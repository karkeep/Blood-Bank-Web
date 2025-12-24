-- ============================================
-- Migration 006: Analytics Domain
-- ============================================
-- Donation records, notifications, materialized views, and ML features

-- ============================================
-- Table: donation_records
-- ============================================
CREATE TABLE donation_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Participants
    donor_id UUID REFERENCES users(id) NOT NULL,
    request_id UUID REFERENCES emergency_requests(id),
    blood_bank_id UUID REFERENCES blood_banks(id),
    event_id UUID REFERENCES donation_events(id),
    
    -- Donation details
    blood_type blood_type_enum NOT NULL,
    volume_ml INTEGER NOT NULL DEFAULT 450 CHECK (volume_ml > 0 AND volume_ml <= 500),
    donation_type donation_type_enum DEFAULT 'regular' NOT NULL,
    blood_components blood_component_enum DEFAULT 'whole_blood',
    
    -- Status workflow
    status donation_status_enum DEFAULT 'scheduled' NOT NULL,
    
    -- Scheduling
    scheduled_at TIMESTAMPTZ,
    check_in_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    
    -- Health check
    pre_donation_check JSONB DEFAULT '{}'::JSONB,
    health_check_passed BOOLEAN,
    hemoglobin_level DECIMAL(4,2),
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    
    -- Post-donation
    adverse_reaction BOOLEAN DEFAULT FALSE,
    adverse_reaction_notes TEXT,
    rest_time_mins INTEGER,
    
    -- Verification
    verification_code TEXT UNIQUE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    
    -- Analytics
    response_time_mins INTEGER, -- From request to confirmation
    travel_distance_km DECIMAL(6,2),
    wait_time_mins INTEGER,
    
    -- Location
    donation_location TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    
    -- Notes
    donor_notes TEXT,
    staff_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_donation_records_donor ON donation_records(donor_id, completed_at DESC);
CREATE INDEX idx_donation_records_type ON donation_records(blood_type, completed_at DESC);
CREATE INDEX idx_donation_records_status ON donation_records(status);
CREATE INDEX idx_donation_records_date ON donation_records(completed_at DESC) WHERE status = 'completed';
CREATE INDEX idx_donation_records_bank ON donation_records(blood_bank_id, completed_at DESC);

-- ============================================
-- Table: notifications
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    
    -- Notification content
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type notification_type_enum NOT NULL,
    
    -- Related entity
    related_entity_type TEXT, -- 'request', 'donation', 'event', etc.
    related_entity_id UUID,
    
    -- Action
    action_url TEXT,
    action_label TEXT,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    
    -- Delivery
    delivery_channels TEXT[] DEFAULT ARRAY['in_app'],
    email_sent BOOLEAN DEFAULT FALSE,
    sms_sent BOOLEAN DEFAULT FALSE,
    push_sent BOOLEAN DEFAULT FALSE,
    
    -- Scheduling
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    
    -- Expiry
    expires_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_type ON notifications(type);

-- ============================================
-- Table: analytics_events
-- ============================================
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User (optional for anonymous events)
    user_id UUID REFERENCES users(id),
    session_id TEXT,
    
    -- Event
    event_name TEXT NOT NULL,
    event_category TEXT NOT NULL,
    
    -- Properties
    properties JSONB DEFAULT '{}'::JSONB,
    
    -- Context
    page_url TEXT,
    referrer TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    
    -- Location
    ip_address INET,
    city TEXT,
    country TEXT,
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes (time-series optimized)
CREATE INDEX idx_analytics_events_date ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_analytics_events_name ON analytics_events(event_name, created_at DESC);

