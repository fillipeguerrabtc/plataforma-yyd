from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID

from app.models.site_config import SiteConfig, MediaAsset
from app.schemas.site_config import SiteConfigCreate, SiteConfigUpdate, MediaAssetCreate, MediaAssetUpdate


def get_config_by_key(db: Session, key: str) -> Optional[SiteConfig]:
    """Get configuration by key."""
    return db.query(SiteConfig).filter(SiteConfig.key == key, SiteConfig.is_active == True).first()


def get_configs_by_category(db: Session, category: str) -> List[SiteConfig]:
    """Get all configurations in a category."""
    return db.query(SiteConfig).filter(SiteConfig.category == category, SiteConfig.is_active == True).all()


def get_all_configs(db: Session) -> List[SiteConfig]:
    """Get all active configurations."""
    return db.query(SiteConfig).filter(SiteConfig.is_active == True).all()


def create_config(db: Session, config: SiteConfigCreate) -> SiteConfig:
    """Create new configuration."""
    db_config = SiteConfig(**config.dict())
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config


def update_config(db: Session, key: str, config_update: SiteConfigUpdate) -> Optional[SiteConfig]:
    """Update configuration."""
    db_config = get_config_by_key(db, key)
    if not db_config:
        return None
    
    update_data = config_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_config, field, value)
    
    db.commit()
    db.refresh(db_config)
    return db_config


def get_media_by_key(db: Session, key: str) -> Optional[MediaAsset]:
    """Get media asset by key."""
    return db.query(MediaAsset).filter(MediaAsset.key == key, MediaAsset.is_active == True).first()


def get_media_by_category(db: Session, category: str) -> List[MediaAsset]:
    """Get all media assets in a category."""
    return db.query(MediaAsset).filter(MediaAsset.category == category, MediaAsset.is_active == True).all()


def create_media(db: Session, media: MediaAssetCreate) -> MediaAsset:
    """Create new media asset."""
    db_media = MediaAsset(**media.dict())
    db.add(db_media)
    db.commit()
    db.refresh(db_media)
    return db_media


def update_media(db: Session, key: str, media_update: MediaAssetUpdate) -> Optional[MediaAsset]:
    """Update media asset."""
    db_media = get_media_by_key(db, key)
    if not db_media:
        return None
    
    update_data = media_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_media, field, value)
    
    db.commit()
    db.refresh(db_media)
    return db_media
