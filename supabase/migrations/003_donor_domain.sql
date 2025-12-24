-- ============================================
-- Migration 003: Donor Domain
-- ============================================
-- Donor profiles, availability, achievements, and health records

-- ============================================
-- Table: donor_profiles
-- ============================================
CREATE TABLE donor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Availability status
    status availability_status_enum DEFAULT 'available' NOT NULL,
    
    -- Donation statistics
    total_donations INTEGER DEFAULT 0 NOT NULL CHECK (total_donations >= 0),
    liters_donated DECIMAL(8,3) DEFAULT 0 NOT NULL CHECK (liters_donated >= 0),
    lives_saved INTEGER DEFAULT 0 NOT NULL CHECK (lives_saved >= 0),
    donation_streak INTEGER DEFAULT 0 NOT NULL CHECK (donation_streak >= 0),
    
    -- Eligibility
    last_donation_date DATE,
    next_eligible_date DATE,
    eligibility_status eligibility_enum DEFAULT 'unknown' NOT NULL,
    
    -- Location for nearby search
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'Nepal',
    
    -- Travel preferences
    travel_radius_km INTEGER DEFAULT 25 CHECK (travel_radius_km > 0),
    transportation_needed BOOLEAN DEFAULT FALSE,
    
    -- Emergency availability
    emergency_available BOOLEAN DEFAULT TRUE,
    emergency_contact_time TEXT DEFAULT 'within_1_hour',
    
    -- Verification
    verification_status verification_enum DEFAULT 'unverified' NOT NULL,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    
    -- Gamification
    badge badge_enum DEFAULT 'newcomer' NOT NULL,
    points INTEGER DEFAULT 0 CHECK (points >= 0),
    
    -- Profile settings
    is_visible BOOLEAN DEFAULT TRUE,
    show_contact_info BOOLEAN DEFAULT FALSE,
    profile_description TEXT,
    preferred_donation_centers UUID[],
    language_preferences TEXT[] DEFAULT ARRAY['en', 'ne'],
    
    -- ML Features (pre-computed for performance)
    reliability_score DECIMAL(5,4) DEFAULT 0.5 CHECK (reliability_score BETWEEN 0 AND 1),
    response_rate DECIMAL(5,4) DEFAULT 0.5 CHECK (response_rate BETWEEN 0 AND 1),
    avg_response_time_mins INTEGER,
    predicted_next_donation DATE,
    churn_risk_score DECIMAL(5,4) DEFAULT 0.5 CHECK (churn_risk_score BETWEEN 0 AND 1),
    lifetime_value_score DECIMAL(10,2) DEFAULT 0,
    
    -- Ratings
    average_rating DECIMAL(3,2) DEFAULT 5.0 CHECK (average_rating BETWEEN 1 AND 5),
    total_reviews INTEGER DEFAULT 0 CHECK (total_reviews >= 0),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for donor_profiles
CREATE INDEX idx_donor_profiles_user_id ON donor_profiles(user_id);
CREATE INDEX idx_donor_profiles_status ON donor_profiles(status);
CREATE INDEX idx_donor_profiles_location ON donor_profiles(latitude, longitude);
CREATE INDEX idx_donor_profiles_badge ON donor_profiles(badge);
CREATE INDEX idx_donor_profiles_eligible ON donor_profiles(next_eligible_date) 
    WHERE status = 'available' AND eligibility_status = 'eligible';
CREATE INDEX idx_donor_profiles_ml_scores ON donor_profiles(reliability_score DESC, response_rate DESC);
CREATE INDEX idx_donor_profiles_city ON donor_profiles(city);

-- ============================================
-- Table: donor_availability
-- ============================================
-- Weekly availability schedule for donors
CREATE TABLE donor_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_profile_id UUID REFERENCES donor_profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Schedule
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    
    -- Recurrence
    is_recurring BOOLEAN DEFAULT TRUE,
    valid_from DATE DEFAULT CURRENT_DATE,
    valid_until DATE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    UNIQUE(donor_profile_id, day_of_week, start_time, end_time)
);

-- Index for availability queries
CREATE INDEX idx_donor_availability_profile ON donor_availability(donor_profile_id);
CREATE INDEX idx_donor_availability_day ON donor_availability(day_of_week, is_available);

