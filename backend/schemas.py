from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False  # ← AJOUTER CETTE LIGNE

class UserResponse(UserBase):
    id: int
    avatar_url: Optional[str] = None
    is_restaurateur: bool = False
    restaurant_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Password reset schemas
class ForgotPassword(BaseModel):
    email: EmailStr

class ResetPassword(BaseModel):
    token: str
    new_password: str

# Restaurant schemas
class RestaurantBase(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    cuisine_type: str
    price_range: str
    image_url: Optional[str] = None
    description: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    opening_hours: Optional[str] = None
    services: Optional[List[str]] = []
    ambiance: Optional[List[str]] = []

class RestaurantCreate(RestaurantBase):
    pass

class RestaurantResponse(RestaurantBase):
    id: int
    owner_id: int
    rating: float
    review_count: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Review schemas
class ReviewCreate(BaseModel):
    rating: int
    comment: str

class ReviewResponse(BaseModel):
    id: int
    restaurant_id: int
    user_id: int
    rating: int
    comment: str
    created_at: datetime
    user: UserResponse

    class Config:
        from_attributes = True

# Photo schemas
class PhotoResponse(BaseModel):
    id: int
    restaurant_id: int
    image_url: str
    is_primary: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Review schemas
class ReviewBase(BaseModel):
    rating: int
    comment: str

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: int
    restaurant_id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    user: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True