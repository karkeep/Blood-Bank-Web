-- ============================================
-- Migration 008: Homepage Content Management
-- ============================================
-- Admin-controllable settings for homepage sections

-- ============================================
-- Table: homepage_content
-- ============================================
CREATE TABLE homepage_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key TEXT UNIQUE NOT NULL, -- 'donor_spotlight', 'city_inventory', 'top_donor_cities', 'cities_needing_donors'
    
    -- Display settings
    is_visible BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    title TEXT,
    subtitle TEXT,
    
    -- Content configuration (JSON)
    config JSONB DEFAULT '{}'::JSONB,
    -- Example configs:
    -- donor_spotlight: { "count": 3, "anonymize": true, "badge_filter": ["gold", "platinum"] }
    -- city_inventory: { "cities": ["Kathmandu", "Lalitpur"], "show_map": true }
    -- top_donor_cities: { "limit": 5, "show_percentage": true }
    
    -- Featured items (admin override)
    featured_items UUID[] DEFAULT '{}',
    
    -- Caching
    cache_duration_mins INTEGER DEFAULT 15,
    last_refresh_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_homepage_content_section ON homepage_content(section_key);
CREATE INDEX idx_homepage_content_visible ON homepage_content(is_visible, display_order);

-- ============================================
-- Table: featured_donors (for spotlight override)
-- ============================================
CREATE TABLE featured_donors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    
    -- Display settings
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    featured_until TIMESTAMPTZ,
    
    -- Custom display (override)
    custom_name TEXT, -- e.g., "Anonymous Hero" or real name
    custom_badge TEXT, -- Gold, Silver, Bronze, Platinum, Diamond
    highlight_reason TEXT, -- "Top donor this month"
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_featured_donors_active ON featured_donors(is_active, display_order) WHERE is_active = TRUE;
CREATE INDEX idx_featured_donors_user ON featured_donors(donor_id);

-- ============================================
-- Table: city_display_settings
-- ============================================
CREATE TABLE city_display_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_name TEXT UNIQUE NOT NULL,
    
    -- Display settings
    is_visible BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    display_name TEXT, -- Localized or formatted name
    
    -- Thresholds for status calculation
    critical_threshold DECIMAL(5,2) DEFAULT 0.20, -- Below 20% = Critical
    low_threshold DECIMAL(5,2) DEFAULT 0.50,      -- Below 50% = Low
    
    -- Target metrics
    target_donors INTEGER,
    target_inventory_per_type INTEGER DEFAULT 50,
    
    -- Coordinates (for map display)
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_city_settings_visible ON city_display_settings(is_visible, display_order);

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_display_settings ENABLE ROW LEVEL SECURITY;

-- Homepage content: Public read, admin write
CREATE POLICY homepage_content_read ON homepage_content
    FOR SELECT USING (TRUE);

CREATE POLICY homepage_content_write ON homepage_content
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin')
        )
    );

-- Featured donors: Public read, admin write
CREATE POLICY featured_donors_read ON featured_donors
    FOR SELECT USING (TRUE);

CREATE POLICY featured_donors_write ON featured_donors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin')
        )
    );

-- City settings: Public read, admin write
CREATE POLICY city_settings_read ON city_display_settings
    FOR SELECT USING (TRUE);

CREATE POLICY city_settings_write ON city_display_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin')
        )
    );

-- ============================================
-- Triggers
-- ============================================

CREATE TRIGGER trg_homepage_content_updated_at
    BEFORE UPDATE ON homepage_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_featured_donors_updated_at
    BEFORE UPDATE ON featured_donors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_city_settings_updated_at
    BEFORE UPDATE ON city_display_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Seed Default Content Settings
-- ============================================

INSERT INTO homepage_content (section_key, title, subtitle, config, display_order) VALUES
('donor_spotlight', 'Top Donor Spotlight', 'Celebrating our blood heroes', 
 '{"count": 3, "anonymize": true, "badge_filter": ["gold", "platinum", "diamond"]}'::JSONB, 1),
('city_inventory', 'City Blood Inventory', 'Real-time blood supply status', 
 '{"show_map": true, "show_details": true}'::JSONB, 2),
('top_donor_cities', 'Top Donor Cities', 'Cities with most active donors', 
 '{"limit": 5, "show_count": true}'::JSONB, 3),
('cities_needing_donors', 'Cities Needing Donors', 'Areas with donor shortage', 
 '{"limit": 5, "show_deficit_percentage": true}'::JSONB, 4);

-- Seed Nepal cities
INSERT INTO city_display_settings (city_name, display_name, latitude, longitude, target_donors, display_order) VALUES
('Kathmandu', 'Kathmandu', 27.7172, 85.3240, 5000, 1),
('Lalitpur', 'Lalitpur (Patan)', 27.6588, 85.3247, 2000, 2),
('Bhaktapur', 'Bhaktapur', 27.6710, 85.4298, 1500, 3),
('Pokhara', 'Pokhara', 28.2096, 83.9856, 3000, 4),
('Biratnagar', 'Biratnagar', 26.4525, 87.2718, 2500, 5),
('Birgunj', 'Birgunj', 27.0104, 84.8821, 2000, 6),
('Chitwan', 'Bharatpur (Chitwan)', 27.6833, 84.4333, 2000, 7),
('Butwal', 'Butwal', 27.7006, 83.4483, 1500, 8);

