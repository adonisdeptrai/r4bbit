-- Migration: Create tickets table
-- Description: Support ticket system with messaging

-- Create ticket category enum
CREATE TYPE ticket_category AS ENUM ('Technical Issue', 'Billing', 'Product Key', 'Feature Request', 'Other');

-- Create ticket priority enum
CREATE TYPE ticket_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');

-- Create ticket status enum
CREATE TYPE ticket_status AS ENUM ('Open', 'In Progress', 'Resolved', 'Closed');

-- Create tickets table
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL CHECK (LENGTH(subject) <= 200),
    category ticket_category NOT NULL DEFAULT 'Other',
    priority ticket_priority NOT NULL DEFAULT 'Medium',
    status ticket_status NOT NULL DEFAULT 'Open',
    messages JSONB DEFAULT '[]'::jsonb,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Function to auto-generate ticket_id
CREATE OR REPLACE FUNCTION generate_ticket_id()
RETURNS TEXT AS $$
BEGIN
    RETURN 'TKT-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate ticket_id and update timestamp
CREATE OR REPLACE FUNCTION set_ticket_metadata()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate ticket_id on insert
    IF TG_OP = 'INSERT' THEN
        IF NEW.ticket_id IS NULL OR NEW.ticket_id = '' THEN
            NEW.ticket_id := generate_ticket_id();
            -- Ensure uniqueness
            WHILE EXISTS (SELECT 1 FROM tickets WHERE ticket_id = NEW.ticket_id) LOOP
                NEW.ticket_id := generate_ticket_id();
            END LOOP;
        END IF;
    END IF;
    
    -- Always update timestamp
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_ticket_metadata
    BEFORE INSERT OR UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION set_ticket_metadata();

-- Create indexes
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_user_status ON tickets(user_id, status);
CREATE INDEX idx_tickets_status_updated ON tickets(status, updated_at DESC);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);

-- Add comments
COMMENT ON TABLE tickets IS 'Support ticket system with messaging';
COMMENT ON COLUMN tickets.messages IS 'Array of message objects: {sender, senderRole, message, timestamp}';
