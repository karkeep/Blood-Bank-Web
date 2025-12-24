-- ============================================
-- Migration 010: Donor Notifications & ML Analytics
-- ============================================
-- Clean migration with proper ordering and error handling

-- ============================================
-- PART 1: Schema Changes to emergency_requests
-- ============================================

-- Make requester_id optional for anonymous requests
DO $$ 
BEGIN
    ALTER TABLE emergency_requests ALTER COLUMN requester_id DROP NOT NULL;
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- Add new columns for notification system (safe adds)
ALTER TABLE emergency_requests ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;
ALTER TABLE emergency_requests ADD COLUMN IF NOT EXISTS notification_radius_km INTEGER DEFAULT 5;
ALTER TABLE emergency_requests ADD COLUMN IF NOT EXISTS notification_attempts INTEGER DEFAULT 0;
ALTER TABLE emergency_requests ADD COLUMN IF NOT EXISTS last_notification_radius_km INTEGER DEFAULT 0;
ALTER TABLE emergency_requests ADD COLUMN IF NOT EXISTS max_radius_reached BOOLEAN DEFAULT FALSE;
ALTER TABLE emergency_requests ADD COLUMN IF NOT EXISTS device_fingerprint TEXT;
ALTER TABLE emergency_requests ADD COLUMN IF NOT EXISTS ip_hash TEXT;
ALTER TABLE emergency_requests ADD COLUMN IF NOT EXISTS source_platform TEXT DEFAULT 'web';

-- ============================================
-- PART 2: Donor Notifications Table
-- ============================================

-- Drop existing table if it has wrong schema
DROP TABLE IF EXISTS donor_notifications CASCADE;

CREATE TABLE donor_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Links (donor_user_id references users.id)
    request_id UUID REFERENCES emergency_requests(id) ON DELETE CASCADE NOT NULL,
    donor_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    
    -- Notification details
    notification_type TEXT DEFAULT 'emergency_request' CHECK (notification_type IN (
        'emergency_request', 'reminder', 'urgent_followup', 'final_call', 'thank_you'
    )),
    notification_round INTEGER DEFAULT 1 CHECK (notification_round > 0),
    radius_km INTEGER NOT NULL CHECK (radius_km > 0),
    
    -- Response tracking
    response TEXT DEFAULT 'pending' CHECK (response IN ('yes', 'no', 'maybe', 'pending', 'expired', 'no_response')),
    response_time TIMESTAMPTZ,
    response_latency_seconds INTEGER CHECK (response_latency_seconds >= 0),
    response_message TEXT,
    
    -- Delivery status
    delivery_method TEXT[] DEFAULT ARRAY['in_app'],
    delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    delivered_at TIMESTAMPTZ,
    delivery_attempts INTEGER DEFAULT 0 CHECK (delivery_attempts >= 0),
    last_delivery_error TEXT,
    
    -- User engagement metrics (for ML)
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    time_to_read_seconds INTEGER CHECK (time_to_read_seconds >= 0),
    notification_opened_count INTEGER DEFAULT 0 CHECK (notification_opened_count >= 0),
    link_clicked BOOLEAN DEFAULT FALSE,
    link_clicked_at TIMESTAMPTZ,
    
    -- Distance and location
    distance_km DECIMAL(6,2) CHECK (distance_km >= 0),
    donor_latitude DECIMAL(10,8),
    donor_longitude DECIMAL(11,8),
    
    -- ML Features (pre-computed for faster analysis)
    donor_reliability_score DECIMAL(3,2) CHECK (donor_reliability_score BETWEEN 0 AND 1),
    donor_total_donations INTEGER CHECK (donor_total_donations >= 0),
    donor_response_rate DECIMAL(3,2) CHECK (donor_response_rate BETWEEN 0 AND 1),
    is_first_notification BOOLEAN DEFAULT FALSE,
    urgency_at_notification TEXT,
    hours_until_expiry DECIMAL(6,2),
    blood_type_requested TEXT, -- Denormalized for ML queries
    day_of_week INTEGER, -- 0-6, pre-computed for pattern analysis
    hour_of_day INTEGER, -- 0-23, pre-computed for pattern analysis
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ,
    
    -- One notification per donor per request
    UNIQUE(request_id, donor_user_id)
);

