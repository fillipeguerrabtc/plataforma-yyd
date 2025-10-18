"""
WhatsApp Cloud API Integration
Complete integration with Aurora IA for customer communication
"""

import os
import httpx
from typing import Dict, Optional
import logging
from datetime import datetime

from app.services.aurora_core import get_aurora_core
from app.services.aurora_flow import get_aurora_flow, Event, EventType

logger = logging.getLogger(__name__)


class WhatsAppService:
    """
    WhatsApp Cloud API Service
    
    Features:
    - Send/receive messages
    - Media handling
    - Template messages
    - Aurora IA integration
    """
    
    def __init__(self):
        self.access_token = os.getenv("WHATSAPP_ACCESS_TOKEN", "")
        self.phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "")
        self.business_account_id = os.getenv("WHATSAPP_BUSINESS_ACCOUNT_ID", "")
        self.verify_token = os.getenv("WHATSAPP_VERIFY_TOKEN", "YYD_WEBHOOK_2024")
        
        self.base_url = f"https://graph.facebook.com/v18.0/{self.phone_number_id}"
        self.aurora_core = get_aurora_core()
        self.aurora_flow = get_aurora_flow()
        
        logger.info("WhatsApp Service initialized")
    
    async def send_message(
        self,
        to: str,
        message: str,
        message_type: str = "text"
    ) -> Dict:
        """
        Send WhatsApp message
        
        Args:
            to: Recipient phone number (with country code)
            message: Message text
            message_type: Type of message (text/image/document)
        
        Returns:
            API response
        """
        url = f"{self.base_url}/messages"
        
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "messaging_product": "whatsapp",
            "to": to,
            "type": message_type,
            "text": {"body": message}
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                
                logger.info(f"WhatsApp message sent to {to}")
                return response.json()
                
            except httpx.HTTPError as e:
                logger.error(f"WhatsApp API error: {e}")
                raise
    
    async def send_template_message(
        self,
        to: str,
        template_name: str,
        language_code: str = "en",
        components: Optional[list] = None
    ) -> Dict:
        """
        Send WhatsApp template message
        
        Templates must be pre-approved by Meta
        
        Args:
            to: Recipient phone number
            template_name: Template name
            language_code: Language (en/pt_BR/es)
            components: Template components (variables)
        
        Returns:
            API response
        """
        url = f"{self.base_url}/messages"
        
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {"code": language_code},
                "components": components or []
            }
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                
                logger.info(f"WhatsApp template '{template_name}' sent to {to}")
                return response.json()
                
            except httpx.HTTPError as e:
                logger.error(f"WhatsApp template error: {e}")
                raise
    
    async def handle_incoming_message(self, webhook_data: Dict) -> Optional[str]:
        """
        Handle incoming WhatsApp message
        
        Processes webhook from WhatsApp and generates Aurora response
        
        Args:
            webhook_data: Webhook payload from WhatsApp
        
        Returns:
            Response message or None
        """
        try:
            entry = webhook_data.get("entry", [{}])[0]
            changes = entry.get("changes", [{}])[0]
            value = changes.get("value", {})
            messages = value.get("messages", [])
            
            if not messages:
                return None
            
            message = messages[0]
            from_number = message.get("from")
            message_type = message.get("type")
            
            # Extract message text
            if message_type == "text":
                message_text = message.get("text", {}).get("body", "")
            else:
                logger.info(f"Unsupported message type: {message_type}")
                return None
            
            # Detect language (simple heuristic)
            language = self._detect_language(message_text)
            
            # Generate Aurora response
            aurora_response = await self.aurora_core.generate_response(
                user_message=message_text,
                conversation_context={"channel": "whatsapp", "from": from_number},
                language=language
            )
            
            # Send response
            await self.send_message(from_number, aurora_response.text)
            
            # Publish event to Aurora Flow
            event = Event(
                id=f"whatsapp_{message.get('id')}",
                type=EventType.WHATSAPP_MESSAGE,
                timestamp=datetime.utcnow(),
                payload={
                    "from": from_number,
                    "message": message_text,
                    "response": aurora_response.text,
                    "affective_state": aurora_response.affective_state.to_list()
                }
            )
            await self.aurora_flow.publish(event)
            
            return aurora_response.text
            
        except Exception as e:
            logger.error(f"Error handling WhatsApp message: {e}", exc_info=True)
            return None
    
    def verify_webhook(self, mode: str, token: str, challenge: str) -> Optional[str]:
        """
        Verify WhatsApp webhook
        
        Args:
            mode: Verification mode
            token: Verify token
            challenge: Challenge string
        
        Returns:
            Challenge if verified, None otherwise
        """
        if mode == "subscribe" and token == self.verify_token:
            logger.info("WhatsApp webhook verified successfully")
            return challenge
        
        logger.warning("WhatsApp webhook verification failed")
        return None
    
    def _detect_language(self, text: str) -> str:
        """
        Simple language detection
        
        Args:
            text: Input text
        
        Returns:
            Language code (en/pt/es)
        """
        text_lower = text.lower()
        
        # Portuguese indicators
        if any(word in text_lower for word in ["olá", "oi", "obrigad", "por favor", "você", "está"]):
            return "pt"
        
        # Spanish indicators
        if any(word in text_lower for word in ["hola", "gracias", "por favor", "usted", "está"]):
            return "es"
        
        # Default to English
        return "en"


# Singleton instance
_whatsapp_service: Optional[WhatsAppService] = None

def get_whatsapp_service() -> WhatsAppService:
    """Get singleton WhatsApp service instance"""
    global _whatsapp_service
    if _whatsapp_service is None:
        _whatsapp_service = WhatsAppService()
    return _whatsapp_service
