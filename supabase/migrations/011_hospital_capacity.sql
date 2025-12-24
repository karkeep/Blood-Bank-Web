-- ============================================
-- Migration 011: Emergency Room Capacity & Availability
-- ============================================
-- Extends hospitals table for real-time ER/ICU/Ventilator tracking

-- ============================================
-- PART 1: Extend hospitals table with capacity columns
-- ============================================

-- Emergency room capacity
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS emergency_beds INTEGER DEFAULT 0;
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS emergency_beds_available INTEGER DEFAULT 0;

-- Ventilator capacity
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS ventilators_total INTEGER DEFAULT 0;
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS ventilators_available INTEGER DEFAULT 0;

-- ICU availability (total already exists, add available)
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS icu_beds_available INTEGER DEFAULT 0;

-- General beds available
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS beds_available INTEGER DEFAULT 0;

-- Operating theater
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS operating_theaters INTEGER DEFAULT 0;
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS operating_theaters_available INTEGER DEFAULT 0;

-- Ambulance
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS ambulances_total INTEGER DEFAULT 0;
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS ambulances_available INTEGER DEFAULT 0;

-- Oxygen supply
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS has_oxygen_plant BOOLEAN DEFAULT FALSE;
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS oxygen_cylinders_available INTEGER DEFAULT 0;

-- Specialty departments (JSONB for flexibility)
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS departments JSONB DEFAULT '[]'::JSONB;
-- Example: ["Emergency", "Cardiology", "Neurology", "Pediatrics", "Trauma"]

-- Services offered
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS services JSONB DEFAULT '[]'::JSONB;
-- Example: ["X-Ray", "MRI", "CT Scan", "Blood Bank", "Dialysis"]

-- Real-time status
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS last_capacity_update TIMESTAMPTZ;
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS capacity_updated_by UUID REFERENCES users(id);
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS accepts_emergencies BOOLEAN DEFAULT TRUE;
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS current_wait_time_mins INTEGER DEFAULT 0;
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS emergency_status TEXT DEFAULT 'normal' 
    CHECK (emergency_status IN ('normal', 'busy', 'critical', 'full', 'not_accepting'));

-- Hospital image
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Rating
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0 CHECK (average_rating BETWEEN 0 AND 5);
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- Indexes for capacity queries
CREATE INDEX IF NOT EXISTS idx_hospitals_emergency_available ON hospitals(emergency_beds_available) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_hospitals_icu_available ON hospitals(icu_beds_available) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_hospitals_ventilators ON hospitals(ventilators_available) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_hospitals_status ON hospitals(emergency_status, accepts_emergencies);

-- ============================================
-- PART 2: Hospital Capacity History (for ML trends)
-- ============================================

CREATE TABLE IF NOT EXISTS hospital_capacity_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE NOT NULL,
    
    -- Snapshot of capacity at this time
    recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Beds
    total_beds INTEGER,
    beds_available INTEGER,
    occupancy_rate DECIMAL(5,2), -- percentage
    
    -- Emergency
    emergency_beds INTEGER,
    emergency_beds_available INTEGER,
    emergency_occupancy_rate DECIMAL(5,2),
    
    -- ICU
    icu_beds INTEGER,
    icu_beds_available INTEGER,
    icu_occupancy_rate DECIMAL(5,2),
    
    -- Ventilators
    ventilators_total INTEGER,
    ventilators_available INTEGER,
    ventilator_usage_rate DECIMAL(5,2),
    
    -- Status
    emergency_status TEXT,
    current_wait_time_mins INTEGER,
    
    -- Time features for ML
    hour_of_day INTEGER,
    day_of_week INTEGER,
    is_weekend BOOLEAN,
    is_holiday BOOLEAN DEFAULT FALSE,
    
    -- Recorded by
    recorded_by UUID REFERENCES users(id)
);

CREATE INDEX idx_hch_hospital ON hospital_capacity_history(hospital_id, recorded_at DESC);
CREATE INDEX idx_hch_time ON hospital_capacity_history(recorded_at DESC);
CREATE INDEX idx_hch_ml ON hospital_capacity_history(hospital_id, hour_of_day, day_of_week);

-- ============================================
-- PART 3: Hospital Analytics (ML-ready)
-- ============================================

