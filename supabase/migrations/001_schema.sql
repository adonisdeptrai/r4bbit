-- =============================================
-- R4B Supabase Migration: Core Tables
-- Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. USERS (extends auth.users)
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'seller')),
    balance DECIMAL(12,2) DEFAULT 0,
    avatar_url TEXT,
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.users IS 'User profiles extending Supabase auth.users';

-- =============================================
-- 2. PRODUCTS
-- =============================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('Automation Script', 'MMO Tool', 'Course', 'License Key')),
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    image_url TEXT,
    features TEXT[] DEFAULT '{}',
    rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    sales INTEGER DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    stock INTEGER,
    unlimited_stock BOOLEAN DEFAULT false,
    platform TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.products IS 'Digital products for sale';

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_products_type ON public.products(type);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);

-- =============================================
-- 3. ORDERS
-- =============================================
CREATE SEQUENCE IF NOT EXISTS order_seq START 1000;

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT UNIQUE NOT NULL DEFAULT 'ORD-' || LPAD(nextval('order_seq')::TEXT, 6, '0'),
    user_id UUID NOT NULL REFERENCES public.users(id),
    product_id UUID REFERENCES public.products(id),
    product_title TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'pending_verification', 'processing', 'paid', 'completed', 'refunded', 'failed')),
    payment_method TEXT,
    payment_code TEXT,
    invoice_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.orders IS 'Customer orders';

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_code ON public.orders(payment_code);

-- =============================================
-- 4. PRODUCT KEYS (License Keys)
-- =============================================
CREATE TABLE IF NOT EXISTS public.product_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    key_value TEXT NOT NULL,
    is_used BOOLEAN DEFAULT false,
    used_by UUID REFERENCES public.users(id),
    used_at TIMESTAMPTZ,
    order_id UUID REFERENCES public.orders(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.product_keys IS 'License keys for products';

CREATE INDEX IF NOT EXISTS idx_product_keys_product_id ON public.product_keys(product_id);
CREATE INDEX IF NOT EXISTS idx_product_keys_is_used ON public.product_keys(is_used);

-- =============================================
-- 5. REVIEWS
-- =============================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, user_id)
);

COMMENT ON TABLE public.reviews IS 'Product reviews (one per user per product)';

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);

-- =============================================
-- 6. TICKETS (Support)
-- =============================================
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    subject TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'pending', 'resolved', 'closed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id),
    message TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.tickets IS 'Support tickets';
COMMENT ON TABLE public.ticket_messages IS 'Messages within support tickets';

-- =============================================
-- 7. SETTINGS (Key-Value Store)
-- =============================================
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.settings IS 'Application settings (key-value store)';

-- Insert default settings
INSERT INTO public.settings (key, value) VALUES 
    ('exchangeRate', '25000'::jsonb),
    ('bank', '{"bankId": "", "accountNo": "", "accountName": ""}'::jsonb),
    ('crypto', '{"enabled": false, "networks": []}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- 8. WISHLIST
-- =============================================
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

COMMENT ON TABLE public.wishlist IS 'User wishlists';

CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist(user_id);
