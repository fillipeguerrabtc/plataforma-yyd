-- YYD Platform Database Schema
-- PostgreSQL 15+ (pgvector temporarily disabled)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS AND AUTH
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('admin', 'manager', 'guide', 'customer')) NOT NULL,
    phone VARCHAR(50),
    language VARCHAR(10) DEFAULT 'en',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- GUIDES
CREATE TABLE guides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    certifications JSONB DEFAULT '[]',
    languages JSONB DEFAULT '["pt","en"]',
    specialties JSONB DEFAULT '[]',
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_tours INT DEFAULT 0,
    availability_schedule JSONB,
    bio_pt TEXT,
    bio_en TEXT,
    bio_es TEXT,
    photo_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guides_user ON guides(user_id);
CREATE INDEX idx_guides_active ON guides(active);

-- VEHICLES (FLEET)
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_type VARCHAR(50) CHECK (vehicle_type IN ('tuk-tuk-electric', 'van', 'car')) NOT NULL,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    capacity INT NOT NULL,
    status VARCHAR(50) CHECK (status IN ('available', 'in-use', 'maintenance', 'inactive')) DEFAULT 'available',
    battery_level INT CHECK (battery_level >= 0 AND battery_level <= 100),
    last_maintenance TIMESTAMPTZ,
    next_maintenance TIMESTAMPTZ,
    insurance_expiry TIMESTAMPTZ,
    location JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_type ON vehicles(vehicle_type);

-- TOUR PRODUCTS
CREATE TABLE tour_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    city VARCHAR(100) CHECK (city IN ('Sintra', 'Lisboa', 'Cascais', 'Douro', 'Porto', 'Algarve')),
    category VARCHAR(100),
    base_price_eur DECIMAL(10,2) NOT NULL,
    base_price_usd DECIMAL(10,2),
    duration_minutes INT CHECK (duration_minutes > 0),
    max_participants INT DEFAULT 4,
    
    title_pt VARCHAR(255),
    title_en VARCHAR(255),
    title_es VARCHAR(255),
    
    description_pt TEXT,
    description_en TEXT,
    description_es TEXT,
    
    highlights_pt JSONB,
    highlights_en JSONB,
    highlights_es JSONB,
    
    includes JSONB DEFAULT '[]',
    excludes JSONB DEFAULT '[]',
    addons JSONB DEFAULT '[]',
    
    cancellation_policy JSONB,
    meeting_point JSONB,
    
    photos JSONB DEFAULT '[]',
    visibility BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tour_products_slug ON tour_products(slug);
CREATE INDEX idx_tour_products_city ON tour_products(city);
CREATE INDEX idx_tour_products_visibility ON tour_products(visibility);

-- BOOKINGS
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    
    tour_product_id UUID REFERENCES tour_products(id),
    customer_id UUID REFERENCES users(id),
    guide_id UUID REFERENCES guides(id),
    vehicle_id UUID REFERENCES vehicles(id),
    
    tour_date DATE NOT NULL,
    tour_time TIME NOT NULL,
    participants INT NOT NULL,
    
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    customer_language VARCHAR(10) DEFAULT 'en',
    
    base_price DECIMAL(10,2) NOT NULL,
    addons_price DECIMAL(10,2) DEFAULT 0.00,
    total_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    fx_rate DECIMAL(10,6),
    
    payment_status VARCHAR(50) CHECK (payment_status IN ('pending', 'paid', 'refunded', 'cancelled')) DEFAULT 'pending',
    booking_status VARCHAR(50) CHECK (booking_status IN ('tentative', 'confirmed', 'completed', 'cancelled', 'no-show')) DEFAULT 'tentative',
    
    stripe_payment_intent_id VARCHAR(255),
    voucher_code VARCHAR(100),
    
    special_requests TEXT,
    internal_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_bookings_number ON bookings(booking_number);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_tour_date ON bookings(tour_date);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_bookings_payment ON bookings(payment_status);

