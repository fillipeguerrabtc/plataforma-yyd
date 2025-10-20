"""
Initialize Aurora Knowledge Base with YYD Tour Information

Populates vector database with:
- Tour descriptions (multilingual)
- FAQs
- Policies
- Local recommendations
"""

from embeddings import embeddings_service

# Tour Information (from YYD website analysis)
TOUR_KNOWLEDGE = [
    # Sintra Tours
    {
        "content": "Sintra Highlights Tour: Visit the most iconic palaces of Sintra including Pena Palace, Quinta da Regaleira, and Moorish Castle. Experience the fairy-tale architecture, mystical gardens, and panoramic mountain views. Duration: 4 hours. Price: €60 per person. Perfect for first-time visitors who want to see the essential Sintra landmarks.",
        "content_type": "tour_info",
        "language": "en",
        "metadata": {
            "name": "Sintra Highlights",
            "price": 60,
            "duration": 4,
            "locations": ["Pena Palace", "Quinta da Regaleira", "Moorish Castle"],
            "category": "sintra"
        }
    },
    {
        "content": "Tour Destaques de Sintra: Visite os palácios mais icônicos de Sintra incluindo Palácio da Pena, Quinta da Regaleira e Castelo dos Mouros. Experimente a arquitetura de conto de fadas, jardins místicos e vistas panorâmicas da montanha. Duração: 4 horas. Preço: €60 por pessoa. Perfeito para visitantes pela primeira vez que querem ver os marcos essenciais de Sintra.",
        "content_type": "tour_info",
        "language": "pt",
        "metadata": {
            "name": "Sintra Highlights",
            "price": 60,
            "duration": 4,
            "locations": ["Palácio da Pena", "Quinta da Regaleira", "Castelo dos Mouros"],
            "category": "sintra"
        }
    },
    {
        "content": "Tour Lo Mejor de Sintra: Visita los palacios más icónicos de Sintra incluyendo el Palacio da Pena, Quinta da Regaleira y Castillo de los Moros. Experimenta la arquitectura de cuento de hadas, jardines místicos y vistas panorámicas de la montaña. Duración: 4 horas. Precio: €60 por persona. Perfecto para visitantes primerizos que quieren ver los lugares esenciales de Sintra.",
        "content_type": "tour_info",
        "language": "es",
        "metadata": {
            "name": "Sintra Highlights",
            "price": 60,
            "duration": 4,
            "locations": ["Palacio da Pena", "Quinta da Regaleira", "Castillo de los Moros"],
            "category": "sintra"
        }
    },
    
    # Cascais Tours
    {
        "content": "Cascais Coastal Tour: Explore the stunning Atlantic coastline from Estoril to Cabo da Roca, Europe's westernmost point. Visit Guincho Beach, Boca do Inferno (Hell's Mouth), and charming Cascais town. Duration: 3 hours. Price: €50 per person. Ideal for beach lovers and sunset seekers.",
        "content_type": "tour_info",
        "language": "en",
        "metadata": {
            "name": "Cascais Coastal",
            "price": 50,
            "duration": 3,
            "locations": ["Estoril", "Cabo da Roca", "Guincho Beach", "Boca do Inferno"],
            "category": "cascais"
        }
    },
    {
        "content": "Tour Costeiro de Cascais: Explore a deslumbrante costa atlântica de Estoril até Cabo da Roca, o ponto mais ocidental da Europa. Visite Praia do Guincho, Boca do Inferno e a charmosa vila de Cascais. Duração: 3 horas. Preço: €50 por pessoa. Ideal para amantes de praia e pôr do sol.",
        "content_type": "tour_info",
        "language": "pt",
        "metadata": {
            "name": "Cascais Coastal",
            "price": 50,
            "duration": 3,
            "locations": ["Estoril", "Cabo da Roca", "Praia do Guincho", "Boca do Inferno"],
            "category": "cascais"
        }
    },
    
    # Full Day Tours
    {
        "content": "Sintra & Cascais Full Day Tour: The ultimate Portuguese experience combining magical Sintra palaces with the beautiful Cascais coastline. Visit Pena Palace, Regaleira, Cabo da Roca, and Cascais town. Duration: 8 hours. Price: €120 per person. Includes hotel pickup and lunch recommendations. Perfect for those who want to maximize their day.",
        "content_type": "tour_info",
        "language": "en",
        "metadata": {
            "name": "Sintra & Cascais Full Day",
            "price": 120,
            "duration": 8,
            "locations": ["Pena Palace", "Quinta da Regaleira", "Cabo da Roca", "Cascais"],
            "category": "full_day"
        }
    },
]