CREATE TABLE IF NOT EXISTS hospital_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Capacity patterns (by hour of day)
    avg_occupancy_by_hour JSONB DEFAULT '{}'::JSONB, -- {0: 0.65, 1: 0.60, ...}
    avg_emergency_wait_by_hour JSONB DEFAULT '{}'::JSONB,
    
    -- Day of week patterns
    avg_occupancy_by_day JSONB DEFAULT '{}'::JSONB, -- {Mon: 0.75, Tue: 0.80, ...}
    peak_days INTEGER[], -- Days with highest occupancy
    
    -- Predictions (ML-computed)
    predicted_occupancy_next_hour DECIMAL(5,2),
    predicted_wait_time_mins INTEGER,
    predicted_status TEXT,
    
    -- Performance metrics
    avg_response_time_mins INTEGER,
    avg_patient_rating DECIMAL(3,2),
    emergency_success_rate DECIMAL(5,4),
    
    -- Last 7 days stats
    avg_daily_emergencies INTEGER,
    avg_daily_admissions INTEGER,
    
    -- Timestamps
    last_computed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_ha_hospital ON hospital_analytics(hospital_id);

-- ============================================
-- PART 4: User Hospital Searches (for recommendations)
-- ============================================

CREATE TABLE IF NOT EXISTS hospital_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User (optional for anonymous)
    user_id UUID REFERENCES users(id),
    session_id TEXT, -- For anonymous tracking
    
    -- Search parameters
    search_latitude DECIMAL(10,8),
    search_longitude DECIMAL(11,8),
    search_radius_km INTEGER,
    search_type TEXT, -- 'emergency', 'icu', 'ventilator', 'general'
    
    -- Results
    results_count INTEGER,
    hospitals_shown UUID[], -- Array of hospital IDs shown
    
    -- User interaction
    hospital_clicked UUID REFERENCES hospitals(id),
    clicked_at TIMESTAMPTZ,
    called_hospital BOOLEAN DEFAULT FALSE,
    got_directions BOOLEAN DEFAULT FALSE,
    
    -- Device info (for ML)
    device_type TEXT, -- 'mobile', 'desktop', 'tablet'
    platform TEXT, -- 'web', 'ios', 'android'
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_hs_user ON hospital_searches(user_id);
CREATE INDEX idx_hs_location ON hospital_searches(search_latitude, search_longitude);
CREATE INDEX idx_hs_time ON hospital_searches(created_at DESC);
CREATE INDEX idx_hs_type ON hospital_searches(search_type);

-- ============================================
-- PART 5: Find Nearby Hospitals Function
-- ============================================

CREATE OR REPLACE FUNCTION find_nearby_hospitals(
    p_latitude DECIMAL,
    p_longitude DECIMAL,
    p_radius_km INTEGER DEFAULT 25,
    p_type TEXT DEFAULT 'all', -- 'all', 'emergency', 'icu', 'ventilator'
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    address TEXT,
    city TEXT,
    phone TEXT,
    emergency_phone TEXT,
    distance_km DECIMAL,
    -- Capacity
    emergency_beds_available INTEGER,
    icu_beds_available INTEGER,
    ventilators_available INTEGER,
    beds_available INTEGER,
    -- Status
    emergency_status TEXT,
    current_wait_time_mins INTEGER,
    accepts_emergencies BOOLEAN,
    is_24_hours BOOLEAN,
    -- Rating
    average_rating DECIMAL,
    -- Location
    latitude DECIMAL,
    longitude DECIMAL,
    image_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        h.name,
        h.address,
        h.city,
        h.phone,
        h.emergency_phone,
        ROUND(
            (6371 * acos(
                LEAST(1.0, GREATEST(-1.0,
                    cos(radians(p_latitude)) * cos(radians(h.latitude)) *
                    cos(radians(h.longitude) - radians(p_longitude)) +
                    sin(radians(p_latitude)) * sin(radians(h.latitude))
                ))
            ))::DECIMAL, 2
        ) AS distance_km,
        h.emergency_beds_available,
        h.icu_beds_available,
        h.ventilators_available,
        h.beds_available,
        h.emergency_status,
        h.current_wait_time_mins,
        h.accepts_emergencies,
        h.is_24_hours,
        h.average_rating,
        h.latitude,
        h.longitude,
        h.image_url
    FROM hospitals h
    WHERE 
        h.is_active = TRUE
        AND h.latitude IS NOT NULL
        AND h.longitude IS NOT NULL
        AND (
            6371 * acos(
                LEAST(1.0, GREATEST(-1.0,
                    cos(radians(p_latitude)) * cos(radians(h.latitude)) *
                    cos(radians(h.longitude) - radians(p_longitude)) +
                    sin(radians(p_latitude)) * sin(radians(h.latitude))
                ))
            )
        ) <= p_radius_km
        AND (
            p_type = 'all'
            OR (p_type = 'emergency' AND h.emergency_beds_available > 0)
            OR (p_type = 'icu' AND h.icu_beds_available > 0)
            OR (p_type = 'ventilator' AND h.ventilators_available > 0)
        )
    ORDER BY 
        CASE h.emergency_status
            WHEN 'normal' THEN 1
            WHEN 'busy' THEN 2
            WHEN 'critical' THEN 3
            ELSE 4
        END,
        distance_km ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- PART 6: RLS Policies
-- ============================================

ALTER TABLE hospital_capacity_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_searches ENABLE ROW LEVEL SECURITY;

-- Capacity history: Public read, admin/org write
CREATE POLICY hch_select ON hospital_capacity_history FOR SELECT USING (TRUE);
CREATE POLICY hch_insert ON hospital_capacity_history FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid()::UUID AND role IN ('admin', 'superadmin', 'moderator'))
);

