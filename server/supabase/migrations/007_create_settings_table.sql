-- Migration: Create settings table
-- Description: Application settings (singleton table)

-- Create settings table
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_config JSONB DEFAULT '{}'::jsonb,
    binance_config JSONB DEFAULT '{}'::jsonb,
    crypto_config JSONB DEFAULT '{"enabled": false, "networks": []}'::jsonb,
    exchange_rate NUMERIC(12, 2) NOT NULL DEFAULT 25000,
    is_auto_check_enabled BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Ensure only one settings record exists (singleton pattern)
CREATE UNIQUE INDEX idx_settings_singleton ON settings ((id IS NOT NULL));

-- Insert default settings record
INSERT INTO settings (id) VALUES (gen_random_uuid());

-- Trigger to prevent deletion of the singleton record
CREATE OR REPLACE FUNCTION prevent_settings_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Cannot delete settings record. Update it instead.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_settings_delete
    BEFORE DELETE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION prevent_settings_delete();

-- Trigger to auto-update timestamp
CREATE OR REPLACE FUNCTION update_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_settings_timestamp
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_settings_timestamp();

-- Add comments
COMMENT ON TABLE settings IS 'Application settings (singleton table - only one record allowed)';
COMMENT ON COLUMN settings.bank_config IS 'TPBank configuration: {bankId, accountNo, accountName, username, password, deviceId}';
COMMENT ON COLUMN settings.binance_config IS 'Binance API configuration: {apiKey, secretKey}';
COMMENT ON COLUMN settings.crypto_config IS 'Crypto payment configuration: {enabled, networks: [{network, currency, walletAddress, qrCodeUrl, enabled}]}';
COMMENT ON COLUMN settings.exchange_rate IS 'USD to VND exchange rate';

-- Note: Encryption should be handled in application layer using existing encryption.js utility
