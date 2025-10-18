from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.db.session import get_db
from app.schemas.customer import Customer, CustomerCreate, CustomerUpdate, CustomerResponse
from app.crud import customer as customer_crud
from app.api.v1.deps import get_current_user, require_manager_or_admin
from app.models.user import User

router = APIRouter()


@router.get("/customers", response_model=List[CustomerResponse])
def get_all_customers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    segment: Optional[str] = None,
    country: Optional[str] = None,
    tag: Optional[str] = None,
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all customers with optional filters (requires authentication)"""
    customers = customer_crud.get_customers(
        db, 
        skip=skip, 
        limit=limit, 
        segment=segment,
        country=country, 
        tag=tag, 
        active_only=active_only
    )
    return [CustomerResponse.from_customer(c) for c in customers]


@router.get("/customers/stats")
def get_customer_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get customer statistics (requires authentication)"""
    return customer_crud.get_customer_stats(db)


@router.get("/customers/{customer_id}", response_model=Customer)
def get_customer(
    customer_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get customer by ID (requires authentication)"""
    customer = customer_crud.get_customer(db, customer_id=customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.post("/customers", response_model=Customer, status_code=201)
def create_customer(
    customer_data: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    """Create new customer (admin/manager only)"""
    existing = customer_crud.get_customer_by_email(db, email=customer_data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Customer email already exists")
    
    return customer_crud.create_customer(db=db, customer=customer_data)


@router.put("/customers/{customer_id}", response_model=Customer)
def update_customer(
    customer_id: UUID,
    customer_update: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    """Update customer (admin/manager only)"""
    customer = customer_crud.update_customer(db, customer_id=customer_id, customer_update=customer_update)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.delete("/customers/{customer_id}", status_code=204)
def delete_customer(
    customer_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    """Soft delete customer (admin/manager only)"""
    success = customer_crud.delete_customer(db, customer_id=customer_id)
    if not success:
        raise HTTPException(status_code=404, detail="Customer not found")
    return None
