-- ============================================
-- Migration 009: Organization Portal System
-- ============================================
-- Hospital/Blood Bank login, room availability, and data submission tracking

-- ============================================
-- Table: organization_accounts
-- ============================================
-- Unified login system for hospitals and blood banks
CREATE TABLE organization_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Organization link (one of these should be set)
    organization_type TEXT NOT NULL CHECK (organization_type IN ('hospital', 'blood_bank')),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    blood_bank_id UUID REFERENCES blood_banks(id) ON DELETE CASCADE,
    
    -- Login credentials
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    
    -- Contact person
    contact_name TEXT NOT NULL,
    contact_phone TEXT,
    contact_role TEXT DEFAULT 'admin', -- admin, data_entry, viewer
    
    -- Access control
    access_level TEXT DEFAULT 'full' CHECK (access_level IN ('full', 'inventory_only', 'rooms_only', 'view_only')),
    is_primary_contact BOOLEAN DEFAULT FALSE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    
    -- Session tracking
    last_login_at TIMESTAMPTZ,
    login_count INTEGER DEFAULT 0,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    
    -- Password reset
    reset_token TEXT,
    reset_token_expires TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_org_link CHECK (
        (organization_type = 'hospital' AND hospital_id IS NOT NULL AND blood_bank_id IS NULL) OR
        (organization_type = 'blood_bank' AND blood_bank_id IS NOT NULL AND hospital_id IS NULL)
    )
);

-- Indexes
CREATE INDEX idx_org_accounts_email ON organization_accounts(email);
CREATE INDEX idx_org_accounts_hospital ON organization_accounts(hospital_id) WHERE hospital_id IS NOT NULL;
CREATE INDEX idx_org_accounts_blood_bank ON organization_accounts(blood_bank_id) WHERE blood_bank_id IS NOT NULL;
CREATE INDEX idx_org_accounts_active ON organization_accounts(is_active, is_verified);

-- ============================================
-- Table: hospital_room_availability
-- ============================================
-- Real-time room/bed availability tracking for hospitals
CREATE TABLE hospital_room_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE NOT NULL,
    
    -- Room type
    room_type TEXT NOT NULL CHECK (room_type IN (
        'icu', 'emergency', 'general', 'nicu', 'picu', 'ccu', 'hdu', 'isolation', 'maternity', 'pediatric'
    )),
    
    -- Capacity
    total_beds INTEGER NOT NULL DEFAULT 0 CHECK (total_beds >= 0),
    occupied_beds INTEGER NOT NULL DEFAULT 0 CHECK (occupied_beds >= 0),
    available_beds INTEGER GENERATED ALWAYS AS (total_beds - occupied_beds) STORED,
    reserved_beds INTEGER DEFAULT 0 CHECK (reserved_beds >= 0),
    
    -- Special equipment
    ventilators_total INTEGER DEFAULT 0 CHECK (ventilators_total >= 0),
    ventilators_in_use INTEGER DEFAULT 0 CHECK (ventilators_in_use >= 0),
    ventilators_available INTEGER GENERATED ALWAYS AS (ventilators_total - ventilators_in_use) STORED,
    
    -- Oxygen support
    oxygen_beds_total INTEGER DEFAULT 0,
    oxygen_beds_in_use INTEGER DEFAULT 0,
    
    -- Status
    status TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN total_beds = 0 THEN 'unavailable'
            WHEN (total_beds - occupied_beds)::DECIMAL / total_beds < 0.1 THEN 'critical'
            WHEN (total_beds - occupied_beds)::DECIMAL / total_beds < 0.3 THEN 'low'
            ELSE 'available'
        END
    ) STORED,
    
    -- Display settings
    is_visible BOOLEAN DEFAULT TRUE,
    
    -- Update tracking
    last_updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_by UUID REFERENCES organization_accounts(id),
    next_update_due TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Unique constraint - one row per room type per hospital
    UNIQUE(hospital_id, room_type),
    
    -- Validation
    CONSTRAINT valid_occupancy CHECK (occupied_beds <= total_beds),
    CONSTRAINT valid_ventilator_use CHECK (ventilators_in_use <= ventilators_total)
);

