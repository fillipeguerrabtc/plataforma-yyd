"""
Knowledge Base Expansion Script - Adds 26 NEW FAQs to reach 50+ total
====================================================================
Inserts comprehensive FAQs without embeddings (waiting for OpenAI quota restoration)
"""

import os
import sys
import uuid
from datetime import datetime
import psycopg2
from dotenv import load_dotenv

load_dotenv()

# Connect to database
conn = psycopg2.connect(os.getenv("DATABASE_URL"))
cur = conn.cursor()

# 26 NEW comprehensive FAQs (in addition to existing 24)
NEW_FAQS = [
    # 1. CANCELLATION
    ("policies", ["cancellation", "refund", "modification"], 1.0,
     "Cancellation Policy: Free cancellation up to 24 hours before tour start for full refund. Within 24 hours: non-refundable. Contact WhatsApp +351 917 756 732 or info@yesyoudeserve.tours to cancel/reschedule. We'll find alternative dates at no extra charge (subject to availability). No-shows are non-refundable.",
     "Política de Cancelamento: Cancelamento grátis até 24h antes para reembolso total. Dentro de 24h: não reembolsável. Contate WhatsApp +351 917 756 732 ou info@yesyoudeserve.tours para cancelar/reagendar. Encontraremos datas alternativas sem custo extra (sujeito a disponibilidade). No-shows não reembolsáveis.",
     "Política de Cancelación: Cancelación gratuita hasta 24h antes para reembolso completo. Dentro de 24h: no reembolsable. Contacte WhatsApp +351 917 756 732 o info@yesyoudeserve.tours para cancelar/reprogramar. Encontraremos fechas alternativas sin cargo (sujeto a disponibilidad). No-shows no reembolsables."),
    
    # 2. ACCESSIBILITY
    ("accessibility", ["wheelchair", "mobility", "elderly"], 1.0,
     "Accessibility: Tuk-tuks accessible for moderate mobility but NOT wheelchair accessible (2-3 steps to enter). Elderly guests welcome - guides assist. Monuments have stairs/uneven surfaces. Inform us of accessibility needs when booking to customize. We can focus on viewpoints vs interiors. Service animals welcome.",
     "Acessibilidade: Tuk-tuks acessíveis para mobilidade moderada mas NÃO para cadeiras de rodas (2-3 degraus). Idosos bem-vindos - guias auxiliam. Monumentos têm escadas/superfícies irregulares. Informe necessidades ao reservar para personalizar. Podemos focar em mirantes vs interiores. Animais de serviço bem-vindos.",
     "Accesibilidad: Tuk-tuks accesibles para movilidad moderada pero NO sillas de ruedas (2-3 escalones). Mayores bienvenidos - guías ayudan. Monumentos tienen escaleras/superficies irregulares. Informe necesidades al reservar para personalizar. Podemos enfocarnos en miradores vs interiores. Animales de servicio bienvenidos."),
    
    # 3. WEATHER
    ("practical", ["weather", "rain", "clothing"], 1.0,
     "Weather: Sintra is 5-10°C cooler than Lisbon, often foggy/rainy. Layer clothing! Bring jacket even in summer. Tuk-tuks have rain covers and blankets. Tours run rain or shine - never cancelled! Comfortable walking shoes essential (no heels!). Sunscreen and hat for sunny days. Sintra windy especially at Cabo da Roca.",
     "Clima: Sintra é 5-10°C mais fria que Lisboa, frequentemente nebulosa/chuvosa. Vista-se em camadas! Traga jaqueta mesmo no verão. Tuk-tuks têm coberturas de chuva e cobertores. Tours com chuva ou sol - nunca cancelamos! Sapatos confortáveis essenciais (sem saltos!). Protetor solar e chapéu para dias ensolarados. Sintra ventosa especialmente em Cabo da Roca.",
     "Clima: Sintra es 5-10°C más fría que Lisboa, frecuentemente neblinosa/lluviosa. ¡Vístase en capas! Traiga chaqueta incluso en verano. Tuk-tuks tienen cubiertas de lluvia y mantas. Tours con lluvia o sol - ¡nunca cancelamos! Zapatos cómodos esenciales (¡sin tacones!). Protector solar y sombrero para días soleados. Sintra ventosa especialmente en Cabo da Roca."),
    
    # 4. CHILDREN
    ("family", ["children", "kids", "family"], 1.0,
     "Children & Families: Families very welcome! All ages can join. Kids love tuk-tuks and castles. No car seats required by law. Guides experienced with families. Bring snacks/water for kids. Consider baby carrier vs stroller (cobblestones!). Under 6 typically free/discounted monument tickets.",
     "Crianças & Famílias: Famílias muito bem-vindas! Todas as idades podem participar. Crianças adoram tuk-tuks e castelos. Sem assentos de carro exigidos por lei. Guias experientes com famílias. Traga lanches/água para crianças. Considere porta-bebê vs carrinho (paralelepípedos!). Menores de 6 anos tipicamente grátis/desconto em monumentos.",
     "Niños y Familias: ¡Familias muy bienvenidas! Todas las edades pueden unirse. Niños aman tuk-tuks y castillos. No requiere asientos de auto por ley. Guías experimentados con familias. Traiga bocadillos/agua para niños. Considere portabebés vs cochecito (¡adoquines!). Menores de 6 años típicamente gratis/descuento en monumentos."),
    
    # 5. PHOTOGRAPHY
    ("photography", ["photos", "camera", "instagram"], 1.0,
     "Photography: Professional photos INCLUDED! Guides know best angles and Instagram spots. Unlimited photos with your phone/camera throughout day - no selfie sticks needed! Best times: 9-11am for soft light and fewer crowds. Pena Palace spectacular from multiple viewpoints. Bring phone/camera fully charged. Drones prohibited without permits.",
     "Fotografia: Fotos profissionais INCLUSAS! Guias conhecem melhores ângulos e spots Instagram. Fotos ilimitadas com seu telefone/câmera durante o dia - sem pau de selfie! Melhores horários: 9-11h para luz suave e menos multidões. Palácio da Pena espetacular de múltiplos mirantes. Traga telefone/câmera carregado. Drones proibidos sem autorização.",
     "Fotografía: ¡Fotos profesionales INCLUIDAS! Guías conocen mejores ángulos y spots Instagram. Fotos ilimitadas con su teléfono/cámara durante el día - ¡sin palos de selfie! Mejores horarios: 9-11am para luz suave y menos multitudes. Palacio de Pena espectacular desde múltiples miradores. Traiga teléfono/cámara cargado. Drones prohibidos sin permisos."),
    
    # 6. PAYMENT
    ("payment", ["payment", "credit card", "cash"], 1.0,
     "Payment: We accept Cash (Euros), Credit/Debit Cards (Visa/Mastercard/Amex), Bank Transfer, PayPal, MBWay. Payment typically on tour day, or arrange advance. All-Inclusive tours: we handle all payments (monuments, lunch, wine). Tipping appreciated but never expected. ATMs in Sintra center.",
     "Pagamento: Aceitamos Dinheiro (Euros), Cartões Crédito/Débito (Visa/Mastercard/Amex), Transferência, PayPal, MBWay. Pagamento tipicamente no dia do tour, ou antecipado. Tours All-Inclusive: cuidamos de todos pagamentos (monumentos, almoço, vinho). Gorjetas apreciadas mas nunca esperadas. Caixas eletrônicos no centro de Sintra.",
     "Pago: Aceptamos Efectivo (Euros), Tarjetas Crédito/Débito (Visa/Mastercard/Amex), Transferencia, PayPal, MBWay. Pago típicamente día del tour, o anticipado. Tours All-Inclusive: manejamos todos pagos (monumentos, almuerzo, vino). Propinas apreciadas pero nunca esperadas. Cajeros en centro Sintra."),
    
    # 7. GROUP SIZE
    ("groups", ["group", "corporate", "private"], 1.0,
     "Groups: Tuk-tuks fit 6 people. Larger groups (7-36+): multiple tuk-tuks with walkie-talkies. Perfect for corporate events, team building, bachelor/bachelorette parties, weddings! Special group rates. 100% private tours - never grouped with strangers. Corporate: invoices, customized routes, special venues. Contact for 10+ people for custom pricing.",
     "Grupos: Tuk-tuks cabem 6 pessoas. Grupos maiores (7-36+): múltiplos tuk-tuks com walkie-talkies. Perfeito para eventos corporativos, team building, despedidas, casamentos! Tarifas especiais. Tours 100% privados - nunca agrupados com estranhos. Corporativo: faturas, rotas customizadas, locais especiais. Contate para 10+ pessoas para preço customizado.",
     "Grupos: Tuk-tuks caben 6 personas. Grupos más grandes (7-36+): múltiples tuk-tuks con walkie-talkies. ¡Perfecto para eventos corporativos, team building, despedidas, bodas! Tarifas especiales. Tours 100% privados - nunca agrupados con extraños. Corporativo: facturas, rutas personalizadas, lugares especiales. Contacte para 10+ personas para precio personalizado."),
    
    # 8. LANGUAGES
    ("languages", ["language", "english", "spanish"], 1.0,
     "Languages: All guides fluent in English and Portuguese. Many speak Spanish! Tell us your preferred language when booking. Founder Daniel Ponce speaks PT/EN/ES fluently. Tour quality same in all languages - local insights and stories adapted. Monument signage PT/EN. Audio guides available in 10+ languages.",
     "Idiomas: Todos guias fluentes em Inglês e Português. Muitos falam Espanhol! Nos informe seu idioma ao reservar. Fundador Daniel Ponce fala PT/EN/ES fluentemente. Qualidade do tour igual em todos idiomas - insights locais e histórias adaptadas. Sinalização monumentos PT/EN. Audioguias disponíveis em 10+ idiomas.",
     "Idiomas: Todos guías fluidos en Inglés y Portugués. ¡Muchos hablan Español! Infórmenos su idioma al reservar. Fundador Daniel Ponce habla PT/EN/ES con fluidez. Calidad del tour igual en todos idiomas - perspectivas locales e historias adaptadas. Señalización monumentos PT/EN. Audioguías disponibles en 10+ idiomas."),
    
    # 9. DIETARY
    ("food", ["vegetarian", "vegan", "allergies"], 1.0,
     "Dietary Restrictions: We accommodate ALL dietary needs! Inform us when booking: vegetarian, vegan, gluten-free, dairy-free, nut allergies, halal, kosher, etc. Portuguese restaurants very accommodating. We'll communicate your needs in advance. Bring emergency medication for severe allergies.",
     "Restrições Alimentares: Acomodamos TODAS necessidades! Informe ao reservar: vegetariano, vegano, sem glúten, sem laticínios, alergias a nozes, halal, kosher, etc. Restaurantes portugueses muito acomodatícios. Comunicaremos suas necessidades com antecedência. Traga medicação de emergência para alergias graves.",
     "Restricciones Alimentarias: ¡Acomodamos TODAS las necesidades! Informe al reservar: vegetariano, vegano, sin gluten, sin lácteos, alergias a nueces, halal, kosher, etc. Restaurantes portugueses muy acomodaticios. Comunicaremos sus necesidades con anticipación. Traiga medicación de emergencia para alergias graves."),
    
    # 10. TIPPING
    ("tipping", ["tip", "gratuity"], 1.0,
     "Tipping: Appreciated but NEVER expected! If you want to show appreciation, 10-20% is generous but any amount welcome. Many guests tip €20-50 for exceptional service. Tip in cash (Euros) to guide. What matters most: your satisfaction and positive reviews (TripAdvisor, Google, Facebook)!",
     "Gorjetas: Apreciadas mas NUNCA esperadas! Se quiser mostrar apreciação, 10-20% é generoso mas qualquer quantia bem-vinda. Muitos hóspedes dão €20-50 por serviço excepcional. Gorjeta em dinheiro (Euros) ao guia. O que mais importa: sua satisfação e avaliações positivas (TripAdvisor, Google, Facebook)!",
     "Propinas: ¡Apreciadas pero NUNCA esperadas! Si quiere mostrar apreciación, 10-20% es generoso pero cualquier cantidad bienvenida. Muchos huéspedes dan €20-50 por servicio excepcional. Propina en efectivo (Euros) al guía. Lo que más importa: su satisfacción y reseñas positivas (¡TripAdvisor, Google, Facebook!)"),
    
    # 11. SAFETY
    ("safety", ["safety", "insurance", "emergency"], 1.0,
     "Safety: Your safety is our priority! Tuk-tuks professionally maintained. Guides trained in first aid. Comprehensive liability insurance. Portugal emergency: 112 (ambulance/police/fire). Recommend travel insurance for medical/cancellations. Seat belts provided. Careful driving. Tuk-tuks sanitized between tours.",
     "Segurança: Sua segurança é nossa prioridade! Tuk-tuks profissionalmente mantidos. Guias treinados em primeiros socorros. Seguro de responsabilidade abrangente. Emergência Portugal: 112 (ambulância/polícia/bombeiros). Recomende seguro viagem para médico/cancelamentos. Cintos fornecidos. Direção cuidadosa. Tuk-tuks sanitizados entre tours.",
     "Seguridad: ¡Su seguridad es nuestra prioridad! Tuk-tuks mantenidos profesionalmente. Guías capacitados en primeros auxilios. Seguro de responsabilidad integral. Emergencia Portugal: 112 (ambulancia/policía/bomberos). Recomiende seguro de viaje para médico/cancelaciones. Cinturones provistos. Conducción cuidadosa. Tuk-tuks sanitizados entre tours."),
    
    # 12. PARKING
    ("logistics", ["parking", "restroom", "facilities"], 1.0,
     "Parking & Facilities: DON'T park at monuments - difficult and expensive! Park Sintra center (pay parking) or take train from Lisbon. Meeting point at train station. Restroom breaks at cafes/restaurants/monuments. Public restrooms in historic center. Clean facilities at all monuments. Baby changing available.",
     "Estacionamento & Instalações: NÃO estacione em monumentos - difícil e caro! Estacione centro Sintra (pago) ou pegue trem de Lisboa. Ponto de encontro na estação. Pausas banheiro em cafés/restaurantes/monumentos. Banheiros públicos no centro histórico. Instalações limpas em todos monumentos. Troca de fraldas disponível.",
     "Estacionamiento e Instalaciones: ¡NO estacione en monumentos - difícil y caro! Estacione centro Sintra (pago) o tome tren desde Lisboa. Punto de encuentro en estación. Pausas baño en cafés/restaurantes/monumentos. Baños públicos en centro histórico. Instalaciones limpias en todos monumentos. Cambio de pañales disponible."),
    
    # 13. MONUMENT RECOMMENDATIONS
    ("recommendations", ["monuments", "must-see", "top picks"], 1.0,
     "Which Monuments: MUST-SEE: Pena Palace (iconic colorful castle), Quinta da Regaleira (mystical gardens + Initiation Well). If time: Moorish Castle (views), Sintra National Palace (medieval, twin chimneys), Monserrate (peaceful gardens). SKIP if rushed: Chalet Biester, Seteais. Outside: Cabo da Roca (westernmost Europe), Azenhas do Mar (cliffside village). We help you choose based on interests!",
     "Quais Monumentos: IMPERDÍVEIS: Palácio da Pena (castelo colorido icônico), Quinta da Regaleira (jardins místicos + Poço Iniciático). Se tempo: Castelo dos Mouros (vistas), Palácio Nacional Sintra (medieval, chaminés gêmeas), Monserrate (jardins tranquilos). PULE se apressado: Chalet Biester, Seteais. Fora: Cabo da Roca (mais ocidental Europa), Azenhas do Mar (vila penhasco). Ajudamos escolher baseado em interesses!",
     "Qué Monumentos: IMPERDIBLES: Palacio de Pena (castillo colorido icónico), Quinta da Regaleira (jardines místicos + Pozo Iniciático). Si tiempo: Castillo de los Moros (vistas), Palacio Nacional Sintra (medieval, chimeneas gemelas), Monserrate (jardines tranquilos). OMITA si apurado: Chalet Biester, Seteais. Fuera: Cabo da Roca (más occidental Europa), Azenhas do Mar (pueblo acantilado). ¡Ayudamos elegir según intereses!"),
    
    # 14. BEST TIME TO VISIT
    ("planning", ["best time", "season", "crowds"], 1.0,
     "Best Time to Visit: Year-round destination! Spring (Apr-May) and Fall (Sep-Oct): perfect weather, fewer crowds. Summer (Jun-Aug): warm but very crowded, book early! Winter (Nov-Mar): cooler, rainy, but magical atmosphere and NO crowds - great for photographers! Weekdays less crowded than weekends. Early morning (9am) best for photos and avoiding tour buses. Christmas/New Year magical but busy.",
     "Melhor Época: Destino ano todo! Primavera (Abr-Mai) e Outono (Set-Out): clima perfeito, menos multidões. Verão (Jun-Ago): quente mas muito lotado, reserve cedo! Inverno (Nov-Mar): mais frio, chuvoso, mas atmosfera mágica e SEM multidões - ótimo para fotógrafos! Dias de semana menos lotados que fins de semana. Manhã cedo (9h) melhor para fotos e evitar ônibus turísticos. Natal/Ano Novo mágico mas ocupado.",
     "Mejor Época: ¡Destino todo el año! Primavera (Abr-May) y Otoño (Sep-Oct): clima perfecto, menos multitudes. Verano (Jun-Ago): cálido pero muy concurrido, ¡reserve temprano! Invierno (Nov-Mar): más frío, lluvioso, pero atmósfera mágica y SIN multitudes - ¡genial para fotógrafos! Días de semana menos concurridos que fines de semana. Temprano en mañana (9am) mejor para fotos y evitar autobuses turísticos. Navidad/Año Nuevo mágico pero ocupado."),
    
    # 15. WHAT TO BRING
    ("practical", ["what to bring", "essentials", "packing"], 1.0,
     "What to Bring: Comfortable walking shoes (essential!), layered clothing, light jacket, water bottle (we provide water too), sunscreen, hat, sunglasses, phone/camera fully charged, cash/cards for souvenirs, any medications you need. For All-Inclusive tours: we handle everything else! Don't bring: large backpacks (no storage in tuk-tuk), heels, umbrella (we have rain covers).",
     "O Que Trazer: Sapatos confortáveis (essencial!), roupas em camadas, jaqueta leve, garrafa de água (também fornecemos), protetor solar, chapéu, óculos de sol, telefone/câmera carregado, dinheiro/cartões para souvenirs, medicamentos necessários. Tours All-Inclusive: cuidamos de todo o resto! Não traga: mochilas grandes (sem armazenamento no tuk-tuk), saltos, guarda-chuva (temos coberturas de chuva).",
     "Qué Traer: Zapatos cómodos (¡esencial!), ropa en capas, chaqueta ligera, botella de agua (también proporcionamos), protector solar, sombrero, gafas de sol, teléfono/cámara cargado, efectivo/tarjetas para souvenirs, medicamentos necesarios. Tours All-Inclusive: ¡nos encargamos de todo lo demás! No traiga: mochilas grandes (sin almacenamiento en tuk-tuk), tacones, paraguas (tenemos cubiertas de lluvia)."),
    
    # 16. PICKUP LOCATIONS
    ("logistics", ["pickup", "meetup", "location", "hotel"], 1.0,
     "Pickup Locations: We pickup from ANY hotel/accommodation in Sintra, Cascais, or Estoril FREE! For Lisbon hotels: €30-50 extra depending on location (covers highway tolls and time). Standard meeting point: Sintra train station (easy from Lisbon - 40min train ride). We'll send exact pickup time and guide contact 24h before tour. Guide will meet you in lobby or specific location. Always ready 5-10min before pickup!",
     "Locais de Embarque: Buscamos em QUALQUER hotel/acomodação em Sintra, Cascais ou Estoril GRÁTIS! Para hotéis Lisboa: €30-50 extra dependendo da localização (cobre pedágios e tempo). Ponto de encontro padrão: estação de trem Sintra (fácil de Lisboa - 40min de trem). Enviaremos horário exato e contato do guia 24h antes do tour. Guia encontrará você no lobby ou local específico. Sempre pronto 5-10min antes!",
     "Lugares de Recogida: ¡Recogemos en CUALQUIER hotel/alojamiento en Sintra, Cascais o Estoril GRATIS! Para hoteles Lisboa: €30-50 extra dependiendo de ubicación (cubre peajes y tiempo). Punto de encuentro estándar: estación de tren Sintra (fácil desde Lisboa - 40min en tren). Enviaremos hora exacta y contacto de guía 24h antes del tour. Guía lo encontrará en lobby o ubicación específica. ¡Siempre listo 5-10min antes!"),
    
    # 17. DURATION & TIMING
    ("tour_details", ["duration", "timing", "how long"], 1.0,
     "Tour Duration: Half-Day (4-5 hours) - perfect for cruise passengers or limited time. Full-Day (8 hours) - comprehensive Sintra experience with lunch. All-Inclusive (8-10 hours) - full day + wine tasting + gourmet lunch. Tours flexible - if you're tired or want longer at specific sites, we adapt! Start times: usually 9am (best for avoiding crowds) but we accommodate your schedule. Sunrise tours available for photographers!",
     "Duração do Tour: Meio-Dia (4-5 horas) - perfeito para passageiros de cruzeiro ou tempo limitado. Dia Completo (8 horas) - experiência abrangente de Sintra com almoço. All-Inclusive (8-10 horas) - dia completo + degustação de vinhos + almoço gourmet. Tours flexíveis - se estiver cansado ou quiser mais tempo em locais específicos, adaptamos! Horários de início: geralmente 9h (melhor para evitar multidões) mas acomodamos sua agenda. Tours ao nascer do sol disponíveis para fotógrafos!",
     "Duración del Tour: Medio-Día (4-5 horas) - perfecto para pasajeros de crucero o tiempo limitado. Día Completo (8 horas) - experiencia integral de Sintra con almuerzo. All-Inclusive (8-10 horas) - día completo + cata de vinos + almuerzo gourmet. Tours flexibles - si está cansado o quiere más tiempo en sitios específicos, ¡adaptamos! Horarios de inicio: generalmente 9am (mejor para evitar multitudes) pero acomodamos su agenda. ¡Tours al amanecer disponibles para fotógrafos!"),
    
    # 18. MONUMENT TICKETS
    ("payment", ["tickets", "entrance fees", "monument cost"], 1.0,
     "Monument Tickets: NOT included in tour price (except All-Inclusive). Approximate costs: Pena Palace €14-20, Quinta da Regaleira €12, Moorish Castle €8, Sintra National Palace €10, Monserrate €8. Combos available! Children under 6: usually free. Students/seniors: discounts. We can purchase tickets for you in advance to skip lines! Or you can buy on-site (cash/card accepted). Budget €30-60/person for 2-3 monuments.",
     "Ingressos de Monumentos: NÃO inclusos no preço do tour (exceto All-Inclusive). Custos aproximados: Palácio da Pena €14-20, Quinta da Regaleira €12, Castelo dos Mouros €8, Palácio Nacional Sintra €10, Monserrate €8. Combos disponíveis! Crianças menores de 6: geralmente grátis. Estudantes/idosos: descontos. Podemos comprar ingressos antecipadamente para pular filas! Ou você compra no local (dinheiro/cartão aceitos). Orçamento €30-60/pessoa para 2-3 monumentos.",
     "Entradas de Monumentos: NO incluidas en precio del tour (excepto All-Inclusive). Costos aproximados: Palacio de Pena €14-20, Quinta da Regaleira €12, Castillo de los Moros €8, Palacio Nacional Sintra €10, Monserrate €8. ¡Combos disponibles! Niños menores de 6: generalmente gratis. Estudiantes/mayores: descuentos. ¡Podemos comprar entradas anticipadamente para saltar filas! O puede comprar en sitio (efectivo/tarjeta aceptados). Presupuesto €30-60/persona para 2-3 monumentos."),
    
    # 19. LUNCH RECOMMENDATIONS
    ("food", ["lunch", "restaurant", "where to eat"], 1.0,
     "Lunch: Full-Day tours include lunch at traditional Portuguese restaurants! Our picks: fresh seafood, grilled fish, Sintra's famous travesseiros (almond pastries), queijadas (cheese pastries). Vegetarian/vegan options available. Lunch ~€15-25/person (included in Full-Day and All-Inclusive). Wine recommended! We know family-owned gems with authentic food, not tourist traps. Cascais waterfront restaurants spectacular. Half-Day tours: we'll recommend best spots if you're staying longer.",
     "Almoço: Tours de Dia Completo incluem almoço em restaurantes portugueses tradicionais! Nossas escolhas: frutos do mar frescos, peixe grelhado, famosos travesseiros de Sintra (pastéis de amêndoa), queijadas (pastéis de queijo). Opções vegetarianas/veganas disponíveis. Almoço ~€15-25/pessoa (incluso em Dia Completo e All-Inclusive). Vinho recomendado! Conhecemos joias familiares com comida autêntica, não armadilhas turísticas. Restaurantes à beira-mar em Cascais espetaculares. Tours Meio-Dia: recomendaremos melhores locais se ficar mais tempo.",
     "Almuerzo: ¡Tours de Día Completo incluyen almuerzo en restaurantes portugueses tradicionales! Nuestras elecciones: mariscos frescos, pescado a la parrilla, famosos travesseiros de Sintra (pasteles de almendra), queijadas (pasteles de queso). Opciones vegetarianas/veganas disponibles. Almuerzo ~€15-25/persona (incluido en Día Completo y All-Inclusive). ¡Vino recomendado! Conocemos joyas familiares con comida auténtica, no trampas turísticas. Restaurantes frente al mar en Cascais espectaculares. Tours Medio-Día: recomendaremos mejores lugares si se queda más tiempo."),
    
    # 20. WINE TASTING
    ("experiences", ["wine", "wine tasting", "vineyard"], 1.0,
     "Wine Tasting: All-Inclusive tours include wine tasting at Quinta dos Avidagos vineyard or Adega Regional de Colares! Taste 3-5 local wines from Colares region (unique sandy soil vineyards). Learn about rare Ramisco grape variety. Beautiful vineyard views. Wine expert hosts. €15-25 value included. Can purchase bottles to take home. If you don't drink: we can substitute with local cheese/pastry tasting or extend monument time!",
     "Degustação de Vinhos: Tours All-Inclusive incluem degustação de vinhos na Quinta dos Avidagos ou Adega Regional de Colares! Prove 3-5 vinhos locais da região de Colares (vinhedos únicos em solo arenoso). Aprenda sobre variedade rara de uva Ramisco. Belas vistas do vinhedo. Anfitriões especialistas em vinho. Valor €15-25 incluso. Pode comprar garrafas para levar. Se não bebe: podemos substituir com degustação local de queijo/pastelaria ou estender tempo em monumentos!",
     "Cata de Vinos: ¡Tours All-Inclusive incluyen cata de vinos en Quinta dos Avidagos o Adega Regional de Colares! Pruebe 3-5 vinos locales de región de Colares (viñedos únicos en suelo arenoso). Aprenda sobre variedad rara de uva Ramisco. Hermosas vistas del viñedo. Anfitriones expertos en vino. Valor €15-25 incluido. Puede comprar botellas para llevar. Si no bebe: ¡podemos sustituir con degustación local de queso/pastelería o extender tiempo en monumentos!"),
    
    # 21. CROWDS & LINES
    ("practical", ["crowds", "lines", "busy"], 1.0,
     "Avoiding Crowds: Sintra VERY crowded June-August and weekends! Our strategy: Start early (9am), visit monuments before tour buses arrive (11am+), use guide-only entrances when possible. Pena Palace busiest 12-4pm - we go morning or late afternoon. Quinta da Regaleira: underground passages less crowded. Weekdays November-March: almost empty! Early morning golden hour: best photos + no crowds. Trust your guide's crowd-avoiding expertise!",
     "Evitando Multidões: Sintra MUITO lotada Junho-Agosto e fins de semana! Nossa estratégia: Começar cedo (9h), visitar monumentos antes dos ônibus turísticos chegarem (11h+), usar entradas só para guias quando possível. Palácio da Pena mais lotado 12-16h - vamos manhã ou final da tarde. Quinta da Regaleira: passagens subterrâneas menos lotadas. Dias de semana Novembro-Março: quase vazios! Golden hour manhã cedo: melhores fotos + sem multidões. Confie na expertise do seu guia para evitar multidões!",
     "Evitando Multitudes: ¡Sintra MUY concurrida Junio-Agosto y fines de semana! Nuestra estrategia: Comenzar temprano (9am), visitar monumentos antes que lleguen autobuses turísticos (11am+), usar entradas solo para guías cuando sea posible. Palacio de Pena más concurrido 12-16h - vamos mañana o final de tarde. Quinta da Regaleira: pasajes subterráneos menos concurridos. Días de semana Noviembre-Marzo: ¡casi vacíos! Golden hour mañana temprano: mejores fotos + sin multitudes. ¡Confíe en la experiencia de su guía para evitar multitudes!"),
    
    # 22. PRIVATE VS SHARED
    ("tour_details", ["private", "shared", "exclusive"], 1.0,
     "Private vs Shared: ALL our tours are 100% PRIVATE! Never grouped with strangers. Your tuk-tuk, your guide, your schedule. Want to spend 2 hours at Pena Palace? Fine! Want to skip a monument? No problem! Only people in your tuk-tuk are your travel companions. This is a premium boutique experience, not a mass tour. Fully customizable itinerary. That's the YYD difference - personal, exclusive, your way!",
     "Privado vs Compartilhado: TODOS nossos tours são 100% PRIVADOS! Nunca agrupados com estranhos. Seu tuk-tuk, seu guia, sua agenda. Quer passar 2 horas no Palácio da Pena? Tudo bem! Quer pular um monumento? Sem problema! Apenas pessoas no seu tuk-tuk são seus companheiros de viagem. Esta é uma experiência boutique premium, não tour de massa. Itinerário totalmente personalizável. Essa é a diferença YYD - pessoal, exclusivo, do seu jeito!",
     "Privado vs Compartido: ¡TODOS nuestros tours son 100% PRIVADOS! Nunca agrupados con extraños. Su tuk-tuk, su guía, su horario. ¿Quiere pasar 2 horas en Palacio de Pena? ¡Bien! ¿Quiere saltarse un monumento? ¡No hay problema! Solo personas en su tuk-tuk son sus compañeros de viaje. Esta es una experiencia boutique premium, no tour masivo. Itinerario totalmente personalizable. ¡Esa es la diferencia YYD - personal, exclusivo, a su manera!"),
    
    # 23. HISTORICAL CONTEXT
    ("culture", ["history", "historical", "background"], 1.0,
     "Historical Context: Sintra is UNESCO World Heritage site since 1995! Royal summer retreat since 12th century. Pena Palace: King Ferdinand II's romantic 19th-century castle. Quinta da Regaleira: Masonic symbolism and mystery. Moorish Castle: 8th-9th century Moors defense structure. Sintra's unique microclimate allowed exotic plants from Portuguese colonies. Lord Byron called it 'glorious Eden'. Our guides bring history alive with stories, not just dates!",
     "Contexto Histórico: Sintra é Patrimônio Mundial da UNESCO desde 1995! Retiro real de verão desde século 12. Palácio da Pena: castelo romântico do século 19 do Rei Fernando II. Quinta da Regaleira: simbolismo maçônico e mistério. Castelo dos Mouros: estrutura de defesa mourisca séculos 8-9. Microclima único de Sintra permitiu plantas exóticas das colônias portuguesas. Lord Byron chamou de 'Éden glorioso'. Nossos guias trazem história viva com histórias, não apenas datas!",
     "Contexto Histórico: ¡Sintra es Patrimonio Mundial de la UNESCO desde 1995! Retiro real de verano desde siglo 12. Palacio de Pena: castillo romántico del siglo 19 del Rey Fernando II. Quinta da Regaleira: simbolismo masónico y misterio. Castillo de los Moros: estructura de defensa morisca siglos 8-9. Microclima único de Sintra permitió plantas exóticas de colonias portuguesas. Lord Byron lo llamó 'Edén glorioso'. ¡Nuestros guías traen historia viva con historias, no solo fechas!"),
    
    # 24. COVID & HEALTH
    ("safety", ["covid", "health", "sanitization"], 1.0,
     "COVID & Health: Tuk-tuks sanitized between all tours. Guides vaccinated and follow health protocols. Masks optional (your preference). Hand sanitizer provided. Outdoor activities inherently safer. Monuments well-ventilated. If you feel unwell before tour, please reschedule - we'll accommodate at no charge. Portugal healthcare excellent if needed. Travel insurance recommended for peace of mind.",
     "COVID & Saúde: Tuk-tuks sanitizados entre todos os tours. Guias vacinados e seguem protocolos de saúde. Máscaras opcionais (sua preferência). Álcool gel fornecido. Atividades ao ar livre inerentemente mais seguras. Monumentos bem ventilados. Se sentir-se mal antes do tour, por favor reagende - acomodaremos sem custo. Saúde em Portugal excelente se necessário. Seguro viagem recomendado para tranquilidade.",
     "COVID y Salud: Tuk-tuks sanitizados entre todos los tours. Guías vacunados y siguen protocolos de salud. Máscaras opcionales (su preferencia). Gel desinfectante proporcionado. Actividades al aire libre inherentemente más seguras. Monumentos bien ventilados. Si se siente mal antes del tour, por favor reprograme - acomodaremos sin cargo. Salud en Portugal excelente si es necesario. Seguro de viaje recomendado para tranquilidad."),
    
    # 25. SOUVENIRS & SHOPPING
    ("shopping", ["souvenirs", "shopping", "gifts"], 1.0,
     "Souvenirs & Shopping: Sintra famous for travesseiros and queijadas pastries - perfect gifts! Traditional hand-painted azulejo tiles. Portuguese cork products. Sintra wine from Colares region. Local honey and preserves. Handmade ceramics. Our guides know authentic shops, not tourist traps! Best souvenir: your photos and memories. We'll give you time for shopping in Sintra historic center. ATM and credit cards widely accepted.",
     "Souvenirs & Compras: Sintra famosa por travesseiros e queijadas - presentes perfeitos! Azulejos tradicionais pintados à mão. Produtos portugueses de cortiça. Vinho de Sintra da região de Colares. Mel local e conservas. Cerâmicas artesanais. Nossos guias conhecem lojas autênticas, não armadilhas turísticas! Melhor souvenir: suas fotos e memórias. Daremos tempo para compras no centro histórico de Sintra. Caixas eletrônicos e cartões de crédito amplamente aceitos.",
     "Souvenirs y Compras: Sintra famosa por travesseiros y queijadas - ¡regalos perfectos! Azulejos tradicionales pintados a mano. Productos portugueses de corcho. Vino de Sintra de región de Colares. Miel local y conservas. Cerámicas artesanales. ¡Nuestros guías conocen tiendas auténticas, no trampas turísticas! Mejor souvenir: sus fotos y memorias. Daremos tiempo para compras en centro histórico de Sintra. Cajeros automáticos y tarjetas de crédito ampliamente aceptados."),
    
    # 26. COMBO TOURS
    ("tour_details", ["combo", "combination", "multiple days"], 1.0,
     "Combo Tours: Want Sintra + Cascais + Lisbon? We create multi-day packages! Popular combos: Day 1 Sintra, Day 2 Cascais/Estoril, Day 3 Lisbon highlights. Or combine with Fátima, Óbidos, Nazaré. Discounts for multiple days! Perfect for cruise passengers with 2-3 days in port. We can design custom itineraries for your entire Portugal visit. Contact us to build your dream Portuguese adventure!",
     "Tours Combinados: Quer Sintra + Cascais + Lisboa? Criamos pacotes multi-dias! Combos populares: Dia 1 Sintra, Dia 2 Cascais/Estoril, Dia 3 destaques de Lisboa. Ou combine com Fátima, Óbidos, Nazaré. Descontos para múltiplos dias! Perfeito para passageiros de cruzeiro com 2-3 dias no porto. Podemos desenhar itinerários customizados para toda sua visita a Portugal. Entre em contato para construir sua aventura portuguesa dos sonhos!",
     "Tours Combinados: ¿Quiere Sintra + Cascais + Lisboa? ¡Creamos paquetes multi-días! Combos populares: Día 1 Sintra, Día 2 Cascais/Estoril, Día 3 destacados de Lisboa. O combine con Fátima, Óbidos, Nazaré. ¡Descuentos para múltiples días! Perfecto para pasajeros de crucero con 2-3 días en puerto. Podemos diseñar itinerarios personalizados para toda su visita a Portugal. ¡Contáctenos para construir su aventura portuguesa de ensueño!")
]

