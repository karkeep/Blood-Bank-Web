-- ============================================
-- Migration 004: Requests Domain
-- ============================================
-- Emergency requests, hospitals, matching, and fulfillment tracking

-- ============================================
-- Table: hospitals
-- ============================================
CREATE TABLE hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic information
    name TEXT NOT NULL,
    registration_number TEXT UNIQUE,
    type location_type_enum DEFAULT 'hospital' NOT NULL,
    
    -- Location
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT DEFAULT 'Nepal',
    zip_code TEXT,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    
    -- Contact
    phone TEXT,
    emergency_phone TEXT,
    email TEXT,
    website TEXT,
    
    -- Operating hours (JSONB for flexibility)
    operating_hours JSONB DEFAULT '{}'::JSONB,
    is_24_hours BOOLEAN DEFAULT FALSE,
    
    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    
    -- Capacity
    blood_bank_available BOOLEAN DEFAULT FALSE,
    total_beds INTEGER,
    icu_beds INTEGER,
    
    -- Statistics
    total_requests INTEGER DEFAULT 0,
    fulfilled_requests INTEGER DEFAULT 0,
    avg_fulfillment_time_mins INTEGER,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for hospitals
CREATE INDEX idx_hospitals_city ON hospitals(city);
CREATE INDEX idx_hospitals_location ON hospitals(latitude, longitude);
CREATE INDEX idx_hospitals_active ON hospitals(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_hospitals_verified ON hospitals(is_verified) WHERE is_verified = TRUE;

-- ============================================
-- Table: emergency_requests
-- ============================================
CREATE TABLE emergency_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Requester
    requester_id UUID REFERENCES users(id) NOT NULL,
    hospital_id UUID REFERENCES hospitals(id),
    
    -- Patient information
    patient_name TEXT NOT NULL,
    patient_age INTEGER CHECK (patient_age > 0 AND patient_age < 150),
    patient_gender gender_enum,
    blood_type blood_type_enum NOT NULL,
    units_needed INTEGER NOT NULL CHECK (units_needed > 0 AND units_needed <= 20),
    blood_components blood_component_enum DEFAULT 'whole_blood',
    
    -- Request details
    urgency urgency_enum NOT NULL DEFAULT 'normal',
    request_reason TEXT NOT NULL,
    medical_condition TEXT,
    special_requirements TEXT[],
    notes TEXT,
    
    -- Priority (computed)
    priority_score INTEGER GENERATED ALWAYS AS (
        CASE urgency 
            WHEN 'life_threatening' THEN 100
            WHEN 'critical' THEN 75
            WHEN 'urgent' THEN 50
            ELSE 25
        END
    ) STORED,
    
    -- Location (hospital or custom)
    hospital_name TEXT NOT NULL,
    hospital_address TEXT NOT NULL,
    hospital_city TEXT NOT NULL,
    hospital_state TEXT NOT NULL,
    hospital_country TEXT DEFAULT 'Nepal',
    hospital_zip_code TEXT,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    hospital_phone TEXT,
    
    -- Contact information
    contact_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_email TEXT,
    contact_relation TEXT NOT NULL,
    alternate_contact JSONB, -- { name, phone, relation }
    
    -- Status workflow
    status request_status_enum DEFAULT 'pending' NOT NULL,
    matched_donors_count INTEGER DEFAULT 0,
    interested_donors_count INTEGER DEFAULT 0,
    confirmed_donors_count INTEGER DEFAULT 0,
    fulfilled_units INTEGER DEFAULT 0,
    
    -- Timeline
    needed_by TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    fulfilled_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    
    -- Notification tracking
    last_notification_sent TIMESTAMPTZ,
    notification_count INTEGER DEFAULT 0,
    
    -- Verification
    is_hospital_verified BOOLEAN DEFAULT FALSE,
    is_request_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_deadline CHECK (expires_at > created_at)
);

-- Indexes for emergency_requests
CREATE INDEX idx_emergency_requests_requester ON emergency_requests(requester_id);
CREATE INDEX idx_emergency_requests_hospital ON emergency_requests(hospital_id);
CREATE INDEX idx_emergency_requests_blood_type ON emergency_requests(blood_type);
CREATE INDEX idx_emergency_requests_urgency ON emergency_requests(urgency);
CREATE INDEX idx_emergency_requests_status ON emergency_requests(status);
CREATE INDEX idx_emergency_requests_location ON emergency_requests(latitude, longitude);
CREATE INDEX idx_emergency_requests_city ON emergency_requests(hospital_city);
-- Note: Cannot use NOW() in partial index as it's not IMMUTABLE
-- Instead, filter by status only and check expires_at at query time
CREATE INDEX idx_emergency_requests_active ON emergency_requests(blood_type, urgency, expires_at DESC, created_at DESC)
    WHERE status IN ('pending', 'matching');
CREATE INDEX idx_emergency_requests_priority ON emergency_requests(priority_score DESC, created_at DESC)
    WHERE status IN ('pending', 'matching');

