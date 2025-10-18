from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from decimal import Decimal
from datetime import datetime
from uuid import UUID


class TourBase(BaseModel):
    slug: str
    city: Optional[str] = None
    category: Optional[str] = None
    base_price_eur: Decimal
    base_price_usd: Optional[Decimal] = None
    duration_minutes: Optional[int] = None
    max_participants: Optional[int] = 4
    
    title_pt: Optional[str] = None
    title_en: Optional[str] = None
    title_es: Optional[str] = None
    
    description_pt: Optional[str] = None
    description_en: Optional[str] = None
    description_es: Optional[str] = None
    
    highlights_pt: Optional[List[str]] = None
    highlights_en: Optional[List[str]] = None
    highlights_es: Optional[List[str]] = None
    
    includes: Optional[List[str]] = None
    excludes: Optional[List[str]] = None
    addons: Optional[List[Dict[str, Any]]] = None
    
    cancellation_policy: Optional[Dict[str, Any]] = None
    meeting_point: Optional[Dict[str, Any]] = None
    photos: Optional[List[str]] = None
    
    visibility: bool = True
    featured: bool = False


class TourCreate(TourBase):
    pass


class TourUpdate(BaseModel):
    slug: Optional[str] = None
    city: Optional[str] = None
    category: Optional[str] = None
    base_price_eur: Optional[Decimal] = None
    base_price_usd: Optional[Decimal] = None
    duration_minutes: Optional[int] = None
    max_participants: Optional[int] = None
    visibility: Optional[bool] = None
    featured: Optional[bool] = None


class Tour(TourBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
