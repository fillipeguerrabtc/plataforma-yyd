-- YYD Platform Seed Data
-- Real tours from Yes You Deserve Portugal

-- Insert admin user (password: admin123)
INSERT INTO users (id, email, password_hash, full_name, role, language) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@yyd.tours', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5I5nkT9FkzPl.', 'Admin YYD', 'admin', 'pt'),
('00000000-0000-0000-0000-000000000002', 'manager@yyd.tours', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5I5nkT9FkzPl.', 'Manager YYD', 'manager', 'pt');

-- Insert real guides
INSERT INTO users (id, email, password_hash, full_name, role, language, phone) VALUES
('00000000-0000-0000-0000-000000000010', 'daniel@yyd.tours', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5I5nkT9FkzPl.', 'Daniel Ponce', 'guide', 'pt', '+351912345678'),
('00000000-0000-0000-0000-000000000011', 'vera@yyd.tours', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5I5nkT9FkzPl.', 'Vera Santos', 'guide', 'pt', '+351912345679'),
('00000000-0000-0000-0000-000000000012', 'leandro@yyd.tours', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5I5nkT9FkzPl.', 'Leandro Silva', 'guide', 'pt', '+351912345680');

-- Insert guide profiles
INSERT INTO guides (id, user_id, certifications, languages, specialties, rating, total_tours, bio_en, bio_pt) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 
'["Tourism Professional License", "First Aid Certified"]', 
'["pt", "en", "es"]', 
'["History", "Photography", "Wine Tours"]', 
5.00, 234,
'Founder & Lead Guide. Featured on ABC Good Morning America with Robin Roberts. Passionate about sharing the magic of Sintra with authentic, personalized experiences.',
'Fundador e Guia Principal. Destaque no ABC Good Morning America com Robin Roberts. Apaixonado por compartilhar a magia de Sintra com experiências autênticas e personalizadas.'),

('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000011',
'["Tourism Professional License"]',
'["pt", "en"]',
'["Nature", "Coastal Tours", "Family Tours"]',
4.95, 187,
'Specializes in coastal experiences and family-friendly tours. Known for warm personality and deep knowledge of local culture.',
'Especialista em experiências costeiras e tours para famílias. Conhecida por sua personalidade calorosa e profundo conhecimento da cultura local.'),

('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000012',
'["Tourism Professional License", "Wine Sommelier Level 2"]',
'["pt", "en", "fr"]',
'["Wine Tours", "Gastronomy", "History"]',
4.98, 156,
'Wine expert and history enthusiast. Perfect for wine lovers seeking authentic Portuguese experiences.',
'Especialista em vinhos e entusiasta de história. Perfeito para amantes de vinho que buscam experiências portuguesas autênticas.');

-- Insert vehicles (fleet)
INSERT INTO vehicles (id, vehicle_type, plate_number, capacity, battery_level) VALUES
('20000000-0000-0000-0000-000000000001', 'tuk-tuk-electric', 'AA-11-BB', 4, 95),
('20000000-0000-0000-0000-000000000002', 'tuk-tuk-electric', 'AA-22-CC', 4, 88),
('20000000-0000-0000-0000-000000000003', 'tuk-tuk-electric', 'AA-33-DD', 4, 92),
('20000000-0000-0000-0000-000000000004', 'van', 'AA-44-EE', 8, 100);

-- Insert real YYD tour products
INSERT INTO tour_products (
    id, slug, city, category, base_price_eur, base_price_usd, duration_minutes, max_participants,
    title_en, title_pt, title_es,
    description_en, description_pt, description_es,
    highlights_en, highlights_pt, highlights_es,
    includes, excludes, addons, photos, visibility, featured
) VALUES

-- Sintra Magic Private Tour
('30000000-0000-0000-0000-000000000001', 'sintra-magic-private-tour', 'Sintra', 'Cultural & Historical', 220.00, 240.00, 240, 4,
'Sintra Magic Private Tour', 
'Sintra Mágica Tour Privado',
'Tour Privado Mágico de Sintra',
'Discover the enchanting palaces and gardens of Sintra in a private electric tuk-tuk. Visit Pena Palace, Quinta da Regaleira, and secret viewpoints known only to locals. Includes complimentary photos and authentic Portuguese stories.',
'Descubra os palácios e jardins encantadores de Sintra em tuk-tuk elétrico privado. Visite Palácio da Pena, Quinta da Regaleira e miradouros secretos conhecidos apenas pelos locais. Inclui fotos gratuitas e histórias portuguesas autênticas.',
'Descubre los palacios y jardines encantadores de Sintra en tuk-tuk eléctrico privado. Visita Palacio da Pena, Quinta da Regaleira y miradores secretos conocidos solo por locales.',
'["Pena Palace exterior", "Quinta da Regaleira", "Moorish Castle views", "Secret viewpoints", "Local stories & history", "Complimentary photos"]',
'["Palácio da Pena (exterior)", "Quinta da Regaleira", "Vistas Castelo dos Mouros", "Miradouros secretos", "Histórias e cultura local", "Fotos gratuitas"]',
'["Palacio da Pena (exterior)", "Quinta da Regaleira", "Vistas Castillo Moros", "Miradores secretos", "Historias locales", "Fotos gratis"]',
'["Private electric tuk-tuk", "Professional guide", "Complimentary photos", "Bottled water"]',
'["Monument entrance fees", "Lunch", "Gratuities"]',
'[{"id": "extra-time", "name_en": "Extra Hour", "name_pt": "Hora Extra", "price_eur": 50}, {"id": "photo-session", "name_en": "Professional Photo Session", "name_pt": "Sessão Fotográfica Profissional", "price_eur": 80}, {"id": "lunch", "name_en": "Local Restaurant Lunch", "name_pt": "Almoço Restaurante Local", "price_eur": 35}]',
'["https://example.com/sintra-1.jpg", "https://example.com/sintra-2.jpg"]',
true, true),

-- Sunset at Cabo da Roca
('30000000-0000-0000-0000-000000000002', 'sunset-cabo-da-roca', 'Cascais', 'Romantic & Nature', 180.00, 195.00, 120, 4,
'Sunset at Cabo da Roca',
'Pôr do Sol em Cabo da Roca',
'Atardecer en Cabo da Roca',
'Experience the magic of sunset at the westernmost point of continental Europe. Enjoy champagne while watching the sun dip into the Atlantic Ocean at dramatic cliffs. Perfect for couples and photographers.',
'Experiencie a magia do pôr do sol no ponto mais ocidental da Europa continental. Desfrute de champanhe enquanto observa o sol mergulhar no Oceano Atlântico nas falésias dramáticas. Perfeito para casais e fotógrafos.',
'Experimenta la magia del atardecer en el punto más occidental de Europa continental. Disfruta champán mientras ves el sol hundirse en el Atlántico.',
'["Cabo da Roca sunset", "Champagne toast", "Atlantic Ocean views", "Professional photos", "Azenhas do Mar village", "Coastal cliffs"]',
'["Pôr do sol Cabo da Roca", "Brinde com champanhe", "Vistas Oceano Atlântico", "Fotos profissionais", "Vila Azenhas do Mar", "Falésias costeiras"]',
'["Atardecer Cabo da Roca", "Brindis champán", "Vistas Océano Atlántico", "Fotos profesionales", "Pueblo Azenhas do Mar"]',
'["Private electric tuk-tuk", "Champagne & glasses", "Professional guide", "Sunset photos"]',
'["Additional drinks", "Dinner", "Gratuities"]',
'[{"id": "dinner", "name_en": "Seaside Dinner", "name_pt": "Jantar à Beira-Mar", "price_eur": 65}]',
'["https://example.com/cabo-1.jpg"]',
true, true),

-- Lisbon Electric Experience
('30000000-0000-0000-0000-000000000003', 'lisbon-electric-experience', 'Lisboa', 'City Tours', 160.00, 175.00, 180, 4,
'Lisbon Electric Experience',
'Lisboa Elétrica Experience',
'Experiencia Eléctrica Lisboa',
'Explore Lisbon seven hills in comfort with our electric tuk-tuk. Visit Alfama, best miradouros, historic neighborhoods, and learn about Fado culture. Navigate narrow streets inaccessible to big buses.',
'Explore as sete colinas de Lisboa confortavelmente com nosso tuk-tuk elétrico. Visite Alfama, melhores miradouros, bairros históricos e aprenda sobre cultura do Fado. Navegue ruas estreitas inacessíveis a grandes ônibus.',
'Explora las siete colinas de Lisboa cómodamente en tuk-tuk eléctrico. Visita Alfama, mejores miradores, barrios históricos y cultura Fado.',
'["Alfama district", "Miradouros panoramic views", "Fado story & culture", "Historic neighborhoods", "Tram 28 route", "Local insights"]',
'["Bairro Alfama", "Vistas panorâmicas miradouros", "História e cultura Fado", "Bairros históricos", "Rota Elétrico 28", "Conhecimento local"]',
'["Barrio Alfama", "Vistas panorámicas miradores", "Historia Fado", "Barrios históricos", "Ruta Tranvía 28"]',
'["Private electric tuk-tuk", "Professional guide", "Water", "City insights"]',
'["Museum fees", "Food & drinks", "Gratuities"]',
'[{"id": "fado-show", "name_en": "Fado Show & Dinner", "name_pt": "Show de Fado e Jantar", "price_eur": 75}]',
'["https://example.com/lisboa-1.jpg"]',
true, false),

-- Douro Intimate Wine Route
('30000000-0000-0000-0000-000000000004', 'douro-intimate-wine-route', 'Douro', 'Wine & Gastronomy', 320.00, 350.00, 480, 8,
'Douro Intimate Wine Route',
'Douro Intimista do Vinho',
'Ruta Intimista Vino Douro',
'Full-day wine experience in UNESCO World Heritage Douro Valley. Visit family-owned quintas, taste exceptional wines, enjoy traditional lunch with local chef. Small group ensures intimate experience.',
'Experiência de dia completo de vinhos no Vale do Douro Patrimônio Mundial da UNESCO. Visite quintas familiares, deguste vinhos excepcionais, desfrute almoço tradicional com chef local. Grupo pequeno garante experiência íntima.',
'Experiencia de día completo de vinos en Valle Douro Patrimonio UNESCO. Visita quintas familiares, degusta vinos excepcionales, almuerzo tradicional con chef local.',
'["3 family-owned quintas", "Wine tastings", "Traditional lunch with chef", "Douro River views", "UNESCO Heritage site", "Small group (max 8)"]',
'["3 quintas familiares", "Degustações de vinho", "Almoço tradicional com chef", "Vistas Rio Douro", "Património UNESCO", "Grupo pequeno (máx 8)"]',
'["3 quintas familiares", "Degustaciones vino", "Almuerzo tradicional chef", "Vistas Río Douro", "Patrimonio UNESCO"]',
'["Private van transport", "Wine expert guide", "3 winery visits", "Wine tastings", "Traditional lunch", "Bottled water"]',
'["Additional wine purchases", "Gratuities"]',
'[{"id": "river-cruise", "name_en": "Douro River Cruise", "name_pt": "Cruzeiro Rio Douro", "price_eur": 45}]',
'["https://example.com/douro-1.jpg"]',
true, true);

-- Insert sample Stripe integration (disabled by default)
INSERT INTO integrations (integration_type, integration_name, enabled, config) VALUES
('stripe', 'Stripe Payments', false, '{"mode": "test", "webhook_enabled": true, "auto_capture": true}'),
('whatsapp', 'WhatsApp Business API', false, '{"phone_number_id": "", "business_account_id": ""}'),
('meta', 'Meta Business Suite', false, '{"app_id": "", "pages": []}');