-- Indexes
CREATE INDEX idx_room_availability_hospital ON hospital_room_availability(hospital_id);
CREATE INDEX idx_room_availability_type ON hospital_room_availability(room_type);
CREATE INDEX idx_room_availability_status ON hospital_room_availability(status) WHERE is_visible = TRUE;
CREATE INDEX idx_room_availability_update_due ON hospital_room_availability(next_update_due);

-- ============================================
-- Table: data_submission_logs
-- ============================================
-- Track daily data submissions from organizations
CREATE TABLE data_submission_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Organization reference
    organization_account_id UUID REFERENCES organization_accounts(id) ON DELETE CASCADE NOT NULL,
    organization_type TEXT NOT NULL CHECK (organization_type IN ('hospital', 'blood_bank')),
    
    -- Submission details
    submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    submitted_by UUID REFERENCES organization_accounts(id),
    
    -- Data type
    data_type TEXT NOT NULL CHECK (data_type IN (
        'blood_inventory', 'room_availability', 'both', 'no_change'
    )),
    
    -- Submission content summary
    summary JSONB DEFAULT '{}'::JSONB,
    -- Example: { "blood_types_updated": 8, "rooms_updated": 5, "total_changes": 13 }
    
    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    verification_notes TEXT,
    
    -- Data quality flags
    has_anomalies BOOLEAN DEFAULT FALSE,
    anomaly_details JSONB DEFAULT '[]'::JSONB,
    
    -- Reminder tracking
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- One submission per org per day per type
    UNIQUE(organization_account_id, submission_date, data_type)
);

-- Indexes
CREATE INDEX idx_submission_logs_org ON data_submission_logs(organization_account_id);
CREATE INDEX idx_submission_logs_date ON data_submission_logs(submission_date DESC);
-- Index for recent submissions lookup (without non-immutable function)
CREATE INDEX idx_submission_logs_recent ON data_submission_logs(submission_date, organization_account_id);
CREATE INDEX idx_submission_logs_pending ON data_submission_logs(submission_date, reminder_sent) 
    WHERE reminder_sent = FALSE;

-- ============================================
-- Table: organization_reminders
-- ============================================
-- Configure reminder schedules for organizations
CREATE TABLE organization_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_account_id UUID REFERENCES organization_accounts(id) ON DELETE CASCADE NOT NULL,
    
    -- Reminder configuration
    is_enabled BOOLEAN DEFAULT TRUE,
    reminder_frequency TEXT DEFAULT 'daily' CHECK (reminder_frequency IN ('daily', 'twice_daily', 'weekly')),
    
    -- Timing (stored as time)
    morning_reminder_time TIME DEFAULT '08:00',
    evening_reminder_time TIME DEFAULT '18:00',
    
    -- Notification methods
    notify_email BOOLEAN DEFAULT TRUE,
    notify_sms BOOLEAN DEFAULT FALSE,
    notify_in_app BOOLEAN DEFAULT TRUE,
    
    -- Additional contacts for reminders
    additional_emails TEXT[] DEFAULT '{}',
    additional_phones TEXT[] DEFAULT '{}',
    
    -- Tracking
    last_reminder_sent TIMESTAMPTZ,
    last_reminder_type TEXT, -- 'morning', 'evening', 'missed'
    reminder_streak INTEGER DEFAULT 0, -- Days in a row data was submitted on time
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- One config per org account
    UNIQUE(organization_account_id)
);

-- Indexes
CREATE INDEX idx_org_reminders_enabled ON organization_reminders(is_enabled) WHERE is_enabled = TRUE;
CREATE INDEX idx_org_reminders_time ON organization_reminders(morning_reminder_time);

-- ============================================
-- Table: organization_activity_log
-- ============================================
-- Audit trail for organization actions
CREATE TABLE organization_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_account_id UUID REFERENCES organization_accounts(id) ON DELETE CASCADE NOT NULL,
    
    -- Activity details
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'login', 'logout', 'password_change', 'profile_update',
        'inventory_update', 'room_update', 'data_submission', 'export_data'
    )),
    description TEXT,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    
    -- Changes made (for update activities)
    changes JSONB DEFAULT '{}'::JSONB,
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_org_activity_account ON organization_activity_log(organization_account_id, created_at DESC);
CREATE INDEX idx_org_activity_type ON organization_activity_log(activity_type);
CREATE INDEX idx_org_activity_date ON organization_activity_log(created_at DESC);

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE organization_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_room_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_submission_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_activity_log ENABLE ROW LEVEL SECURITY;

