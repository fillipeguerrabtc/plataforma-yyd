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

# Twilio WhatsApp Configuration (Sandbox)
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")  # Sandbox default

# WhatsApp Configuration (Facebook Business API)
WHATSAPP_ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN", "")
WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "")
WHATSAPP_VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "aurora_verify_2024")
WHATSAPP_API_URL = "https://graph.facebook.com/v18.0"

# Facebook Configuration
FACEBOOK_ACCESS_TOKEN = os.getenv("FACEBOOK_PAGE_ACCESS_TOKEN", "")
FACEBOOK_VERIFY_TOKEN = os.getenv("FACEBOOK_VERIFY_TOKEN", "aurora_verify_2024")

# ============ Twilio WhatsApp Webhook (Sandbox) ============

@router.post("/twilio/whatsapp")
async def twilio_whatsapp_webhook(request: Request):
    """
    Twilio WhatsApp Sandbox webhook endpoint
    
    Receives messages from Twilio WhatsApp Sandbox and processes with Aurora IA
    Webhook URL: https://your-domain.repl.co/webhooks/twilio/whatsapp
    """
    try:
        form_data = await request.form()
        
        # Extract Twilio webhook data
        from_number = str(form_data.get("From", ""))
        to_number = str(form_data.get("To", ""))
        body = str(form_data.get("Body", ""))
        message_sid = str(form_data.get("MessageSid", ""))
        
        print(f"📥 Twilio WhatsApp message received:")
        print(f"   From: {from_number}")
        print(f"   To: {to_number}")
        print(f"   Body: {body}")
        print(f"   SID: {message_sid}")
        
        # Process with Aurora IA
        await process_twilio_whatsapp_message(from_number, body)
        
        # Return TwiML response (empty for now)
        return {
            "status": "ok",
            "message_sid": message_sid
        }
    except Exception as e:
        print(f"❌ Twilio WhatsApp webhook error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def process_twilio_whatsapp_message(from_number: str, text: str):
    """Process incoming Twilio WhatsApp message with Aurora IA"""
    try:
        from affective_mathematics import AffectiveAnalyzer
        from intelligence import aurora_intelligence
        from langdetect import detect, LangDetectException
        
        # Auto-detect language from message
        language = "pt"  # Default to Portuguese
        try:
            detected = detect(text)
            # Map language codes to our supported languages
            if detected == "en":
                language = "en"
            elif detected == "es":
                language = "es"
            elif detected == "pt":
                language = "pt"
            else:
                # For other languages, default to English
                language = "en"
            print(f"🌍 Language detected: {language} (from: {detected})")
        except LangDetectException:
            print(f"⚠️  Could not detect language, using default: {language}")
        
        # Analyze affective state
        analyzer = AffectiveAnalyzer()
        customer_state = analyzer.analyze_text(text, language)
        
        # Generate intelligent response
        messages = [{"role": "user", "content": text}]
        context = {
            "tours": [
                {"name": "Sintra Highlights", "price": 60, "duration": 4},
                {"name": "Cascais Coastal", "price": 50, "duration": 3},
                {"name": "Sintra & Cascais Full Day", "price": 120, "duration": 8},
            ],
            "platform": "whatsapp",
            "channel": "twilio_sandbox"
        }
        
        response_data = aurora_intelligence.generate_response(
            messages=messages,
            language=language,
            customer_state=customer_state,
            context=context
        )
        
        # Send response back via Twilio
        await send_twilio_whatsapp_message(from_number, response_data["message"])
        
        print(f"✅ Processed message with affective state: {customer_state.to_dict()}")
        print(f"   Response sent: {response_data['message'][:100]}...")
        
    except Exception as e:
        print(f"❌ Error processing Twilio message: {str(e)}")
        # Send fallback response
        fallback_msg = "Olá! Sou Aurora 🤖 Estou tendo problemas técnicos, mas logo estarei pronta para ajudá-lo!"
        await send_twilio_whatsapp_message(from_number, fallback_msg)

async def send_twilio_whatsapp_message(to_number: str, text: str):
    """Send WhatsApp message via Twilio API"""
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
        print("⚠️  Twilio credentials not configured")
        return
    
    try:
        # Use Twilio REST API
        url = f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json"
        
        data = {
            "From": TWILIO_WHATSAPP_NUMBER,
            "To": to_number,
            "Body": text
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                data=data,
                auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
            )
            
            if response.status_code in [200, 201]:
                print(f"✅ Twilio WhatsApp message sent to {to_number}")
            else:
                print(f"❌ Twilio send failed: {response.status_code} - {response.text}")
                
    except Exception as e:
        print(f"❌ Error sending Twilio message: {str(e)}")

# ============ WhatsApp Webhook (Facebook Business API) ============

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
    from_number = str(message.get("from", ""))
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
    
    # Process with Aurora IA RAG + 7-layer memory system
    try:
        from affective_mathematics import AffectiveAnalyzer
        from rag import decision_engine
        from memory import MemoryManager
        from langdetect import detect, LangDetectException
        import uuid
        
        # Auto-detect language
        language = "pt"
        try:
            detected = detect(text)
            if detected in ["en", "pt", "es"]:
                language = detected
        except LangDetectException:
            pass
        
        # Analyze affective state
        analyzer = AffectiveAnalyzer()
        customer_state = analyzer.analyze_text(text, language)
        emotional_dict = customer_state.to_dict()
        
        # Create persistent conversation ID based on channel + sender
        # This ensures all messages from same sender map to same conversation
        import hashlib
        conversation_id = hashlib.md5(f"whatsapp_{from_number}".encode()).hexdigest()
        session_id = conversation_id
        
        memory_manager = MemoryManager()
        memory_manager.store_conversation_snapshot(
            session_id=session_id,
            conversation_id=conversation_id,
            customer_id=from_number,
            messages=[{"role": "user", "content": text}],
            emotional_state=emotional_dict
        )
        
        # Generate intelligent response using RAG
        response_data = await decision_engine.generate_response(
            query=text,
            emotional_state=emotional_dict,
            conversation_context={"session_id": session_id, "conversation_id": conversation_id},
            locale=language,
            messages=[{"role": "user", "content": text}]
        )
        
        response_text = response_data['message']
        
        # Detect handoff conditions
        from handoff_detection import detect_handoff, create_handoff_record
        
        requires_handoff, handoff_reason = detect_handoff(
            user_message=text,
            emotional_state=emotional_dict,
            response_confidence=response_data.get('confidence', 1.0)
        )
        
        # Create handoff record if needed
        if requires_handoff:
            await create_handoff_record(
                conversation_id=conversation_id,
                lead_id=None,
                reason=handoff_reason,
                emotional_state=emotional_dict,
                confidence=response_data.get('confidence', 1.0),
                notes=f"WhatsApp auto-detected from {from_number}: {text[:100]}"
            )
        
    except Exception as e:
        print(f"❌ Error processing WhatsApp message with Aurora: {e}")
        response_text = "Olá! Sou Aurora 🤖 Estou tendo problemas técnicos temporários. Por favor, tente novamente em alguns momentos!"
    
    # Send response back to WhatsApp
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
    
    # Process with Aurora IA RAG + 7-layer memory system
    try:
        from affective_mathematics import AffectiveAnalyzer
        from rag import decision_engine
        from memory import MemoryManager
        from langdetect import detect, LangDetectException
        import uuid
        
        # Auto-detect language
        language = "pt"
        try:
            detected = detect(text)
            if detected in ["en", "pt", "es"]:
                language = detected
        except LangDetectException:
            pass
        
        # Analyze affective state
        analyzer = AffectiveAnalyzer()
        customer_state = analyzer.analyze_text(text, language)
        emotional_dict = customer_state.to_dict()
        
        # Create persistent conversation ID based on channel + sender  
        # This ensures all messages from same sender map to same conversation
        import hashlib
        conversation_id = hashlib.md5(f"facebook_{sender_id}".encode()).hexdigest()
        session_id = conversation_id
        
        memory_manager = MemoryManager()
        memory_manager.store_conversation_snapshot(
            session_id=session_id,
            conversation_id=conversation_id,
            customer_id=sender_id,
            messages=[{"role": "user", "content": text}],
            emotional_state=emotional_dict
        )
        
        # Generate intelligent response using RAG
        response_data = await decision_engine.generate_response(
            query=text,
            emotional_state=emotional_dict,
            conversation_context={"session_id": session_id, "conversation_id": conversation_id},
            locale=language,
            messages=[{"role": "user", "content": text}]
        )
        
        response_text = response_data['message']
        
        # Detect handoff conditions
        from handoff_detection import detect_handoff, create_handoff_record
        
        requires_handoff, handoff_reason = detect_handoff(
            user_message=text,
            emotional_state=emotional_dict,
            response_confidence=response_data.get('confidence', 1.0)
        )
        
        # Create handoff record if needed
        if requires_handoff:
            await create_handoff_record(
                conversation_id=conversation_id,
                lead_id=None,
                reason=handoff_reason,
                emotional_state=emotional_dict,
                confidence=response_data.get('confidence', 1.0),
                notes=f"Facebook auto-detected from {sender_id}: {text[:100]}"
            )
        
    except Exception as e:
        print(f"❌ Error processing Facebook message with Aurora: {e}")
        response_text = "Olá! Sou Aurora 🤖 Estou tendo problemas técnicos temporários. Por favor, tente novamente!"
    
    # Send response
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
