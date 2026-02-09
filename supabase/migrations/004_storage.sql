-- =============================================
-- R4B Supabase Migration: Storage Buckets
-- Run this in Supabase SQL Editor OR use Dashboard
-- =============================================

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    2097152, -- 2MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for QR codes (payment)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'qr-codes',
    'qr-codes',
    true,
    1048576, -- 1MB limit
    ARRAY['image/png', 'image/jpeg']
)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- Storage Policies
-- =============================================

-- Product Images: Anyone can view, admins can upload
CREATE POLICY "Public can view product images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'product-images' 
        AND public.is_admin()
    );

CREATE POLICY "Admins can delete product images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'product-images' 
        AND public.is_admin()
    );

-- Avatars: Anyone can view, users can upload own
CREATE POLICY "Public can view avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars' 
        AND (storage.foldername(name))[1] = auth.uid()::TEXT
    );

CREATE POLICY "Users can delete own avatar"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'avatars' 
        AND (storage.foldername(name))[1] = auth.uid()::TEXT
    );

-- QR Codes: Anyone can view, admins can manage
CREATE POLICY "Public can view QR codes"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'qr-codes');

CREATE POLICY "Admins can manage QR codes"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'qr-codes' 
        AND public.is_admin()
    );