-- Comprehensive indexes for analytics and ML queries
CREATE INDEX idx_dn_request ON donor_notifications(request_id);
CREATE INDEX idx_dn_donor ON donor_notifications(donor_user_id);
CREATE INDEX idx_dn_response ON donor_notifications(response);
CREATE INDEX idx_dn_pending ON donor_notifications(response, created_at) WHERE response = 'pending';
CREATE INDEX idx_dn_radius ON donor_notifications(request_id, radius_km);
CREATE INDEX idx_dn_created ON donor_notifications(created_at DESC);
-- ML-specific indexes
CREATE INDEX idx_dn_analytics ON donor_notifications(created_at, response, response_latency_seconds);
CREATE INDEX idx_dn_ml_features ON donor_notifications(donor_reliability_score, distance_km, response);
CREATE INDEX idx_dn_time_patterns ON donor_notifications(day_of_week, hour_of_day, response);
CREATE INDEX idx_dn_response_time ON donor_notifications(response_latency_seconds) WHERE response IN ('yes', 'no');

-- ============================================
-- PART 3: Analytics Tables
-- ============================================

DROP TABLE IF EXISTS request_analytics CASCADE;
CREATE TABLE request_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES emergency_requests(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Response metrics
    total_notifications_sent INTEGER DEFAULT 0 CHECK (total_notifications_sent >= 0),
    total_yes_responses INTEGER DEFAULT 0 CHECK (total_yes_responses >= 0),
    total_no_responses INTEGER DEFAULT 0 CHECK (total_no_responses >= 0),
    total_no_response INTEGER DEFAULT 0 CHECK (total_no_response >= 0),
    response_rate DECIMAL(5,4) DEFAULT 0 CHECK (response_rate BETWEEN 0 AND 1),
    avg_response_time_seconds INTEGER CHECK (avg_response_time_seconds >= 0),
    median_response_time_seconds INTEGER CHECK (median_response_time_seconds >= 0),
    
    -- Fulfillment metrics
    time_to_first_yes_seconds INTEGER CHECK (time_to_first_yes_seconds >= 0),
    time_to_fulfillment_seconds INTEGER CHECK (time_to_fulfillment_seconds >= 0),
    fulfillment_rate DECIMAL(5,4) DEFAULT 0 CHECK (fulfillment_rate BETWEEN 0 AND 1),
    
    -- Radius progression (for ML: learn optimal radius strategies)
    initial_radius_km INTEGER CHECK (initial_radius_km > 0),
    final_radius_km INTEGER CHECK (final_radius_km > 0),
    radius_expansions INTEGER DEFAULT 0 CHECK (radius_expansions >= 0),
    donors_per_radius JSONB DEFAULT '[]'::JSONB, -- [{radius: 5, donors: 10, yes: 3, no: 2}, ...]
    optimal_radius_km INTEGER, -- ML-predicted optimal radius for similar requests
    
    -- Donor quality metrics
    avg_donor_distance_km DECIMAL(6,2) CHECK (avg_donor_distance_km >= 0),
    avg_donor_reliability_score DECIMAL(3,2) CHECK (avg_donor_reliability_score BETWEEN 0 AND 1),
    donor_distribution JSONB DEFAULT '{}'::JSONB, -- Geographic heatmap data
    
    -- Blood type analysis
    blood_type TEXT,
    urgency_level TEXT,
    
    -- Time analysis
    request_hour INTEGER, -- Hour of day request was made
    request_day_of_week INTEGER, -- Day of week
    
    -- Outcome
    final_status TEXT,
    was_fulfilled BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_ra_request ON request_analytics(request_id);
CREATE INDEX idx_ra_response_rate ON request_analytics(response_rate DESC);
CREATE INDEX idx_ra_blood_type ON request_analytics(blood_type, urgency_level);
CREATE INDEX idx_ra_time_patterns ON request_analytics(request_hour, request_day_of_week);
CREATE INDEX idx_ra_fulfillment ON request_analytics(was_fulfilled, final_status);

DROP TABLE IF EXISTS donor_analytics CASCADE;
CREATE TABLE donor_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Response behavior
    total_notifications_received INTEGER DEFAULT 0 CHECK (total_notifications_received >= 0),
    total_yes_responses INTEGER DEFAULT 0 CHECK (total_yes_responses >= 0),
    total_no_responses INTEGER DEFAULT 0 CHECK (total_no_responses >= 0),
    total_ignored INTEGER DEFAULT 0 CHECK (total_ignored >= 0),
    overall_response_rate DECIMAL(5,4) DEFAULT 0 CHECK (overall_response_rate BETWEEN 0 AND 1),
    yes_rate DECIMAL(5,4) DEFAULT 0 CHECK (yes_rate BETWEEN 0 AND 1),
    
    -- Time-based patterns (for ML prediction)
    avg_response_time_seconds INTEGER CHECK (avg_response_time_seconds >= 0),
    median_response_time_seconds INTEGER CHECK (median_response_time_seconds >= 0),
    fastest_response_time_seconds INTEGER CHECK (fastest_response_time_seconds >= 0),
    response_by_hour JSONB DEFAULT '{}'::JSONB, -- {0: 0.1, 1: 0.05, ...} response rate by hour
    response_by_day JSONB DEFAULT '{}'::JSONB, -- {Mon: 0.3, Tue: 0.4, ...}
    most_responsive_hours INTEGER[] DEFAULT '{}', -- Top 3 hours with highest response rate
    
    -- Distance preferences
    avg_response_distance_km DECIMAL(6,2) CHECK (avg_response_distance_km >= 0),
    max_response_distance_km DECIMAL(6,2) CHECK (max_response_distance_km >= 0),
    distance_response_curve JSONB DEFAULT '[]'::JSONB, -- [{dist: 5, rate: 0.8}, {dist: 10, rate: 0.5}, ...]
    preferred_max_distance_km INTEGER, -- ML-predicted comfortable max distance
    
    -- Urgency sensitivity
    response_by_urgency JSONB DEFAULT '{}'::JSONB, -- {critical: 0.9, urgent: 0.6, normal: 0.3}
    urgency_sensitivity_score DECIMAL(5,4), -- Higher = more responsive to urgent requests
    
    -- Engagement metrics
    avg_time_to_read_seconds INTEGER CHECK (avg_time_to_read_seconds >= 0),
    notification_open_rate DECIMAL(5,4) DEFAULT 0 CHECK (notification_open_rate BETWEEN 0 AND 1),
    
    -- Donation follow-through
    donations_after_yes INTEGER DEFAULT 0 CHECK (donations_after_yes >= 0),
    follow_through_rate DECIMAL(5,4) DEFAULT 0 CHECK (follow_through_rate BETWEEN 0 AND 1),
    
    -- ML Scores (computed by background jobs)
    predicted_response_probability DECIMAL(5,4) CHECK (predicted_response_probability BETWEEN 0 AND 1),
    reliability_trend TEXT CHECK (reliability_trend IN ('improving', 'stable', 'declining', NULL)),
    churn_risk_score DECIMAL(5,4) CHECK (churn_risk_score BETWEEN 0 AND 1),
    engagement_score DECIMAL(5,4) CHECK (engagement_score BETWEEN 0 AND 1),
    
    -- Cohort analysis
    donor_segment TEXT, -- 'highly_active', 'moderate', 'dormant', 'new'
    days_since_last_response INTEGER,
    
    -- Last activity
    last_notification_at TIMESTAMPTZ,
    last_donation_at TIMESTAMPTZ,
    last_response_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_da_user ON donor_analytics(user_id);
CREATE INDEX idx_da_response_rate ON donor_analytics(overall_response_rate DESC);
CREATE INDEX idx_da_predicted ON donor_analytics(predicted_response_probability DESC);
CREATE INDEX idx_da_segment ON donor_analytics(donor_segment);
CREATE INDEX idx_da_churn ON donor_analytics(churn_risk_score DESC) WHERE churn_risk_score > 0.5;

DROP TABLE IF EXISTS system_analytics CASCADE;
CREATE TABLE system_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_type TEXT NOT NULL,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    total_requests INTEGER DEFAULT 0,
    fulfilled_requests INTEGER DEFAULT 0,
    expired_requests INTEGER DEFAULT 0,
    cancelled_requests INTEGER DEFAULT 0,
    avg_fulfillment_time_minutes INTEGER,
    
    total_notifications_sent INTEGER DEFAULT 0,
    total_responses INTEGER DEFAULT 0,
    avg_response_rate DECIMAL(5,4) DEFAULT 0,
    
    active_donors INTEGER DEFAULT 0,
    new_donors INTEGER DEFAULT 0,
    total_donations INTEGER DEFAULT 0,
    
    requests_by_blood_type JSONB DEFAULT '{}'::JSONB,
    fulfillment_by_blood_type JSONB DEFAULT '{}'::JSONB,
    requests_by_city JSONB DEFAULT '{}'::JSONB,
    avg_radius_at_fulfillment_km DECIMAL(6,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(period_type, period_start)
);

DROP TABLE IF EXISTS ml_donor_features CASCADE;
CREATE TABLE ml_donor_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    feature_vector JSONB DEFAULT '{}'::JSONB,
    
    f_response_rate_7d DECIMAL(5,4),
    f_response_rate_30d DECIMAL(5,4),
    f_response_rate_90d DECIMAL(5,4),
    f_avg_distance_km DECIMAL(6,2),
    f_donations_count INTEGER,
    f_days_since_last_donation INTEGER,
    f_days_since_registration INTEGER,
    f_notification_fatigue_score DECIMAL(5,4),
    f_time_of_day_preference INTEGER[],
    f_urgency_sensitivity DECIMAL(5,4),
    
    embedding_vector REAL[],
    
    last_computed_at TIMESTAMPTZ DEFAULT NOW(),
    model_version TEXT DEFAULT 'v1',
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_ml_user ON ml_donor_features(user_id);

-- ============================================
-- PART 4: Functions
-- ============================================

-- Find donors for request
CREATE OR REPLACE FUNCTION find_donors_for_request(
    p_request_id UUID,
    p_radius_km INTEGER DEFAULT 5,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    donor_user_id UUID,
    full_name TEXT,
    blood_type blood_type_enum,
    distance_km DECIMAL,
    phone TEXT,
    email TEXT,
    reliability_score DECIMAL,
    predicted_response_probability DECIMAL,
    is_available BOOLEAN
) AS $$
DECLARE
    v_request emergency_requests%ROWTYPE;
BEGIN
    SELECT * INTO v_request FROM emergency_requests WHERE id = p_request_id;
    
    IF v_request IS NULL THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        dp.user_id as donor_user_id,
        u.full_name,
        u.blood_type,
        ROUND(
            (6371 * acos(
                LEAST(1.0, GREATEST(-1.0,
                    cos(radians(v_request.latitude)) * cos(radians(dp.latitude)) *
                    cos(radians(dp.longitude) - radians(v_request.longitude)) +
                    sin(radians(v_request.latitude)) * sin(radians(dp.latitude))
                ))
            ))::DECIMAL, 2
        ) AS distance_km,
        u.phone,
        u.email,
        dp.reliability_score,
        COALESCE(da.predicted_response_probability, dp.response_rate) as predicted_response_probability,
        (dp.status = 'available' AND dp.is_visible = TRUE AND 
         (dp.next_eligible_date IS NULL OR dp.next_eligible_date <= CURRENT_DATE)) as is_available
    FROM donor_profiles dp
    JOIN users u ON dp.user_id = u.id
    LEFT JOIN donor_analytics da ON da.user_id = dp.user_id
    WHERE 
        u.blood_type = v_request.blood_type
        AND dp.status = 'available'
        AND dp.is_visible = TRUE
        AND dp.latitude IS NOT NULL
        AND dp.longitude IS NOT NULL
        AND (
            6371 * acos(
                LEAST(1.0, GREATEST(-1.0,
                    cos(radians(v_request.latitude)) * cos(radians(dp.latitude)) *
                    cos(radians(dp.longitude) - radians(v_request.longitude)) +
                    sin(radians(v_request.latitude)) * sin(radians(dp.latitude))
                ))
            )
        ) <= p_radius_km
        AND NOT EXISTS (
            SELECT 1 FROM donor_notifications dn 
            WHERE dn.request_id = p_request_id AND dn.donor_user_id = dp.user_id
        )
    ORDER BY 
        COALESCE(da.predicted_response_probability, dp.response_rate) DESC,
        distance_km ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Send donor notifications with automatic radius widening
CREATE OR REPLACE FUNCTION send_donor_notifications(
    p_request_id UUID,
    p_initial_radius_km INTEGER DEFAULT 5,
    p_radius_increment_km INTEGER DEFAULT 2,
    p_max_radius_km INTEGER DEFAULT 50
)
RETURNS TABLE (
    donors_notified INTEGER,
    current_radius_km INTEGER,
    should_widen BOOLEAN
) AS $$
DECLARE
    v_request emergency_requests%ROWTYPE;
    v_current_radius INTEGER;
    v_new_donors INTEGER := 0;
    v_donor RECORD;
BEGIN
    SELECT * INTO v_request FROM emergency_requests WHERE id = p_request_id;
    
    IF v_request IS NULL THEN
        RETURN QUERY SELECT 0, 0, FALSE;
        RETURN;
    END IF;
    
    -- Determine radius
    IF v_request.last_notification_radius_km = 0 OR v_request.last_notification_radius_km IS NULL THEN
        v_current_radius := p_initial_radius_km;
    ELSE
        v_current_radius := v_request.last_notification_radius_km + p_radius_increment_km;
    END IF;
    
    IF v_current_radius > p_max_radius_km THEN
        v_current_radius := p_max_radius_km;
    END IF;
    
    -- Find and notify donors
    FOR v_donor IN 
        SELECT * FROM find_donors_for_request(p_request_id, v_current_radius, 100)
    LOOP
        INSERT INTO donor_notifications (
            request_id, 
            donor_user_id, 
            radius_km, 
            distance_km, 
            response,
            notification_round,
            delivery_method,
            donor_reliability_score,
            donor_response_rate,
            urgency_at_notification,
            hours_until_expiry,
            expires_at
        )
        VALUES (
            p_request_id,
            v_donor.donor_user_id,
            v_current_radius,
            v_donor.distance_km,
            'pending',
            COALESCE(v_request.notification_attempts, 0) + 1,
            ARRAY['in_app', 'push'],
            v_donor.reliability_score,
            v_donor.predicted_response_probability,
            v_request.urgency::TEXT,
            EXTRACT(EPOCH FROM (v_request.expires_at - NOW())) / 3600,
            v_request.expires_at
        )
        ON CONFLICT (request_id, donor_user_id) DO NOTHING;
        
        IF FOUND THEN
            v_new_donors := v_new_donors + 1;
        END IF;
    END LOOP;
    
    -- Update request
    UPDATE emergency_requests 
    SET 
        notification_attempts = COALESCE(notification_attempts, 0) + 1,
        last_notification_radius_km = v_current_radius,
        last_notification_sent = NOW(),
        notification_count = COALESCE(notification_count, 0) + v_new_donors,
        max_radius_reached = (v_current_radius >= p_max_radius_km),
        updated_at = NOW()
    WHERE id = p_request_id;
    
    -- Update analytics
    INSERT INTO request_analytics (request_id, initial_radius_km, final_radius_km, total_notifications_sent)
    VALUES (p_request_id, v_current_radius, v_current_radius, v_new_donors)
    ON CONFLICT (request_id) DO UPDATE SET
        final_radius_km = v_current_radius,
        radius_expansions = request_analytics.radius_expansions + 1,
        total_notifications_sent = request_analytics.total_notifications_sent + v_new_donors,
        updated_at = NOW();
    
    RETURN QUERY SELECT v_new_donors, v_current_radius, (v_current_radius < p_max_radius_km);
END;
$$ LANGUAGE plpgsql;

-- Record donor response
CREATE OR REPLACE FUNCTION record_donor_response(
    p_notification_id UUID,
    p_response TEXT,
    p_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_notification donor_notifications%ROWTYPE;
    v_latency INTEGER;
BEGIN
    SELECT * INTO v_notification FROM donor_notifications WHERE id = p_notification_id;
    
    IF v_notification IS NULL THEN
        RETURN FALSE;
    END IF;
    
    v_latency := EXTRACT(EPOCH FROM (NOW() - v_notification.created_at))::INTEGER;
    
    UPDATE donor_notifications SET
        response = p_response,
        response_time = NOW(),
        response_latency_seconds = v_latency,
        response_message = p_message,
        updated_at = NOW()
    WHERE id = p_notification_id;
    
    -- Update request analytics
    UPDATE request_analytics SET
        total_yes_responses = total_yes_responses + CASE WHEN p_response = 'yes' THEN 1 ELSE 0 END,
        total_no_responses = total_no_responses + CASE WHEN p_response = 'no' THEN 1 ELSE 0 END,
        time_to_first_yes_seconds = CASE 
            WHEN p_response = 'yes' AND time_to_first_yes_seconds IS NULL 
            THEN v_latency ELSE time_to_first_yes_seconds END,
        updated_at = NOW()
    WHERE request_id = v_notification.request_id;
    
    -- Update donor analytics
    INSERT INTO donor_analytics (user_id, total_notifications_received, total_yes_responses, total_no_responses, last_response_at)
    VALUES (
        v_notification.donor_user_id, 
        1, 
        CASE WHEN p_response = 'yes' THEN 1 ELSE 0 END,
        CASE WHEN p_response = 'no' THEN 1 ELSE 0 END,
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_notifications_received = donor_analytics.total_notifications_received + 1,
        total_yes_responses = donor_analytics.total_yes_responses + CASE WHEN p_response = 'yes' THEN 1 ELSE 0 END,
        total_no_responses = donor_analytics.total_no_responses + CASE WHEN p_response = 'no' THEN 1 ELSE 0 END,
        overall_response_rate = (donor_analytics.total_yes_responses + donor_analytics.total_no_responses + 1)::DECIMAL / 
            (donor_analytics.total_notifications_received + 1),
        yes_rate = (donor_analytics.total_yes_responses + CASE WHEN p_response = 'yes' THEN 1 ELSE 0 END)::DECIMAL /
            (donor_analytics.total_notifications_received + 1),
        last_response_at = NOW(),
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 5: RLS Policies
-- ============================================
ALTER TABLE donor_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_donor_features ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS dn_select ON donor_notifications;
DROP POLICY IF EXISTS dn_update ON donor_notifications;
DROP POLICY IF EXISTS dn_insert ON donor_notifications;
DROP POLICY IF EXISTS ra_select ON request_analytics;
DROP POLICY IF EXISTS da_select ON donor_analytics;
DROP POLICY IF EXISTS sa_select ON system_analytics;
DROP POLICY IF EXISTS ml_select ON ml_donor_features;

-- Create new policies
CREATE POLICY dn_select ON donor_notifications FOR SELECT USING (
    donor_user_id = auth.uid()::UUID
    OR EXISTS (SELECT 1 FROM emergency_requests er WHERE er.id = request_id AND er.requester_id = auth.uid()::UUID)
    OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid()::UUID AND role IN ('admin', 'superadmin'))
);
CREATE POLICY dn_update ON donor_notifications FOR UPDATE USING (donor_user_id = auth.uid()::UUID);
CREATE POLICY dn_insert ON donor_notifications FOR INSERT WITH CHECK (TRUE);

CREATE POLICY ra_select ON request_analytics FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid()::UUID AND role IN ('admin', 'superadmin'))
    OR EXISTS (SELECT 1 FROM emergency_requests er WHERE er.id = request_id AND er.requester_id = auth.uid()::UUID)
);

