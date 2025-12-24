-- ============================================
-- Migration 007: Seed Data
-- ============================================
-- Sample data for development and testing

-- ============================================
-- Seed: Blood Banks
-- ============================================
INSERT INTO blood_banks (name, code, address, city, state, latitude, longitude, phone, emergency_phone, is_verified, is_24_hours, total_storage_capacity) VALUES
('Nepal Red Cross Blood Bank', 'NRCBB-KTM', 'Exhibition Road', 'Kathmandu', 'Bagmati', 27.7051, 85.3153, '+977-1-4228094', '+977-1-4228095', true, true, 1000),
('Bir Hospital Blood Center', 'BH-BC', 'Mahaboudha', 'Kathmandu', 'Bagmati', 27.7048, 85.3137, '+977-1-4221988', '+977-1-4221989', true, true, 500),
('Grande Hospital Blood Bank', 'GH-BB', 'Dhapasi', 'Kathmandu', 'Bagmati', 27.7469, 85.3244, '+977-1-4004000', '+977-1-4004001', true, true, 400),
('Norvic Hospital Blood Bank', 'NH-BB', 'Thapathali', 'Kathmandu', 'Bagmati', 27.6947, 85.3209, '+977-1-4258554', '+977-1-4258555', true, true, 350),
('Patan Hospital Blood Bank', 'PH-BB', 'Lagankhel', 'Lalitpur', 'Bagmati', 27.6680, 85.3249, '+977-1-5522266', '+977-1-5522267', true, true, 450),
('Bhaktapur Blood Bank', 'BBB', 'Suryabinayak', 'Bhaktapur', 'Bagmati', 27.6716, 85.4298, '+977-1-6614477', '+977-1-6614478', true, false, 200),
('Pokhara Blood Bank', 'PBB', 'New Road', 'Pokhara', 'Gandaki', 28.2096, 83.9856, '+977-61-521234', '+977-61-521235', true, true, 300),
('Biratnagar Red Cross', 'BRC-BB', 'Main Road', 'Biratnagar', 'Koshi', 26.4525, 87.2718, '+977-21-525252', '+977-21-525253', true, false, 250);

-- ============================================
-- Seed: Blood Inventory for each blood bank
-- ============================================
-- Generate inventory for each blood bank and blood type
INSERT INTO blood_inventory (blood_bank_id, blood_type, units_available, total_capacity, weekly_demand_avg)
SELECT 
    bb.id,
    bt.blood_type,
    -- Random units between 10 and 80
    10 + floor(random() * 70)::integer,
    100,
    -- Random demand between 5 and 20
    5 + floor(random() * 15)::decimal
FROM blood_banks bb
CROSS JOIN (
    VALUES 
        ('A+'::blood_type_enum), ('A-'::blood_type_enum),
        ('B+'::blood_type_enum), ('B-'::blood_type_enum),
        ('AB+'::blood_type_enum), ('AB-'::blood_type_enum),
        ('O+'::blood_type_enum), ('O-'::blood_type_enum)
) AS bt(blood_type)
ON CONFLICT (blood_bank_id, blood_type) DO UPDATE SET
    units_available = EXCLUDED.units_available,
    weekly_demand_avg = EXCLUDED.weekly_demand_avg;

-- ============================================
-- Seed: Hospitals
-- ============================================
INSERT INTO hospitals (name, address, city, state, latitude, longitude, phone, emergency_phone, is_verified, blood_bank_available, is_24_hours, total_beds, icu_beds) VALUES
('Tribhuvan University Teaching Hospital', 'Maharajgunj', 'Kathmandu', 'Bagmati', 27.7381, 85.3321, '+977-1-4412303', '+977-1-4412707', true, true, true, 500, 50),
('Bir Hospital', 'Mahaboudha', 'Kathmandu', 'Bagmati', 27.7048, 85.3137, '+977-1-4221988', '+977-1-4221989', true, true, true, 600, 60),
('Grande International Hospital', 'Dhapasi', 'Kathmandu', 'Bagmati', 27.7469, 85.3244, '+977-1-4004000', '+977-1-4004001', true, true, true, 300, 40),
('Norvic International Hospital', 'Thapathali', 'Kathmandu', 'Bagmati', 27.6947, 85.3209, '+977-1-4258554', '+977-1-4258555', true, true, true, 250, 35),
('Patan Hospital', 'Lagankhel', 'Lalitpur', 'Bagmati', 27.6680, 85.3249, '+977-1-5522266', '+977-1-5522267', true, true, true, 400, 45),
('Bhaktapur Hospital', 'Suryabinayak', 'Bhaktapur', 'Bagmati', 27.6716, 85.4298, '+977-1-6614477', '+977-1-6614478', true, false, true, 200, 20),
('Western Regional Hospital', 'Ramghat', 'Pokhara', 'Gandaki', 28.2103, 83.9856, '+977-61-520066', '+977-61-520067', true, true, true, 350, 40),
('BP Koirala Institute', 'Dharan', 'Sunsari', 'Koshi', 26.8123, 87.2833, '+977-25-525555', '+977-25-525556', true, true, true, 700, 70);

-- ============================================
-- Seed: Sample Donations Events
-- ============================================
INSERT INTO donation_events (name, description, event_type, venue_name, address, city, state, latitude, longitude, start_time, end_time, max_donors, status) VALUES
('World Blood Donor Day Campaign', 'Annual blood donation drive celebrating World Blood Donor Day', 'blood_drive', 'Ratna Park', 'Ratna Park, New Road', 'Kathmandu', 'Bagmati', 27.7067, 85.3106, NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '8 hours', 200, 'upcoming'),
('Corporate Blood Drive - Tech Park', 'Blood donation event for tech companies', 'corporate', 'Softwarica IT Park', 'Dillibazar', 'Kathmandu', 'Bagmati', 27.7046, 85.3262, NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days' + INTERVAL '6 hours', 100, 'registration_open'),
('Emergency Drive - Accident Victims', 'Emergency blood drive for accident victims', 'emergency_drive', 'Bir Hospital Campus', 'Mahaboudha', 'Kathmandu', 'Bagmati', 27.7048, 85.3137, NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '10 hours', 150, 'registration_open'),
('College Blood Donation Camp', 'Annual blood donation camp at Tribhuvan University', 'blood_drive', 'TU Main Campus', 'Kirtipur', 'Kathmandu', 'Bagmati', 27.6815, 85.2858, NOW() + INTERVAL '21 days', NOW() + INTERVAL '21 days' + INTERVAL '7 hours', 300, 'upcoming'),
('Mobile Blood Collection - Lalitpur', 'Mobile blood collection unit visiting Lalitpur areas', 'mobile_collection', 'Patan Durbar Square', 'Patan', 'Lalitpur', 'Bagmati', 27.6727, 85.3250, NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '5 hours', 50, 'upcoming');

-- ============================================
-- Refresh Materialized Views
-- ============================================
-- Note: Run this after seed to populate materialized views
-- REFRESH MATERIALIZED VIEW mv_city_donor_stats;
-- REFRESH MATERIALIZED VIEW mv_monthly_donation_trends;

-- ============================================
-- Log seed completion
-- ============================================
DO $$
BEGIN
    RAISE NOTICE 'Seed data inserted successfully!';
    RAISE NOTICE 'Blood Banks: 8';
    RAISE NOTICE 'Blood Inventory Records: 64 (8 banks x 8 blood types)';
    RAISE NOTICE 'Hospitals: 8';
    RAISE NOTICE 'Donation Events: 5';
END $$;
