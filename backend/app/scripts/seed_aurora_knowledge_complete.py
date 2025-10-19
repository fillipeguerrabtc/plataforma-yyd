"""
Seed Aurora Knowledge Base - COMPLETO
Whitepaper-aligned knowledge for production Aurora IA

Includes:
- All 4 official YYD tours (T-SIN-001, T-CAS-002, T-LIS-003, T-DOU-004)
- Policies (cancellation, weather, pricing)
- FAQs (multilingual EN/PT/ES)
- Sales scripts
- Company philosophy
"""

import asyncio
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.services.aurora_mind_production import get_aurora_mind_production
from app.core.config import settings


# ==================== OFFICIAL YYD TOURS ====================

TOURS_EN = [
    {
        "category": "tour_product",
        "content": """
        **SINTRA MAGIC PRIVATE TOUR (T-SIN-001)**
        
        Duration: 4 hours
        Price: €220
        Capacity: Up to 4 people
        Vehicle: Electric tuk-tuk
        
        **Highlights:**
        - Pena Palace (exterior visit with photo stops)
        - Quinta da Regaleira gardens
        - Sintra historic center
        - Local pastéis de nata tasting
        - Professional guide with historical insights
        
        **What's Included:**
        - Electric tuk-tuk transportation
        - Professional certified guide
        - Photo stops at best viewpoints
        - Flexible itinerary
        
        **What's NOT Included:**
        - Monument entrance tickets (€14-20 per person)
        - Food and drinks (except complimentary water)
        - Optional wine tasting (€24/person)
        
        **Add-ons Available:**
        - Extra time: €50/hour
        - Wine tasting: €24/person
        - Child seat: Free
        - Photo session: €40
        
        **Ideal For:**
        - Couples, families, small groups
        - First-time visitors to Sintra
        - Photography enthusiasts
        - History and architecture lovers
        
        **Meeting Point:**
        Sintra train station or hotel pickup (Sintra/Cascais area)
        
        **Cancellation Policy:**
        - Free cancellation up to 48 hours before
        - 50% charge if cancelled 24-48 hours before
        - 100% charge if no-show or cancelled < 24 hours
        """,
        "metadata": {
            "tour_code": "T-SIN-001",
            "city": "Sintra",
            "price_eur": 220,
            "duration_hours": 4
        }
    },
    {
        "category": "tour_product",
        "content": """
        **SUNSET AT CABO DA ROCA (T-CAS-002)**
        
        Duration: 2 hours
        Price: €180
        Capacity: Up to 4 people
        Vehicle: Electric tuk-tuk
        
        **Experience:**
        Watch the sunset at the westernmost point of continental Europe!
        
        **Route:**
        - Cascais Marina departure
        - Scenic coastal drive
        - Guincho Beach viewpoint
        - Cabo da Roca cliffs
        - Champagne/wine at sunset
        - Return via Boca do Inferno
        
        **What's Included:**
        - Electric tuk-tuk
        - Professional guide
        - Champagne or wine (1 bottle for group)
        - Blankets (if needed)
        - Photos by guide
        
        **Best Time:**
        April-October (check sunset times - tour starts 1.5h before sunset)
        
        **Weather Policy:**
        Tour runs in light rain. Cancelled only for severe weather with full refund.
        
        **Perfect For:**
        - Romantic couples
        - Proposal moments
        - Photography
        - Nature lovers
        """,
        "metadata": {
            "tour_code": "T-CAS-002",
            "city": "Cascais",
            "price_eur": 180,
            "duration_hours": 2
        }
    },
    {
        "category": "tour_product",
        "content": """
        **LISBON ELECTRIC EXPERIENCE (T-LIS-003)**
        
        Duration: 3 hours
        Price: €160
        Capacity: Up to 4 people
        Vehicle: Electric tuk-tuk
        
        **Neighborhoods Explored:**
        - Alfama (oldest district, narrow streets)
        - Graça (panoramic viewpoints)
        - Mouraria (multicultural quarter)
        - Baixa (downtown, historic center)
        
        **Highlights:**
        - Miradouro da Senhora do Monte (best view in Lisbon)
        - Fado music history and culture
        - Lisbon Cathedral
        - Authentic tiled houses
        - Hidden local spots
        - Ginjinha tasting (optional)
        
        **What Makes Us Different:**
        - Skip the tourist crowds
        - Electric & eco-friendly
        - Local guide (born in Lisbon)
        - Flexible route
        
        **Food Options (not included, but we can stop):**
        - Pastéis de nata: €1-2
        - Bifana sandwich: €3-4
        - Ginjinha liqueur: €1.50
        
        **Meeting Point:**
        Praça do Comércio or hotel pickup (Lisbon center)
        """,
        "metadata": {
            "tour_code": "T-LIS-003",
            "city": "Lisboa",
            "price_eur": 160,
            "duration_hours": 3
        }
    },
    {
        "category": "tour_product",
        "content": """
        **DOURO INTIMATE WINE ROUTE (T-DOU-004)**
        
        Duration: 8 hours (full day)
        Price: €320
        Capacity: Up to 4 people
        Vehicle: Comfortable van
        
        **Full Day Experience:**
        - Depart Lisbon/Porto (6:00 AM)
        - Arrive Douro Valley (8:30 AM)
        - Visit 2 family-owned quintas (wineries)
        - Traditional Portuguese lunch at quinta
        - River cruise (1 hour) optional
        - Return (arrive 6:00 PM)
        
        **Included:**
        - Private transportation (van)
        - Professional guide/driver
        - Wine tastings at 2 quintas (6-8 wines total)
        - Traditional lunch with wine pairing
        - All taxes and fees
        
        **Not Included:**
        - River cruise ticket (€15-25)
        - Extra wine purchases
        - Gratuities (optional)
        
        **Wine Varieties Tasted:**
        - Port wine (ruby, tawny, vintage)
        - Douro DOC red wines
        - White wines
        - Moscatel
        
        **Ideal For:**
        - Wine enthusiasts
        - Couples celebrating
        - Small groups
        - Foodies
        
        **Requirements:**
        - Minimum 2 people
        - Must be 18+ for wine tasting
        - Comfortable walking shoes
        
        **Note:**
        This is our premium experience. Small group, personalized attention,
        family quintas (not mass tourism).
        """,
        "metadata": {
            "tour_code": "T-DOU-004",
            "city": "Douro",
            "price_eur": 320,
            "duration_hours": 8
        }
    }
]

