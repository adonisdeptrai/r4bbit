-- Migration: Create product_keys table
-- Description: License keys/product access codes with foreign key relationships

-- Create key status enum
CREATE TYPE key_status AS ENUM ('available', 'sold', 'reserved');

-- Create product_keys table
CREATE TABLE product_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    key TEXT NOT NULL UNIQUE,
    status key_status NOT NULL DEFAULT 'available',
    order_id UUID, -- FK constraint will be added after orders table is created
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_product_keys_product_id ON product_keys(product_id);
CREATE INDEX idx_product_keys_status ON product_keys(status);
CREATE INDEX idx_product_keys_product_status ON product_keys(product_id, status);
CREATE INDEX idx_product_keys_user_id ON product_keys(user_id);

-- Add comments
COMMENT ON TABLE product_keys IS 'License keys and product access codes';
COMMENT ON COLUMN product_keys.status IS 'Key availability status';
