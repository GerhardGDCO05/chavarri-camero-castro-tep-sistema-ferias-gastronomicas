-- ============================================
-- DATABASE: orders_service
-- ============================================
CREATE DATABASE orders_service;
\c orders_service;

CREATE SCHEMA public;

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL, -- Auth Service
    stall_id UUID NOT NULL,    -- Stall Service
    total NUMERIC(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pendiente', 'preparando', 'listo', 'entregado')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL,
    
    CONSTRAINT fk_order FOREIGN KEY (order_id)
        REFERENCES public.orders(id) ON DELETE CASCADE
);

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);

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