# ==================== POLICIES ====================

POLICIES_EN = [
    {
        "category": "policy_cancellation",
        "content": """
        **YYD Cancellation & Refund Policy**
        
        We understand plans change! Here's our flexible policy:
        
        **Free Cancellation:**
        - Cancel up to 48 hours before tour: 100% refund
        - Modify date/time up to 24 hours before: Free
        
        **Partial Refund:**
        - Cancel 24-48 hours before: 50% refund
        
        **No Refund:**
        - Cancel less than 24 hours before: No refund
        - No-show: No refund
        
        **Weather Cancellation:**
        - Severe weather (IPMA red alert): Full refund or reschedule
        - Light rain: Tour proceeds (we have rain covers!)
        
        **How to Cancel:**
        1. Email: hello@yesyoudeserve.tours
        2. WhatsApp: +351 XXX XXX XXX
        3. Via booking confirmation link
        
        **Refund Timeline:**
        - Credit card refunds: 5-10 business days
        - Original payment method
        
        **Force Majeure:**
        In case of strikes, natural disasters, pandemic lockdowns: full refund.
        """,
        "metadata": {"policy_type": "cancellation"}
    },
    {
        "category": "policy_pricing",
        "content": """
        **YYD Pricing & Payment Policy**
        
        **Price Structure:**
        - Prices are PER TOUR (not per person)
        - Up to 4 people included in base price
        - 5th person (if vehicle allows): +€30
        
        **What's Included in Price:**
        - Electric vehicle transportation
        - Professional certified guide
        - Fuel/electricity
        - Insurance
        - Taxes
        
        **Additional Costs:**
        - Monument entrance tickets (not included)
        - Food and drinks (unless specified)
        - Gratuities (optional, 10-15% customary)
        
        **Payment Methods:**
        - Credit/debit card (Visa, Mastercard, Amex)
        - Stripe secure payment
        - PayPal (for international)
        - Cash (on-site, EUR only)
        
        **When to Pay:**
        - Online booking: Pay 30% deposit, rest on tour day
        - Same-day booking: Full payment required
        
        **Dynamic Pricing:**
        - Peak season (Jun-Sep): +10-15%
        - Last-minute (< 24h): +20%
        - Early bird (>14 days): -10%
        
        **Currency:**
        - Prices shown in EUR
        - International cards accepted (automatic conversion)
        """,
        "metadata": {"policy_type": "pricing"}
    }
]

# ==================== FAQS ====================

