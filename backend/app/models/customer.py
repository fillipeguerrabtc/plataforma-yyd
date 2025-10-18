from sqlalchemy import Column, String, Text, Boolean, DateTime, Integer, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid

from app.db.base import Base


class Customer(Base):
    """Customer (client) model - for CRM and customer management"""
    __tablename__ = "customers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50))
    language = Column(String(10), default='en')
    country = Column(String(100), index=True)
    
    tags = Column(JSONB, default=[])
    notes = Column(Text)
    
    total_bookings = Column(Integer, default=0)
    total_spent_eur = Column(Numeric(10, 2), default=0)
    last_booking_date = Column(DateTime(timezone=True))
    preferred_tour_type = Column(String(100))
    
    marketing_consent = Column(Boolean, default=False)
    whatsapp_opt_in = Column(Boolean, default=False)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