-- REVIEWS
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES users(id),
    guide_id UUID REFERENCES guides(id),
    
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    nps_score INT CHECK (nps_score >= 0 AND nps_score <= 10),
    
    review_text TEXT,
    response_text TEXT,
    
    sentiment_score DECIMAL(3,2),
    
    published BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_booking ON reviews(booking_id);
CREATE INDEX idx_reviews_guide ON reviews(guide_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- FINANCIAL TRANSACTIONS
CREATE TABLE financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_type VARCHAR(50) CHECK (transaction_type IN ('payment', 'refund', 'payout', 'fee', 'adjustment')) NOT NULL,
    
    booking_id UUID REFERENCES bookings(id),
    
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    
    stripe_charge_id VARCHAR(255),
    stripe_refund_id VARCHAR(255),
    stripe_payout_id VARCHAR(255),
    
    status VARCHAR(50) CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
    
    description TEXT,
    metadata JSONB,
    
    processed_by UUID REFERENCES users(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_transactions_booking ON financial_transactions(booking_id);
CREATE INDEX idx_transactions_type ON financial_transactions(transaction_type);
CREATE INDEX idx_transactions_status ON financial_transactions(status);
CREATE INDEX idx_transactions_created ON financial_transactions(created_at);

-- INTEGRATIONS CONFIG
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_type VARCHAR(100) CHECK (integration_type IN ('stripe', 'whatsapp', 'meta', 'tripadvisor', 'ota', 'custom')) NOT NULL,
    integration_name VARCHAR(255) NOT NULL,
    
    enabled BOOLEAN DEFAULT FALSE,
    
    config JSONB NOT NULL,
    credentials JSONB,
    
    webhook_url TEXT,
    webhook_secret VARCHAR(255),
    
    last_sync_at TIMESTAMPTZ,
    sync_status VARCHAR(50),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_integrations_type ON integrations(integration_type);
CREATE INDEX idx_integrations_enabled ON integrations(enabled);

-- AURORA CONVERSATIONS (for Lead/Customer chat)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(255),
    channel VARCHAR(50) CHECK (channel IN ('whatsapp', 'instagram', 'facebook', 'web', 'voice')) NOT NULL,
    
    customer_id UUID REFERENCES users(id),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    customer_email VARCHAR(255),
    
    language VARCHAR(10) DEFAULT 'en',
    
    status VARCHAR(50) CHECK (status IN ('active', 'waiting', 'closed', 'handoff')) DEFAULT 'active',
    assigned_to UUID REFERENCES users(id),
    
    sentiment_avg DECIMAL(3,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ
);

CREATE INDEX idx_conversations_customer ON conversations(customer_id);
CREATE INDEX idx_conversations_channel ON conversations(channel);
CREATE INDEX idx_conversations_status ON conversations(status);

-- MESSAGES
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    
    direction VARCHAR(10) CHECK (direction IN ('inbound', 'outbound')) NOT NULL,
    sender_type VARCHAR(20) CHECK (sender_type IN ('customer', 'ai', 'agent')) NOT NULL,
    sender_id UUID REFERENCES users(id),
    
    content TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'text',
    
    intent VARCHAR(100),
    sentiment DECIMAL(3,2),
    
    metadata JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- EMBEDDINGS (for semantic search)
CREATE TABLE embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scope VARCHAR(50) CHECK (scope IN ('tour', 'policy', 'faq', 'guide', 'memory')) NOT NULL,
    reference_id UUID,
    
    locale VARCHAR(10),
    content TEXT,
    
    metadata JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_embeddings_scope ON embeddings(scope);
CREATE INDEX idx_embeddings_ref ON embeddings(reference_id);

-- AUDIT LOG
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    changes JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_guides_updated_at BEFORE UPDATE ON guides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tour_products_updated_at BEFORE UPDATE ON tour_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
