-- Migration: Create transactions table
-- Description: Financial transaction ledger with balance tracking

-- Create transaction type enum
CREATE TYPE transaction_type AS ENUM ('topup', 'purchase', 'refund', 'admin_adjustment');

-- Create transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    balance_before NUMERIC(12, 2) NOT NULL,
    balance_after NUMERIC(12, 2) NOT NULL,
    description TEXT DEFAULT '',
    related_order UUID REFERENCES orders(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_user_created ON transactions(user_id, created_at DESC);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- Add comments
COMMENT ON TABLE transactions IS 'Financial transaction ledger with balance tracking';
COMMENT ON COLUMN transactions.balance_before IS 'User balance before this transaction';
COMMENT ON COLUMN transactions.balance_after IS 'User balance after this transaction';
COMMENT ON COLUMN transactions.created_by IS 'Admin user who created this transaction (for manual adjustments)';
