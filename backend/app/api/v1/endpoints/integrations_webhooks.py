"""
Integration Webhooks - WhatsApp, Facebook, Instagram
Receives and processes external platform webhooks
"""

from fastapi import APIRouter, Request, HTTPException, Query
from typing import Optional
import logging

from app.services.integrations.whatsapp import get_whatsapp_service
from app.services.integrations.facebook import get_facebook_service

router = APIRouter()
logger = logging.getLogger(__name__)


# WhatsApp Webhooks
@router.get("/webhooks/whatsapp")
async def verify_whatsapp_webhook(
    hub_mode: str = Query(alias="hub.mode"),
    hub_token: str = Query(alias="hub.verify_token"),
    hub_challenge: str = Query(alias="hub.challenge")
):
    """
    Verify WhatsApp webhook
    
    Called by WhatsApp to verify webhook URL
    """
    whatsapp_service = get_whatsapp_service()
    challenge = whatsapp_service.verify_webhook(hub_mode, hub_token, hub_challenge)
    
    if challenge:
        return int(challenge)
    
    raise HTTPException(status_code=403, detail="Verification failed")


@router.post("/webhooks/whatsapp")
async def whatsapp_webhook(request: Request):
    """
    Handle incoming WhatsApp messages
    
    Processes messages and generates Aurora responses
    """
    try:
        data = await request.json()
        
        whatsapp_service = get_whatsapp_service()
        response = await whatsapp_service.handle_incoming_message(data)
        
        return {"status": "ok", "response": response}
        
    except Exception as e:
        logger.error(f"WhatsApp webhook error: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}


# Facebook/Instagram Webhooks
@router.get("/webhooks/facebook")
async def verify_facebook_webhook(
    hub_mode: str = Query(alias="hub.mode"),
    hub_token: str = Query(alias="hub.verify_token"),
    hub_challenge: str = Query(alias="hub.challenge")
):
    """
    Verify Facebook webhook
    
    Called by Facebook to verify webhook URL
    """
    facebook_service = get_facebook_service()
    challenge = facebook_service.verify_webhook(hub_mode, hub_token, hub_challenge)
    
    if challenge:
        return int(challenge)
    
    raise HTTPException(status_code=403, detail="Verification failed")


@router.post("/webhooks/facebook")
async def facebook_webhook(request: Request):
    """
    Handle incoming Facebook/Instagram messages
    
    Processes Messenger and Instagram DM messages
    """
    try:
        data = await request.json()
        
        # Detect platform (facebook/instagram)
        # Instagram messages come with different structure
        platform = "facebook"  # Default
        
        facebook_service = get_facebook_service()
        response = await facebook_service.handle_incoming_message(data, platform)
        
        return {"status": "ok", "response": response}
        
    except Exception as e:
        logger.error(f"Facebook webhook error: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}
