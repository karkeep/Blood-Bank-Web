-- ============================================
-- Migration 005: Inventory Domain
-- ============================================
-- Blood banks, inventory management, and supply chain tracking

-- ============================================
-- Table: blood_banks
-- ============================================
CREATE TABLE blood_banks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic information
    name TEXT NOT NULL,
    code TEXT UNIQUE, -- Official registration code
    type location_type_enum DEFAULT 'blood_bank' NOT NULL,
    
    -- Organization
    organization_name TEXT,
    license_number TEXT,
    
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
    
    -- Operating hours
    operating_hours JSONB DEFAULT '{}'::JSONB,
    is_24_hours BOOLEAN DEFAULT FALSE,
    
    -- Capacity
    total_storage_capacity INTEGER DEFAULT 500,
    refrigeration_units INTEGER DEFAULT 10,
    
    -- Services available
    services JSONB DEFAULT '{
        "whole_blood": true,
        "platelets": true,
        "plasma": true,
        "red_cells": true,
        "testing": true,
        "mobile_collection": false
    }'::JSONB,
    
    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Statistics
    total_collections INTEGER DEFAULT 0,
    total_distributions INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_blood_banks_city ON blood_banks(city);
CREATE INDEX idx_blood_banks_location ON blood_banks(latitude, longitude);
CREATE INDEX idx_blood_banks_active ON blood_banks(is_active) WHERE is_active = TRUE;

-- ============================================
-- Table: blood_inventory
-- ============================================
CREATE TABLE blood_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blood_bank_id UUID REFERENCES blood_banks(id) ON DELETE CASCADE NOT NULL,
    blood_type blood_type_enum NOT NULL,
    
    -- Stock levels
    units_available INTEGER NOT NULL DEFAULT 0 CHECK (units_available >= 0),
    total_capacity INTEGER NOT NULL DEFAULT 100 CHECK (total_capacity > 0),
    reserved_units INTEGER DEFAULT 0 CHECK (reserved_units >= 0),
    expiring_soon INTEGER DEFAULT 0 CHECK (expiring_soon >= 0), -- Units expiring in 7 days
    
    -- Computed fields (updated via trigger - cannot use GENERATED AS due to IMMUTABLE requirement)
    status inventory_status_enum DEFAULT 'adequate',
    fill_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Forecasting data
    weekly_demand_avg DECIMAL(8,2) DEFAULT 0,
    weekly_supply_avg DECIMAL(8,2) DEFAULT 0,
    days_until_stockout INTEGER DEFAULT 999,
    
    -- Alert settings
    alert_threshold_pct INTEGER DEFAULT 20 CHECK (alert_threshold_pct BETWEEN 0 AND 100),
    is_alerted BOOLEAN DEFAULT FALSE,
    last_alert_at TIMESTAMPTZ,
    
    -- Timestamps
    last_restocked_at TIMESTAMPTZ,
    last_distributed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Unique constraint
    UNIQUE(blood_bank_id, blood_type)
);

-- Indexes
CREATE INDEX idx_blood_inventory_bank ON blood_inventory(blood_bank_id);
CREATE INDEX idx_blood_inventory_type ON blood_inventory(blood_type);
CREATE INDEX idx_blood_inventory_status ON blood_inventory(status);
CREATE INDEX idx_blood_inventory_critical ON blood_inventory(blood_bank_id, blood_type) 
    WHERE status IN ('critical', 'low');

-- ============================================
-- Table: inventory_transactions
-- ============================================
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID REFERENCES blood_inventory(id) ON DELETE CASCADE NOT NULL,
    
    -- Transaction type
    transaction_type TEXT NOT NULL CHECK (transaction_type IN (
        'donation_received', 'transfer_in', 'purchase',
        'used_for_patient', 'transfer_out', 'expired', 'discarded', 'reserved'
    )),
    
    -- Quantity
    quantity INTEGER NOT NULL,
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    
    -- Reference
    reference_type TEXT, -- 'donation', 'request', 'transfer', 'expiry'
    reference_id UUID,
    
    -- Details
    notes TEXT,
    performed_by UUID REFERENCES users(id),
    
    -- For transfers
    from_blood_bank_id UUID REFERENCES blood_banks(id),
    to_blood_bank_id UUID REFERENCES blood_banks(id),
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_inventory_transactions_inventory ON inventory_transactions(inventory_id, created_at DESC);
CREATE INDEX idx_inventory_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX idx_inventory_transactions_date ON inventory_transactions(created_at DESC);

