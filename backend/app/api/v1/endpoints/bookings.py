from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
from decimal import Decimal
import uuid
import stripe
import os
import hmac
import hashlib

from app.db.session import get_db
from app.models.booking import Booking, BookingStatus, PaymentStatus
from app.models.tour import TourProduct

router = APIRouter()

# Initialize Stripe with secret from environment
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
if not stripe.api_key:
    raise ValueError("STRIPE_SECRET_KEY environment variable not set")


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
        booking_status=BookingStatus.TENTATIVE.value,
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
    if current_payment_status == PaymentStatus.PAID.value:
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
            "payment_status": PaymentStatus.PENDING.value
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


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhook events for payment confirmation"""
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    # Get webhook secret from environment (optional for testing)
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    
    try:
        if webhook_secret:
            # Verify webhook signature in production
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
        else:
            # For testing without webhook secret
            import json
            event = json.loads(payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle payment_intent.succeeded event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        booking_id = payment_intent.get('metadata', {}).get('booking_id')
        
        if booking_id:
            # Update booking status to confirmed and payment to paid
            booking = db.query(Booking).filter(Booking.id == uuid.UUID(booking_id)).first()
            if booking:
                booking.payment_status = PaymentStatus.PAID.value
                booking.booking_status = BookingStatus.CONFIRMED.value
                booking.confirmed_at = datetime.utcnow()
                db.commit()
                
                print(f"✅ Booking {booking.booking_number} confirmed - Payment successful!")
    
    # Handle payment_intent.payment_failed event
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        booking_id = payment_intent.get('metadata', {}).get('booking_id')
        
        if booking_id:
            # Update payment status to cancelled
            booking = db.query(Booking).filter(Booking.id == uuid.UUID(booking_id)).first()
            if booking:
                booking.payment_status = PaymentStatus.CANCELLED.value
                db.commit()
                
                print(f"❌ Booking {booking.booking_number} - Payment failed!")
    
    return {"status": "success"}


@router.post("/{booking_id}/cancel")
async def cancel_booking(booking_id: str, db: Session = Depends(get_db)):
    """Cancel a booking"""
    booking = db.query(Booking).filter(Booking.id == uuid.UUID(booking_id)).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Can only cancel tentative or confirmed bookings
    if booking.booking_status in [BookingStatus.COMPLETED.value, BookingStatus.CANCELLED.value]:
        raise HTTPException(status_code=400, detail="Cannot cancel completed or already cancelled booking")
    
    booking.booking_status = BookingStatus.CANCELLED.value
    
    # Refund if payment was made
    if booking.payment_status == PaymentStatus.PAID.value and booking.stripe_payment_intent_id:
        try:
            refund = stripe.Refund.create(
                payment_intent=booking.stripe_payment_intent_id
            )
            booking.payment_status = PaymentStatus.REFUNDED.value
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Refund failed: {str(e)}")
    
    db.commit()
    
    return {
        "message": "Booking cancelled successfully",
        "booking_number": str(booking.booking_number),
        "status": str(booking.booking_status),
        "payment_status": str(booking.payment_status)
    }
