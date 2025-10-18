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
    segment: str = 'regular'
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
    segment: Optional[str] = None
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
        
        
class CustomerResponse(BaseModel):
    """Customer response with aliased name field for frontend compatibility"""
    id: UUID
    name: str  
    email: str
    phone: Optional[str]
    language: str
    country: Optional[str]
    segment: str
    tags: List[str]
    lifetime_value_eur: Decimal  
    total_bookings: int
    notes: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        
    @classmethod
    def from_customer(cls, customer):
        """Convert Customer to CustomerResponse with aliased fields"""
        return cls(
            id=customer.id,
            name=customer.full_name,
            email=customer.email,
            phone=customer.phone,
            language=customer.language,
            country=customer.country,
            segment=customer.segment,
            tags=customer.tags,
            lifetime_value_eur=customer.total_spent_eur,
            total_bookings=customer.total_bookings,
            notes=customer.notes,
            is_active=customer.is_active,
            created_at=customer.created_at,
            updated_at=customer.updated_at
        )