-- Analytics: Public read
CREATE POLICY ha_select ON hospital_analytics FOR SELECT USING (TRUE);

-- Searches: User can see own, admins see all
CREATE POLICY hs_select ON hospital_searches FOR SELECT USING (
    user_id = auth.uid()::UUID
    OR user_id IS NULL
    OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid()::UUID AND role IN ('admin', 'superadmin'))
);
CREATE POLICY hs_insert ON hospital_searches FOR INSERT WITH CHECK (TRUE);

-- ============================================
-- PART 7: Triggers
-- ============================================

CREATE TRIGGER trg_hch_recorded_at
    BEFORE INSERT ON hospital_capacity_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_ha_updated_at
    BEFORE UPDATE ON hospital_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Auto-record capacity history when hospital capacity changes
CREATE OR REPLACE FUNCTION record_capacity_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.emergency_beds_available != NEW.emergency_beds_available OR
        OLD.icu_beds_available != NEW.icu_beds_available OR
        OLD.ventilators_available != NEW.ventilators_available OR
        OLD.beds_available != NEW.beds_available OR
        OLD.emergency_status != NEW.emergency_status) THEN
        
        INSERT INTO hospital_capacity_history (
            hospital_id,
            total_beds, beds_available, occupancy_rate,
            emergency_beds, emergency_beds_available, emergency_occupancy_rate,
            icu_beds, icu_beds_available, icu_occupancy_rate,
            ventilators_total, ventilators_available, ventilator_usage_rate,
            emergency_status, current_wait_time_mins,
            hour_of_day, day_of_week, is_weekend
        ) VALUES (
            NEW.id,
            NEW.total_beds, NEW.beds_available, 
            CASE WHEN NEW.total_beds > 0 THEN ((NEW.total_beds - NEW.beds_available)::DECIMAL / NEW.total_beds * 100) ELSE 0 END,
            NEW.emergency_beds, NEW.emergency_beds_available,
            CASE WHEN NEW.emergency_beds > 0 THEN ((NEW.emergency_beds - NEW.emergency_beds_available)::DECIMAL / NEW.emergency_beds * 100) ELSE 0 END,
            NEW.icu_beds, NEW.icu_beds_available,
            CASE WHEN NEW.icu_beds > 0 THEN ((NEW.icu_beds - NEW.icu_beds_available)::DECIMAL / NEW.icu_beds * 100) ELSE 0 END,
            NEW.ventilators_total, NEW.ventilators_available,
            CASE WHEN NEW.ventilators_total > 0 THEN ((NEW.ventilators_total - NEW.ventilators_available)::DECIMAL / NEW.ventilators_total * 100) ELSE 0 END,
            NEW.emergency_status, NEW.current_wait_time_mins,
            EXTRACT(HOUR FROM NOW())::INTEGER,
            EXTRACT(DOW FROM NOW())::INTEGER,
            EXTRACT(DOW FROM NOW()) IN (0, 6)
        );
        
        NEW.last_capacity_update = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_record_hospital_capacity
    BEFORE UPDATE ON hospitals
    FOR EACH ROW
    EXECUTE FUNCTION record_capacity_change();

