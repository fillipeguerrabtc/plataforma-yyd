from sqlalchemy import Column, String, Text, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid

from app.db.base import Base


class SiteConfig(Base):
    """Site configuration - editable from BackOffice"""
    __tablename__ = "site_config"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value_text = Column(Text)
    value_json = Column(JSONB)
    category = Column(String(50), nullable=False)  # hero, features, tours, etc
    
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class MediaAsset(Base):
    """Media assets (images, videos) - manageable from BackOffice"""
    __tablename__ = "media_assets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key = Column(String(100), unique=True, nullable=False, index=True)
    type = Column(String(20), nullable=False)  # image, video
    url = Column(String(500), nullable=False)
    alt_text = Column(String(255))
    category = Column(String(50))  # hero, gallery, tours, etc
    
    meta_data = Column(JSONB)  # dimensions, duration, etc
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