CREATE POLICY da_select ON donor_analytics FOR SELECT USING (
    user_id = auth.uid()::UUID
    OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid()::UUID AND role IN ('admin', 'superadmin'))
);

CREATE POLICY sa_select ON system_analytics FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid()::UUID AND role IN ('admin', 'superadmin'))
);

CREATE POLICY ml_select ON ml_donor_features FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid()::UUID AND role IN ('admin', 'superadmin'))
);

-- Update emergency requests policies
DROP POLICY IF EXISTS emergency_requests_insert ON emergency_requests;
CREATE POLICY emergency_requests_insert ON emergency_requests
    FOR INSERT WITH CHECK (auth.uid()::UUID = requester_id OR requester_id IS NULL);

DROP POLICY IF EXISTS emergency_requests_select ON emergency_requests;
CREATE POLICY emergency_requests_select ON emergency_requests
    FOR SELECT USING (
        status IN ('pending', 'matching', 'donors_found')
        OR requester_id = auth.uid()::UUID
        OR requester_id IS NULL
        OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid()::UUID AND role IN ('admin', 'superadmin', 'moderator'))
    );

-- ============================================
-- PART 6: Triggers
-- ============================================
DROP TRIGGER IF EXISTS trg_dn_updated_at ON donor_notifications;
DROP TRIGGER IF EXISTS trg_ra_updated_at ON request_analytics;
DROP TRIGGER IF EXISTS trg_da_updated_at ON donor_analytics;
DROP TRIGGER IF EXISTS trg_ml_updated_at ON ml_donor_features;

