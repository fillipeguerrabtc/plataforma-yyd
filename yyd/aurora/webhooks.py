"""
WhatsApp and Facebook Messenger webhook handlers for Aurora IA
"""

from fastapi import APIRouter, Request, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import os
import hmac
import hashlib
import httpx
from datetime import datetime

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

# WhatsApp Configuration
WHATSAPP_ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN", "")
WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "")
WHATSAPP_VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "aurora_verify_2024")
WHATSAPP_API_URL = "https://graph.facebook.com/v18.0"

# Facebook Configuration
FACEBOOK_ACCESS_TOKEN = os.getenv("FACEBOOK_PAGE_ACCESS_TOKEN", "")
FACEBOOK_VERIFY_TOKEN = os.getenv("FACEBOOK_VERIFY_TOKEN", "aurora_verify_2024")

# ============ WhatsApp Webhook ============

@router.get("/whatsapp")
async def whatsapp_webhook_verify(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
):
    """
    WhatsApp webhook verification endpoint
    Facebook sends GET request to verify webhook
    """
    if hub_mode == "subscribe" and hub_verify_token == WHATSAPP_VERIFY_TOKEN:
        print(f"✅ WhatsApp webhook verified at {datetime.utcnow().isoformat()}")
        return int(hub_challenge)
    else:
        raise HTTPException(status_code=403, detail="Verification failed")

@router.post("/whatsapp")
async def whatsapp_webhook(request: Request):
    """
    WhatsApp webhook endpoint for receiving messages
    
    Message types supported:
    - text: Simple text messages
    - image: Image messages
    - audio: Voice notes
    - location: Location sharing
    """
    try:
        body = await request.json()
        
        # Log incoming webhook
        print(f"📥 WhatsApp webhook received: {body}")
        
        # Extract message data
        if "entry" in body:
            for entry in body["entry"]:
                for change in entry.get("changes", []):
                    value = change.get("value", {})
                    messages = value.get("messages", [])
                    
                    for message in messages:
                        await process_whatsapp_message(message, value)
        
        return {"status": "ok"}
    except Exception as e:
        print(f"❌ WhatsApp webhook error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def process_whatsapp_message(message: Dict[str, Any], value: Dict[str, Any]):
    """Process incoming WhatsApp message"""
    from_number = message.get("from")
    message_type = message.get("type")
    message_id = message.get("id")
    
    print(f"💬 WhatsApp message from {from_number}: type={message_type}")
    
    # Extract text content
    text = ""
    if message_type == "text":
        text = message.get("text", {}).get("body", "")
    elif message_type == "audio":
        text = "[Voice message received - transcription pending]"
    elif message_type == "image":
        text = "[Image received]"
    elif message_type == "location":
        text = "[Location shared]"
    
    # TODO: Process with Aurora IA chat engine
    # TODO: Generate intelligent response
    # TODO: Update conversation history in database
    
    # Send response back to WhatsApp
    response_text = f"Olá! Aurora IA aqui 🤖. Recebi sua mensagem: '{text}'. Em breve terei inteligência completa para ajudá-lo!"
    await send_whatsapp_message(from_number, response_text)

async def send_whatsapp_message(to_number: str, text: str):
    """Send WhatsApp message via Facebook Graph API"""
    if not WHATSAPP_ACCESS_TOKEN or not WHATSAPP_PHONE_NUMBER_ID:
        print("⚠️  WhatsApp credentials not configured")
        return
    
    url = f"{WHATSAPP_API_URL}/{WHATSAPP_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": to_number,
        "type": "text",
        "text": {"body": text},
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            print(f"✅ WhatsApp message sent to {to_number}")
        else:
            print(f"❌ WhatsApp send failed: {response.text}")

# ============ Facebook Messenger Webhook ============

@router.get("/facebook")
async def facebook_webhook_verify(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
):
    """
    Facebook Messenger webhook verification
    """
    if hub_mode == "subscribe" and hub_verify_token == FACEBOOK_VERIFY_TOKEN:
        print(f"✅ Facebook webhook verified at {datetime.utcnow().isoformat()}")
        return int(hub_challenge)
    else:
        raise HTTPException(status_code=403, detail="Verification failed")

@router.post("/facebook")
async def facebook_webhook(request: Request):
    """
    Facebook Messenger webhook endpoint
    """
    try:
        body = await request.json()
        print(f"📥 Facebook webhook received: {body}")
        
        # Extract messages
        if "entry" in body:
            for entry in body["entry"]:
                for messaging_event in entry.get("messaging", []):
                    if "message" in messaging_event:
                        await process_facebook_message(messaging_event)
        
        return {"status": "ok"}
    except Exception as e:
        print(f"❌ Facebook webhook error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def process_facebook_message(event: Dict[str, Any]):
    """Process incoming Facebook Messenger message"""
    sender_id = event.get("sender", {}).get("id")
    message = event.get("message", {})
    text = message.get("text", "")
    
    print(f"💬 Facebook message from {sender_id}: {text}")
    
    # TODO: Process with Aurora IA
    # TODO: Update conversation history
    
    # Send response
    response_text = f"Olá! Aurora IA aqui 🤖. Recebi sua mensagem via Facebook: '{text}'. Em breve estarei totalmente operacional!"
    await send_facebook_message(sender_id, response_text)

async def send_facebook_message(recipient_id: str, text: str):
    """Send Facebook Messenger message"""
    if not FACEBOOK_ACCESS_TOKEN:
        print("⚠️  Facebook credentials not configured")
        return
    
    url = f"{WHATSAPP_API_URL}/me/messages"
    headers = {"Content-Type": "application/json"}
    params = {"access_token": FACEBOOK_ACCESS_TOKEN}
    payload = {
        "recipient": {"id": recipient_id},
        "message": {"text": text},
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers, params=params)
        if response.status_code == 200:
            print(f"✅ Facebook message sent to {recipient_id}")
        else:
            print(f"❌ Facebook send failed: {response.text}")
