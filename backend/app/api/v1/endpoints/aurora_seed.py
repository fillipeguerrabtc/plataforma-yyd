"""
Aurora Knowledge Base Seed
Populates knowledge base with real YYD tours and FAQs
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.aurora_mind import get_aurora_mind

router = APIRouter()


@router.post("/seed/knowledge")
async def seed_knowledge_base(db: AsyncSession = Depends(get_db)):
    """Populate Aurora knowledge base with YYD tours and FAQs"""
    
    mind = get_aurora_mind()
    
    # Real YYD Tours from official website
    tours_data = [
        {
            "category": "tours",
            "content": "Personalized Half-Day Tour: €280 for 4 hours. Visit all Sintra monuments from outside, Cabo da Roca (westernmost point of Europe), fully personalized itinerary. Optional wine tasting available for €24 per person. Perfect for couples and small groups."
        },
        {
            "category": "tours",
            "content": "Personalized Full-Day Tour (BEST CHOICE ⭐): €420 for 8 hours. Includes everything from Half-Day Tour PLUS Azenhas do Mar village, Cascais coastal town. Optional authentic Portuguese lunch and monument entry tickets. Wine tour available. Recommended for comprehensive Sintra experience."
        },
        {
            "category": "tours",
            "content": "All-Inclusive Experience (Ultimate Luxury): €640 for 8 hours. EVERYTHING included: premium transfer service from/to hotel, authentic Portuguese lunch with wine, all monument entry tickets, professional wine tasting. Absolutely NO hidden costs. For travelers who want zero worries."
        },
        {
            "category": "tours",
            "content": "Electric Tuk-Tuk Tours: YYD uses 100% electric tuk-tuks. Silent, sustainable, eco-friendly. Can access narrow streets that buses cannot. Comfortable seating for up to 6 passengers. Perfect for photos and Instagram moments."
        }
    ]
    
    # FAQs
    faqs_data = [
        {
            "category": "faqs",
            "content": "Cancellation Policy: Free cancellation up to 48 hours before tour. Rescheduling is free if done 48h in advance. Weather guarantee: if IPMA issues severe weather alert, automatic free rebooking."
        },
        {
            "category": "faqs",
            "content": "Payment Methods: We accept all major credit cards through Stripe (secure payment). EUR, USD, and BRL currencies accepted. Payment processed immediately. Invoice emailed automatically."
        },
        {
            "category": "faqs",
            "content": "Languages: Tours available in English, Portuguese (Brazilian and European), and Spanish. Guides are certified and passionate locals. They adjust storytelling to your interests - history, photography, architecture, or gastronomy."
        },
        {
            "category": "faqs",
            "content": "Group Size: Private tours for 1-6 people in same tuk-tuk. Larger groups can book multiple tuk-tuks. Intimate experience guaranteed - no mass tourism."
        },
        {
            "category": "faqs",
            "content": "What to Bring: Comfortable walking shoes, sunscreen, water bottle, camera, light jacket (Sintra can be windy). We provide umbrellas if rain is expected."
        }
    ]
    
    # Sales techniques (for Aurora persuasion)
    sales_data = [
        {
            "category": "sales",
            "content": "Upsell Strategy: After customer shows interest in Half-Day, mention that Full-Day adds Azenhas do Mar and Cascais for only €140 more (8 hours vs 4 hours). Present it as best value. Use scarcity: 'Only 2 Full-Day slots left this week'."
        },
        {
            "category": "sales",
            "content": "Cross-sell: Suggest wine tasting (€24/person) for romantic couples. Mention photo package for Instagram influencers. Offer lunch recommendation at local Portuguese restaurant (commission 10%)."
        },
        {
            "category": "sales",
            "content": "Handling Objections - Price: Emphasize electric tuk-tuk uniqueness, certified passionate guides, personalized experience (not mass tourism), featured on ABC Good Morning America, 200+ 5-star TripAdvisor reviews."
        },
        {
            "category": "sales",
            "content": "Closing Technique: Use affective alignment. If customer seems excited (high activation), close with: 'Shall I secure your spot for [date]? I have the perfect guide for you.' If hesitant (low activation), provide social proof: '89% of our clients choose Full-Day after seeing how much there is to explore.'"
        }
    ]
    
    # Combine all
    all_knowledge = tours_data + faqs_data + sales_data
    
    # Insert into knowledge base
    ids = []
    for item in all_knowledge:
        knowledge_id = await mind.store_knowledge(
            db=db,
            category=item["category"],
            content=item["content"],
            metadata={"source": "seed", "verified": True}
        )
        ids.append(knowledge_id)
    
    return {
        "message": f"Successfully seeded {len(ids)} knowledge items",
        "categories": {
            "tours": len(tours_data),
            "faqs": len(faqs_data),
            "sales": len(sales_data)
        },
        "knowledge_ids": ids
    }
