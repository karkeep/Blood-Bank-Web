-- ============================================
-- Migration 000: Enable Extensions
-- ============================================
-- Run this first to enable required PostgreSQL extensions

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for spatial queries (nearby donor search)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable pg_trgm for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable unaccent for search normalization
CREATE EXTENSION IF NOT EXISTS unaccent;
