from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
import auth
from database import engine
import os
import uuid
import shutil
from pathlib import Path

# Створення таблиць
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="MyStorage API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://192.168.0.143", "http://localhost"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Папка для uploads
UPLOAD_DIR = Path("/app/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

@app.get("/")
def read_root():
    return {"message": "MyStorage API"}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

# ============ AUTH ============

@app.post("/api/auth/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(auth.get_db)):
    # Перевірка чи існує користувач
    db_user = db.query(models.User).filter(
        (models.User.email == user.email) | (models.User.username == user.username)
    ).first()
    if db_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Створення користувача
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/auth/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(auth.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = auth.create_access_token(data={"sub": db_user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=schemas.User)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# ============ BOXES ============

@app.get("/api/boxes", response_model=List[schemas.Box])
def get_boxes(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(auth.get_db)
):
    # Власні коробки + shared коробки
    own_boxes = db.query(models.Box).filter(models.Box.owner_id == current_user.id).all()
    shared_boxes = current_user.shared_boxes
    
    all_boxes = []
    for box in own_boxes:
        box_dict = schemas.Box.from_orm(box)
        box_dict.is_shared = False
        all_boxes.append(box_dict)
    
    for box in shared_boxes:
        box_dict = schemas.Box.from_orm(box)
        box_dict.is_shared = True
        all_boxes.append(box_dict)
    
    return all_boxes

@app.post("/api/boxes", response_model=schemas.Box)
def create_box(
    box: schemas.BoxCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(auth.get_db)
):
    qr_code = str(uuid.uuid4())[:8]
    db_box = models.Box(
        **box.dict(),
        owner_id=current_user.id,
        qr_code=qr_code
    )
    db.add(db_box)
    db.commit()
    db.refresh(db_box)
    return db_box

@app.get("/api/boxes/{box_id}", response_model=schemas.Box)
def get_box(
    box_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(auth.get_db)
):
    box = db.query(models.Box).filter(models.Box.id == box_id).first()
    if not box:
        raise HTTPException(status_code=404, detail="Box not found")
    
    # Перевірка доступу
    if box.owner_id != current_user.id and current_user not in box.shared_with:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return box

@app.put("/api/boxes/{box_id}", response_model=schemas.Box)
def update_box(
    box_id: int,
    box_update: schemas.BoxUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(auth.get_db)
):
    box = db.query(models.Box).filter(models.Box.id == box_id).first()
    if not box:
        raise HTTPException(status_code=404, detail="Box not found")
    
    if box.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only owner can update")
    
    for key, value in box_update.dict(exclude_unset=True).items():
        setattr(box, key, value)
    
    db.commit()
    db.refresh(box)
    return box

@app.delete("/api/boxes/{box_id}")
def delete_box(
    box_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(auth.get_db)
):
    box = db.query(models.Box).filter(models.Box.id == box_id).first()
    if not box:
        raise HTTPException(status_code=404, detail="Box not found")
    
    if box.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only owner can delete")
    
    db.delete(box)
    db.commit()
    return {"message": "Box deleted"}

@app.post("/api/boxes/{box_id}/share")
def share_box(
    box_id: int,
    share_data: schemas.BoxShare,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(auth.get_db)
):
    box = db.query(models.Box).filter(models.Box.id == box_id).first()
    if not box:
        raise HTTPException(status_code=404, detail="Box not found")
    
    if box.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only owner can share")
    
    user_to_share = db.query(models.User).filter(models.User.email == share_data.user_email).first()
    if not user_to_share:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_to_share in box.shared_with:
        raise HTTPException(status_code=400, detail="Already shared")
    
    box.shared_with.append(user_to_share)
    db.commit()
    return {"message": "Box shared successfully"}

@app.delete("/api/boxes/{box_id}/share/{user_id}")
def unshare_box(
    box_id: int,
    user_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(auth.get_db)
):
    box = db.query(models.Box).filter(models.Box.id == box_id).first()
    if not box:
        raise HTTPException(status_code=404, detail="Box not found")
    
    if box.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only owner can unshare")
    
    user_to_remove = db.query(models.User).filter(models.User.id == user_id).first()
    if user_to_remove in box.shared_with:
        box.shared_with.remove(user_to_remove)
        db.commit()
    
    return {"message": "Access removed"}

# ============ ITEMS ============

@app.get("/api/items", response_model=List[schemas.Item])
def get_items(
    box_id: int = None,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(auth.get_db)
):
    query = db.query(models.Item)
    if box_id:
        query = query.filter(models.Item.box_id == box_id)
    return query.all()

@app.post("/api/items", response_model=schemas.Item)
def create_item(
    item: schemas.ItemCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(auth.get_db)
):
    # Перевірка доступу до коробки
    box = db.query(models.Box).filter(models.Box.id == item.box_id).first()
    if not box:
        raise HTTPException(status_code=404, detail="Box not found")
    
    if box.owner_id != current_user.id and current_user not in box.shared_with:
        raise HTTPException(status_code=403, detail="Access denied")
    
    db_item = models.Item(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.put("/api/items/{item_id}", response_model=schemas.Item)
def update_item(
    item_id: int,
    item_update: schemas.ItemUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(auth.get_db)
):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Перевірка доступу
    box = item.box
    if box.owner_id != current_user.id and current_user not in box.shared_with:
        raise HTTPException(status_code=403, detail="Access denied")
    
    for key, value in item_update.dict(exclude_unset=True).items():
        setattr(item, key, value)
    
    db.commit()
    db.refresh(item)
    return item

@app.delete("/api/items/{item_id}")
def delete_item(
    item_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(auth.get_db)
):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    box = item.box
    if box.owner_id != current_user.id and current_user not in box.shared_with:
        raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(item)
    db.commit()
    return {"message": "Item deleted"}

# ============ UPLOAD ============

@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only images allowed")
    
    file_ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = UPLOAD_DIR / filename
    
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"url": f"/uploads/{filename}"}