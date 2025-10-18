from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from uuid import UUID


class CustomerBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    language: str = 'en'
    country: Optional[str] = None
    tags: List[str] = []
    notes: Optional[str] = None
    marketing_consent: bool = False
    whatsapp_opt_in: bool = False


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    language: Optional[str] = None
    country: Optional[str] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None
    marketing_consent: Optional[bool] = None
    whatsapp_opt_in: Optional[bool] = None
    is_active: Optional[bool] = None


class Customer(CustomerBase):
    id: UUID
    total_bookings: int
    total_spent_eur: Decimal
    last_booking_date: Optional[datetime] = None
    preferred_tour_type: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
