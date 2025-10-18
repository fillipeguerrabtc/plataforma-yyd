from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.lead import Lead, LeadCreate
from app.crud import lead as lead_crud

router = APIRouter()


@router.post("/", response_model=Lead, status_code=201)
def create_lead(
    lead_data: LeadCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new lead from the lead capture form.
    
    - **name**: Full name of the lead
    - **email**: Email address (required, will be indexed)
    - **phone**: Phone number (optional)
    - **source**: Where they heard about us (optional)
    - **privacy_consent**: Must be true to create lead
    """
    if not lead_data.privacy_consent:
        raise HTTPException(
            status_code=400,
            detail="Privacy consent is required to submit the form"
        )
    
    existing_lead = lead_crud.get_lead_by_email(db, email=lead_data.email)
    if existing_lead:
        return existing_lead
    
    return lead_crud.create_lead(db=db, lead=lead_data)