FAQS_EN = [
    {
        "category": "faq",
        "content": """
        **FAQ: Is YYD suitable for families with children?**
        
        **Answer:**
        Absolutely! We LOVE families!
        
        - Child seats available (free, request when booking)
        - Flexible itinerary (bathroom breaks, snack stops)
        - Engaging stories for kids
        - Shorter route options for young children
        
        **Ages:**
        - Babies (0-2): Free, child seat provided
        - Kids (3-12): Included in group price
        - Teens (13+): Count as adult for capacity
        
        **Kid-Friendly Tours:**
        - Sintra Magic (castles = kids love it!)
        - Lisbon Electric (short, varied)
        
        **Less Suitable:**
        - Douro Wine (long day, wine-focused)
        - Sunset Cabo da Roca (timing may be late for young kids)
        """,
        "metadata": {"topic": "families"}
    },
    {
        "category": "faq",
        "content": """
        **FAQ: What if it rains on my tour day?**
        
        **Answer:**
        We're prepared for Portuguese weather!
        
        **Light Rain:**
        - Tour proceeds as scheduled
        - We have rain covers and umbrellas
        - Actually beautiful (fewer crowds!)
        
        **Heavy Rain:**
        - We contact you 24h before
        - Options: reschedule (free) or full refund
        
        **Severe Weather (IPMA Red Alert):**
        - Automatic cancellation for safety
        - 100% refund or reschedule
        
        **What We Provide:**
        - Waterproof covers for tuk-tuks
        - Umbrellas
        - Blankets if cold
        
        **Pro Tip:**
        Some of our best photos are on moody, cloudy days!
        """,
        "metadata": {"topic": "weather"}
    },
    {
        "category": "faq",
        "content": """
        **FAQ: Do I need to buy monument tickets separately?**
        
        **Answer:**
        Yes, monument entrance tickets are NOT included in tour price.
        
        **Why?**
        - Gives you flexibility (some guests prefer exterior photos)
        - Monument tickets are personal (age discounts, student rates)
        
        **Typical Costs (Sintra):**
        - Pena Palace: €14 (palace + park) or €7.50 (park only)
        - Quinta da Regaleira: €12
        - Moorish Castle: €8
        - National Palace: €10
        
        **Our Recommendation:**
        - First time in Sintra: Budget €25-35 per person for tickets
        - Photography-focused: Park tickets only (€7-10)
        
        **Can Guide Buy Tickets?**
        - Yes! Guide can purchase on your behalf
        - You pay guide directly (cash or Revolut/MBWay)
        - Saves queuing time
        
        **Combo Tickets:**
        - We can arrange advance combo tickets (5% discount)
        - Request when booking
        """,
        "metadata": {"topic": "tickets"}
    }
]

# ==================== SALES SCRIPTS ====================

SALES_SCRIPTS_EN = [
    {
        "category": "sales_greeting",
        "content": """
        **Aurora Sales Greeting Script**
        
        Hi! 👋 I'm Aurora, YYD's AI concierge.
        
        I'm here to help you discover the perfect Portuguese experience!
        
        A bit about us:
        - 🏆 200+ five-star TripAdvisor reviews
        - 🌿 100% electric tuk-tuks (eco-friendly!)
        - 📺 Featured on ABC Good Morning America
        - 👨‍👩‍👧‍👦 Boutique, personalized tours (max 4 people)
        
        **What brings you to Portugal?**
        - Romantic getaway?
        - Family vacation?
        - Photography adventure?
        - Wine tasting?
        
        Tell me your vibe, and I'll suggest the perfect tour! ✨
        """,
        "metadata": {"script_type": "greeting"}
    },
    {
        "category": "sales_upsell",
        "content": """
        **Aurora Upsell Script - Add-Ons**
        
        **For Sintra Magic Tour:**
        
        "I see you're booking our Sintra Magic tour - excellent choice!
        
        Would you like to make it extra special?
        
        ✨ **Popular Add-Ons:**
        
        🍷 **Wine Tasting** (+€24/person)
        - Visit local quinta
        - Taste 3 regional wines
        - Paired cheese & charcuterie
        - Only 15min detour
        
        📸 **Professional Photo Session** (+€40)
        - 50+ edited photos
        - Delivered within 48h
        - Perfect for couples/proposals
        
        ⏱ **Extra Hour** (+€50)
        - Visit additional monument
        - More photo stops
        - Relaxed pace
        
        **80% of guests add at least one!**
        
        Interested?"
        """,
        "metadata": {"script_type": "upsell"}
    }
]

# ==================== COMPANY PHILOSOPHY ====================

