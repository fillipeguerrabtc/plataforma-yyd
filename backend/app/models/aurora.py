from sqlalchemy import Column, String, Text, Boolean, DateTime, Float, ForeignKey, Numeric, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB, CITEXT
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
import uuid

from app.db.base import Base


class YYDClient(Base):
    """YYD Client - Complete customer profile (whitepaper spec)"""
    __tablename__ = "yyd_client"
    
    client_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(CITEXT, unique=True, nullable=False, index=True)
    phone = Column(String(50))
    locale = Column(String(10), default='en')
    tz = Column(String(50), default='UTC')
    country = Column(String(100))
    segment = Column(String(50), default='regular')
    
    total_bookings = Column(Numeric(10, 0), default=0)
    total_spent_eur = Column(Numeric(10, 2), default=0)
    lifetime_value = Column(Numeric(10, 2), default=0)
    
    whatsapp_number = Column(String(50))
    facebook_psid = Column(String(255))
    instagram_id = Column(String(255))
    
    marketing_consent = Column(Boolean, default=False)
    whatsapp_opt_in = Column(Boolean, default=False)
    
    preferred_language = Column(String(10))
    preferred_tours = Column(JSONB, default=[])
    tags = Column(JSONB, default=[])
    notes = Column(Text)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class YYDSession(Base):
    """YYD Session - Conversation session tracking (whitepaper spec)"""
    __tablename__ = "yyd_session"
    
    session_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey('yyd_client.client_id'), nullable=False)
    channel = Column(String(20), CheckConstraint("channel IN ('whatsapp','facebook','instagram','web','voice')"), nullable=False)
    locale = Column(String(10), default='en')
    status = Column(String(20), CheckConstraint("status IN ('active','paused','closed','archived')"), default='active')
    
    context = Column(JSONB, default={})
    affective_state = Column(Vector(3))
    
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    closed_at = Column(DateTime(timezone=True))


class YYDEmbeddings(Base):
    """YYD Embeddings - Multi-scope vector storage (whitepaper spec)"""
    __tablename__ = "yyd_embeddings"
    
    emb_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scope = Column(String(10), CheckConstraint("scope IN ('SM','EM','AM','TM','PM')"), nullable=False)
    ref_id = Column(UUID(as_uuid=True))
    locale = Column(String(10))
    vector = Column(Vector(1536))
    meta = Column(JSONB, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class YYDEpisode(Base):
    """YYD Episode - Episodic memory (whitepaper spec)"""
    __tablename__ = "yyd_episode"
    
    episode_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey('yyd_client.client_id'), nullable=False)
    session_id = Column(UUID(as_uuid=True), ForeignKey('yyd_session.session_id'))
    
    emotion = Column(JSONB)
    transcript = Column(JSONB)
    outcome = Column(String(50))
    rating = Column(Numeric(3, 2))
    
    booking_id = Column(UUID(as_uuid=True))
    tour_id = Column(UUID(as_uuid=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AuroraConversation(Base):
    """Aurora AI conversation tracking (legacy - use YYDSession for new code)"""
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