-- ============================================
-- Table: ml_donor_features (Feature Store)
-- ============================================
CREATE TABLE ml_donor_features (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    
    -- Behavioral Features
    total_logins_7d INTEGER DEFAULT 0,
    total_logins_30d INTEGER DEFAULT 0,
    total_logins_90d INTEGER DEFAULT 0,
    total_requests_viewed_30d INTEGER DEFAULT 0,
    total_requests_responded_30d INTEGER DEFAULT 0,
    
    -- Response Features
    avg_response_time_mins_30d DECIMAL(8,2),
    min_response_time_mins DECIMAL(8,2),
    max_response_time_mins DECIMAL(8,2),
    response_rate_30d DECIMAL(5,4) DEFAULT 0,
    
    -- Donation Features
    total_donations_lifetime INTEGER DEFAULT 0,
    total_donations_365d INTEGER DEFAULT 0,
    total_donations_90d INTEGER DEFAULT 0,
    donation_frequency_days DECIMAL(6,2),
    liters_donated_lifetime DECIMAL(8,3) DEFAULT 0,
    
    -- Engagement Features
    profile_completeness_pct DECIMAL(5,2) DEFAULT 0,
    days_since_registration INTEGER,
    days_since_last_login INTEGER,
    days_since_last_donation INTEGER,
    is_notification_enabled BOOLEAN DEFAULT TRUE,
    
    -- Performance Features
    fulfillment_rate DECIMAL(5,4) DEFAULT 0,
    cancellation_rate DECIMAL(5,4) DEFAULT 0,
    no_show_rate DECIMAL(5,4) DEFAULT 0,
    
    -- Predictions (updated by ML pipeline)
    churn_probability DECIMAL(5,4),
    expected_donations_next_90d DECIMAL(4,2),
    lifetime_value_score DECIMAL(10,2),
    next_donation_prediction DATE,
    donor_segment TEXT,
    
    -- Timestamps
    features_updated_at TIMESTAMPTZ DEFAULT NOW(),
    predictions_updated_at TIMESTAMPTZ
);

-- Index for ML queries
CREATE INDEX idx_ml_features_churn ON ml_donor_features(churn_probability DESC);
CREATE INDEX idx_ml_features_ltv ON ml_donor_features(lifetime_value_score DESC);
CREATE INDEX idx_ml_features_segment ON ml_donor_features(donor_segment);

-- ============================================
-- Table: audit_logs
-- ============================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Actor
    user_id UUID REFERENCES users(id),
    user_email TEXT,
    user_role TEXT,
    
    -- Action
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    
    -- Changes
    old_values JSONB,
    new_values JSONB,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_date ON audit_logs(created_at DESC);

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE donation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_donor_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Donation records: Own + admin access
CREATE POLICY donation_records_select ON donation_records
    FOR SELECT USING (
        donor_id = auth.uid()::UUID
        OR EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin', 'volunteer')
        )
    );

CREATE POLICY donation_records_insert ON donation_records
    FOR INSERT WITH CHECK (
        donor_id = auth.uid()::UUID
        OR EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin', 'volunteer')
        )
    );

-- Notifications: Own only
CREATE POLICY notifications_own ON notifications
    FOR ALL USING (user_id = auth.uid()::UUID);

-- Analytics events: Insert any, select admin only
CREATE POLICY analytics_events_insert ON analytics_events
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY analytics_events_select ON analytics_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin')
        )
    );

-- ML features: Admin only
CREATE POLICY ml_features_admin ON ml_donor_features
    FOR ALL USING (
        user_id = auth.uid()::UUID
        OR EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin')
        )
    );

-- Audit logs: Superadmin only
CREATE POLICY audit_logs_superadmin ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role = 'superadmin'
        )
    );

-- ============================================
-- Triggers
-- ============================================

CREATE TRIGGER trg_donation_records_updated_at
    BEFORE UPDATE ON donation_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update donor stats when donation is completed