-- Organization accounts: Self access + admin access
CREATE POLICY org_accounts_self ON organization_accounts
    FOR ALL USING (
        id = (current_setting('app.current_org_account_id', TRUE))::UUID
        OR EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin')
        )
    );

-- Room availability: Public read, org write
CREATE POLICY room_availability_read ON hospital_room_availability
    FOR SELECT USING (is_visible = TRUE);

CREATE POLICY room_availability_write ON hospital_room_availability
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM organization_accounts oa
            WHERE oa.hospital_id = hospital_room_availability.hospital_id
            AND oa.id = (current_setting('app.current_org_account_id', TRUE))::UUID
        )
        OR EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin')
        )
    );

-- Submission logs: Own org + admin access
CREATE POLICY submission_logs_access ON data_submission_logs
    FOR ALL USING (
        organization_account_id = (current_setting('app.current_org_account_id', TRUE))::UUID
        OR EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin')
        )
    );

-- Reminders: Own org + admin access
CREATE POLICY org_reminders_access ON organization_reminders
    FOR ALL USING (
        organization_account_id = (current_setting('app.current_org_account_id', TRUE))::UUID
        OR EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin')
        )
    );

-- Activity log: Own org + admin access
CREATE POLICY org_activity_access ON organization_activity_log
    FOR ALL USING (
        organization_account_id = (current_setting('app.current_org_account_id', TRUE))::UUID
        OR EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin')
        )
    );

-- ============================================
-- Triggers
-- ============================================

CREATE TRIGGER trg_org_accounts_updated_at
    BEFORE UPDATE ON organization_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_org_reminders_updated_at
    BEFORE UPDATE ON organization_reminders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update room availability timestamp
CREATE OR REPLACE FUNCTION update_room_availability_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated_at = NOW();
    NEW.next_update_due = NOW() + INTERVAL '24 hours';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_room_availability_timestamp
    BEFORE UPDATE ON hospital_room_availability
    FOR EACH ROW EXECUTE FUNCTION update_room_availability_timestamp();

-- ============================================
-- Functions
-- ============================================

-- Get organizations missing today's submission
DROP FUNCTION IF EXISTS get_missing_submissions(DATE);
DROP FUNCTION IF EXISTS get_missing_submissions;

