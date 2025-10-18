from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum

from app.db.base import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    GUIDE = "guide"
    STAFF = "staff"


class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column("password_hash", String(255), nullable=False)
    role = Column(String(50), default=UserRole.STAFF.value, nullable=False)
    
    is_active = Column("active", Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    
    phone = Column(String(50))
    avatar_url = Column(String(500))
    language = Column(String(10), default="en")
    
    last_login = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