-- ============================================
-- Table: inventory_alerts
-- ============================================
CREATE TABLE inventory_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID REFERENCES blood_inventory(id) ON DELETE CASCADE NOT NULL,
    blood_bank_id UUID REFERENCES blood_banks(id) ON DELETE CASCADE NOT NULL,
    
    -- Alert info
    alert_type TEXT NOT NULL CHECK (alert_type IN (
        'critical_level', 'low_level', 'expiring_soon', 'stockout', 'surplus'
    )),
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    message TEXT NOT NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_inventory_alerts_active ON inventory_alerts(blood_bank_id, is_active) 
    WHERE is_active = TRUE;

-- ============================================
-- Table: donation_events (Blood Drives)
-- ============================================
CREATE TABLE donation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic info
    name TEXT NOT NULL,
    description TEXT,
    event_type TEXT DEFAULT 'blood_drive' CHECK (event_type IN (
        'blood_drive', 'mobile_collection', 'emergency_drive', 'corporate'
    )),
    
    -- Organization
    organizer_id UUID REFERENCES users(id),
    blood_bank_id UUID REFERENCES blood_banks(id),
    
    -- Location
    venue_name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    
    -- Schedule
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    registration_deadline TIMESTAMPTZ,
    
    -- Capacity
    max_donors INTEGER DEFAULT 100,
    registered_count INTEGER DEFAULT 0,
    actual_donations INTEGER DEFAULT 0,
    
    -- Status
    status TEXT DEFAULT 'upcoming' CHECK (status IN (
        'draft', 'upcoming', 'registration_open', 'in_progress', 'completed', 'cancelled'
    )),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT valid_event_time CHECK (end_time > start_time)
);

-- Indexes
CREATE INDEX idx_donation_events_date ON donation_events(start_time);
CREATE INDEX idx_donation_events_city ON donation_events(city);
CREATE INDEX idx_donation_events_status ON donation_events(status);

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE blood_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_events ENABLE ROW LEVEL SECURITY;

-- Blood banks: Public read
CREATE POLICY blood_banks_select ON blood_banks
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY blood_banks_admin ON blood_banks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin')
        )
    );

-- Blood inventory: Public read, admin write
CREATE POLICY blood_inventory_select ON blood_inventory
    FOR SELECT USING (TRUE);

CREATE POLICY blood_inventory_admin ON blood_inventory
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin')
        )
    );

-- Inventory transactions: Admin only
CREATE POLICY inventory_transactions_admin ON inventory_transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin')
        )
    );

-- Inventory alerts: Admin only
CREATE POLICY inventory_alerts_admin ON inventory_alerts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin')
        )
    );

-- Donation events: Public read
CREATE POLICY donation_events_select ON donation_events
    FOR SELECT USING (status != 'draft');

CREATE POLICY donation_events_manage ON donation_events
    FOR ALL USING (
        organizer_id = auth.uid()::UUID
        OR EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin', 'volunteer')
        )
    );

-- ============================================
-- Triggers
-- ============================================

CREATE TRIGGER trg_blood_banks_updated_at
    BEFORE UPDATE ON blood_banks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_donation_events_updated_at
    BEFORE UPDATE ON donation_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Compute inventory status, fill_percentage, and days_until_stockout
-- These cannot be GENERATED ALWAYS columns due to IMMUTABLE requirement
CREATE OR REPLACE FUNCTION compute_inventory_status()
RETURNS TRIGGER AS $$
DECLARE
    v_fill_ratio DECIMAL;
BEGIN
    -- Calculate fill ratio
    IF NEW.total_capacity > 0 THEN
        v_fill_ratio := NEW.units_available::DECIMAL / NEW.total_capacity;
    ELSE
        v_fill_ratio := 0;
    END IF;
    
    -- Compute fill_percentage
    NEW.fill_percentage := ROUND(v_fill_ratio * 100, 2);
    
    -- Compute status based on fill ratio
    IF v_fill_ratio <= 0.1 THEN
        NEW.status := 'critical';
    ELSIF v_fill_ratio <= 0.25 THEN
        NEW.status := 'low';
    ELSIF v_fill_ratio >= 0.9 THEN
        NEW.status := 'surplus';
    ELSIF v_fill_ratio >= 0.7 THEN
        NEW.status := 'good';
    ELSE
        NEW.status := 'adequate';
    END IF;
    
    -- Compute days_until_stockout
    IF NEW.weekly_demand_avg > 0 THEN
        NEW.days_until_stockout := FLOOR(NEW.units_available / (NEW.weekly_demand_avg / 7))::INTEGER;
    ELSE
        NEW.days_until_stockout := 999;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_compute_inventory_status
    BEFORE INSERT OR UPDATE ON blood_inventory
    FOR EACH ROW EXECUTE FUNCTION compute_inventory_status();

