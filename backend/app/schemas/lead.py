from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID


class LeadBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    source: Optional[str] = None
    privacy_consent: bool = True


class LeadCreate(LeadBase):
    pass


class Lead(LeadBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
