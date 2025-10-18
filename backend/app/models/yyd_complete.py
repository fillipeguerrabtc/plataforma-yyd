"""
YYD Complete Models - Guides, Vehicles, Reviews (Whitepaper Spec)
"""

from sqlalchemy import Column, String, Text, Boolean, DateTime, Integer, Numeric, CheckConstraint, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
import uuid

from app.db.base import Base


class Guide(Base):
    """Tour Guide Profile"""
    __tablename__ = "guides"
    
    guide_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(50))
    
    languages = Column(ARRAY(String(10)))
    certifications = Column(JSONB, default=[])
    specialties = Column(ARRAY(String(100)))
    
    bio_pt = Column(Text)
    bio_en = Column(Text)
    bio_es = Column(Text)
    
    photo_url = Column(String(500))
    rating_avg = Column(Numeric(3, 2), default=5.0)
    total_tours = Column(Integer, default=0)
    
    availability = Column(JSONB, default={})
    hourly_rate_eur = Column(Numeric(10, 2))
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Vehicle(Base):
    """Electric Tuk-Tuk Fleet"""
    __tablename__ = "vehicles"
    
    vehicle_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    license_plate = Column(String(20), unique=True, nullable=False)
    vehicle_type = Column(String(50), default='tuk-tuk')
    model = Column(String(100))
    year = Column(Integer)
    
    max_capacity = Column(Integer, default=4)
    battery_capacity_kwh = Column(Numeric(5, 2))
    current_battery_percent = Column(Numeric(5, 2))
    
    status = Column(
        String(20),
        CheckConstraint("status IN ('available','in_use','maintenance','charging','offline')"),
        default='available'
    )
    
    last_maintenance = Column(DateTime(timezone=True))
    next_maintenance_due = Column(DateTime(timezone=True))
    
    gps_tracker_id = Column(String(100))
    insurance_expires = Column(DateTime(timezone=True))
    
    total_km = Column(Numeric(10, 2), default=0)
    total_tours = Column(Integer, default=0)
    
    metadata = Column(JSONB, default={})
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Review(Base):
    """Customer Reviews & Ratings"""
    __tablename__ = "reviews"
    
    review_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(UUID(as_uuid=True), ForeignKey('bookings.id'), nullable=False)
    client_id = Column(UUID(as_uuid=True), ForeignKey('yyd_client.client_id'))
    tour_id = Column(UUID(as_uuid=True))
    guide_id = Column(UUID(as_uuid=True), ForeignKey('guides.guide_id'))
    
    rating_overall = Column(Numeric(3, 2), nullable=False)
    rating_guide = Column(Numeric(3, 2))
    rating_vehicle = Column(Numeric(3, 2))
    rating_value = Column(Numeric(3, 2))
    
    review_text = Column(Text)
    review_language = Column(String(10))
    
    sentiment_score = Column(Numeric(3, 2))
    affective_embedding = Column(Vector(3))
    
    platform = Column(String(50))
    platform_id = Column(String(255))
    
    is_featured = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    is_public = Column(Boolean, default=True)
    
    response_text = Column(Text)
    responded_at = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class TourRecommendation(Base):
    """AI-powered Tour Recommendations (Whitepaper Chapter 11)"""
    __tablename__ = "tour_recommendations"
    
    rec_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey('yyd_client.client_id'), nullable=False)
    session_id = Column(UUID(as_uuid=True), ForeignKey('yyd_session.session_id'))
    tour_id = Column(UUID(as_uuid=True), nullable=False)
    
    score_affective = Column(Numeric(5, 4))
    score_semantic = Column(Numeric(5, 4))
    score_operational = Column(Numeric(5, 4))
    score_final = Column(Numeric(5, 4), nullable=False)
    
    reasoning = Column(JSONB)
    
    presented_at = Column(DateTime(timezone=True), server_default=func.now())
    clicked = Column(Boolean, default=False)
    booked = Column(Boolean, default=False)


class DynamicPricing(Base):
    """Dynamic Pricing Events (Whitepaper Chapter 12 - EVD)"""
    __tablename__ = "dynamic_pricing"
    
    pricing_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tour_id = Column(UUID(as_uuid=True), nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    
    base_price = Column(Numeric(10, 2), nullable=False)
    demand_factor = Column(Numeric(5, 4))
    weather_factor = Column(Numeric(5, 4))
    occupancy_factor = Column(Numeric(5, 4))
    
    final_price = Column(Numeric(10, 2), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
