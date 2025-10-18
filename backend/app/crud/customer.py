from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate


def get_customer(db: Session, customer_id: UUID) -> Optional[Customer]:
    """Get customer by ID"""
    return db.query(Customer).filter(Customer.id == customer_id).first()


def get_customer_by_email(db: Session, email: str) -> Optional[Customer]:
    """Get customer by email"""
    return db.query(Customer).filter(Customer.email == email).first()


def get_customers(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    segment: Optional[str] = None,
    country: Optional[str] = None,
    tag: Optional[str] = None,
    active_only: bool = True
) -> List[Customer]:
    """Get all customers with optional filters"""
    query = db.query(Customer)
    
    if active_only:
        query = query.filter(Customer.is_active == True)
    
    if segment:
        query = query.filter(Customer.segment == segment)
    
    if country:
        query = query.filter(Customer.country == country)
    
    if tag:
        query = query.filter(Customer.tags.contains([tag]))
    
    return query.offset(skip).limit(limit).all()


def create_customer(db: Session, customer: CustomerCreate) -> Customer:
    """Create new customer"""
    db_customer = Customer(**customer.model_dump())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer


def update_customer(
    db: Session, 
    customer_id: UUID, 
    customer_update: CustomerUpdate
) -> Optional[Customer]:
    """Update customer"""
    db_customer = get_customer(db, customer_id)
    if not db_customer:
        return None
    
    update_data = customer_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_customer, field, value)
    
    db.commit()
    db.refresh(db_customer)
    return db_customer


def delete_customer(db: Session, customer_id: UUID) -> bool:
    """Soft delete customer"""
    db_customer = get_customer(db, customer_id)
    if not db_customer:
        return False
    
    db_customer.is_active = False
    db.commit()
    return True


def get_customer_stats(db: Session) -> dict:
    """Get customer statistics"""
    total = db.query(Customer).filter(Customer.is_active == True).count()
    with_bookings = db.query(Customer).filter(
        Customer.is_active == True,
        Customer.total_bookings > 0
    ).count()
    
    return {
        "total_customers": total,
        "customers_with_bookings": with_bookings,
        "conversion_rate": round((with_bookings / total * 100) if total > 0 else 0, 2)
    }
