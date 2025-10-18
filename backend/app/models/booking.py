from sqlalchemy import Column, String, Integer, Numeric, DateTime, Text, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid
import enum

from app.db.base import Base


class BookingStatus(str, enum.Enum):
    TENTATIVE = "tentative"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no-show"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"


class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Tour Information (matched to existing DB schema)
    tour_product_id = Column(UUID(as_uuid=True), nullable=False)
    customer_id = Column(UUID(as_uuid=True))
    guide_id = Column(UUID(as_uuid=True))
    vehicle_id = Column(UUID(as_uuid=True))
    tour_date = Column(DateTime(timezone=True), nullable=False)
    tour_time = Column(String(10))  # Time in HH:MM format
    participants = Column(Integer, nullable=False, default=1)
    
    # Customer Information
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    customer_phone = Column(String(50))
    customer_language = Column(String(5), default="en")
    
    # Pricing
    base_price = Column(Numeric(10, 2), nullable=False)
    addons_price = Column(Numeric(10, 2), default=0)
    total_price = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(10), default="EUR")
    fx_rate = Column(Numeric(10, 6))
    
    # Special Requests
    special_requests = Column(Text)
    internal_notes = Column(Text)
    
    # Booking Status (using string columns to match existing DB)
    booking_status = Column(String(50), default="PENDING", nullable=False)
    payment_status = Column(String(50), default="PENDING", nullable=False)
    
    # Payment Information
    stripe_payment_intent_id = Column(String(255))
    voucher_code = Column(String(100))
    
    # Metadata
    booking_number = Column(String(50), unique=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    confirmed_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
