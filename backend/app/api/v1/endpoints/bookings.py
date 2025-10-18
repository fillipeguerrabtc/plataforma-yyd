from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
from decimal import Decimal
import uuid
import stripe
import os

from app.db.session import get_db
from app.models.booking import Booking, BookingStatus, PaymentStatus
from app.models.tour import TourProduct

router = APIRouter()

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_51SJ48KBkC2gtgckmAeGfu9nLD5SjSB0snAuolYVufKtNlXrJTQcQaL0QgJ4j3TeRMqXoTC5XnbwnYLd6x1dh5aa0BImx5tGl6")


class CreateBookingRequest(BaseModel):
    tour_id: str
    tour_date: datetime
    participants: int
    customer_name: str
    customer_email: EmailStr
    customer_phone: Optional[str] = None
    customer_country: Optional[str] = None
    selected_addons: List[dict] = []
    special_requests: Optional[str] = None
    language: str = "en"


class CreatePaymentIntentRequest(BaseModel):
    booking_id: str


class BookingResponse(BaseModel):
    id: str
    booking_reference: str
    tour_id: str
    tour_date: datetime
    participants: int
    customer_name: str
    customer_email: str
    total_price: Decimal
    currency: str
    status: str
    payment_status: str
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_data: CreateBookingRequest,
    db: Session = Depends(get_db)
):
    """Create a new booking without payment"""
    # Validate tour exists
    tour = db.query(TourProduct).filter(TourProduct.id == uuid.UUID(booking_data.tour_id)).first()
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")
    
    # Calculate pricing
    base_price = Decimal(str(tour.base_price_eur)) * booking_data.participants
    addons_price = Decimal("0.00")
    
    for addon in booking_data.selected_addons:
        addon_price = Decimal(str(addon.get('price_eur', 0)))
        addons_price += addon_price
    
    total_price = base_price + addons_price
    
    # Generate unique booking number
    booking_number = f"YYD-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
    
    # Extract time from tour_date
    tour_time_str = booking_data.tour_date.strftime("%H:%M:%S")
    
    # Create booking
    new_booking = Booking(
        tour_product_id=uuid.UUID(booking_data.tour_id),
        tour_date=booking_data.tour_date.date(),
        tour_time=tour_time_str,
        participants=booking_data.participants,
        customer_name=booking_data.customer_name,
        customer_email=booking_data.customer_email,
        customer_phone=booking_data.customer_phone,
        customer_language=booking_data.language,
        base_price=base_price,
        addons_price=addons_price,
        total_price=total_price,
        currency="EUR",
        special_requests=booking_data.special_requests,
        booking_number=booking_number,
        booking_status=BookingStatus.PENDING.value,
        payment_status=PaymentStatus.PENDING.value
    )
    
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    
    return {
        "id": str(new_booking.id),
        "booking_number": str(new_booking.booking_number),
        "tour_id": str(new_booking.tour_product_id),
        "tour_date": new_booking.tour_date.isoformat(),
        "participants": int(new_booking.participants),
        "customer_name": str(new_booking.customer_name),
        "customer_email": str(new_booking.customer_email),
        "total_price": str(new_booking.total_price),
        "currency": str(new_booking.currency),
        "status": str(new_booking.booking_status),
        "payment_status": str(new_booking.payment_status),
        "created_at": new_booking.created_at.isoformat()
    }


@router.post("/create-payment-intent")
async def create_payment_intent(
    payment_data: CreatePaymentIntentRequest,
    db: Session = Depends(get_db)
):
    """Create a Stripe Payment Intent for an existing booking"""
    booking = db.query(Booking).filter(Booking.id == uuid.UUID(payment_data.booking_id)).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check if already paid
    current_payment_status = str(booking.payment_status)
    if current_payment_status == PaymentStatus.SUCCEEDED.value:
        raise HTTPException(status_code=400, detail="Booking already paid")
    
    try:
        # Extract actual values from SQLAlchemy columns
        total_price_value = float(booking.total_price)
        currency_value = str(booking.currency)
        booking_id_value = str(booking.id)
        booking_number_value = str(booking.booking_number)
        customer_name_value = str(booking.customer_name)
        customer_email_value = str(booking.customer_email)
        
        # Create Stripe Payment Intent
        payment_intent = stripe.PaymentIntent.create(
            amount=int(total_price_value * 100),  # Convert to cents
            currency=currency_value.lower(),
            metadata={
                "booking_id": booking_id_value,
                "booking_number": booking_number_value,
                "customer_name": customer_name_value,
                "customer_email": customer_email_value
            },
            receipt_email=customer_email_value
        )
        
        # Update booking with Stripe Payment Intent ID using direct SQL update
        db.query(Booking).filter(Booking.id == uuid.UUID(payment_data.booking_id)).update({
            "stripe_payment_intent_id": payment_intent.id,
            "payment_status": PaymentStatus.PROCESSING.value
        })
        db.commit()
        
        return {
            "clientSecret": payment_intent.client_secret,
            "paymentIntentId": payment_intent.id,
            "amount": payment_intent.amount,
            "currency": payment_intent.currency
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Payment error: {str(e)}")


@router.get("/{booking_id}")
async def get_booking(booking_id: str, db: Session = Depends(get_db)):
    """Get booking details by ID"""
    booking = db.query(Booking).filter(Booking.id == uuid.UUID(booking_id)).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return {
        "id": str(booking.id),
        "booking_number": str(booking.booking_number),
        "tour_id": str(booking.tour_product_id),
        "tour_date": booking.tour_date.isoformat(),
        "participants": int(booking.participants),
        "customer_name": str(booking.customer_name),
        "customer_email": str(booking.customer_email),
        "total_price": str(booking.total_price),
        "currency": str(booking.currency),
        "status": str(booking.booking_status),
        "payment_status": str(booking.payment_status),
        "created_at": booking.created_at.isoformat()
    }