CREATE TRIGGER trg_dn_updated_at
    BEFORE UPDATE ON donor_notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_ra_updated_at
    BEFORE UPDATE ON request_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_da_updated_at
    BEFORE UPDATE ON donor_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_ml_updated_at
    BEFORE UPDATE ON ml_donor_features
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- PART 7: Views
-- ============================================
DROP VIEW IF EXISTS v_pending_notifications;
CREATE VIEW v_pending_notifications AS
SELECT 
    dn.id,
    dn.request_id,
    dn.donor_user_id,
    er.blood_type,
    er.urgency,
    er.hospital_name,
    er.hospital_city,
    er.patient_name,
    er.units_needed,
    dn.distance_km,
    dn.created_at as notified_at,
    er.expires_at,
    dn.donor_reliability_score,
    u.full_name as donor_name,
    u.phone as donor_phone
FROM donor_notifications dn
JOIN emergency_requests er ON dn.request_id = er.id
JOIN users u ON dn.donor_user_id = u.id
WHERE dn.response = 'pending'
  AND er.status IN ('pending', 'matching')
  AND er.expires_at > NOW();

DROP VIEW IF EXISTS v_request_summary;
CREATE VIEW v_request_summary AS
SELECT 
    er.id,
    er.patient_name,
    er.blood_type,
    er.urgency,
    er.hospital_name,
    er.hospital_city,
    er.status,
    er.units_needed,
    er.created_at,
    er.expires_at,
    COALESCE(ra.total_notifications_sent, 0) as notifications_sent,
    COALESCE(ra.total_yes_responses, 0) as yes_responses,
    COALESCE(ra.response_rate, 0) as response_rate,
    er.last_notification_radius_km as current_radius,
    er.max_radius_reached
FROM emergency_requests er
LEFT JOIN request_analytics ra ON ra.request_id = er.id
WHERE er.expires_at > NOW();