-- ============================================
-- Table: request_matches
-- ============================================
-- Links donors to emergency requests
CREATE TABLE request_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES emergency_requests(id) ON DELETE CASCADE NOT NULL,
    donor_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    
    -- Match quality
    match_score DECIMAL(5,4) DEFAULT 0.5, -- 0-1 ML-computed match quality
    distance_km DECIMAL(6,2),
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'notified', 'interested', 'confirmed', 
        'in_transit', 'arrived', 'donated', 'cancelled', 'expired'
    )),
    
    -- Response tracking
    notified_at TIMESTAMPTZ,
    responded_at TIMESTAMPTZ,
    response_time_mins INTEGER,
    
    -- Donor response
    is_interested BOOLEAN,
    decline_reason TEXT,
    
    -- Scheduling
    scheduled_time TIMESTAMPTZ,
    
    -- Completion
    completed_at TIMESTAMPTZ,
    units_donated INTEGER,
    
    -- Notes
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Unique constraint: one match per donor per request
    UNIQUE(request_id, donor_id)
);

-- Indexes for request_matches
CREATE INDEX idx_request_matches_request ON request_matches(request_id);
CREATE INDEX idx_request_matches_donor ON request_matches(donor_id);
CREATE INDEX idx_request_matches_status ON request_matches(status);
CREATE INDEX idx_request_matches_pending ON request_matches(donor_id, status)
    WHERE status IN ('pending', 'notified', 'interested', 'confirmed');

-- ============================================
-- Table: request_activities
-- ============================================
-- Activity log for request lifecycle
CREATE TABLE request_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES emergency_requests(id) ON DELETE CASCADE NOT NULL,
    
    -- Activity
    activity_type TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Actor
    actor_id UUID REFERENCES users(id),
    actor_type TEXT, -- 'user', 'system', 'admin'
    
    -- Additional data
    metadata JSONB DEFAULT '{}'::JSONB,
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for activities
CREATE INDEX idx_request_activities_request ON request_activities(request_id, created_at DESC);

-- ============================================
-- RLS Policies for Requests Domain
-- ============================================

ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_activities ENABLE ROW LEVEL SECURITY;

-- Hospitals: Public read for verified, admin write
CREATE POLICY hospitals_select ON hospitals
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY hospitals_admin ON hospitals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin')
        )
    );

-- Emergency requests: Authenticated can read active, requester can manage own
CREATE POLICY emergency_requests_select ON emergency_requests
    FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND (
            status IN ('pending', 'matching', 'donors_found')
            OR requester_id = auth.uid()::UUID
            OR EXISTS (
                SELECT 1 FROM user_roles 
                WHERE user_id = auth.uid()::UUID 
                AND role IN ('admin', 'superadmin', 'moderator')
            )
        )
    );

CREATE POLICY emergency_requests_insert ON emergency_requests
    FOR INSERT WITH CHECK (auth.uid()::UUID = requester_id);

CREATE POLICY emergency_requests_update ON emergency_requests
    FOR UPDATE USING (
        requester_id = auth.uid()::UUID
        OR EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin', 'moderator')
        )
    );

-- Request matches: Involved parties only
CREATE POLICY request_matches_select ON request_matches
    FOR SELECT USING (
        donor_id = auth.uid()::UUID
        OR EXISTS (
            SELECT 1 FROM emergency_requests er 
            WHERE er.id = request_id AND er.requester_id = auth.uid()::UUID
        )
        OR EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin', 'moderator')
        )
    );

CREATE POLICY request_matches_update ON request_matches
    FOR UPDATE USING (
        donor_id = auth.uid()::UUID
        OR EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin', 'moderator')
        )
    );

-- Request activities: Read for involved parties
CREATE POLICY request_activities_select ON request_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM emergency_requests er 
            WHERE er.id = request_id 
            AND (er.requester_id = auth.uid()::UUID OR EXISTS (
                SELECT 1 FROM request_matches rm 
                WHERE rm.request_id = er.id AND rm.donor_id = auth.uid()::UUID
            ))
        )
        OR EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin', 'moderator')
        )
    );

-- ============================================
-- Triggers for Requests Domain
-- ============================================

CREATE TRIGGER trg_hospitals_updated_at
    BEFORE UPDATE ON hospitals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_emergency_requests_updated_at
    BEFORE UPDATE ON emergency_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_request_matches_updated_at
    BEFORE UPDATE ON request_matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update request counts when matches change
