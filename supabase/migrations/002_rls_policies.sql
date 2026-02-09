-- =============================================
-- R4B Supabase Migration: Row Level Security
-- Run this AFTER 001_schema.sql
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTION: Check if user is admin
-- =============================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- USERS POLICIES
-- =============================================
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id 
        AND role = (SELECT role FROM public.users WHERE id = auth.uid()) -- Can't change own role
    );

CREATE POLICY "Admins can view all users"
    ON public.users FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can update all users"
    ON public.users FOR UPDATE
    USING (public.is_admin());

-- =============================================
-- PRODUCTS POLICIES
-- =============================================
CREATE POLICY "Anyone can view active products"
    ON public.products FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can view all products"
    ON public.products FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can insert products"
    ON public.products FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products"
    ON public.products FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins can delete products"
    ON public.products FOR DELETE
    USING (public.is_admin());

-- =============================================
-- ORDERS POLICIES
-- =============================================
CREATE POLICY "Users can view own orders"
    ON public.orders FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create own orders"
    ON public.orders FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all orders"
    ON public.orders FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can update orders"
    ON public.orders FOR UPDATE
    USING (public.is_admin());

-- =============================================
-- PRODUCT KEYS POLICIES
-- =============================================
CREATE POLICY "Users can view own keys"
    ON public.product_keys FOR SELECT
    USING (used_by = auth.uid());

CREATE POLICY "Admins can manage all keys"
    ON public.product_keys FOR ALL
    USING (public.is_admin());

-- =============================================
-- REVIEWS POLICIES
-- =============================================
CREATE POLICY "Anyone can view reviews"
    ON public.reviews FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
    ON public.reviews FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
    ON public.reviews FOR DELETE
    USING (auth.uid() = user_id OR public.is_admin());

-- =============================================
-- TICKETS POLICIES
-- =============================================
CREATE POLICY "Users can view own tickets"
    ON public.tickets FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can create tickets"
    ON public.tickets FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update tickets"
    ON public.tickets FOR UPDATE
    USING (public.is_admin());

-- =============================================
-- TICKET MESSAGES POLICIES
-- =============================================
CREATE POLICY "Users can view messages in own tickets"
    ON public.ticket_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.tickets 
            WHERE id = ticket_id AND (user_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Users can add messages to own tickets"
    ON public.ticket_messages FOR INSERT
    WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.tickets 
            WHERE id = ticket_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can add messages to any ticket"
    ON public.ticket_messages FOR INSERT
    WITH CHECK (public.is_admin());

-- =============================================
-- SETTINGS POLICIES
-- =============================================
CREATE POLICY "Anyone can view settings"
    ON public.settings FOR SELECT
    USING (true);

CREATE POLICY "Admins can update settings"
    ON public.settings FOR ALL
    USING (public.is_admin());

-- =============================================
-- WISHLIST POLICIES
-- =============================================
CREATE POLICY "Users can view own wishlist"
    ON public.wishlist FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage own wishlist"
    ON public.wishlist FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete from own wishlist"
    ON public.wishlist FOR DELETE
    USING (user_id = auth.uid());
