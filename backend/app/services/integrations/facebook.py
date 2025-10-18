"""
Facebook/Instagram Graph API Integration
Complete integration with Aurora IA for Meta platforms
"""

import os
import httpx
from typing import Dict, Optional, List
import logging
from datetime import datetime

from app.services.aurora_core import get_aurora_core
from app.services.aurora_flow import get_aurora_flow, Event, EventType

logger = logging.getLogger(__name__)


class FacebookService:
    """
    Facebook Graph API Service
    
    Features:
    - Page messages (Facebook Messenger)
    - Instagram direct messages
    - Comments moderation
    - Aurora IA integration
    """
    
    def __init__(self):
        self.access_token = os.getenv("FACEBOOK_PAGE_ACCESS_TOKEN", "")
        self.page_id = os.getenv("FACEBOOK_PAGE_ID", "")
        self.instagram_account_id = os.getenv("INSTAGRAM_ACCOUNT_ID", "")
        self.verify_token = os.getenv("FACEBOOK_VERIFY_TOKEN", "YYD_FB_WEBHOOK_2024")
        
        self.base_url = "https://graph.facebook.com/v18.0"
        self.aurora_core = get_aurora_core()
        self.aurora_flow = get_aurora_flow()
        
        logger.info("Facebook Service initialized")
    
    async def send_message(
        self,
        recipient_id: str,
        message_text: str,
        platform: str = "facebook"
    ) -> Dict:
        """
        Send message via Facebook Messenger or Instagram
        
        Args:
            recipient_id: PSID (Page-Scoped ID)
            message_text: Message to send
            platform: Platform (facebook/instagram)
        
        Returns:
            API response
        """
        url = f"{self.base_url}/me/messages"
        
        headers = {
            "Content-Type": "application/json"
        }
        
        params = {
            "access_token": self.access_token
        }
        
        payload = {
            "recipient": {"id": recipient_id},
            "message": {"text": message_text}
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    url,
                    json=payload,
                    headers=headers,
                    params=params
                )
                response.raise_for_status()
                
                logger.info(f"{platform.capitalize()} message sent to {recipient_id}")
                return response.json()
                
            except httpx.HTTPError as e:
                logger.error(f"Facebook API error: {e}")
                raise
    
    async def handle_incoming_message(
        self,
        webhook_data: Dict,
        platform: str = "facebook"
    ) -> Optional[str]:
        """
        Handle incoming Facebook/Instagram message
        
        Args:
            webhook_data: Webhook payload
            platform: Platform source
        
        Returns:
            Response message or None
        """
        try:
            entry = webhook_data.get("entry", [{}])[0]
            messaging = entry.get("messaging", [])
            
            if not messaging:
                return None
            
            event = messaging[0]
            sender_id = event.get("sender", {}).get("id")
            
            # Check if it's a message
            if "message" not in event:
                return None
            
            message = event["message"]
            message_text = message.get("text", "")
            
            if not message_text:
                return None
            
            # Detect language
            language = self._detect_language(message_text)
            
            # Generate Aurora response
            aurora_response = await self.aurora_core.generate_response(
                user_message=message_text,
                conversation_context={
                    "channel": platform,
                    "sender_id": sender_id
                },
                language=language
            )
            
            # Send response
            await self.send_message(sender_id, aurora_response.text, platform)
            
            # Publish event
            event_obj = Event(
                id=f"{platform}_{message.get('mid', '')}",
                type=EventType.FACEBOOK_MESSAGE,
                timestamp=datetime.utcnow(),
                payload={
                    "sender_id": sender_id,
                    "message": message_text,
                    "response": aurora_response.text,
                    "platform": platform,
                    "affective_state": aurora_response.affective_state.to_list()
                }
            )
            await self.aurora_flow.publish(event_obj)
            
            return aurora_response.text
            
        except Exception as e:
            logger.error(f"Error handling {platform} message: {e}", exc_info=True)
            return None
    
    async def get_page_info(self) -> Dict:
        """Get Facebook page information"""
        url = f"{self.base_url}/{self.page_id}"
        
        params = {
            "fields": "name,followers_count,fan_count",
            "access_token": self.access_token
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                logger.error(f"Facebook page info error: {e}")
                return {}
    
    def verify_webhook(self, mode: str, token: str, challenge: str) -> Optional[str]:
        """
        Verify Facebook webhook
        
        Args:
            mode: Verification mode
            token: Verify token
            challenge: Challenge string
        
        Returns:
            Challenge if verified, None otherwise
        """
        if mode == "subscribe" and token == self.verify_token:
            logger.info("Facebook webhook verified successfully")
            return challenge
        
        logger.warning("Facebook webhook verification failed")
        return None
    
    def _detect_language(self, text: str) -> str:
        """Simple language detection"""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ["olá", "oi", "obrigad", "você"]):
            return "pt"
        if any(word in text_lower for word in ["hola", "gracias", "usted"]):
            return "es"
        
        return "en"


# Singleton instance
_facebook_service: Optional[FacebookService] = None

def get_facebook_service() -> FacebookService:
    """Get singleton Facebook service instance"""
    global _facebook_service
    if _facebook_service is None:
        _facebook_service = FacebookService()
    return _facebook_service
