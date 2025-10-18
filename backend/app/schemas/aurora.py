from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime
from uuid import UUID


class AuroraConfigBase(BaseModel):
    key: str
    value: Dict[str, Any]
    description: Optional[str] = None
    category: Optional[str] = None


class AuroraConfigCreate(AuroraConfigBase):
    pass


class AuroraConfigUpdate(BaseModel):
    value: Optional[Dict[str, Any]] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class AuroraConfig(AuroraConfigBase):
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AuroraKnowledgeBase(BaseModel):
    category: str
    content: str
    metadata: Dict[str, Any] = {}


class AuroraKnowledgeCreate(AuroraKnowledgeBase):
    pass


class AuroraKnowledge(AuroraKnowledgeBase):
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
