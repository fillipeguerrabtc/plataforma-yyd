from pydantic import BaseModel
from typing import Optional, Any, Dict
from datetime import datetime
from uuid import UUID


class SiteConfigBase(BaseModel):
    key: str
    value_text: Optional[str] = None
    value_json: Optional[Dict[str, Any]] = None
    category: str
    description: Optional[str] = None


class SiteConfigCreate(SiteConfigBase):
    pass


class SiteConfigUpdate(BaseModel):
    value_text: Optional[str] = None
    value_json: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class SiteConfig(SiteConfigBase):
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class MediaAssetBase(BaseModel):
    key: str
    type: str
    url: str
    alt_text: Optional[str] = None
    category: Optional[str] = None
    meta_data: Optional[Dict[str, Any]] = None


class MediaAssetCreate(MediaAssetBase):
    pass


class MediaAssetUpdate(BaseModel):
    url: Optional[str] = None
    alt_text: Optional[str] = None
    meta_data: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class MediaAsset(MediaAssetBase):
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
