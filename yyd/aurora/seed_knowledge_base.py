"""
Knowledge Base Seeder for Aurora IA
===================================

Populates the Semantic Memory with YYD company information, tours, prices,
policies, and recommendations extracted from yesyoudeserve.tours

Run: python seed_knowledge_base.py
"""

import asyncio
import os
from typing import List, Dict
from memory import SemanticMemory
from rag import EmbeddingGenerator

# Knowledge Base Content - Multilingual FAQs
KNOWLEDGE_BASE = [
    # ===== COMPANY INFO =====
    {
        "category": "company_info",
        "tags": ["about", "company", "founder", "history", "awards"],
        "confidence": 1.0,
        "en": "Yes You Deserve is a premium electric tuk-tuk tour company founded by Daniel Ponce, operating in Sintra and Cascais, Portugal. Featured on ABC Good Morning America with Robin Roberts, the company has won the 'Most Unique Tuk Tuk Tour Company 2024 – Portugal' award and the 'Best Private Tour Company in Portugal 2025' award. With over 257 five-star reviews across TripAdvisor, Google, and Facebook, YYD specializes in private, personalized tours with passionate local guides.",
        "pt": "Yes You Deserve é uma empresa premium de passeios de tuk-tuk elétrico fundada por Daniel Ponce, operando em Sintra e Cascais, Portugal. Destaque no ABC Good Morning America com Robin Roberts, a empresa ganhou o prêmio 'Most Unique Tuk Tuk Tour Company 2024 – Portugal' e 'Best Private Tour Company in Portugal 2025'. Com mais de 257 avaliações 5 estrelas no TripAdvisor, Google e Facebook, YYD é especializada em tours privados e personalizados com guias locais apaixonados.",
        "es": "Yes You Deserve es una empresa premium de tours en tuk-tuk eléctrico fundada por Daniel Ponce, operando en Sintra y Cascais, Portugal. Destacada en ABC Good Morning America con Robin Roberts, la empresa ganó el premio 'Most Unique Tuk Tuk Tour Company 2024 – Portugal' y 'Best Private Tour Company in Portugal 2025'. Con más de 257 reseñas de 5 estrellas en TripAdvisor, Google y Facebook, YYD se especializa en tours privados y personalizados con guías locales apasionados."
    },
    {
        "category": "team",
        "tags": ["team", "guides", "staff", "daniel ponce", "danyella"],
        "confidence": 1.0,
        "en": "Our team includes: Daniel Ponce (Founder & Tour Guide - charismatic, passionate about Portugal), Danyella Santos (General Manager - ensures everything runs smoothly), José Capela (Guest Experience & Booking Manager), Catarina Rolo (Main Tour Guide - delightful energy), Gustavo Monteiro (Tour Guide - relaxed, full of stories), Pedro Lopes (Tour Guide - 11+ years experience), Vera Belchior (Tour Guide - warm and balanced), Victor Gaspar (Tour Guide - calm energy), Leonardo Di Franco (Tour Guide - fun and knowledgeable), and Leandro Nascimento (Tour Guide - cultured individual).",
        "pt": "Nossa equipe inclui: Daniel Ponce (Fundador & Guia de Tours - carismático, apaixonado por Portugal), Danyella Santos (Gerente Geral - garante que tudo funcione perfeitamente), José Capela (Gerente de Experiência do Hóspede), Catarina Rolo (Guia Principal - energia encantadora), Gustavo Monteiro (Guia - relaxado, cheio de histórias), Pedro Lopes (Guia - mais de 11 anos de experiência), Vera Belchior (Guia - calorosa e equilibrada), Victor Gaspar (Guia - energia calma), Leonardo Di Franco (Guia - divertido e conhecedor), e Leandro Nascimento (Guia - indivíduo culto).",
        "es": "Nuestro equipo incluye: Daniel Ponce (Fundador y Guía - carismático, apasionado por Portugal), Danyella Santos (Gerente General - asegura que todo funcione perfectamente), José Capela (Gerente de Experiencia del Huésped), Catarina Rolo (Guía Principal - energía encantadora), Gustavo Monteiro (Guía - relajado, lleno de historias), Pedro Lopes (Guía - más de 11 años de experiencia), Vera Belchior (Guía - cálida y equilibrada), Victor Gaspar (Guía - energía tranquila), Leonardo Di Franco (Guía - divertido y conocedor), y Leandro Nascimento (Guía - individuo culto)."
    },
    {
        "category": "daniel_ponce",
        "tags": ["founder", "daniel", "owner", "abc", "good morning america"],
        "confidence": 1.0,
        "en": "Daniel Ponce is the founder and soul of Yes You Deserve. He is a professional photographer with 5 years of experience in Brazil, former non-profit manager, and has 15+ years in customer service. He entered tourism in 2018 with the philosophy that 'travel should go beyond sightseeing—it should involve feeling.' Daniel was featured on ABC Good Morning America guiding Robin Roberts through Sintra. He is charismatic, insightful, and deeply passionate about Portugal, speaking Portuguese, English, and Spanish.",
        "pt": "Daniel Ponce é o fundador e alma do Yes You Deserve. Ele é fotógrafo profissional com 5 anos de experiência no Brasil, ex-gerente de ONGs e tem mais de 15 anos em atendimento ao cliente. Entrou no turismo em 2018 com a filosofia de que 'viajar deve ir além do turismo—deve envolver sentimento.' Daniel foi destaque no ABC Good Morning America guiando Robin Roberts por Sintra. Ele é carismático, perspicaz e profundamente apaixonado por Portugal, falando português, inglês e espanhol.",
        "es": "Daniel Ponce es el fundador y alma de Yes You Deserve. Es fotógrafo profesional con 5 años de experiencia en Brasil, ex-gerente de ONGs y tiene más de 15 años en servicio al cliente. Entró en el turismo en 2018 con la filosofía de que 'viajar debe ir más allá del turismo—debe involucrar sentimiento.' Daniel fue destacado en ABC Good Morning America guiando a Robin Roberts por Sintra. Es carismático, perspicaz y profundamente apasionado por Portugal, hablando portugués, inglés y español."
    },
    
    # ===== TOURS OVERVIEW =====
    {
        "category": "tours",
        "tags": ["tours", "packages", "options", "types"],
        "confidence": 1.0,
        "en": "We offer three main tour options: (1) Half-Day Tour - 4 hours exploring iconic landmarks and hidden gems with either 1 monument inside OR 3 activities of your choice; (2) Personalized Full-Day Tour - 7-8 hours completely customized to your preferences, visiting monuments, coastline, villages, with authentic Portuguese lunch (costs separate); (3) All-Inclusive Experience - 8 hours with everything included: transfers from Lisbon, monument tickets (Pena Palace, Quinta da Regaleira), Portuguese lunch, coastal journey, and optional wine tasting in Colares.",
        "pt": "Oferecemos três opções principais de tours: (1) Tour Meio-Dia - 4 horas explorando marcos icônicos e joias escondidas com 1 monumento por dentro OU 3 atividades à sua escolha; (2) Tour Personalizado Dia Completo - 7-8 horas completamente customizado às suas preferências, visitando monumentos, litoral, vilas, com almoço português autêntico (custos à parte); (3) Experiência All-Inclusive - 8 horas com tudo incluído: transfers de Lisboa, ingressos de monumentos (Palácio da Pena, Quinta da Regaleira), almoço português, jornada costeira e degustação de vinhos opcional em Colares.",
        "es": "Ofrecemos tres opciones principales de tours: (1) Tour Medio Día - 4 horas explorando lugares icónicos y joyas escondidas con 1 monumento por dentro O 3 actividades de tu elección; (2) Tour Personalizado Día Completo - 7-8 horas completamente personalizado a tus preferencias, visitando monumentos, costa, pueblos, con almuerzo portugués auténtico (costos aparte); (3) Experiencia All-Inclusive - 8 horas con todo incluido: transfers desde Lisboa, entradas de monumentos (Palacio de Pena, Quinta da Regaleira), almuerzo portugués, viaje costero y cata de vinos opcional en Colares."
    },
    
    # ===== HALF-DAY TOUR =====
    {
        "category": "half_day_tour",
        "tags": ["half-day", "4 hours", "short tour", "prices"],
        "confidence": 1.0,
        "en": "Half-Day Tour (4 hours): OPTION 1 - Visit 1 monument inside (like Quinta da Regaleira or Pena Palace) + 1 activity from: Cabo da Roca, Azenhas do Mar, Cascais, Wine Tasting (€24/person extra), Historical Center, or Major Monuments outside. OPTION 2 - 3 activities of your choice. Pricing: November-April: €340 total (1-4 people), €85/person (5-6 people). May-October: €400 total (1-4 people), €100/person (5-6 people). Includes: private transportation, WiFi, professional photography. NOT included: monument tickets, wine tasting.",
        "pt": "Tour Meio-Dia (4 horas): OPÇÃO 1 - Visitar 1 monumento por dentro (como Quinta da Regaleira ou Palácio da Pena) + 1 atividade entre: Cabo da Roca, Azenhas do Mar, Cascais, Degustação de Vinhos (€24/pessoa extra), Centro Histórico, ou Monumentos Principais por fora. OPÇÃO 2 - 3 atividades à sua escolha. Preços: Novembro-Abril: €340 total (1-4 pessoas), €85/pessoa (5-6 pessoas). Maio-Outubro: €400 total (1-4 pessoas), €100/pessoa (5-6 pessoas). Inclui: transporte privado, WiFi, fotografia profissional. NÃO inclui: ingressos de monumentos, degustação de vinhos.",
        "es": "Tour Medio Día (4 horas): OPCIÓN 1 - Visitar 1 monumento por dentro (como Quinta da Regaleira o Palacio de Pena) + 1 actividad entre: Cabo da Roca, Azenhas do Mar, Cascais, Cata de Vinos (€24/persona extra), Centro Histórico, o Monumentos Principales por fuera. OPCIÓN 2 - 3 actividades de tu elección. Precios: Noviembre-Abril: €340 total (1-4 personas), €85/persona (5-6 personas). Mayo-Octubre: €400 total (1-4 personas), €100/persona (5-6 personas). Incluye: transporte privado, WiFi, fotografía profesional. NO incluye: entradas de monumentos, cata de vinos."
    },
    
    # ===== FULL-DAY TOUR =====
    {
        "category": "full_day_tour",
        "tags": ["full-day", "8 hours", "customized", "personalized", "prices"],
        "confidence": 1.0,
        "en": "Personalized Full-Day Tour (7-8 hours): A completely customized experience exploring Sintra's palaces, coastal villages, hidden gems, and authentic local flavors at your perfect pace. Includes 30-minute planning call with Daniel Ponce. You can visit monuments inside (tickets separate), enjoy traditional Portuguese lunch at family-run restaurant (costs separate), and choose coastal stops like Cabo da Roca, Azenhas do Mar, Cascais. Pricing: November-April: €440 total (1-4 people), €110/person (5-6 people). May-October: €540 total (1-4 people), €135/person (5-6 people). Includes: private tuk-tuk, WiFi, professional photos, planning call. NOT included: monument tickets, lunch, wine tasting.",
        "pt": "Tour Personalizado Dia Completo (7-8 horas): Uma experiência completamente customizada explorando palácios de Sintra, vilas costeiras, joias escondidas e sabores locais autênticos no seu ritmo perfeito. Inclui chamada de planejamento de 30 minutos com Daniel Ponce. Você pode visitar monumentos por dentro (ingressos à parte), desfrutar de almoço tradicional português em restaurante familiar (custos à parte), e escolher paradas costeiras como Cabo da Roca, Azenhas do Mar, Cascais. Preços: Novembro-Abril: €440 total (1-4 pessoas), €110/pessoa (5-6 pessoas). Maio-Outubro: €540 total (1-4 pessoas), €135/pessoa (5-6 pessoas). Inclui: tuk-tuk privado, WiFi, fotos profissionais, chamada de planejamento. NÃO inclui: ingressos de monumentos, almoço, degustação de vinhos.",
        "es": "Tour Personalizado Día Completo (7-8 horas): Una experiencia completamente personalizada explorando palacios de Sintra, pueblos costeros, joyas escondidas y sabores locales auténticos a tu ritmo perfecto. Incluye llamada de planificación de 30 minutos con Daniel Ponce. Puedes visitar monumentos por dentro (entradas aparte), disfrutar de almuerzo tradicional portugués en restaurante familiar (costos aparte), y elegir paradas costeras como Cabo da Roca, Azenhas do Mar, Cascais. Precios: Noviembre-Abril: €440 total (1-4 personas), €110/persona (5-6 personas). Mayo-Octubre: €540 total (1-4 personas), €135/persona (5-6 personas). Incluye: tuk-tuk privado, WiFi, fotos profesionales, llamada de planificación. NO incluye: entradas de monumentos, almuerzo, cata de vinos."
    },
    
    # ===== ALL-INCLUSIVE TOUR =====
    {
        "category": "all_inclusive",
        "tags": ["all-inclusive", "premium", "luxury", "everything included", "prices"],
        "confidence": 1.0,
        "en": "All-Inclusive Experience (8 hours): The most complete and comfortable way to discover Sintra with EVERYTHING arranged for you. Includes: private transfers from/to Lisbon, all monument tickets (Pena Palace, Quinta da Regaleira, etc.), authentic Portuguese lunch at family-run restaurant, coastal journey (Cabo da Roca, Azenhas do Mar, Cascais), professional photography, and optional wine tour in Colares. Pricing (November-April): €580 (1 person), €720 (2 people), €860 (3 people), €1,000 (4 people), €1,250 (5 people), €1,500 (6 people). Pricing (May-October): €680 (1 person), €820 (2 people), €960 (3 people), €1,100 (4 people), €1,375 (5 people), €1,650 (6 people). Contact for 7+ people quotes.",
        "pt": "Experiência All-Inclusive (8 horas): A forma mais completa e confortável de descobrir Sintra com TUDO arranjado para você. Inclui: transfers privados de/para Lisboa, todos os ingressos de monumentos (Palácio da Pena, Quinta da Regaleira, etc.), almoço português autêntico em restaurante familiar, jornada costeira (Cabo da Roca, Azenhas do Mar, Cascais), fotografia profissional, e tour de vinhos opcional em Colares. Preços (Novembro-Abril): €580 (1 pessoa), €720 (2 pessoas), €860 (3 pessoas), €1.000 (4 pessoas), €1.250 (5 pessoas), €1.500 (6 pessoas). Preços (Maio-Outubro): €680 (1 pessoa), €820 (2 pessoas), €960 (3 pessoas), €1.100 (4 pessoas), €1.375 (5 pessoas), €1.650 (6 pessoas). Contate para cotações de 7+ pessoas.",
        "es": "Experiencia All-Inclusive (8 horas): La forma más completa y cómoda de descubrir Sintra con TODO organizado para ti. Incluye: transfers privados desde/hacia Lisboa, todas las entradas de monumentos (Palacio de Pena, Quinta da Regaleira, etc.), almuerzo portugués auténtico en restaurante familiar, viaje costero (Cabo da Roca, Azenhas do Mar, Cascais), fotografía profesional, y tour de vinos opcional en Colares. Precios (Noviembre-Abril): €580 (1 persona), €720 (2 personas), €860 (3 personas), €1.000 (4 personas), €1.250 (5 personas), €1.500 (6 personas). Precios (Mayo-Octubre): €680 (1 persona), €820 (2 personas), €960 (3 personas), €1.100 (4 personas), €1.375 (5 personas), €1.650 (6 personas). Contacta para cotizaciones de 7+ personas."
    },
    
    # ===== MONUMENTS - PENA PALACE =====
    {
        "category": "monuments",
        "tags": ["pena palace", "palacio da pena", "castle", "sintra", "monument"],
        "confidence": 1.0,
        "en": "Pena Palace (Palácio da Pena) is Sintra's most iconic landmark - a colorful fairytale castle perched on a hilltop with vibrant yellow, red, and purple towers. It's considered Europe's finest Romantic palace with stunning 360-degree views over Sintra and the Atlantic Ocean. Built in the 19th century by King Ferdinand II, the palace is surrounded by the enchanting Pena Park with over 2,000 plant species. Entry tickets cost €14-20 and should be pre-booked at www.parquesdesintra.pt. Allow 2-3 hours for a complete visit. It's a must-see on any Sintra tour!",
        "pt": "Palácio da Pena é o marco mais icônico de Sintra - um castelo de conto de fadas colorido empoleirado em uma colina com torres vibrantes amarelas, vermelhas e roxas. É considerado o melhor palácio romântico da Europa com vistas deslumbrantes de 360 graus sobre Sintra e o Oceano Atlântico. Construído no século XIX pelo Rei Fernando II, o palácio é cercado pelo encantador Parque da Pena com mais de 2.000 espécies de plantas. Ingressos custam €14-20 e devem ser pré-reservados em www.parquesdesintra.pt. Reserve 2-3 horas para uma visita completa. É imperdível em qualquer tour de Sintra!",
        "es": "Palacio de Pena (Palácio da Pena) es el hito más icónico de Sintra - un castillo de cuento de hadas colorido ubicado en una colina con torres vibrantes amarillas, rojas y moradas. Se considera el mejor palacio romántico de Europa con vistas impresionantes de 360 grados sobre Sintra y el Océano Atlántico. Construido en el siglo XIX por el Rey Fernando II, el palacio está rodeado por el encantador Parque de Pena con más de 2.000 especies de plantas. Las entradas cuestan €14-20 y deben reservarse previamente en www.parquesdesintra.pt. Reserve 2-3 horas para una visita completa. ¡Es imprescindible en cualquier tour de Sintra!"
    },
    
    # ===== MONUMENTS - QUINTA DA REGALEIRA =====
    {
        "category": "monuments",
        "tags": ["quinta da regaleira", "initiation well", "mystical", "gardens", "sintra"],
        "confidence": 1.0,
        "en": "Quinta da Regaleira is a Neo-Gothic mansion with mystical gardens featuring the famous Initiation Well - a 27-meter deep spiral staircase that descends into the earth. Built in the early 20th century, it's filled with Knights Templar symbolism, underground tunnels, grottoes, and enchanting gardens. The property combines architecture, alchemy, and mythology in a unique experience. Entry tickets cost €10-12 (book at www.regaleira.pt). Allow 2-3 hours to fully explore the gardens, tunnels, and mansion. It's one of Sintra's most magical and mysterious places!",
        "pt": "Quinta da Regaleira é uma mansão neogótica com jardins místicos apresentando o famoso Poço Iniciático - uma escadaria em espiral de 27 metros de profundidade que desce para a terra. Construída no início do século XX, está repleta de simbolismo dos Cavaleiros Templários, túneis subterrâneos, grutas e jardins encantadores. A propriedade combina arquitetura, alquimia e mitologia em uma experiência única. Ingressos custam €10-12 (reserve em www.regaleira.pt). Reserve 2-3 horas para explorar completamente os jardins, túneis e mansão. É um dos lugares mais mágicos e misteriosos de Sintra!",
        "es": "Quinta da Regaleira es una mansión neogótica con jardines místicos que presenta el famoso Pozo Iniciático - una escalera en espiral de 27 metros de profundidad que desciende a la tierra. Construida a principios del siglo XX, está llena de simbolismo de los Caballeros Templarios, túneles subterráneos, grutas y jardines encantadores. La propiedad combina arquitectura, alquimia y mitología en una experiencia única. Las entradas cuestan €10-12 (reserva en www.regaleira.pt). Reserve 2-3 horas para explorar completamente los jardines, túneles y mansión. ¡Es uno de los lugares más mágicos y misteriosos de Sintra!"
    },
    
    # ===== MONUMENTS - MOORISH CASTLE =====
    {
        "category": "monuments",
        "tags": ["moorish castle", "castelo dos mouros", "ruins", "views", "sintra"],
        "confidence": 1.0,
        "en": "Moorish Castle (Castelo dos Mouros) is an 8th-century fortress built by the Moors with spectacular views from its ancient battlements. The castle walls snake across two mountain peaks, offering 360-degree panoramic views of Sintra, Pena Palace, and the Atlantic Ocean. It's one of the best places for photography in Sintra. The ruins are well-preserved and walking the battlements feels like stepping back in time. Entry tickets cost €8-10 (www.parquesdesintra.pt). Allow 1-2 hours. Wear comfortable shoes as there's moderate hiking involved. Best visited early morning to avoid crowds and heat.",
        "pt": "Castelo dos Mouros é uma fortaleza do século VIII construída pelos mouros com vistas espetaculares de suas antigas ameias. As muralhas do castelo serpenteiam por dois picos de montanha, oferecendo vistas panorâmicas de 360 graus de Sintra, Palácio da Pena e o Oceano Atlântico. É um dos melhores lugares para fotografia em Sintra. As ruínas estão bem preservadas e caminhar pelas ameias é como voltar no tempo. Ingressos custam €8-10 (www.parquesdesintra.pt). Reserve 1-2 horas. Use sapatos confortáveis, pois há caminhada moderada. Melhor visitar cedo pela manhã para evitar multidões e calor.",
        "es": "Castillo de los Moros (Castelo dos Mouros) es una fortaleza del siglo VIII construida por los moros con vistas espectaculares desde sus antiguas almenas. Las murallas del castillo serpentean por dos picos montañosos, ofreciendo vistas panorámicas de 360 grados de Sintra, Palacio de Pena y el Océano Atlántico. Es uno de los mejores lugares para fotografía en Sintra. Las ruinas están bien conservadas y caminar por las almenas se siente como retroceder en el tiempo. Las entradas cuestan €8-10 (www.parquesdesintra.pt). Reserve 1-2 horas. Use zapatos cómodos ya que hay caminata moderada. Mejor visitar temprano por la mañana para evitar multitudes y calor."
    },
    
    # ===== LOCATIONS - CABO DA ROCA =====
    {
        "category": "locations",
        "tags": ["cabo da roca", "westernmost", "europe", "cliffs", "lighthouse"],
        "confidence": 1.0,
        "en": "Cabo da Roca is the westernmost point of continental Europe, featuring dramatic 140-meter high cliffs plunging into the Atlantic Ocean. There's a historic lighthouse and a stone monument with a cross marking this geographic milestone. The views are absolutely breathtaking with the wild ocean below and endless horizon. Poet Luís de Camões described it as 'where the land ends and the sea begins.' It's 18km from Sintra center, about 20-30 minutes by tuk-tuk. Free to visit. Best for sunset photos! Bring a jacket as it's very windy. A must-stop on any coastal tour.",
        "pt": "Cabo da Roca é o ponto mais ocidental da Europa continental, apresentando penhascos dramáticos de 140 metros de altura mergulhando no Oceano Atlântico. Há um farol histórico e um monumento de pedra com uma cruz marcando este marco geográfico. As vistas são absolutamente deslumbrantes com o oceano selvagem abaixo e horizonte infinito. O poeta Luís de Camões descreveu como 'onde a terra acaba e o mar começa.' Fica a 18km do centro de Sintra, cerca de 20-30 minutos de tuk-tuk. Grátis para visitar. Melhor para fotos ao pôr do sol! Traga um casaco, pois é muito ventoso. Parada obrigatória em qualquer tour costeiro.",
        "es": "Cabo da Roca es el punto más occidental de Europa continental, con acantilados dramáticos de 140 metros de altura que se precipitan al Océano Atlántico. Hay un faro histórico y un monumento de piedra con una cruz que marca este hito geográfico. Las vistas son absolutamente impresionantes con el océano salvaje abajo y horizonte infinito. El poeta Luís de Camões lo describió como 'donde la tierra termina y el mar comienza.' Está a 18km del centro de Sintra, unos 20-30 minutos en tuk-tuk. Gratis para visitar. ¡Mejor para fotos al atardecer! Traiga una chaqueta ya que es muy ventoso. Parada obligatoria en cualquier tour costero."
    },
    
    # ===== LOCATIONS - AZENHAS DO MAR =====
    {
        "category": "locations",
        "tags": ["azenhas do mar", "village", "coastal", "cliffside", "beach"],
        "confidence": 1.0,
        "en": "Azenhas do Mar is a picturesque cliffside village with traditional whitewashed houses with red roofs cascading down to the Atlantic Ocean. There's a natural seawater pool carved into the rocks at the base of the cliffs, perfect for photos. The village offers stunning coastal views, small cafes, and a peaceful atmosphere away from tourist crowds. It's about 15km from Sintra, 25-30 minutes by tuk-tuk. The narrow streets and dramatic setting make it one of Portugal's most photographed villages. Great stop for refreshments and ocean views on coastal tours.",
        "pt": "Azenhas do Mar é uma vila pitoresca à beira do penhasco com casas tradicionais caiadas de branco com telhados vermelhos descendo em cascata para o Oceano Atlântico. Há uma piscina natural de água do mar esculpida nas rochas na base dos penhascos, perfeita para fotos. A vila oferece vistas costeiras deslumbrantes, pequenos cafés e uma atmosfera tranquila longe das multidões turísticas. Fica a cerca de 15km de Sintra, 25-30 minutos de tuk-tuk. As ruas estreitas e o cenário dramático fazem dela uma das vilas mais fotografadas de Portugal. Ótima parada para refrescos e vistas do oceano em tours costeiros.",
        "es": "Azenhas do Mar es un pintoresco pueblo al borde del acantilado con casas tradicionales encaladas con techos rojos que descienden en cascada hacia el Océano Atlántico. Hay una piscina natural de agua de mar tallada en las rocas en la base de los acantilados, perfecta para fotos. El pueblo ofrece vistas costeras impresionantes, pequeños cafés y una atmósfera tranquila lejos de las multitudes turísticas. Está a unos 15km de Sintra, 25-30 minutos en tuk-tuk. Las calles estrechas y el escenario dramático lo convierten en uno de los pueblos más fotografiados de Portugal. Gran parada para refrescos y vistas al océano en tours costeros."
    },
    
    # ===== LOCATIONS - CASCAIS =====
    {
        "category": "locations",
        "tags": ["cascais", "coastal town", "beaches", "marina", "elegant"],
        "confidence": 1.0,
        "en": "Cascais is an elegant coastal town and former fishing village that became a summer retreat for Portuguese royalty and European aristocracy. It features cobblestone streets, a charming marina with yachts, beautiful beaches, the Santa Marta Lighthouse Museum, and Boca do Inferno (Hell's Mouth) - a dramatic sea cave. The town has excellent seafood restaurants, cafes with ocean views, and a relaxed yet sophisticated atmosphere. It's about 30km from Sintra, 35-40 minutes by tuk-tuk. Perfect ending point for tours - guests can take the scenic coastal train back to Lisbon from here (40 minutes, €2.30).",
        "pt": "Cascais é uma elegante cidade costeira e antiga vila de pescadores que se tornou refúgio de verão para a realeza portuguesa e aristocracia europeia. Apresenta ruas de paralelepípedos, uma marina encantadora com iates, belas praias, o Museu do Farol de Santa Marta, e Boca do Inferno - uma dramática caverna marinha. A cidade tem excelentes restaurantes de frutos do mar, cafés com vistas para o oceano e uma atmosfera relaxada mas sofisticada. Fica a cerca de 30km de Sintra, 35-40 minutos de tuk-tuk. Ponto final perfeito para tours - hóspedes podem pegar o trem costeiro cênico de volta a Lisboa daqui (40 minutos, €2,30).",
        "es": "Cascais es una elegante ciudad costera y antiguo pueblo pesquero que se convirtió en refugio de verano para la realeza portuguesa y la aristocracia europea. Cuenta con calles empedradas, un encantador puerto deportivo con yates, hermosas playas, el Museo del Faro de Santa Marta, y Boca do Inferno - una dramática cueva marina. La ciudad tiene excelentes restaurantes de mariscos, cafés con vistas al océano y una atmósfera relajada pero sofisticada. Está a unos 30km de Sintra, 35-40 minutos en tuk-tuk. Punto final perfecto para tours - los huéspedes pueden tomar el tren costero panorámico de regreso a Lisboa desde aquí (40 minutos, €2,30)."
    },
    
    # ===== WINE TASTING - COLARES =====
    {
        "category": "experiences",
        "tags": ["wine", "colares", "wine tasting", "vineyard", "unique wines"],
        "confidence": 1.0,
        "en": "Colares wine tasting is a unique experience featuring one of the world's rarest wines grown in sandy soils near the Atlantic coast. The Colares region produces distinctive red and white wines using ancient vines (some over 100 years old) that survived the phylloxera plague. Visit historic wine cellars with traditional oak barrels to taste these full-bodied wines and learn about the unique terroir. Wine tasting costs €24 per person (additional to tour price). The Adega Regional de Colares is a family-run winery offering authentic Portuguese wine culture. Tours include tasting 2-3 wines with local cheese and bread.",
        "pt": "Degustação de vinhos em Colares é uma experiência única apresentando um dos vinhos mais raros do mundo cultivados em solos arenosos perto da costa atlântica. A região de Colares produz vinhos tintos e brancos distintos usando vinhas antigas (algumas com mais de 100 anos) que sobreviveram à praga da filoxera. Visite adegas históricas com barricas de carvalho tradicionais para provar estes vinhos encorpados e aprender sobre o terroir único. Degustação de vinhos custa €24 por pessoa (adicional ao preço do tour). A Adega Regional de Colares é uma vinícola familiar oferecendo autêntica cultura vinícola portuguesa. Tours incluem degustação de 2-3 vinhos com queijo e pão locais.",
        "es": "Cata de vinos en Colares es una experiencia única que presenta uno de los vinos más raros del mundo cultivados en suelos arenosos cerca de la costa atlántica. La región de Colares produce vinos tintos y blancos distintivos usando viñas antiguas (algunas de más de 100 años) que sobrevivieron a la plaga de filoxera. Visite bodegas históricas con barriles de roble tradicionales para probar estos vinos con cuerpo y aprender sobre el terroir único. La cata de vinos cuesta €24 por persona (adicional al precio del tour). La Adega Regional de Colares es una bodega familiar que ofrece auténtica cultura vinícola portuguesa. Los tours incluyen degustación de 2-3 vinos con queso y pan local."
    },
    
    # ===== BOOKING & POLICIES =====
    {
        "category": "booking",
        "tags": ["booking", "how to book", "reservation", "contact", "whatsapp"],
        "confidence": 1.0,
        "en": "Booking is simple and fast! Contact us via: (1) WhatsApp +351 917 756 732 (fastest response), (2) Facebook Messenger @yesyoudeserve, or (3) Email info@yesyoudeserve.tours. We reply quickly to confirm availability and customize your tour. For Full-Day and All-Inclusive tours, we offer a 30-minute planning call with Daniel Ponce to design your perfect itinerary. No prepayment required for inquiries. We handle everything: tickets, timing, logistics, restaurant reservations. Book directly through our website www.yesyoudeserve.tours or contact us on any channel. We're here to help you plan your unforgettable Sintra experience!",
        "pt": "Reservar é simples e rápido! Entre em contato via: (1) WhatsApp +351 917 756 732 (resposta mais rápida), (2) Facebook Messenger @yesyoudeserve, ou (3) Email info@yesyoudeserve.tours. Respondemos rapidamente para confirmar disponibilidade e personalizar seu tour. Para tours Dia Completo e All-Inclusive, oferecemos uma chamada de planejamento de 30 minutos com Daniel Ponce para desenhar seu itinerário perfeito. Sem pré-pagamento necessário para consultas. Cuidamos de tudo: ingressos, horários, logística, reservas de restaurante. Reserve diretamente através do nosso site www.yesyoudeserve.tours ou entre em contato por qualquer canal. Estamos aqui para ajudá-lo a planejar sua experiência inesquecível em Sintra!",
        "es": "¡Reservar es simple y rápido! Contáctenos a través de: (1) WhatsApp +351 917 756 732 (respuesta más rápida), (2) Facebook Messenger @yesyoudeserve, o (3) Email info@yesyoudeserve.tours. Respondemos rápidamente para confirmar disponibilidad y personalizar su tour. Para tours de Día Completo y All-Inclusive, ofrecemos una llamada de planificación de 30 minutos con Daniel Ponce para diseñar su itinerario perfecto. Sin prepago requerido para consultas. Nos encargamos de todo: entradas, horarios, logística, reservas de restaurante. Reserve directamente a través de nuestro sitio web www.yesyoudeserve.tours o contáctenos en cualquier canal. ¡Estamos aquí para ayudarlo a planificar su experiencia inolvidable en Sintra!"
    },
    
    # ===== WHAT'S INCLUDED =====
    {
        "category": "inclusions",
        "tags": ["included", "what's included", "photography", "wifi", "features"],
        "confidence": 1.0,
        "en": "All tours include: (1) Private electric tuk-tuk transportation - spacious, eco-friendly, and comfortable with blankets for chilly weather; (2) Expert English-speaking local guide - passionate storytellers with deep knowledge of Sintra's history and culture; (3) Professional photography - your guide captures stunning photos at the best spots so you can enjoy the moment hands-free; (4) WiFi on board; (5) Flexible, personalized itinerary - we adapt to your interests, pace, and weather conditions; (6) Exclusive routes avoiding crowds and traffic; (7) Local recommendations for restaurants, shops, and hidden gems. We navigate narrow streets that buses can't access!",
        "pt": "Todos os tours incluem: (1) Transporte privado em tuk-tuk elétrico - espaçoso, ecológico e confortável com cobertores para clima frio; (2) Guia local especialista falante de inglês - contadores de histórias apaixonados com profundo conhecimento da história e cultura de Sintra; (3) Fotografia profissional - seu guia captura fotos deslumbrantes nos melhores locais para você aproveitar o momento com as mãos livres; (4) WiFi a bordo; (5) Itinerário flexível e personalizado - adaptamos aos seus interesses, ritmo e condições climáticas; (6) Rotas exclusivas evitando multidões e tráfego; (7) Recomendações locais para restaurantes, lojas e joias escondidas. Navegamos ruas estreitas que ônibus não podem acessar!",
        "es": "Todos los tours incluyen: (1) Transporte privado en tuk-tuk eléctrico - espacioso, ecológico y cómodo con mantas para clima frío; (2) Guía local experto que habla inglés - narradores apasionados con profundo conocimiento de la historia y cultura de Sintra; (3) Fotografía profesional - su guía captura fotos impresionantes en los mejores lugares para que disfrute del momento con las manos libres; (4) WiFi a bordo; (5) Itinerario flexible y personalizado - nos adaptamos a sus intereses, ritmo y condiciones climáticas; (6) Rutas exclusivas evitando multitudes y tráfico; (7) Recomendaciones locales para restaurantes, tiendas y joyas escondidas. ¡Navegamos calles estrechas a las que los autobuses no pueden acceder!"
    },
    
    # ===== PORTUGUESE LUNCH =====
    {
        "category": "experiences",
        "tags": ["lunch", "food", "portuguese cuisine", "restaurant", "local food"],
        "confidence": 1.0,
        "en": "Traditional Portuguese lunch is a highlight of our full-day tours! We take you to authentic family-run restaurants where locals eat - not tourist traps. Expect fresh grilled fish, seafood (squid, octopus), bacalhau (codfish), Portuguese stews, rice with seafood, fresh salads, boiled potatoes, and vegetables. Meals include bread, olives, wine or drinks, and sometimes Portuguese desserts like pastel de nata. Many guests say it's one of the best meals of their trip! Lunch costs are separate from the tour price (typically €15-25 per person). Vegetarian options available. We can accommodate dietary restrictions - just let us know in advance!",
        "pt": "Almoço tradicional português é um destaque dos nossos tours de dia completo! Levamos você a restaurantes autênticos de família onde os locais comem - não armadilhas para turistas. Espere peixe grelhado fresco, frutos do mar (lula, polvo), bacalhau, ensopados portugueses, arroz de marisco, saladas frescas, batatas cozidas e vegetais. Refeições incluem pão, azeitonas, vinho ou bebidas, e às vezes sobremesas portuguesas como pastel de nata. Muitos hóspedes dizem que é uma das melhores refeições da viagem! Custos de almoço são separados do preço do tour (tipicamente €15-25 por pessoa). Opções vegetarianas disponíveis. Podemos acomodar restrições alimentares - apenas nos avise com antecedência!",
        "es": "¡El almuerzo tradicional portugués es un punto destacado de nuestros tours de día completo! Te llevamos a restaurantes auténticos familiares donde comen los locales - no trampas para turistas. Espera pescado fresco a la parrilla, mariscos (calamar, pulpo), bacalao, guisos portugueses, arroz con mariscos, ensaladas frescas, papas hervidas y vegetales. Las comidas incluyen pan, aceitunas, vino o bebidas, y a veces postres portugueses como pastel de nata. ¡Muchos huéspedes dicen que es una de las mejores comidas de su viaje! Los costos del almuerzo son separados del precio del tour (típicamente €15-25 por persona). Opciones vegetarianas disponibles. ¡Podemos acomodar restricciones dietéticas - solo avísenos con anticipación!"
    },
    
    # ===== BEST TIME TO VISIT =====
    {
        "category": "planning",
        "tags": ["best time", "when to visit", "weather", "seasons", "crowds"],
        "confidence": 1.0,
        "en": "Best time to visit Sintra: Spring (March-May) and Fall (September-November) offer perfect weather, fewer crowds, and beautiful colors. Summer (June-August) is peak season - gorgeous weather but very crowded, book monuments early! Winter (December-February) is quietest with mild temperatures (10-15°C) but occasional rain - great prices and no crowds. Start your tour EARLY (9am pickup recommended) to beat crowds at Pena Palace and enjoy better light for photos. Sintra can be 5-10°C cooler than Lisbon due to microclimate. Bring layers! Our pricing reflects seasons: lower prices November-April (except Dec 23-Jan 1), higher May-October.",
        "pt": "Melhor época para visitar Sintra: Primavera (Março-Maio) e Outono (Setembro-Novembro) oferecem clima perfeito, menos multidões e belas cores. Verão (Junho-Agosto) é alta temporada - clima lindo mas muito lotado, reserve monumentos cedo! Inverno (Dezembro-Fevereiro) é mais tranquilo com temperaturas amenas (10-15°C) mas chuva ocasional - ótimos preços e sem multidões. Comece seu tour CEDO (pickup às 9h recomendado) para evitar multidões no Palácio da Pena e aproveitar melhor luz para fotos. Sintra pode ser 5-10°C mais fria que Lisboa devido ao microclima. Traga camadas! Nossos preços refletem as estações: preços menores Novembro-Abril (exceto 23 Dez-1 Jan), maiores Maio-Outubro.",
        "es": "Mejor época para visitar Sintra: Primavera (Marzo-Mayo) y Otoño (Septiembre-Noviembre) ofrecen clima perfecto, menos multitudes y hermosos colores. Verano (Junio-Agosto) es temporada alta - clima hermoso pero muy concurrido, ¡reserve monumentos temprano! Invierno (Diciembre-Febrero) es más tranquilo con temperaturas suaves (10-15°C) pero lluvia ocasional - excelentes precios y sin multitudes. Comience su tour TEMPRANO (recogida a las 9am recomendada) para evitar multitudes en el Palacio de Pena y disfrutar mejor luz para fotos. Sintra puede ser 5-10°C más fría que Lisboa debido al microclima. ¡Traiga capas! Nuestros precios reflejan las estaciones: precios más bajos Noviembre-Abril (excepto 23 Dic-1 Ene), más altos Mayo-Octubre."
    },
    
    # ===== REVIEWS & TESTIMONIALS =====
    {
        "category": "social_proof",
        "tags": ["reviews", "testimonials", "ratings", "tripadvisor", "google"],
        "confidence": 1.0,
        "en": "We're proud of our 257+ five-star reviews across multiple platforms! TripAdvisor: 78 reviews (4.7/5 stars), Google: 54 reviews (4.7/5), Facebook: 29 reviews (4.7/5), Trustpilot and TrustIndex: 208+ reviews (5/5). Guests consistently praise: Daniel and our guides' passion and knowledge, personalized attention and flexibility, authentic Portuguese lunch experiences, professional photography, comfortable tuk-tuks and crowd-free routes, making them feel like VIPs and locals simultaneously. Common quotes: 'Best part of our Portugal trip!', 'Daniel exceeded our expectations', 'One of the best meals of our trip', 'We laughed all day!' Many guests return or recommend us to friends and family.",
        "pt": "Temos orgulho de nossas 257+ avaliações cinco estrelas em múltiplas plataformas! TripAdvisor: 78 avaliações (4,7/5 estrelas), Google: 54 avaliações (4,7/5), Facebook: 29 avaliações (4,7/5), Trustpilot e TrustIndex: 208+ avaliações (5/5). Hóspedes consistentemente elogiam: paixão e conhecimento de Daniel e nossos guias, atenção personalizada e flexibilidade, experiências autênticas de almoço português, fotografia profissional, tuk-tuks confortáveis e rotas sem multidões, fazendo-os sentir como VIPs e locais simultaneamente. Citações comuns: 'Melhor parte da nossa viagem a Portugal!', 'Daniel superou nossas expectativas', 'Uma das melhores refeições da viagem', 'Rimos o dia todo!' Muitos hóspedes retornam ou nos recomendam a amigos e família.",
        "es": "¡Estamos orgullosos de nuestras 257+ reseñas de cinco estrellas en múltiples plataformas! TripAdvisor: 78 reseñas (4,7/5 estrellas), Google: 54 reseñas (4,7/5), Facebook: 29 reseñas (4,7/5), Trustpilot y TrustIndex: 208+ reseñas (5/5). Los huéspedes elogian consistentemente: la pasión y conocimiento de Daniel y nuestros guías, atención personalizada y flexibilidad, experiencias auténticas de almuerzo portugués, fotografía profesional, tuk-tuks cómodos y rutas sin multitudes, haciéndolos sentir como VIP y locales simultáneamente. Citas comunes: '¡Mejor parte de nuestro viaje a Portugal!', 'Daniel superó nuestras expectativas', 'Una de las mejores comidas del viaje', '¡Reímos todo el día!' Muchos huéspedes regresan o nos recomiendan a amigos y familia."
    },
    
    # ===== ABC GOOD MORNING AMERICA =====
    {
        "category": "media",
        "tags": ["abc", "good morning america", "robin roberts", "tv", "media"],
        "confidence": 1.0,
        "en": "Yes You Deserve was featured on ABC's Good Morning America when Robin Roberts visited Portugal! Our founder Daniel Ponce personally guided Robin through the magic of Sintra in our electric tuk-tuk, showcasing why our tours are special. The segment highlighted our personalized approach, knowledge of local culture, and the stunning beauty of Sintra's palaces and landscapes. You can watch the clip on our website or YouTube. This media recognition by one of America's top morning shows validates our commitment to creating unforgettable experiences. When you book with us, you're choosing the same quality of service that impressed national television!",
        "pt": "Yes You Deserve foi destaque no Good Morning America da ABC quando Robin Roberts visitou Portugal! Nosso fundador Daniel Ponce pessoalmente guiou Robin pela magia de Sintra em nosso tuk-tuk elétrico, mostrando por que nossos tours são especiais. O segmento destacou nossa abordagem personalizada, conhecimento da cultura local, e a beleza deslumbrante dos palácios e paisagens de Sintra. Você pode assistir o clipe em nosso site ou YouTube. Esse reconhecimento de mídia por um dos principais programas matinais da América valida nosso compromisso em criar experiências inesquecíveis. Quando você reserva conosco, está escolhendo a mesma qualidade de serviço que impressionou a televisão nacional!",
        "es": "¡Yes You Deserve fue destacado en Good Morning America de ABC cuando Robin Roberts visitó Portugal! Nuestro fundador Daniel Ponce guió personalmente a Robin por la magia de Sintra en nuestro tuk-tuk eléctrico, mostrando por qué nuestros tours son especiales. El segmento destacó nuestro enfoque personalizado, conocimiento de la cultura local, y la belleza impresionante de los palacios y paisajes de Sintra. Puedes ver el clip en nuestro sitio web o YouTube. Este reconocimiento mediático de uno de los principales programas matutinos de América valida nuestro compromiso de crear experiencias inolvidables. ¡Cuando reservas con nosotros, estás eligiendo la misma calidad de servicio que impresionó a la televisión nacional!"
    },
    
    # ===== OTHER MONUMENTS =====
    {
        "category": "monuments",
        "tags": ["sintra national palace", "palacio nacional", "twin chimneys", "medieval"],
        "confidence": 1.0,
        "en": "Sintra National Palace (Palácio Nacional de Sintra) is a medieval palace in the town center with iconic twin conical chimneys visible from anywhere in Sintra. It's Portugal's best-preserved medieval royal palace, featuring magnificent tile work, the Magpie Room, Swan Room, and Arab Room with stunning azulejos. Entry tickets cost €10-12. Located in the heart of the historic center, it's surrounded by traditional shops and pastry cafes. Allow 1-1.5 hours for visit. Less crowded than Pena Palace. Great combination with exploring Sintra's charming town center, trying local pastries like travesseiros and queijadas.",
        "pt": "Palácio Nacional de Sintra é um palácio medieval no centro da vila com icônicas chaminés gêmeas cônicas visíveis de qualquer lugar em Sintra. É o palácio real medieval mais bem preservado de Portugal, apresentando magnífico trabalho em azulejos, a Sala das Pegas, Sala dos Cisnes, e Sala Árabe com deslumbrantes azulejos. Ingressos custam €10-12. Localizado no coração do centro histórico, é cercado por lojas tradicionais e cafés de pastelaria. Reserve 1-1,5 horas para visita. Menos lotado que o Palácio da Pena. Ótima combinação com explorar o charmoso centro da vila de Sintra, experimentando doces locais como travesseiros e queijadas.",
        "es": "Palacio Nacional de Sintra es un palacio medieval en el centro del pueblo con icónicas chimeneas gemelas cónicas visibles desde cualquier lugar en Sintra. Es el palacio real medieval mejor preservado de Portugal, con magnífico trabajo en azulejos, la Sala de las Urracas, Sala de los Cisnes, y Sala Árabe con impresionantes azulejos. Las entradas cuestan €10-12. Ubicado en el corazón del centro histórico, está rodeado de tiendas tradicionales y cafeterías de pastelería. Reserve 1-1.5 horas para la visita. Menos concurrido que el Palacio de Pena. Gran combinación con explorar el encantador centro del pueblo de Sintra, probando dulces locales como travesseiros y queijadas."
    },
    {
        "category": "monuments",
        "tags": ["monserrate palace", "palacio de monserrate", "gardens", "romantic", "moorish"],
        "confidence": 1.0,
        "en": "Monserrate Palace is a stunning Moorish Revival palace with exotic botanical gardens featuring plants from around the world. Built in the 19th century for Sir Francis Cook, it combines Gothic, Indian, and Moorish architectural styles. The palace is less crowded than Pena, offering a more peaceful experience. The gardens cover 33 hectares with rare species, fern valley, and romantic ruins. Entry tickets cost €8-10 (www.parquesdesintra.pt). Allow 1.5-2 hours. Perfect for garden lovers and those seeking tranquility. The ornate interior features intricate stucco work and stunning light effects through the dome.",
        "pt": "Palácio de Monserrate é um deslumbrante palácio de revival mourisco com jardins botânicos exóticos apresentando plantas de todo o mundo. Construído no século XIX para Sir Francis Cook, combina estilos arquitetônicos gótico, indiano e mourisco. O palácio é menos lotado que o Palácio da Pena, oferecendo uma experiência mais tranquila. Os jardins cobrem 33 hectares com espécies raras, vale das samambaias e ruínas românticas. Ingressos custam €8-10 (www.parquesdesintra.pt). Reserve 1,5-2 horas. Perfeito para amantes de jardins e aqueles que buscam tranquilidade. O interior ornamentado apresenta trabalho intrincado em estuque e deslumbrantes efeitos de luz através da cúpula.",
        "es": "Palacio de Monserrate es un impresionante palacio de renacimiento morisco con jardines botánicos exóticos con plantas de todo el mundo. Construido en el siglo XIX para Sir Francis Cook, combina estilos arquitectónicos gótico, indio y morisco. El palacio está menos concurrido que Pena, ofreciendo una experiencia más tranquila. Los jardines cubren 33 hectáreas con especies raras, valle de helechos y ruinas románticas. Las entradas cuestan €8-10 (www.parquesdesintra.pt). Reserve 1.5-2 horas. Perfecto para amantes de jardines y quienes buscan tranquilidad. El interior ornamentado presenta trabajo intrincado en estuco y impresionantes efectos de luz a través de la cúpula."
    },
    
    # ===== PRACTICAL INFO =====
    {
        "category": "practical",
        "tags": ["what to bring", "what to wear", "preparation", "tips"],
        "confidence": 1.0,
        "en": "What to bring on your tour: Comfortable walking shoes (there's moderate walking at monuments and some cobblestone streets), layered clothing (Sintra can be 5-10°C cooler than Lisbon, and weather changes quickly), light jacket or sweater even in summer, sunscreen and hat for sunny days, water bottle (we can refill it), camera or phone for photos (though we take professional photos for you!), cash for monument tickets if not pre-booked, cash for lunch if doing full-day tour. Our tuk-tuks have blankets for chilly weather. Don't worry about carrying bags - there's storage space. We provide WiFi on board. Most importantly: bring your sense of adventure and readiness to have an unforgettable day!",
        "pt": "O que trazer no seu tour: Sapatos confortáveis para caminhar (há caminhada moderada em monumentos e algumas ruas de paralelepípedos), roupas em camadas (Sintra pode ser 5-10°C mais fria que Lisboa, e o clima muda rapidamente), jaqueta leve ou suéter mesmo no verão, protetor solar e chapéu para dias ensolarados, garrafa de água (podemos reencher), câmera ou telefone para fotos (embora tiremos fotos profissionais para você!), dinheiro para ingressos de monumentos se não pré-reservados, dinheiro para almoço se fazendo tour de dia completo. Nossos tuk-tuks têm cobertores para clima frio. Não se preocupe em carregar bolsas - há espaço de armazenamento. Fornecemos WiFi a bordo. Mais importante: traga seu senso de aventura e prontidão para ter um dia inesquecível!",
        "es": "Qué traer en tu tour: Zapatos cómodos para caminar (hay caminata moderada en monumentos y algunas calles empedradas), ropa en capas (Sintra puede ser 5-10°C más fría que Lisboa, y el clima cambia rápidamente), chaqueta ligera o suéter incluso en verano, protector solar y sombrero para días soleados, botella de agua (podemos rellenarla), cámara o teléfono para fotos (¡aunque tomamos fotos profesionales para ti!), efectivo para entradas de monumentos si no están pre-reservadas, efectivo para almuerzo si hace tour de día completo. Nuestros tuk-tuks tienen mantas para clima frío. No te preocupes por llevar bolsas - hay espacio de almacenamiento. Proporcionamos WiFi a bordo. Más importante: ¡trae tu sentido de aventura y disposición para tener un día inolvidable!"
    },
    {
        "category": "practical",
        "tags": ["pickup", "meeting point", "location", "transfer", "lisbon"],
        "confidence": 1.0,
        "en": "Pickup and meeting points: For Half-Day and Full-Day tours, standard meeting point is Sintra train station (easily reached from Lisbon Rossio station - 40 minutes, €2.30 each way). We can also pick you up at your Sintra hotel if you're staying locally. For All-Inclusive Experience, we include private transfers from/to your Lisbon hotel or accommodation - door-to-door service in a comfortable vehicle (about 40-50 minutes drive). You can also end the tour in Cascais and take the scenic coastal train back to Lisbon (40 minutes) if you prefer - just let us know! We're flexible and work around your schedule. Contact us to arrange the best pickup/drop-off for your needs.",
        "pt": "Pontos de encontro e pickup: Para tours Meio-Dia e Dia Completo, ponto de encontro padrão é a estação de trem de Sintra (facilmente alcançável da estação Rossio de Lisboa - 40 minutos, €2,30 cada sentido). Também podemos buscá-lo no seu hotel em Sintra se estiver hospedado localmente. Para Experiência All-Inclusive, incluímos transfers privados de/para seu hotel ou acomodação em Lisboa - serviço porta-a-porta em veículo confortável (cerca de 40-50 minutos de viagem). Você também pode terminar o tour em Cascais e pegar o trem costeiro panorâmico de volta a Lisboa (40 minutos) se preferir - apenas nos avise! Somos flexíveis e trabalhamos em torno do seu horário. Entre em contato conosco para arranjar o melhor pickup/drop-off para suas necessidades.",
        "es": "Puntos de encuentro y recogida: Para tours de Medio Día y Día Completo, el punto de encuentro estándar es la estación de tren de Sintra (fácilmente accesible desde la estación Rossio de Lisboa - 40 minutos, €2,30 cada sentido). También podemos recogerte en tu hotel en Sintra si te hospedas localmente. Para Experiencia All-Inclusive, incluimos transfers privados desde/hacia tu hotel o alojamiento en Lisboa - servicio puerta a puerta en vehículo cómodo (unos 40-50 minutos de viaje). También puedes terminar el tour en Cascais y tomar el tren costero panorámico de regreso a Lisboa (40 minutos) si prefieres - ¡solo avísanos! Somos flexibles y trabajamos alrededor de tu horario. Contáctanos para organizar la mejor recogida/dejada para tus necesidades."
    },
]


