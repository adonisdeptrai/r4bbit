# Supabase Migrations

## Overview

Thư mục này chứa các SQL migration files để setup Supabase database cho R4B application.

## Migration Files

| File | Mô tả |
|------|-------|
| `001_schema.sql` | Core tables (users, products, orders, reviews, etc.) |
| `002_rls_policies.sql` | Row Level Security policies |
| `003_functions_triggers.sql` | Functions, triggers, RPC |
| `004_storage.sql` | Storage buckets & policies |

## Cách chạy

### Option 1: Supabase Dashboard (Recommended)

1. Mở [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn project của bạn
3. Vào **SQL Editor**
4. Copy và paste từng file theo thứ tự:
   - `001_schema.sql`
   - `002_rls_policies.sql`
   - `003_functions_triggers.sql`
   - `004_storage.sql`
5. Click **Run** cho mỗi file

### Option 2: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_ID

# Push migrations
supabase db push
```

## Sau khi chạy migrations

1. **Verify tables:** Kiểm tra trong Table Editor
2. **Test RLS:** Thử query với auth user
3. **Check triggers:** Tạo test user qua signup

## Rollback

Nếu cần rollback, chạy:

```sql
-- Drop all tables (CAREFUL - destroys data!)
DROP TABLE IF EXISTS public.wishlist CASCADE;
DROP TABLE IF EXISTS public.ticket_messages CASCADE;
DROP TABLE IF EXISTS public.tickets CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.product_keys CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.is_admin CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP FUNCTION IF EXISTS public.update_product_rating CASCADE;
DROP FUNCTION IF EXISTS public.update_product_sales CASCADE;
DROP FUNCTION IF EXISTS public.assign_license_key CASCADE;
DROP FUNCTION IF EXISTS public.get_admin_stats CASCADE;
DROP FUNCTION IF EXISTS public.complete_order CASCADE;

-- Drop sequence
DROP SEQUENCE IF EXISTS order_seq;
```
