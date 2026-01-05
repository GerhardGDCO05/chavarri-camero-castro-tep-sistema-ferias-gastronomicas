-- ============================================
-- DATABASE: auth_service
-- ============================================
CREATE DATABASE auth_service;
\c auth_service;

CREATE SCHEMA public;

-- ============================================
-- USERS TABLE (Autenticación)
-- ============================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('cliente', 'emprendedor', 'organizador')),
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- LOGGING TABLE (AOP)
-- ============================================
CREATE TABLE public.api_logs (
    id BIGSERIAL PRIMARY KEY,
    route VARCHAR(255) NOT NULL,
    method VARCHAR(20) NOT NULL,
    user_id UUID NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    status_code INT NOT NULL,
    message TEXT
);