-- ============================================
-- Table: donor_achievements
-- ============================================
CREATE TABLE donor_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_profile_id UUID REFERENCES donor_profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Achievement details
    achievement_code TEXT NOT NULL,
    achievement_title TEXT NOT NULL,
    achievement_description TEXT,
    achievement_icon TEXT,
    
    -- Points
    points_awarded INTEGER DEFAULT 0,
    
    -- Progress (for progressive achievements)
    current_progress INTEGER DEFAULT 0,
    target_progress INTEGER,
    is_completed BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    earned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Unique achievement per donor
    UNIQUE(donor_profile_id, achievement_code)
);

-- Index for achievements
CREATE INDEX idx_donor_achievements_profile ON donor_achievements(donor_profile_id);
CREATE INDEX idx_donor_achievements_completed ON donor_achievements(donor_profile_id, is_completed);

-- ============================================
-- Table: donor_health_records
-- ============================================
CREATE TABLE donor_health_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_profile_id UUID REFERENCES donor_profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Medical information
    weight_kg DECIMAL(5,2),
    height_cm DECIMAL(5,2),
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    hemoglobin_level DECIMAL(4,2),
    
    -- Medical history (JSONB for flexibility)
    medical_conditions TEXT[],
    medications TEXT[],
    allergies TEXT[],
    recent_surgeries JSONB DEFAULT '[]'::JSONB,
    
    -- Last checkup
    last_checkup_date DATE,
    checkup_status verification_enum DEFAULT 'unverified',
    checkup_expiry_date DATE,
    doctor_notes TEXT,
    
    -- Deferral information
    is_deferred BOOLEAN DEFAULT FALSE,
    deferral_reason TEXT,
    deferral_until DATE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for health records
CREATE INDEX idx_donor_health_records_profile ON donor_health_records(donor_profile_id);
CREATE INDEX idx_donor_health_records_deferred ON donor_health_records(donor_profile_id) WHERE is_deferred = TRUE;

-- ============================================
-- RLS Policies for Donor Domain
-- ============================================

ALTER TABLE donor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_health_records ENABLE ROW LEVEL SECURITY;

-- Donor profiles: Public read for verified, owner full access
CREATE POLICY donor_profiles_select ON donor_profiles
    FOR SELECT USING (
        is_visible = TRUE AND verification_status = 'verified'
        OR user_id = auth.uid()::UUID
        OR EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin', 'moderator')
        )
    );

CREATE POLICY donor_profiles_insert ON donor_profiles
    FOR INSERT WITH CHECK (user_id = auth.uid()::UUID);

CREATE POLICY donor_profiles_update ON donor_profiles
    FOR UPDATE USING (
        user_id = auth.uid()::UUID
        OR EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin', 'moderator')
        )
    );

-- Donor availability: Owner access + admins
CREATE POLICY donor_availability_own ON donor_availability
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM donor_profiles dp 
            WHERE dp.id = donor_profile_id AND dp.user_id = auth.uid()::UUID
        )
        OR EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin')
        )
    );

-- Donor achievements: Public read, system write
CREATE POLICY donor_achievements_select ON donor_achievements
    FOR SELECT USING (TRUE);

CREATE POLICY donor_achievements_insert ON donor_achievements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM donor_profiles dp 
            WHERE dp.id = donor_profile_id AND dp.user_id = auth.uid()::UUID
        )
        OR EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin')
        )
    );

-- Donor health records: Owner + medical staff only
CREATE POLICY donor_health_records_own ON donor_health_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM donor_profiles dp 
            WHERE dp.id = donor_profile_id AND dp.user_id = auth.uid()::UUID
        )
        OR EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin')
        )
    );

-- ============================================
-- Triggers for Donor Domain
-- ============================================

CREATE TRIGGER trg_donor_profiles_updated_at
    BEFORE UPDATE ON donor_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_donor_availability_updated_at
    BEFORE UPDATE ON donor_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_donor_health_records_updated_at
    BEFORE UPDATE ON donor_health_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update badge based on total donations
