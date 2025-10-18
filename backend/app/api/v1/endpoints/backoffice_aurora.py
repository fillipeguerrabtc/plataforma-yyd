from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.aurora import AuroraConfig, AuroraConfigCreate, AuroraConfigUpdate
from app.models.aurora import AuroraConfig as AuroraConfigModel
from app.api.v1.deps import get_current_user, require_manager_or_admin
from app.models.user import User

router = APIRouter()


@router.get("/aurora/config", response_model=List[AuroraConfig])
def get_aurora_configs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all Aurora IA configurations (requires authentication)"""
    return db.query(AuroraConfigModel).filter(AuroraConfigModel.is_active == True).all()


@router.get("/aurora/config/{key}", response_model=AuroraConfig)
def get_aurora_config_by_key(
    key: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get Aurora IA configuration by key (requires authentication)"""
    config = db.query(AuroraConfigModel).filter(AuroraConfigModel.key == key).first()
    if not config:
        raise HTTPException(status_code=404, detail="Aurora configuration not found")
    return config


@router.put("/aurora/config/{key}", response_model=AuroraConfig)
def update_aurora_config(
    key: str,
    config_update: AuroraConfigUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    """Update Aurora IA configuration (admin/manager only)"""
    db_config = db.query(AuroraConfigModel).filter(AuroraConfigModel.key == key).first()
    if not db_config:
        raise HTTPException(status_code=404, detail="Aurora configuration not found")
    
    update_data = config_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_config, field, value)
    
    db.commit()
    db.refresh(db_config)
    return db_config


@router.get("/aurora/stats")
def get_aurora_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get Aurora IA statistics (requires authentication)"""
    from app.models.aurora import AuroraConversation, AuroraMessage, AuroraKnowledge
    
    total_conversations = db.query(AuroraConversation).filter(AuroraConversation.is_active == True).count()
    total_messages = db.query(AuroraMessage).count()
    knowledge_items = db.query(AuroraKnowledge).filter(AuroraKnowledge.is_active == True).count()
    
    return {
        "total_conversations": total_conversations,
        "total_messages": total_messages,
        "knowledge_base_items": knowledge_items,
        "status": "operational" if total_conversations > 0 else "idle"
    }
