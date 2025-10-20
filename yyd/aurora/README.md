# Aurora IA - AI Concierge Service

Multilingual AI concierge with affective mathematics for Yes, You Deserve! tours.

## Features

- 🤖 **GPT-4 Powered**: Natural language understanding in PT, EN, ES
- 💝 **Affective Mathematics**: Emotion analysis in ℝ³ (Valence, Arousal, Dominance)
- 🧠 **Vector Embeddings**: Semantic search using pgvector
- 💬 **WhatsApp/Facebook**: Multi-channel support
- 🎯 **Context-Aware**: Booking history, preferences, tour details
- 🗣️ **Voice Support**: Whisper transcription + TTS responses

## Setup

```bash
# Install Python dependencies
cd aurora
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your keys

# Run development server
python main.py
```

## Endpoints

- `GET /health` - Health check
- `POST /chat` - Main chat endpoint
- `POST /affective-state` - Calculate emotional state
- `POST /embeddings` - Generate vector embeddings
- `POST /search` - Semantic knowledge search
- `POST /webhooks/whatsapp` - WhatsApp webhook
- `POST /webhooks/facebook` - Facebook Messenger webhook

## Affective Mathematics (ℝ³)

Aurora analyzes emotional states in 3-dimensional space:

- **Valence** (V): Positive/negative emotion (-1 to 1)
- **Arousal** (A): Activation level (0 to 1)
- **Dominance** (D): Control/power (0 to 1)

Combined vector: **s** = (V, A, D) ∈ ℝ³

## Architecture

```
User Message → Aurora FastAPI
                ↓
        [Embeddings Search]
                ↓
        [GPT-4 + Context]
                ↓
        [Affective Analysis]
                ↓
        Response + Actions
```

## Integration with YYD Platform

Aurora connects to:
- PostgreSQL database (bookings, customers, products)
- Next.js Client app (chat widget)
- Next.js Backoffice (conversation monitoring)
- WhatsApp Business API
- Facebook Messenger API
