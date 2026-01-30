-- Migration: Add foreign key constraints
-- Description: Add FK constraints that require tables to exist first

-- Add order_id FK to product_keys
ALTER TABLE product_keys
    ADD CONSTRAINT fk_product_keys_order
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;
