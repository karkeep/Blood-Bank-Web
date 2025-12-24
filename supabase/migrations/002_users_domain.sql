-- ============================================
-- Migration 002: Users Domain
-- ============================================
-- Core user management tables with authentication, roles, and preferences

-- ============================================
-- Table: users
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Authentication
    firebase_uid TEXT UNIQUE, -- For migration compatibility from Firebase
    email TEXT UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    phone TEXT,
    phone_verified BOOLEAN DEFAULT FALSE,
    
    -- Profile
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    blood_type blood_type_enum NOT NULL,
    date_of_birth DATE,
    gender gender_enum,
    
    -- Location (JSONB for flexibility)
    address JSONB DEFAULT '{}'::JSONB,
    -- Structure: { street, city, state, country, zip_code }
    
    -- PostGIS location for spatial queries
    location GEOGRAPHY(Point, 4326),
    
    -- Account status
    account_status account_status_enum DEFAULT 'active',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_login_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ, -- Soft delete
    
    -- Full-text search vector (auto-generated)
    search_vector TSVECTOR GENERATED ALWAYS AS (
        setweight(to_tsvector('english', COALESCE(full_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(username, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(email, '')), 'C')
    ) STORED,
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~* '^\+?[0-9]{10,15}$')
);

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_blood_type ON users(blood_type);
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid) WHERE firebase_uid IS NOT NULL;
CREATE INDEX idx_users_location ON users USING GIST(location);
CREATE INDEX idx_users_search ON users USING GIN(search_vector);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_active ON users(id) WHERE account_status = 'active' AND deleted_at IS NULL;

-- ============================================
-- Table: user_roles
-- ============================================
-- Supports multiple roles per user
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    role user_role_enum NOT NULL,
    
    -- Permissions (JSONB for flexibility)
    permissions JSONB DEFAULT '{}'::JSONB,
    
    -- Assignment tracking
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ,
    
    -- Notes
    notes TEXT,
    
    -- Unique constraint: one role per user
    UNIQUE(user_id, role)
);

-- Indexes for user_roles
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- ============================================
-- Table: user_preferences
-- ============================================
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Notification preferences
    notification_preferences JSONB DEFAULT '{
        "emergency_email": true,
        "donation_email": true,
        "thank_you_email": true,
        "news_email": false,
        "emergency_push": true,
        "nearby_push": true,
        "emergency_sms": true
    }'::JSONB,
    
    -- Privacy settings
    privacy_settings JSONB DEFAULT '{
        "profile_visibility": "verified_only",
        "show_location": true,
        "show_contact_info": false,
        "show_donation_history": true,
        "allow_analytics": true,
        "allow_research": true
    }'::JSONB,
    
    -- App preferences
    app_preferences JSONB DEFAULT '{
        "theme": "system",
        "language": "en",
        "distance_unit": "km",
        "date_format": "YYYY-MM-DD"
    }'::JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for user_preferences
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- ============================================
-- Table: user_sessions
-- ============================================
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    
    -- Session info
    session_token TEXT UNIQUE NOT NULL,
    device_info JSONB DEFAULT '{}'::JSONB,
    -- Structure: { device_type, os, browser, app_version }
    
    ip_address INET,
    user_agent TEXT,
    
    -- Location at login
    login_location GEOGRAPHY(Point, 4326),
    login_city TEXT,
    login_country TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);

-- Indexes for user_sessions
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON user_sessions(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- ============================================
-- Table: user_verification
-- ============================================
CREATE TABLE user_verification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    
    -- Verification type
    verification_type TEXT NOT NULL, -- 'identity', 'medical', 'address'
    status verification_enum DEFAULT 'unverified' NOT NULL,
    
    -- Documents
    document_urls TEXT[],
    
    -- Verification details
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    -- Expiry
    expires_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Unique constraint
    UNIQUE(user_id, verification_type)
);

-- Index for user_verification
CREATE INDEX idx_user_verification_user_id ON user_verification(user_id);
CREATE INDEX idx_user_verification_status ON user_verification(status);

-- ============================================
-- Row Level Security (RLS) for Users Domain
-- ============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_verification ENABLE ROW LEVEL SECURITY;

-- Users: Users can view public profiles, edit own profile
-- Admins can view and edit all
CREATE POLICY users_select_policy ON users
    FOR SELECT USING (
        deleted_at IS NULL AND (
            account_status = 'active' OR
            auth.uid()::UUID = id OR
            EXISTS (
                SELECT 1 FROM user_roles 
                WHERE user_id = auth.uid()::UUID 
                AND role IN ('admin', 'superadmin', 'moderator')
            )
        )
    );

CREATE POLICY users_update_own ON users
    FOR UPDATE USING (auth.uid()::UUID = id);

CREATE POLICY users_admin_all ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin')
        )
    );

-- User roles: Only admins can manage roles
CREATE POLICY user_roles_select ON user_roles
    FOR SELECT USING (
        user_id = auth.uid()::UUID OR
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin', 'moderator')
        )
    );

CREATE POLICY user_roles_admin_all ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin')
        )
    );

-- User preferences: Users can only access own preferences
CREATE POLICY user_preferences_own ON user_preferences
    FOR ALL USING (user_id = auth.uid()::UUID);

-- User sessions: Users can only see own sessions
CREATE POLICY user_sessions_own ON user_sessions
    FOR ALL USING (user_id = auth.uid()::UUID);

-- User verification: Users can view own, admins can manage all
CREATE POLICY user_verification_select ON user_verification
    FOR SELECT USING (
        user_id = auth.uid()::UUID OR
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin', 'moderator')
        )
    );

CREATE POLICY user_verification_admin ON user_verification
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid()::UUID 
            AND role IN ('admin', 'superadmin', 'moderator')
        )
    );

-- ============================================
-- Triggers for Users Domain
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_user_verification_updated_at
    BEFORE UPDATE ON user_verification
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create user preferences when user is created
CREATE OR REPLACE FUNCTION create_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_preferences (user_id) VALUES (NEW.id);
    -- Also assign default 'donor' role
    INSERT INTO user_roles (user_id, role) VALUES (NEW.id, 'donor');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_user_preferences
    AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION create_user_preferences();

-- ============================================
-- Helper Functions
-- ============================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION user_has_role(p_user_id UUID, p_role user_role_enum)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = p_user_id AND role = p_role
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Get all roles for a user
CREATE OR REPLACE FUNCTION get_user_roles(p_user_id UUID)
RETURNS user_role_enum[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT role FROM user_roles 
        WHERE user_id = p_user_id
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Check if user is admin or superadmin
CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = p_user_id 
        AND role IN ('admin', 'superadmin')
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql STABLE;
