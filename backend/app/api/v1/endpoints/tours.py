from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.db.session import get_db
from app.crud import tour as crud_tour
from app.schemas.tour import Tour, TourCreate, TourUpdate

router = APIRouter()


@router.get("/", response_model=List[Tour])
async def get_tours(
    skip: int = 0,
    limit: int = 100,
    visible_only: bool = True,
    db: Session = Depends(get_db)
):
    tours = crud_tour.get_tours(db, skip=skip, limit=limit, visible_only=visible_only)
    return tours


@router.get("/{tour_id}", response_model=Tour)
async def get_tour(tour_id: UUID, db: Session = Depends(get_db)):
    tour = crud_tour.get_tour(db, tour_id)
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")
    return tour


@router.post("/", response_model=Tour)
async def create_tour(tour: TourCreate, db: Session = Depends(get_db)):
    return crud_tour.create_tour(db, tour)


@router.put("/{tour_id}", response_model=Tour)
async def update_tour(tour_id: UUID, tour: TourUpdate, db: Session = Depends(get_db)):
    updated_tour = crud_tour.update_tour(db, tour_id, tour)
    if not updated_tour:
        raise HTTPException(status_code=404, detail="Tour not found")
    return updated_tour


@router.delete("/{tour_id}")
async def delete_tour(tour_id: UUID, db: Session = Depends(get_db)):
    deleted = crud_tour.delete_tour(db, tour_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Tour not found")
    return {"message": "Tour deleted successfully"}