print(f"🚀 Inserting {len(NEW_FAQS)} NEW knowledge base entries...")
print("=" * 70)

inserted = 0
for idx, faq in enumerate(NEW_FAQS, 1):
    category, tags, confidence, en, pt, es = faq
    
    try:
        knowledge_id = str(uuid.uuid4())
        cur.execute("""
            INSERT INTO aurora_semantic_memory 
            (id, category, tags, confidence, "contentEn", "contentPt", "contentEs", "sourceType", "createdAt", "updatedAt")
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'faq', NOW(), NOW())
            RETURNING id
        """, (knowledge_id, category, tags, confidence, en, pt, es))
        
        result = cur.fetchone()
        inserted += 1
        print(f"✅ [{idx}/{len(NEW_FAQS)}] Inserted: {category} - {result[0]}")
        
    except Exception as e:
        print(f"❌ [{idx}/{len(NEW_FAQS)}] Error: {e}")

conn.commit()
cur.close()
conn.close()

print("=" * 70)
print(f"✨ DONE! Inserted {inserted}/{len(NEW_FAQS)} new FAQs")
print(f"📊 Total Knowledge Base entries: 24 original + {inserted} new = {24+inserted}")
print("\n🔔 Embeddings are NULL - waiting for OpenAI quota restoration")
print("🤖 Health check will auto-process embeddings when quota returns!")
