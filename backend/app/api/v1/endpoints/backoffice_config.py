from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.site_config import SiteConfig, SiteConfigCreate, SiteConfigUpdate, MediaAsset, MediaAssetCreate, MediaAssetUpdate
from app.crud import site_config as config_crud

router = APIRouter()


@router.get("/config", response_model=List[SiteConfig])
def get_all_site_configs(db: Session = Depends(get_db)):
    """Get all site configurations."""
    return config_crud.get_all_configs(db)


@router.get("/config/{key}", response_model=SiteConfig)
def get_site_config(key: str, db: Session = Depends(get_db)):
    """Get configuration by key."""
    config = config_crud.get_config_by_key(db, key=key)
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    return config


@router.post("/config", response_model=SiteConfig, status_code=201)
def create_site_config(
    config_data: SiteConfigCreate,
    db: Session = Depends(get_db)
):
    """Create new site configuration."""
    existing = config_crud.get_config_by_key(db, key=config_data.key)
    if existing:
        raise HTTPException(status_code=400, detail="Configuration key already exists")
    
    return config_crud.create_config(db=db, config=config_data)


@router.put("/config/{key}", response_model=SiteConfig)
def update_site_config(
    key: str,
    config_update: SiteConfigUpdate,
    db: Session = Depends(get_db)
):
    """Update site configuration."""
    config = config_crud.update_config(db, key=key, config_update=config_update)
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    return config


@router.get("/media", response_model=List[MediaAsset])
def get_all_media(db: Session = Depends(get_db)):
    """Get all media assets."""
    return db.query(MediaAsset).filter(MediaAsset.is_active == True).all()


@router.post("/media", response_model=MediaAsset, status_code=201)
def create_media_asset(
    media_data: MediaAssetCreate,
    db: Session = Depends(get_db)
):
    """Create new media asset."""
    existing = config_crud.get_media_by_key(db, key=media_data.key)
    if existing:
        raise HTTPException(status_code=400, detail="Media key already exists")
    
    return config_crud.create_media(db=db, media=media_data)


@router.put("/media/{key}", response_model=MediaAsset)
def update_media_asset(
    key: str,
    media_update: MediaAssetUpdate,
    db: Session = Depends(get_db)
):
    """Update media asset."""
    media = config_crud.update_media(db, key=key, media_update=media_update)
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    return media