CREATE OR REPLACE FUNCTION update_donor_badge()
RETURNS TRIGGER AS $$
BEGIN
    NEW.badge = CASE
        WHEN NEW.total_donations >= 100 THEN 'legend'
        WHEN NEW.total_donations >= 50 THEN 'diamond'
        WHEN NEW.total_donations >= 25 THEN 'platinum'
        WHEN NEW.total_donations >= 10 THEN 'gold'
        WHEN NEW.total_donations >= 5 THEN 'silver'
        WHEN NEW.total_donations >= 1 THEN 'bronze'
        ELSE 'newcomer'
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_donor_badge
    BEFORE UPDATE OF total_donations ON donor_profiles
    FOR EACH ROW EXECUTE FUNCTION update_donor_badge();

-- ============================================
-- Helper Functions for Donor Domain
-- ============================================

-- Find nearby available donors by blood type
CREATE OR REPLACE FUNCTION find_nearby_donors(
    p_blood_type blood_type_enum,
    p_latitude DECIMAL,
    p_longitude DECIMAL,
    p_radius_km INTEGER DEFAULT 25,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    blood_type blood_type_enum,
    distance_km DECIMAL,
    reliability_score DECIMAL,
    is_available BOOLEAN,
    last_donation_date DATE,
    badge badge_enum,
    phone TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id AS user_id,
        u.full_name,
        u.blood_type,
        ROUND(
            (6371 * acos(
                cos(radians(p_latitude)) * cos(radians(dp.latitude)) *
                cos(radians(dp.longitude) - radians(p_longitude)) +
                sin(radians(p_latitude)) * sin(radians(dp.latitude))
            ))::DECIMAL, 2
        ) AS distance_km,
        dp.reliability_score,
        (dp.status = 'available') AS is_available,
        dp.last_donation_date,
        dp.badge,
        u.phone
    FROM users u
    JOIN donor_profiles dp ON u.id = dp.user_id
    WHERE 
        u.blood_type = p_blood_type
        AND dp.eligibility_status = 'eligible'
        AND dp.verification_status = 'verified'
        AND dp.status = 'available'
        AND u.deleted_at IS NULL
        AND dp.latitude IS NOT NULL
        AND dp.longitude IS NOT NULL
        AND (
            6371 * acos(
                cos(radians(p_latitude)) * cos(radians(dp.latitude)) *
                cos(radians(dp.longitude) - radians(p_longitude)) +
                sin(radians(p_latitude)) * sin(radians(dp.latitude))
            )
        ) <= p_radius_km
    ORDER BY 
        dp.reliability_score DESC, 
        distance_km ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get compatible blood types for a recipient
CREATE OR REPLACE FUNCTION get_compatible_blood_types(p_recipient_type blood_type_enum)
RETURNS blood_type_enum[] AS $$
BEGIN
    RETURN CASE p_recipient_type
        WHEN 'AB+' THEN ARRAY['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']::blood_type_enum[]
        WHEN 'AB-' THEN ARRAY['A-', 'B-', 'AB-', 'O-']::blood_type_enum[]
        WHEN 'A+' THEN ARRAY['A+', 'A-', 'O+', 'O-']::blood_type_enum[]
        WHEN 'A-' THEN ARRAY['A-', 'O-']::blood_type_enum[]
        WHEN 'B+' THEN ARRAY['B+', 'B-', 'O+', 'O-']::blood_type_enum[]
        WHEN 'B-' THEN ARRAY['B-', 'O-']::blood_type_enum[]
        WHEN 'O+' THEN ARRAY['O+', 'O-']::blood_type_enum[]
        WHEN 'O-' THEN ARRAY['O-']::blood_type_enum[]
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Calculate days until eligible to donate
CREATE OR REPLACE FUNCTION days_until_eligible(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_next_eligible DATE;
BEGIN
    SELECT next_eligible_date INTO v_next_eligible
    FROM donor_profiles
    WHERE user_id = p_user_id;
    
    IF v_next_eligible IS NULL THEN
        RETURN 0;
    END IF;
    
    RETURN GREATEST(0, (v_next_eligible - CURRENT_DATE)::INTEGER);
END;
$$ LANGUAGE plpgsql STABLE;
