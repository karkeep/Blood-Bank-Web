-- ============================================
-- Migration 001: Enum Types
-- ============================================
-- All custom enum types for the blood bank application

-- Blood types (universal medical standard)
CREATE TYPE blood_type_enum AS ENUM (
    'A+', 'A-', 
    'B+', 'B-', 
    'AB+', 'AB-', 
    'O+', 'O-'
);

-- User account status
CREATE TYPE account_status_enum AS ENUM (
    'active',
    'suspended',
    'deactivated',
    'pending_verification',
    'deleted'
);

-- Donor eligibility status
CREATE TYPE eligibility_enum AS ENUM (
    'eligible',
    'ineligible',
    'temporarily_ineligible',
    'pending',
    'unknown'
);

-- Verification status (used across multiple tables)
CREATE TYPE verification_enum AS ENUM (
    'unverified',
    'pending',
    'verified',
    'rejected',
    'expired'
);

-- Donor badge levels (gamification)
CREATE TYPE badge_enum AS ENUM (
    'newcomer',
    'bronze',
    'silver',
    'gold',
    'platinum',
    'diamond',
    'legend'
);

-- Emergency request urgency levels
CREATE TYPE urgency_enum AS ENUM (
    'normal',
    'urgent',
    'critical',
    'life_threatening'
);

-- Emergency request status workflow
CREATE TYPE request_status_enum AS ENUM (
    'draft',
    'pending',
    'matching',
    'donors_found',
    'partially_fulfilled',
    'fulfilled',
    'cancelled',
    'expired'
);

-- Blood inventory status
CREATE TYPE inventory_status_enum AS ENUM (
    'critical',
    'low',
    'adequate',
    'good',
    'surplus'
);

-- Donation type
CREATE TYPE donation_type_enum AS ENUM (
    'regular',
    'emergency',
    'apheresis',
    'directed',
    'autologous'
);

-- Donation record status
CREATE TYPE donation_status_enum AS ENUM (
    'scheduled',
    'confirmed',
    'checked_in',
    'in_progress',
    'completed',
    'cancelled',
    'no_show',
    'deferred'
);

-- Gender enum
CREATE TYPE gender_enum AS ENUM (
    'male',
    'female',
    'other',
    'prefer_not_to_say'
);

-- Blood component types
CREATE TYPE blood_component_enum AS ENUM (
    'whole_blood',
    'red_cells',
    'platelets',
    'plasma',
    'cryoprecipitate',
    'all'
);

-- User role enum
CREATE TYPE user_role_enum AS ENUM (
    'donor',
    'requester',
    'volunteer',
    'moderator',
    'admin',
    'superadmin'
);

-- Notification type enum
CREATE TYPE notification_type_enum AS ENUM (
    'emergency_request',
    'request_match',
    'donation_reminder',
    'eligibility_reminder',
    'verification_update',
    'achievement',
    'system',
    'promotional'
);

-- Document type enum
CREATE TYPE document_type_enum AS ENUM (
    'government_id',
    'medical_record',
    'blood_test',
    'prescription',
    'consent_form',
    'other'
);

-- Location type enum
CREATE TYPE location_type_enum AS ENUM (
    'hospital',
    'blood_bank',
    'donation_center',
    'mobile_unit',
    'clinic'
);

-- Donor availability status
CREATE TYPE availability_status_enum AS ENUM (
    'available',
    'unavailable',
    'busy',
    'on_vacation',
    'temporarily_unavailable'
);