CREATE OR REPLACE FUNCTION update_donor_stats_on_donation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
        UPDATE donor_profiles 
        SET 
            total_donations = total_donations + 1,
            liters_donated = liters_donated + (NEW.volume_ml::DECIMAL / 1000),
            lives_saved = lives_saved + CEIL(NEW.volume_ml::DECIMAL / 450 * 3),
            last_donation_date = NEW.completed_at::DATE,
            next_eligible_date = (NEW.completed_at + INTERVAL '56 days')::DATE,
            eligibility_status = 'ineligible',
            donation_streak = CASE 
                WHEN last_donation_date IS NULL THEN 1
                WHEN last_donation_date >= (NEW.completed_at::DATE - INTERVAL '90 days')
                THEN donation_streak + 1
                ELSE 1
            END,
            updated_at = NOW()
        WHERE user_id = NEW.donor_id;
        
        -- Update blood inventory
        IF NEW.blood_bank_id IS NOT NULL THEN
            PERFORM update_inventory_units(
                NEW.blood_bank_id, 
                NEW.blood_type, 
                1, 
                'donation_received'
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_donor_stats_on_donation
    AFTER INSERT OR UPDATE ON donation_records
    FOR EACH ROW EXECUTE FUNCTION update_donor_stats_on_donation();

-- ============================================
-- Materialized Views for Dashboards
-- ============================================

-- City-wide donor statistics
CREATE MATERIALIZED VIEW mv_city_donor_stats AS
SELECT 
    COALESCE(dp.city, 'Unknown') as city,
    COUNT(DISTINCT dp.user_id) as total_donors,
    COUNT(DISTINCT dp.user_id) FILTER (WHERE dp.status = 'available') as available_donors,
    COUNT(DISTINCT dp.user_id) FILTER (WHERE dp.verification_status = 'verified') as verified_donors,
    ROUND(AVG(dp.total_donations), 2) as avg_donations_per_donor,
    SUM(dp.liters_donated) as total_liters_donated,
    SUM(dp.lives_saved) as total_lives_saved,
    ROUND(AVG(dp.reliability_score), 4) as avg_reliability,
    COUNT(DISTINCT dp.user_id) FILTER (WHERE dp.badge IN ('gold', 'platinum', 'diamond')) as premium_donors
FROM donor_profiles dp
JOIN users u ON dp.user_id = u.id
WHERE u.deleted_at IS NULL
GROUP BY COALESCE(dp.city, 'Unknown');

CREATE UNIQUE INDEX idx_mv_city_donor_stats_city ON mv_city_donor_stats(city);

-- Blood type distribution
CREATE MATERIALIZED VIEW mv_blood_type_distribution AS
SELECT 
    u.blood_type,
    COUNT(DISTINCT u.id) as total_users,
    COUNT(DISTINCT dp.user_id) as total_donors,
    COUNT(DISTINCT dp.user_id) FILTER (WHERE dp.status = 'available' AND dp.eligibility_status = 'eligible') as available_eligible,
    SUM(COALESCE(dp.total_donations, 0)) as total_donations,
    SUM(COALESCE(dp.liters_donated, 0)) as total_liters
FROM users u
LEFT JOIN donor_profiles dp ON u.id = dp.user_id
WHERE u.deleted_at IS NULL
GROUP BY u.blood_type
ORDER BY u.blood_type;

CREATE UNIQUE INDEX idx_mv_blood_type_distribution ON mv_blood_type_distribution(blood_type);

-- Monthly donation trends
CREATE MATERIALIZED VIEW mv_monthly_donation_trends AS
SELECT 
    DATE_TRUNC('month', completed_at) as month,
    COUNT(*) as total_donations,
    COUNT(DISTINCT donor_id) as unique_donors,
    SUM(volume_ml) as total_volume_ml,
    ROUND(SUM(volume_ml)::DECIMAL / 1000, 2) as total_liters,
    blood_type
FROM donation_records
WHERE status = 'completed' AND completed_at IS NOT NULL
GROUP BY DATE_TRUNC('month', completed_at), blood_type
ORDER BY month DESC, blood_type;

CREATE INDEX idx_mv_monthly_trends ON mv_monthly_donation_trends(month DESC);

-- Dashboard KPIs
CREATE MATERIALIZED VIEW mv_dashboard_kpis AS
SELECT 
    -- User stats
    (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) as total_users,
    (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL AND created_at >= NOW() - INTERVAL '30 days') as new_users_30d,
    
    -- Donor stats
    (SELECT COUNT(*) FROM donor_profiles WHERE verification_status = 'verified') as verified_donors,
    (SELECT COUNT(*) FROM donor_profiles WHERE status = 'available' AND eligibility_status = 'eligible') as available_donors,
    
    -- Donation stats
    (SELECT COUNT(*) FROM donation_records WHERE status = 'completed') as total_donations,
    (SELECT COUNT(*) FROM donation_records WHERE status = 'completed' AND completed_at >= NOW() - INTERVAL '30 days') as donations_30d,
    (SELECT COALESCE(SUM(volume_ml), 0) / 1000.0 FROM donation_records WHERE status = 'completed') as total_liters,
    
    -- Request stats
    (SELECT COUNT(*) FROM emergency_requests WHERE status NOT IN ('cancelled', 'expired')) as total_requests,
    (SELECT COUNT(*) FROM emergency_requests WHERE status = 'fulfilled') as fulfilled_requests,
    (SELECT COUNT(*) FROM emergency_requests WHERE status IN ('pending', 'matching') AND expires_at > NOW()) as active_requests,
    
    -- Lives saved estimate
    (SELECT COALESCE(SUM(lives_saved), 0) FROM donor_profiles) as total_lives_saved,
    
    -- Timestamp
    NOW() as updated_at;

-- ============================================
-- Refresh Function
-- ============================================

CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_city_donor_stats;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_blood_type_distribution;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_monthly_donation_trends;
    REFRESH MATERIALIZED VIEW mv_dashboard_kpis; -- No CONCURRENTLY as it has no unique index
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Helper Functions
-- ============================================

-- Get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
    total_donors BIGINT,
    available_donors BIGINT,
    total_donations BIGINT,
    total_liters DECIMAL,
    lives_saved BIGINT,
    active_requests BIGINT,
    fulfilled_requests BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM donor_profiles WHERE verification_status = 'verified'),
        (SELECT COUNT(*) FROM donor_profiles WHERE status = 'available' AND eligibility_status = 'eligible'),
        (SELECT COUNT(*) FROM donation_records WHERE status = 'completed'),
        (SELECT COALESCE(SUM(volume_ml), 0)::DECIMAL / 1000 FROM donation_records WHERE status = 'completed'),
        (SELECT COALESCE(SUM(lives_saved), 0) FROM donor_profiles),
        (SELECT COUNT(*) FROM emergency_requests WHERE status IN ('pending', 'matching') AND expires_at > NOW()),
        (SELECT COUNT(*) FROM emergency_requests WHERE status = 'fulfilled');
