-- Migration: Create products table
-- Description: Product catalog with pricing and inventory

-- Create product type enum
CREATE TYPE product_type AS ENUM ('Automation Script', 'MMO Tool', 'Course', 'License Key');

-- Create products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    type product_type NOT NULL DEFAULT 'Automation Script',
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(12, 2) CHECK (original_price >= 0),
    description TEXT DEFAULT '',
    image TEXT DEFAULT '',
    features JSONB DEFAULT '[]'::jsonb,
    stock INTEGER NOT NULL DEFAULT 0,
    unlimited_stock BOOLEAN NOT NULL DEFAULT false,
    platform_id TEXT DEFAULT '',
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Add comments
COMMENT ON TABLE products IS 'Product catalog with pricing and inventory management';
COMMENT ON COLUMN products.features IS 'Array of feature descriptions stored as JSON';
COMMENT ON COLUMN products.unlimited_stock IS 'If true, stock is ignored and product is always available';