async def seed_knowledge():
    """Populate semantic memory with knowledge base"""
    print("🌱 Starting Knowledge Base Seeding...")
    print(f"📊 Total entries to seed: {len(KNOWLEDGE_BASE)}")
    
    semantic_memory = SemanticMemory()
    embedding_generator = EmbeddingGenerator()
    
    success_count = 0
    error_count = 0
    
    for idx, entry in enumerate(KNOWLEDGE_BASE, 1):
        try:
            print(f"\n[{idx}/{len(KNOWLEDGE_BASE)}] Processing: {entry['category']}")
            print(f"   Tags: {', '.join(entry['tags'][:3])}...")
            
            # Generate embeddings for all languages
            print("   🔄 Generating embeddings...")
            embeddings = await embedding_generator.batch_generate([
                entry['en'],
                entry['pt'],
                entry['es']
            ])
            
            if not all(embeddings):
                print(f"   ❌ Failed to generate embeddings")
                error_count += 1
                continue
            
            # Store in semantic memory
            source_id = f"kb_{entry['category']}_{idx}"
            semantic_memory.store(
                content_en=entry['en'],
                content_pt=entry['pt'],
                content_es=entry['es'],
                category=entry['category'],
                tags=entry['tags'],
                source_type="knowledge_base",
                source_id=source_id,
                confidence=entry['confidence'],
                metadata={
                    "source": "yesyoudeserve.tours",
                    "seed_date": "2025-01-15",
                    "category": entry['category'],
                    "embeddings_stored": True
                }
            )
            
            print(f"   ✅ Seeded successfully!")
            success_count += 1
            
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            error_count += 1
    
    print("\n" + "="*60)
    print(f"🎉 Knowledge Base Seeding Complete!")
    print(f"   ✅ Success: {success_count}")
    print(f"   ❌ Errors: {error_count}")
    print(f"   📈 Success Rate: {(success_count/len(KNOWLEDGE_BASE)*100):.1f}%")
    print("="*60)


if __name__ == "__main__":
    asyncio.run(seed_knowledge())