END;
$$ LANGUAGE plpgsql STABLE;

-- Update ML features for a donor
CREATE OR REPLACE FUNCTION update_ml_features(p_user_id UUID)
RETURNS void AS $$
DECLARE
    v_donor donor_profiles%ROWTYPE;
    v_donation_count INTEGER;
    v_response_count INTEGER;
BEGIN
    SELECT * INTO v_donor FROM donor_profiles WHERE user_id = p_user_id;
    
    IF v_donor IS NULL THEN RETURN; END IF;
    
    INSERT INTO ml_donor_features (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO UPDATE SET
        total_donations_lifetime = v_donor.total_donations,
        total_donations_365d = (
            SELECT COUNT(*) FROM donation_records 
            WHERE donor_id = p_user_id AND status = 'completed' 
            AND completed_at >= NOW() - INTERVAL '365 days'
        ),
        total_donations_90d = (
            SELECT COUNT(*) FROM donation_records 
            WHERE donor_id = p_user_id AND status = 'completed' 
            AND completed_at >= NOW() - INTERVAL '90 days'
        ),
        liters_donated_lifetime = v_donor.liters_donated,
        days_since_last_donation = CASE 
            WHEN v_donor.last_donation_date IS NOT NULL 
            THEN (CURRENT_DATE - v_donor.last_donation_date)::INTEGER
            ELSE NULL
        END,
        fulfillment_rate = v_donor.response_rate,
        features_updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
