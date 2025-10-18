from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.models.tour import TourProduct
from app.schemas.tour import TourCreate, TourUpdate


def get_tours(db: Session, skip: int = 0, limit: int = 100, visible_only: bool = True) -> List[TourProduct]:
    query = db.query(TourProduct)
    if visible_only:
        query = query.filter(TourProduct.visibility == True)
    return query.offset(skip).limit(limit).all()


def get_tour(db: Session, tour_id: UUID) -> Optional[TourProduct]:
    return db.query(TourProduct).filter(TourProduct.id == tour_id).first()


def get_tour_by_slug(db: Session, slug: str) -> Optional[TourProduct]:
    return db.query(TourProduct).filter(TourProduct.slug == slug).first()


def create_tour(db: Session, tour: TourCreate) -> TourProduct:
    db_tour = TourProduct(**tour.dict())
    db.add(db_tour)
    db.commit()
    db.refresh(db_tour)
    return db_tour


def update_tour(db: Session, tour_id: UUID, tour: TourUpdate) -> Optional[TourProduct]:
    db_tour = get_tour(db, tour_id)
    if db_tour:
        update_data = tour.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_tour, field, value)
        db.commit()
        db.refresh(db_tour)
    return db_tour


def delete_tour(db: Session, tour_id: UUID) -> bool:
    db_tour = get_tour(db, tour_id)
    if db_tour:
        db.delete(db_tour)
        db.commit()
        return True
    return False