PHILOSOPHY_EN = [
    {
        "category": "philosophy",
        "content": """
        **YYD Philosophy - The Five Boutique Laws**
        
        1. **Humanity First**
           Every interaction should feel human, even when mediated by AI.
           We're not a factory - we're storytellers.
        
        2. **Functional Beauty**
           Beauty serves clarity and comfort.
           Our tuk-tuks are elegant AND practical.
        
        3. **Cultural Empathy**
           We adapt to YOUR rhythm - American directness, Brazilian warmth,
           European sophistication.
        
        4. **Real Sustainability**
           100% electric fleet. Local partnerships. Carbon-neutral experiences.
           Not greenwashing - actual impact.
        
        5. **Invisible Excellence**
           Technology should be invisible. Efficiency without ostentation.
           You experience magic - we handle complexity.
        
        **Our Promise:**
        "Luxury is not excess - it's care."
        
        We don't sell tours. We sell moments designed for YOU.
        """,
        "metadata": {"content_type": "philosophy"}
    }
]


async def seed_knowledge_base():
    """Seed complete Aurora knowledge base"""
    
    print("🌱 Seeding Aurora Knowledge Base...")
    print(f"📊 Database: {settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else 'local'}")
    
    # Create async engine
    database_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    engine = create_async_engine(
        database_url,
        echo=False
    )
    
    # Create session
    async_session_factory = sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False
    )
    
    # Get Aurora Mind instance
    aurora_mind = get_aurora_mind_production()
    
    total_items = 0
    errors = 0
    
    async with async_session_factory() as session:
        # Seed Tours
        print("\n📍 Seeding Tours (EN)...")
        for tour in TOURS_EN:
            try:
                knowledge_id = await aurora_mind.store_knowledge(
                    db=session,
                    category=tour["category"],
                    content=tour["content"],
                    metadata=tour["metadata"],
                    language="en"
                )
                await session.commit()  # ✅ COMMIT EXPLÍCITO
                print(f"  ✅ {tour['metadata'].get('tour_code', 'Tour')} - ID: {knowledge_id}")
                total_items += 1
            except Exception as e:
                print(f"  ❌ Error: {e}")
                await session.rollback()
                errors += 1
        
        # Seed Policies
        print("\n📜 Seeding Policies (EN)...")
        for policy in POLICIES_EN:
            try:
                knowledge_id = await aurora_mind.store_knowledge(
                    db=session,
                    category=policy["category"],
                    content=policy["content"],
                    metadata=policy["metadata"],
                    language="en"
                )
                await session.commit()  # ✅ COMMIT EXPLÍCITO
                print(f"  ✅ {policy['category']}")
                total_items += 1
            except Exception as e:
                print(f"  ❌ Error: {e}")
                await session.rollback()
                errors += 1
        
        # Seed FAQs
        print("\n❓ Seeding FAQs (EN)...")
        for faq in FAQS_EN:
            try:
                knowledge_id = await aurora_mind.store_knowledge(
                    db=session,
                    category=faq["category"],
                    content=faq["content"],
                    metadata=faq["metadata"],
                    language="en"
                )
                await session.commit()  # ✅ COMMIT EXPLÍCITO
                print(f"  ✅ {faq['metadata'].get('topic', 'FAQ')}")
                total_items += 1
            except Exception as e:
                print(f"  ❌ Error: {e}")
                await session.rollback()
                errors += 1
        
        # Seed Sales Scripts
        print("\n💰 Seeding Sales Scripts (EN)...")
        for script in SALES_SCRIPTS_EN:
            try:
                knowledge_id = await aurora_mind.store_knowledge(
                    db=session,
                    category=script["category"],
                    content=script["content"],
                    metadata=script["metadata"],
                    language="en"
                )
                await session.commit()  # ✅ COMMIT EXPLÍCITO
                print(f"  ✅ {script['category']}")
                total_items += 1
            except Exception as e:
                print(f"  ❌ Error: {e}")
                await session.rollback()
                errors += 1
        
        # Seed Philosophy
        print("\n🎭 Seeding Philosophy (EN)...")
        for philo in PHILOSOPHY_EN:
            try:
                knowledge_id = await aurora_mind.store_knowledge(
                    db=session,
                    category=philo["category"],
                    content=philo["content"],
                    metadata=philo["metadata"],
                    language="en"
                )
                await session.commit()  # ✅ COMMIT EXPLÍCITO
                print(f"  ✅ Philosophy")
                total_items += 1
            except Exception as e:
                print(f"  ❌ Error: {e}")
                await session.rollback()
                errors += 1
    
    await engine.dispose()  # ✅ CLEANUP
    
    print(f"\n" + "="*60)
    print(f"✅ Seeding complete!")
    print(f"📊 Total items successfully seeded: {total_items}")
    print(f"❌ Errors: {errors}")
    print(f"🧠 Aurora Mind is now ready for production!")
    print("="*60)


if __name__ == "__main__":
    asyncio.run(seed_knowledge_base())
