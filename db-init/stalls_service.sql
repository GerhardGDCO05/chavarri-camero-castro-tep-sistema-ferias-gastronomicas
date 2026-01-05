-- ============================================
-- DATABASE: stalls_service
-- ============================================
CREATE DATABASE stalls_service;
\c stalls_service;

CREATE SCHEMA public;

-- ============================================
-- STALLS (Puestos gastronómicos)
-- ============================================
CREATE TABLE public.stalls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL, -- Referido al Auth Service
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pendiente', 'aprobado', 'activo')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stalls_owner_id ON public.stalls(owner_id);

-- ============================================
-- LOGGING TABLE
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
