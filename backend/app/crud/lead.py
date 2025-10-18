from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from app.models.lead import Lead
from app.schemas.lead import LeadCreate


def create_lead(db: Session, lead: LeadCreate) -> Lead:
    """Create a new lead from form submission."""
    db_lead = Lead(
        name=lead.name,
        email=lead.email,
        phone=lead.phone,
        source=lead.source,
        privacy_consent=lead.privacy_consent,
    )
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead


def get_lead_by_email(db: Session, email: str) -> Optional[Lead]:
    """Get lead by email address."""
    return db.query(Lead).filter(Lead.email == email).first()


def get_lead(db: Session, lead_id: UUID) -> Optional[Lead]:
    """Get lead by ID."""
    return db.query(Lead).filter(Lead.id == lead_id).first()