# FAQs
FAQ_KNOWLEDGE = [
    {
        "content": "Q: What's included in the tour price? A: All tours include transportation in eco-friendly electric tuk-tuks, professional guide services, and hotel pickup/drop-off in central Lisbon. Monument entrance fees are NOT included - these must be purchased separately (typically €10-15 per palace).",
        "content_type": "faq",
        "language": "en",
        "metadata": {"category": "pricing"}
    },
    {
        "content": "Q: O que está incluído no preço do tour? R: Todos os tours incluem transporte em tuk-tuks elétricos ecológicos, serviços de guia profissional e pick-up/entrega no hotel no centro de Lisboa. Taxas de entrada em monumentos NÃO estão incluídas - estas devem ser compradas separadamente (tipicamente €10-15 por palácio).",
        "content_type": "faq",
        "language": "pt",
        "metadata": {"category": "pricing"}
    },
    {
        "content": "Q: How many people per tour? A: We specialize in small-group experiences with a maximum of 6 people per tuk-tuk. This ensures personalized attention, flexibility, and an intimate experience. Private tours are also available upon request.",
        "content_type": "faq",
        "language": "en",
        "metadata": {"category": "group_size"}
    },
    {
        "content": "Q: What should I bring? A: Comfortable walking shoes (palaces have hills and stairs), sunscreen, hat, water bottle, and camera. Sintra can be cooler than Lisbon, so bring a light jacket. We provide umbrellas if it rains.",
        "content_type": "faq",
        "language": "en",
        "metadata": {"category": "preparation"}
    },
    {
        "content": "Q: Can we customize the tour? A: Absolutely! We love creating personalized experiences. You can adjust the itinerary, add extra stops, or focus on specific interests (photography, history, food, etc.). Just let us know your preferences when booking.",
        "content_type": "faq",
        "language": "en",
        "metadata": {"category": "customization"}
    },
]

# Policies
POLICY_KNOWLEDGE = [
    {
        "content": "Cancellation Policy: Free cancellation up to 24 hours before the tour start time. Cancellations within 24 hours are subject to a 50% fee. No-shows will be charged 100%. Weather cancellations by YYD are fully refundable.",
        "content_type": "policy",
        "language": "en",
        "metadata": {"category": "cancellation"}
    },
    {
        "content": "Política de Cancelamento: Cancelamento gratuito até 24 horas antes do horário de início do tour. Cancelamentos dentro de 24 horas estão sujeitos a taxa de 50%. Não comparecimento será cobrado 100%. Cancelamentos por condições meteorológicas pela YYD são totalmente reembolsáveis.",
        "content_type": "policy",
        "language": "pt",
        "metadata": {"category": "cancellation"}
    },
    {
        "content": "Payment Policy: We accept credit cards, PayPal, and cash (euros). Full payment is required at booking. Monument entrance fees are paid directly at each location and are not included in tour price.",
        "content_type": "policy",
        "language": "en",
        "metadata": {"category": "payment"}
    },
]

# Local Recommendations
RECOMMENDATIONS_KNOWLEDGE = [
    {
        "content": "Best Restaurants in Sintra: Tascantiga (traditional Portuguese tapas), Incomum (modern cuisine in historic villa), Café Saudade (budget-friendly with great views). For pastries, try Piriquita's famous travesseiros and queijadas.",
        "content_type": "recommendation",
        "language": "en",
        "metadata": {"category": "food", "location": "sintra"}
    },
    {
        "content": "Melhores Restaurantes em Sintra: Tascantiga (tapas portuguesas tradicionais), Incomum (cozinha moderna em villa histórica), Café Saudade (económico com ótimas vistas). Para doces, experimente os famosos travesseiros e queijadas da Piriquita.",
        "content_type": "recommendation",
        "language": "pt",
        "metadata": {"category": "food", "location": "sintra"}
    },
    {
        "content": "Photography Tips: Best time for photos is early morning (9-10am) to avoid crowds. Pena Palace looks magical in morning light. Quinta da Regaleira's Initiation Well is iconic - arrive early. Cabo da Roca sunset is spectacular but bring a jacket!",
        "content_type": "recommendation",
        "language": "en",
        "metadata": {"category": "photography"}
    },
]

def initialize_knowledge_base():
    """Populate Aurora's knowledge base with all content"""
    print("\n🚀 Initializing Aurora Knowledge Base...")
    
    # Clear existing knowledge (optional - comment out to preserve)
    # embeddings_service.clear_knowledge()
    
    total_items = 0
    
    # Add tour information
    print("\n📚 Adding tour information...")
    for item in TOUR_KNOWLEDGE:
        if embeddings_service.add_knowledge(**item):
            total_items += 1
    
    # Add FAQs
    print("\n❓ Adding FAQs...")
    for item in FAQ_KNOWLEDGE:
        if embeddings_service.add_knowledge(**item):
            total_items += 1
    
    # Add policies
    print("\n📋 Adding policies...")
    for item in POLICY_KNOWLEDGE:
        if embeddings_service.add_knowledge(**item):
            total_items += 1
    
    # Add recommendations
    print("\n💡 Adding recommendations...")
    for item in RECOMMENDATIONS_KNOWLEDGE:
        if embeddings_service.add_knowledge(**item):
            total_items += 1
    
    print(f"\n✅ Knowledge base initialized with {total_items} items!")
    
    # Test semantic search
    print("\n🔍 Testing semantic search...")
    test_queries = [
        ("What tours include Pena Palace?", "en"),
        ("Quais tours incluem o Palácio da Pena?", "pt"),
        ("Can I cancel my booking?", "en"),
        ("Best places to eat in Sintra?", "en"),
    ]
    
    for query, language in test_queries:
        results = embeddings_service.semantic_search(query, language=language, limit=2)
        print(f"\nQuery: {query}")
        print(f"Found {len(results)} results:")
        for r in results:
            print(f"  - {r['content_type']}: {r['content'][:100]}... (similarity: {r['similarity']:.2f})")

if __name__ == "__main__":
    initialize_knowledge_base()