-- ============================================
-- PART 8: Insert Sample Hospitals (Nepal)
-- ============================================

INSERT INTO hospitals (
    name, address, city, state, country, latitude, longitude,
    phone, emergency_phone, is_24_hours, is_verified, is_active,
    total_beds, icu_beds, blood_bank_available,
    emergency_beds, emergency_beds_available, icu_beds_available,
    ventilators_total, ventilators_available, beds_available,
    emergency_status, current_wait_time_mins, average_rating
) VALUES 
    ('Bir Hospital', 'Mahaboudha, Kathmandu', 'Kathmandu', 'Bagmati', 'Nepal', 27.7033, 85.3167, '01-4221119', '01-4221988', TRUE, TRUE, TRUE, 450, 25, TRUE, 30, 12, 8, 15, 6, 85, 'normal', 15, 4.2),
    ('Teaching Hospital (TUTH)', 'Maharajgunj, Kathmandu', 'Kathmandu', 'Bagmati', 'Nepal', 27.7372, 85.3308, '01-4412303', '01-4412505', TRUE, TRUE, TRUE, 600, 40, TRUE, 45, 18, 15, 25, 12, 120, 'busy', 25, 4.5),
    ('Patan Hospital', 'Lagankhel, Lalitpur', 'Lalitpur', 'Bagmati', 'Nepal', 27.6683, 85.3264, '01-5522295', '01-5522266', TRUE, TRUE, TRUE, 350, 20, TRUE, 25, 8, 5, 12, 4, 65, 'normal', 20, 4.4),
    ('Grande International Hospital', 'Dhapasi, Kathmandu', 'Kathmandu', 'Bagmati', 'Nepal', 27.7419, 85.3506, '01-5159266', '01-5159277', TRUE, TRUE, TRUE, 200, 30, TRUE, 20, 10, 12, 20, 10, 45, 'normal', 10, 4.7),
    ('Norvic International Hospital', 'Thapathali, Kathmandu', 'Kathmandu', 'Bagmati', 'Nepal', 27.6947, 85.3197, '01-4258554', '01-4258555', TRUE, TRUE, TRUE, 180, 25, TRUE, 18, 7, 10, 18, 8, 40, 'busy', 30, 4.6),
    ('Nepal Medical College', 'Jorpati, Kathmandu', 'Kathmandu', 'Bagmati', 'Nepal', 27.7356, 85.3856, '01-4911008', '01-4911000', TRUE, TRUE, TRUE, 250, 18, TRUE, 20, 6, 6, 10, 4, 55, 'normal', 15, 4.3),
    ('B&B Hospital', 'Gwarko, Lalitpur', 'Lalitpur', 'Bagmati', 'Nepal', 27.6678, 85.3383, '01-5533206', '01-5533200', TRUE, TRUE, TRUE, 200, 22, TRUE, 15, 5, 8, 12, 6, 50, 'normal', 12, 4.4),
    ('Civil Hospital', 'New Baneshwor, Kathmandu', 'Kathmandu', 'Bagmati', 'Nepal', 27.6917, 85.3453, '01-4780069', '01-4780000', TRUE, TRUE, TRUE, 100, 10, FALSE, 12, 4, 3, 6, 2, 25, 'busy', 35, 4.0),
    ('National Trauma Center', 'Mahankal, Kathmandu', 'Kathmandu', 'Bagmati', 'Nepal', 27.7122, 85.3136, '01-4499000', '01-4499111', TRUE, TRUE, TRUE, 150, 30, TRUE, 35, 15, 12, 20, 10, 35, 'normal', 8, 4.5),
    ('Bhaktapur Hospital', 'Bhaktapur', 'Bhaktapur', 'Bagmati', 'Nepal', 27.6711, 85.4297, '01-6610798', '01-6610700', TRUE, TRUE, TRUE, 200, 12, TRUE, 15, 6, 4, 8, 3, 45, 'normal', 18, 4.1)
ON CONFLICT DO NOTHING;