-- Auto-log inventory changes
CREATE OR REPLACE FUNCTION log_inventory_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.units_available != NEW.units_available THEN
        INSERT INTO inventory_transactions (
            inventory_id,
            transaction_type,
            quantity,
            quantity_before,
            quantity_after
        ) VALUES (
            NEW.id,
            CASE 
                WHEN NEW.units_available > OLD.units_available THEN 'donation_received'
                ELSE 'used_for_patient'
            END,
            ABS(NEW.units_available - OLD.units_available),
            OLD.units_available,
            NEW.units_available
        );
    END IF;
    
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_inventory_change
    BEFORE UPDATE ON blood_inventory
    FOR EACH ROW EXECUTE FUNCTION log_inventory_change();

-- Auto-create alerts for critical inventory
CREATE OR REPLACE FUNCTION check_inventory_alerts()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'critical' AND (OLD IS NULL OR OLD.status != 'critical') THEN
        INSERT INTO inventory_alerts (
            inventory_id, blood_bank_id, alert_type, severity, message
        )
        SELECT 
            NEW.id, 
            NEW.blood_bank_id, 
            'critical_level', 
            'critical',
            'Critical level: ' || NEW.blood_type || ' at ' || bb.name || ' - only ' || NEW.units_available || ' units available'
        FROM blood_banks bb WHERE bb.id = NEW.blood_bank_id;
        
        NEW.is_alerted = TRUE;
        NEW.last_alert_at = NOW();
    ELSIF NEW.status = 'low' AND (OLD IS NULL OR OLD.status NOT IN ('critical', 'low')) THEN
        INSERT INTO inventory_alerts (
            inventory_id, blood_bank_id, alert_type, severity, message
        )
        SELECT 
            NEW.id, 
            NEW.blood_bank_id, 
            'low_level', 
            'warning',
            'Low level: ' || NEW.blood_type || ' at ' || bb.name || ' - ' || NEW.units_available || ' units available'
        FROM blood_banks bb WHERE bb.id = NEW.blood_bank_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_inventory_alerts
    AFTER INSERT OR UPDATE ON blood_inventory
    FOR EACH ROW EXECUTE FUNCTION check_inventory_alerts();

-- ============================================
-- Helper Functions
-- ============================================

-- Get city-wide inventory status
CREATE OR REPLACE FUNCTION get_city_inventory_status(p_city TEXT)
RETURNS TABLE (
    blood_type blood_type_enum,
    total_units INTEGER,
    total_capacity INTEGER,
    fill_percentage DECIMAL,
    status inventory_status_enum,
    blood_banks_count INTEGER,
    critical_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bi.blood_type,
        SUM(bi.units_available)::INTEGER AS total_units,
        SUM(bi.total_capacity)::INTEGER AS total_capacity,
        ROUND((SUM(bi.units_available)::DECIMAL / NULLIF(SUM(bi.total_capacity), 0)) * 100, 2) AS fill_percentage,
        CASE 
            WHEN (SUM(bi.units_available)::DECIMAL / NULLIF(SUM(bi.total_capacity), 0)) <= 0.1 THEN 'critical'
            WHEN (SUM(bi.units_available)::DECIMAL / NULLIF(SUM(bi.total_capacity), 0)) <= 0.25 THEN 'low'
            WHEN (SUM(bi.units_available)::DECIMAL / NULLIF(SUM(bi.total_capacity), 0)) >= 0.7 THEN 'good'
            ELSE 'adequate'
        END::inventory_status_enum AS status,
        COUNT(DISTINCT bb.id)::INTEGER AS blood_banks_count,
        COUNT(DISTINCT bi.id) FILTER (WHERE bi.status = 'critical')::INTEGER AS critical_count
    FROM blood_inventory bi
    JOIN blood_banks bb ON bi.blood_bank_id = bb.id
    WHERE bb.city = p_city AND bb.is_active = TRUE
    GROUP BY bi.blood_type
    ORDER BY bi.blood_type;
END;
$$ LANGUAGE plpgsql STABLE;

-- Update inventory units
CREATE OR REPLACE FUNCTION update_inventory_units(
    p_blood_bank_id UUID,
    p_blood_type blood_type_enum,
    p_change INTEGER,
    p_transaction_type TEXT DEFAULT 'donation_received'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_inventory blood_inventory%ROWTYPE;
BEGIN
    SELECT * INTO v_inventory
    FROM blood_inventory
    WHERE blood_bank_id = p_blood_bank_id AND blood_type = p_blood_type
    FOR UPDATE;
    
    IF v_inventory IS NULL THEN
        -- Create inventory record if doesn't exist
        INSERT INTO blood_inventory (blood_bank_id, blood_type, units_available)
        VALUES (p_blood_bank_id, p_blood_type, GREATEST(0, p_change));
    ELSE
        -- Update existing record
        UPDATE blood_inventory
        SET units_available = GREATEST(0, units_available + p_change)
        WHERE id = v_inventory.id;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
