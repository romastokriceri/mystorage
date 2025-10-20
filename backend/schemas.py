from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    photo_url: Optional[str] = None

class ItemCreate(ItemBase):
    box_id: int

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    photo_url: Optional[str] = None

class Item(ItemBase):
    id: int
    box_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class BoxBase(BaseModel):
    name: str
    description: Optional[str] = None
    location: Optional[str] = None
    photo_url: Optional[str] = None

class BoxCreate(BoxBase):
    pass

class BoxUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    photo_url: Optional[str] = None

class BoxShare(BaseModel):
    user_email: str

class Box(BoxBase):
    id: int
    qr_code: Optional[str] = None
    owner_id: int
    created_at: datetime
    updated_at: datetime
    items: List[Item] = []
    is_shared: bool = False
    
    class Config:
        from_attributes = True