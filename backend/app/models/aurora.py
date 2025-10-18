from sqlalchemy import Column, String, Text, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
import uuid

from app.db.base import Base


class AuroraConversation(Base):
    """Aurora AI conversation tracking"""
    __tablename__ = "aurora_conversations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), ForeignKey('customers.id'))
    channel = Column(String(50), nullable=False)
    language = Column(String(10), default='en')
    affective_state = Column(Vector(3))
    context = Column(JSONB, default={})
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class AuroraMessage(Base):
    """Aurora AI messages"""
    __tablename__ = "aurora_messages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey('aurora_conversations.id'))
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    affective_embedding = Column(Vector(3))
    confidence = Column(Float)
    meta_data = Column('metadata', JSONB, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AuroraKnowledge(Base):
    """Aurora AI knowledge base (RAG)"""
    __tablename__ = "aurora_knowledge"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    embedding = Column(Vector(768))
    meta_data = Column('metadata', JSONB, default={})
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class AuroraConfig(Base):
    """Aurora AI configuration"""
    __tablename__ = "aurora_config"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(JSONB, nullable=False)
    description = Column(Text)
    category = Column(String(50))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
