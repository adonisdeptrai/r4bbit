-- =============================================
-- R4B Supabase Migration: Functions & Triggers
-- Run this AFTER 002_rls_policies.sql
-- =============================================

-- =============================================
-- TRIGGER: Auto-update updated_at timestamp
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON public.tickets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- TRIGGER: Auto-create user profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_username TEXT;
    new_referral_code TEXT;
BEGIN
    -- Generate username from metadata or email
    new_username := COALESCE(
        NEW.raw_user_meta_data->>'username',
        split_part(NEW.email, '@', 1)
    );
    
    -- Generate unique referral code
    new_referral_code := 'REF-' || UPPER(SUBSTR(MD5(NEW.id::TEXT), 1, 8));
    
    -- Insert user profile
    INSERT INTO public.users (id, email, username, role, referral_code)
    VALUES (
        NEW.id,
        NEW.email,
        new_username,
        COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
        new_referral_code
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- If username exists, append random suffix
        INSERT INTO public.users (id, email, username, role, referral_code)
        VALUES (
            NEW.id,
            NEW.email,
            new_username || '_' || SUBSTR(MD5(RANDOM()::TEXT), 1, 4),
            COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
            new_referral_code
        );
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- TRIGGER: Update product rating on review change
-- =============================================
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER AS $$
DECLARE
    target_product_id UUID;
BEGIN
    -- Get the product_id from either NEW or OLD
    target_product_id := COALESCE(NEW.product_id, OLD.product_id);
    
    -- Update product rating and review count
    UPDATE public.products
    SET 
        rating = COALESCE(
            (SELECT ROUND(AVG(rating)::NUMERIC, 1) FROM public.reviews WHERE product_id = target_product_id),
            0
        ),
        reviews_count = (SELECT COUNT(*) FROM public.reviews WHERE product_id = target_product_id)
    WHERE id = target_product_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_insert
    AFTER INSERT ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

CREATE TRIGGER on_review_update
    AFTER UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

CREATE TRIGGER on_review_delete
    AFTER DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

-- =============================================
-- TRIGGER: Update product sales count on order completion
-- =============================================
CREATE OR REPLACE FUNCTION public.update_product_sales()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger when status changes to 'completed'
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE public.products
        SET sales = sales + 1
        WHERE id = NEW.product_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_order_completed
    AFTER INSERT OR UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_product_sales();

-- =============================================
-- TRIGGER: Auto-assign license key on order completion
-- =============================================
CREATE OR REPLACE FUNCTION public.assign_license_key()
RETURNS TRIGGER AS $$
DECLARE
    available_key RECORD;
BEGIN
    -- Only for completed orders with License Key products
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Check if product is a License Key type
        IF EXISTS (
            SELECT 1 FROM public.products 
            WHERE id = NEW.product_id AND type = 'License Key'
        ) THEN
            -- Find an available key
            SELECT * INTO available_key
            FROM public.product_keys
            WHERE product_id = NEW.product_id AND is_used = false
            LIMIT 1
            FOR UPDATE SKIP LOCKED;
            
            IF available_key IS NOT NULL THEN
                -- Assign the key
                UPDATE public.product_keys
                SET 
                    is_used = true,
                    used_by = NEW.user_id,
                    used_at = NOW(),
                    order_id = NEW.id
                WHERE id = available_key.id;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_order_assign_key
    AFTER INSERT OR UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.assign_license_key();

-- =============================================
-- RPC: Get dashboard stats (for admin)
-- =============================================
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Check if admin
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;
    
    SELECT json_build_object(
        'totalRevenue', COALESCE((SELECT SUM(amount) FROM public.orders WHERE status = 'completed'), 0),
        'totalOrders', (SELECT COUNT(*) FROM public.orders),
        'pendingOrders', (SELECT COUNT(*) FROM public.orders WHERE status IN ('pending', 'pending_verification')),
        'totalUsers', (SELECT COUNT(*) FROM public.users),
        'totalProducts', (SELECT COUNT(*) FROM public.products WHERE is_active = true),
        'recentOrders', (
            SELECT json_agg(row_to_json(o))
            FROM (
                SELECT id, order_id, product_title, amount, status, created_at
                FROM public.orders
                ORDER BY created_at DESC
                LIMIT 10
            ) o
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RPC: Complete order (atomic operation)
-- =============================================
CREATE OR REPLACE FUNCTION public.complete_order(p_order_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if admin
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;
    
    UPDATE public.orders
    SET status = 'completed', updated_at = NOW()
    WHERE id = p_order_id AND status != 'completed';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
