-- Migration: Create orders table
-- Description: Order records with payment tracking and verification

-- Create order status enum
CREATE TYPE order_status AS ENUM ('pending', 'completed', 'processing', 'paid', 'refunded', 'pending_verification', 'failed');

-- Create order type enum
CREATE TYPE order_type AS ENUM ('product_purchase', 'balance_topup');

-- Create orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL UNIQUE,
    "user" TEXT NOT NULL,
    product TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    status order_status NOT NULL DEFAULT 'pending',
    method TEXT NOT NULL,
    order_type order_type NOT NULL DEFAULT 'product_purchase',
    verified_at TIMESTAMP WITH TIME ZONE,
    manual_verify JSONB DEFAULT '{}'::jsonb,
    assigned_keys JSONB DEFAULT '[]'::jsonb,
    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Function to auto-generate order_id
CREATE OR REPLACE FUNCTION generate_order_id()
RETURNS TEXT AS $$
BEGIN
    RETURN 'ORD-' || LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order_id before insert
CREATE OR REPLACE FUNCTION set_order_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_id IS NULL OR NEW.order_id = '' THEN
        NEW.order_id := generate_order_id();
        -- Ensure uniqueness
        WHILE EXISTS (SELECT 1 FROM orders WHERE order_id = NEW.order_id) LOOP
            NEW.order_id := generate_order_id();
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_id
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_id();

-- Create indexes
CREATE INDEX idx_orders_user ON orders("user");
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(date DESC);
CREATE INDEX idx_orders_order_id ON orders(order_id);
CREATE INDEX idx_orders_method ON orders(method);
CREATE INDEX idx_orders_user_status ON orders("user", status);
CREATE INDEX idx_orders_status_date ON orders(status, date DESC);
CREATE INDEX idx_orders_user_date ON orders("user", date DESC);

-- Add comments
COMMENT ON TABLE orders IS 'Order records with payment tracking';
COMMENT ON COLUMN orders.manual_verify IS 'JSONB object: {verified, verifiedBy, verifiedAt, transactionId, note, receivedAmount}';
COMMENT ON COLUMN orders.assigned_keys IS 'Array of product key IDs assigned to this order';
