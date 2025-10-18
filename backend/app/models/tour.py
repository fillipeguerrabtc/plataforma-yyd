from sqlalchemy import Column, String, Integer, Numeric, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid

from app.db.base import Base


class TourProduct(Base):
    __tablename__ = "tour_products"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    city = Column(String(100))
    category = Column(String(100))
    base_price_eur = Column(Numeric(10, 2), nullable=False)
    base_price_usd = Column(Numeric(10, 2))
    duration_minutes = Column(Integer)
    max_participants = Column(Integer, default=4)
    
    title_pt = Column(String(255))
    title_en = Column(String(255))
    title_es = Column(String(255))
    
    description_pt = Column(Text)
    description_en = Column(Text)
    description_es = Column(Text)
    
    highlights_pt = Column(JSONB)
    highlights_en = Column(JSONB)
    highlights_es = Column(JSONB)
    
    includes = Column(JSONB)
    excludes = Column(JSONB)
    addons = Column(JSONB)
    
    cancellation_policy = Column(JSONB)
    meeting_point = Column(JSONB)
    photos = Column(JSONB)
    
    visibility = Column(Boolean, default=True)
    featured = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