CREATE OR REPLACE FUNCTION update_request_match_counts()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE emergency_requests
    SET 
        matched_donors_count = (
            SELECT COUNT(*) FROM request_matches 
            WHERE request_id = COALESCE(NEW.request_id, OLD.request_id)
        ),
        interested_donors_count = (
            SELECT COUNT(*) FROM request_matches 
            WHERE request_id = COALESCE(NEW.request_id, OLD.request_id) 
            AND is_interested = TRUE
        ),
        confirmed_donors_count = (
            SELECT COUNT(*) FROM request_matches 
            WHERE request_id = COALESCE(NEW.request_id, OLD.request_id) 
            AND status = 'confirmed'
        ),
        fulfilled_units = (
            SELECT COALESCE(SUM(units_donated), 0) FROM request_matches 
            WHERE request_id = COALESCE(NEW.request_id, OLD.request_id) 
            AND status = 'donated'
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.request_id, OLD.request_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_request_match_counts
    AFTER INSERT OR UPDATE OR DELETE ON request_matches
    FOR EACH ROW EXECUTE FUNCTION update_request_match_counts();

-- Auto-fulfill request when all units are donated
CREATE OR REPLACE FUNCTION check_request_fulfillment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.fulfilled_units >= NEW.units_needed AND NEW.status NOT IN ('fulfilled', 'cancelled', 'expired') THEN
        NEW.status = 'fulfilled';
        NEW.fulfilled_at = NOW();
    ELSIF NEW.fulfilled_units > 0 AND NEW.fulfilled_units < NEW.units_needed AND NEW.status NOT IN ('fulfilled', 'cancelled', 'expired') THEN
        NEW.status = 'partially_fulfilled';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_request_fulfillment
    BEFORE UPDATE OF fulfilled_units ON emergency_requests
    FOR EACH ROW EXECUTE FUNCTION check_request_fulfillment();

-- Log request activities
CREATE OR REPLACE FUNCTION log_request_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO request_activities (request_id, activity_type, description, actor_id, actor_type)
        VALUES (NEW.id, 'created', 'Emergency request created', NEW.requester_id, 'user');
    ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        INSERT INTO request_activities (request_id, activity_type, description, actor_type, metadata)
        VALUES (NEW.id, 'status_changed', 'Status changed from ' || OLD.status || ' to ' || NEW.status, 'system', 
            jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_request_activity
    AFTER INSERT OR UPDATE ON emergency_requests
    FOR EACH ROW EXECUTE FUNCTION log_request_activity();

-- ============================================
-- Helper Functions for Requests Domain
-- ============================================

-- Get active requests near a location
CREATE OR REPLACE FUNCTION get_nearby_requests(
    p_latitude DECIMAL,
    p_longitude DECIMAL,
    p_radius_km INTEGER DEFAULT 50,
    p_blood_types blood_type_enum[] DEFAULT NULL,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    blood_type blood_type_enum,
    units_needed INTEGER,
    urgency urgency_enum,
    priority_score INTEGER,
    hospital_name TEXT,
    hospital_city TEXT,
    distance_km DECIMAL,
    created_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        er.id,
        er.blood_type,
        er.units_needed,
        er.urgency,
        er.priority_score,
        er.hospital_name,
        er.hospital_city,
        ROUND(
            (6371 * acos(
                cos(radians(p_latitude)) * cos(radians(er.latitude)) *
                cos(radians(er.longitude) - radians(p_longitude)) +
                sin(radians(p_latitude)) * sin(radians(er.latitude))
            ))::DECIMAL, 2
        ) AS distance_km,
        er.created_at,
        er.expires_at
    FROM emergency_requests er
    WHERE 
        er.status IN ('pending', 'matching')
        AND er.expires_at > NOW()
        AND (p_blood_types IS NULL OR er.blood_type = ANY(p_blood_types))
        AND (
            6371 * acos(
                cos(radians(p_latitude)) * cos(radians(er.latitude)) *
                cos(radians(er.longitude) - radians(p_longitude)) +
                sin(radians(p_latitude)) * sin(radians(er.latitude))
            )
        ) <= p_radius_km
    ORDER BY er.priority_score DESC, distance_km ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Calculate match score between donor and request
CREATE OR REPLACE FUNCTION calculate_match_score(
    p_donor_id UUID,
    p_request_id UUID
)
RETURNS DECIMAL AS $$
DECLARE
    v_score DECIMAL := 0.5;
    v_donor donor_profiles%ROWTYPE;
    v_request emergency_requests%ROWTYPE;
    v_distance DECIMAL;
BEGIN
    SELECT * INTO v_donor FROM donor_profiles WHERE user_id = p_donor_id;
    SELECT * INTO v_request FROM emergency_requests WHERE id = p_request_id;
    
    IF v_donor IS NULL OR v_request IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Distance factor (closer = higher score)
    v_distance := 6371 * acos(
        cos(radians(v_request.latitude)) * cos(radians(v_donor.latitude)) *
        cos(radians(v_donor.longitude) - radians(v_request.longitude)) +
        sin(radians(v_request.latitude)) * sin(radians(v_donor.latitude))
    );
    v_score := v_score + (1 - LEAST(v_distance / 50, 1)) * 0.2;
    
    -- Reliability factor
    v_score := v_score + v_donor.reliability_score * 0.2;
    
    -- Response rate factor
    v_score := v_score + v_donor.response_rate * 0.1;
    
    RETURN LEAST(v_score, 1);
END;
$$ LANGUAGE plpgsql STABLE;