CREATE OR REPLACE FUNCTION get_missing_submissions(p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    organization_id UUID,
    organization_type TEXT,
    organization_name TEXT,
    contact_email TEXT,
    contact_name TEXT,
    last_submission_date DATE,
    days_since_submission INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        oa.id as organization_id,
        oa.organization_type,
        COALESCE(h.name, bb.name) as organization_name,
        oa.email as contact_email,
        oa.contact_name,
        MAX(dsl.submission_date) as last_submission_date,
        (p_date - COALESCE(MAX(dsl.submission_date), p_date - 30))::INTEGER as days_since_submission
    FROM organization_accounts oa
    LEFT JOIN hospitals h ON oa.hospital_id = h.id
    LEFT JOIN blood_banks bb ON oa.blood_bank_id = bb.id
    LEFT JOIN data_submission_logs dsl ON oa.id = dsl.organization_account_id
        AND dsl.submission_date = p_date
    WHERE oa.is_active = TRUE
      AND oa.is_verified = TRUE
      AND dsl.id IS NULL -- No submission for the date
    GROUP BY oa.id, oa.organization_type, h.name, bb.name, oa.email, oa.contact_name
    ORDER BY days_since_submission DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get city-wise room availability
DROP FUNCTION IF EXISTS get_city_room_availability(TEXT);
DROP FUNCTION IF EXISTS get_city_room_availability;

CREATE OR REPLACE FUNCTION get_city_room_availability(p_city TEXT DEFAULT NULL)
RETURNS TABLE (
    city TEXT,
    room_type TEXT,
    total_beds BIGINT,
    available_beds BIGINT,
    occupancy_rate DECIMAL,
    hospitals_count BIGINT,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.city,
        hra.room_type,
        SUM(hra.total_beds)::BIGINT as total_beds,
        SUM(hra.total_beds - hra.occupied_beds)::BIGINT as available_beds,
        ROUND((SUM(hra.occupied_beds)::DECIMAL / NULLIF(SUM(hra.total_beds), 0)) * 100, 1) as occupancy_rate,
        COUNT(DISTINCT h.id)::BIGINT as hospitals_count,
        CASE 
            WHEN SUM(hra.total_beds - hra.occupied_beds)::DECIMAL / NULLIF(SUM(hra.total_beds), 0) < 0.1 THEN 'critical'
            WHEN SUM(hra.total_beds - hra.occupied_beds)::DECIMAL / NULLIF(SUM(hra.total_beds), 0) < 0.3 THEN 'low'
            ELSE 'available'
        END as status
    FROM hospital_room_availability hra
    JOIN hospitals h ON hra.hospital_id = h.id
    WHERE hra.is_visible = TRUE
      AND h.is_active = TRUE
      AND (p_city IS NULL OR h.city = p_city)
    GROUP BY h.city, hra.room_type
    ORDER BY h.city, hra.room_type;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get organization dashboard stats
DROP FUNCTION IF EXISTS get_org_dashboard_stats(UUID);
DROP FUNCTION IF EXISTS get_org_dashboard_stats;

CREATE OR REPLACE FUNCTION get_org_dashboard_stats(p_org_account_id UUID)
RETURNS TABLE (
    organization_name TEXT,
    organization_type TEXT,
    last_submission_date DATE,
    submission_streak INTEGER,
    pending_alerts INTEGER,
    total_submissions_this_month INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(h.name, bb.name) as organization_name,
        oa.organization_type,
        MAX(dsl.submission_date) as last_submission_date,
        COALESCE(orr.reminder_streak, 0) as submission_streak,
        0 as pending_alerts, -- Placeholder
        COUNT(dsl.id)::INTEGER as total_submissions_this_month
    FROM organization_accounts oa
    LEFT JOIN hospitals h ON oa.hospital_id = h.id
    LEFT JOIN blood_banks bb ON oa.blood_bank_id = bb.id
    LEFT JOIN data_submission_logs dsl ON oa.id = dsl.organization_account_id
        AND dsl.submission_date >= DATE_TRUNC('month', CURRENT_DATE)
    LEFT JOIN organization_reminders orr ON oa.id = orr.organization_account_id
    WHERE oa.id = p_org_account_id
    GROUP BY h.name, bb.name, oa.organization_type, orr.reminder_streak;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- View: Public Room Availability Summary
-- ============================================

CREATE OR REPLACE VIEW v_public_room_availability AS
SELECT 
    h.id as hospital_id,
    h.name as hospital_name,
    h.city,
    h.address,
    h.phone,
    h.emergency_phone,
    hra.room_type,
    hra.total_beds,
    hra.total_beds - hra.occupied_beds as available_beds,
    hra.ventilators_total - hra.ventilators_in_use as ventilators_available,
    hra.status,
    hra.last_updated_at,
    CASE 
        WHEN hra.last_updated_at > NOW() - INTERVAL '24 hours' THEN 'recent'
        WHEN hra.last_updated_at > NOW() - INTERVAL '48 hours' THEN 'stale'
        ELSE 'outdated'
    END as data_freshness
FROM hospital_room_availability hra
JOIN hospitals h ON hra.hospital_id = h.id
WHERE hra.is_visible = TRUE
  AND h.is_active = TRUE;

-- ============================================
-- Seed Initial Room Types for Existing Hospitals
-- ============================================

-- This will create room availability records for existing hospitals
INSERT INTO hospital_room_availability (hospital_id, room_type, total_beds)
SELECT h.id, rt.room_type, 
    CASE rt.room_type
        WHEN 'icu' THEN COALESCE(h.icu_beds, 10)
        WHEN 'emergency' THEN 15
        WHEN 'general' THEN COALESCE(h.total_beds, 50) - COALESCE(h.icu_beds, 10) - 15
        ELSE 5
    END
FROM hospitals h
CROSS JOIN (
    VALUES ('icu'), ('emergency'), ('general')
) AS rt(room_type)
WHERE h.is_active = TRUE
ON CONFLICT (hospital_id, room_type) DO NOTHING;