-- ============================================
-- View: Homepage Analytics (aggregated data)
-- ============================================

CREATE OR REPLACE VIEW v_homepage_analytics AS
SELECT 
    -- KPIs
    (SELECT COUNT(*) FROM donor_profiles WHERE verification_status = 'verified') as total_donors,
    (SELECT COUNT(*) FROM donation_records WHERE status = 'completed') as total_donations,
    (SELECT COALESCE(SUM(volume_ml), 0)::DECIMAL / 1000 FROM donation_records WHERE status = 'completed') as total_liters,
    (SELECT COALESCE(SUM(lives_saved), 0) FROM donor_profiles) as total_lives_saved,
    (SELECT COUNT(*) FROM emergency_requests WHERE status IN ('pending', 'matching')) as active_requests,
    NOW() as queried_at;

-- ============================================
-- Function: Get Top Donors for Spotlight
-- ============================================

-- Drop existing function if exists (to handle return type changes)
DROP FUNCTION IF EXISTS get_top_donors(INTEGER, BOOLEAN);
DROP FUNCTION IF EXISTS get_top_donors;

CREATE OR REPLACE FUNCTION get_top_donors(
    p_limit INTEGER DEFAULT 3,
    p_anonymize BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    id UUID,
    display_name TEXT,
    blood_type blood_type_enum,
    badge TEXT,
    total_donations INTEGER,
    liters_donated DECIMAL,
    lives_saved INTEGER,
    last_donation_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dp.user_id as id,
        CASE WHEN p_anonymize THEN 'Anonymous Hero' ELSE COALESCE(u.full_name, 'Donor') END as display_name,
        u.blood_type,
        dp.badge::TEXT,
        dp.total_donations,
        dp.liters_donated,
        dp.lives_saved,
        dp.last_donation_date
    FROM donor_profiles dp
    JOIN users u ON dp.user_id = u.id
    WHERE dp.verification_status = 'verified'
      AND u.deleted_at IS NULL
    ORDER BY dp.total_donations DESC, dp.lives_saved DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- Function: Get City Inventory Status
-- ============================================

-- Drop existing function if exists (to handle return type changes)
DROP FUNCTION IF EXISTS get_city_inventory_status(TEXT);
DROP FUNCTION IF EXISTS get_city_inventory_status;

CREATE OR REPLACE FUNCTION get_city_inventory_status(p_city TEXT DEFAULT NULL)
RETURNS TABLE (
    city TEXT,
    blood_type TEXT,
    units_available INTEGER,
    total_capacity INTEGER,
    fill_percentage DECIMAL,
    status TEXT,
    blood_bank_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bb.city,
        bi.blood_type::TEXT,
        SUM(bi.units_available)::INTEGER as units_available,
        SUM(bi.total_capacity)::INTEGER as total_capacity,
        ROUND((SUM(bi.units_available)::DECIMAL / NULLIF(SUM(bi.total_capacity), 0)) * 100, 1) as fill_percentage,
        CASE 
            WHEN SUM(bi.units_available)::DECIMAL / NULLIF(SUM(bi.total_capacity), 0) < 0.20 THEN 'Critical'
            WHEN SUM(bi.units_available)::DECIMAL / NULLIF(SUM(bi.total_capacity), 0) < 0.50 THEN 'Low'
            ELSE 'Stable'
        END as status,
        COUNT(DISTINCT bb.id) as blood_bank_count
    FROM blood_inventory bi
    JOIN blood_banks bb ON bi.blood_bank_id = bb.id
    WHERE bb.is_active = TRUE
      AND (p_city IS NULL OR bb.city = p_city)
    GROUP BY bb.city, bi.blood_type
    ORDER BY bb.city, bi.blood_type;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- Function: Get Cities Needing Donors
-- ============================================

-- Drop existing function if exists (to handle return type changes)
DROP FUNCTION IF EXISTS get_cities_needing_donors(INTEGER);
DROP FUNCTION IF EXISTS get_cities_needing_donors;

CREATE OR REPLACE FUNCTION get_cities_needing_donors(p_limit INTEGER DEFAULT 5)
RETURNS TABLE (
    city TEXT,
    current_donors BIGINT,
    target_donors INTEGER,
    deficit_percentage DECIMAL,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cds.city_name as city,
        COALESCE(mv.total_donors, 0) as current_donors,
        cds.target_donors,
        ROUND(((cds.target_donors - COALESCE(mv.total_donors, 0))::DECIMAL / NULLIF(cds.target_donors, 0)) * 100, 0) as deficit_percentage,
        CASE 
            WHEN COALESCE(mv.total_donors, 0)::DECIMAL / NULLIF(cds.target_donors, 0) < 0.30 THEN 'Critical'
            WHEN COALESCE(mv.total_donors, 0)::DECIMAL / NULLIF(cds.target_donors, 0) < 0.60 THEN 'Low'
            ELSE 'Stable'
        END as status
    FROM city_display_settings cds
    LEFT JOIN mv_city_donor_stats mv ON cds.city_name = mv.city
    WHERE cds.is_visible = TRUE
    ORDER BY deficit_percentage DESC NULLS LAST
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;
