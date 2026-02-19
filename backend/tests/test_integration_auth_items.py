import os
from pathlib import Path
import sys

import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

TEST_DB = Path(__file__).parent / "test_integration.db"
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB}"
os.environ["SECRET_KEY"] = "test-secret-key"

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import models  # noqa: E402
import schemas  # noqa: E402
from main import (  # noqa: E402
    register,
    login,
    create_box,
    create_item,
    share_box,
    get_items,
)


@pytest.fixture(scope="session")
def engine():
    if TEST_DB.exists():
        TEST_DB.unlink()
    eng = create_engine(f"sqlite:///{TEST_DB}", connect_args={"check_same_thread": False})
    models.Base.metadata.create_all(bind=eng)
    yield eng
    eng.dispose()
    if TEST_DB.exists():
        TEST_DB.unlink()


@pytest.fixture()
def db(engine):
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = Session()
    try:
        yield session
    finally:
        session.close()


def test_auth_and_items_access_flow(db):
    owner = register(schemas.UserCreate(username="owner", email="owner@example.com", password="secret123"), db)
    guest = register(schemas.UserCreate(username="guest", email="guest@example.com", password="secret123"), db)

    owner_login = login(schemas.UserLogin(email="owner@example.com", password="secret123"), db)
    guest_login = login(schemas.UserLogin(email="guest@example.com", password="secret123"), db)
    assert owner_login["access_token"]
    assert guest_login["access_token"]

    box = create_box(
        schemas.BoxCreate(name="Owner box", description="", location="home", photo_url=""),
        current_user=owner,
        db=db,
    )

    created_item = create_item(
        schemas.ItemCreate(name="Laptop", description="work", category="electronics", photo_url="", box_id=box.id),
        current_user=owner,
        db=db,
    )
    assert created_item.name == "Laptop"

    db.expire_all()
    fresh_guest = db.query(models.User).filter(models.User.id == guest.id).first()

    with pytest.raises(HTTPException) as forbidden_exc:
        get_items(box_id=box.id, current_user=fresh_guest, db=db)
    assert getattr(forbidden_exc.value, "status_code", None) == 403

    share_result = share_box(
        box_id=box.id,
        share_data=schemas.BoxShare(user_email="guest@example.com"),
        current_user=owner,
        db=db,
    )
    assert share_result["message"] == "Box shared successfully"

    db.expire_all()
    shared_guest = db.query(models.User).filter(models.User.id == guest.id).first()
    visible_items = get_items(box_id=box.id, current_user=shared_guest, db=db)
    assert len(visible_items) == 1
    assert visible_items[0].name == "Laptop"
