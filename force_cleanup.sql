-- Force cleanup of users and related data

-- 1. Delete from public tables first (to avoid constraint issues if cascade fails)
DELETE FROM public.user_roles;
DELETE FROM public.vendors;
DELETE FROM public.profiles;
DELETE FROM public.bookings;

-- 2. Delete from auth.users
-- Try deleting by email
DELETE FROM auth.users WHERE email IN ('admin@servify.com', 'vendor@servify.com', 'customer@servify.com');

-- 3. Delete by metadata (in case email matching fails)
DELETE FROM auth.users WHERE raw_user_meta_data->>'name' IN ('System Admin', 'John Vendor', 'Alice Customer');

-- 4. Verify emptiness (optional, just for feedback)
SELECT count(*) as remaining_users FROM auth.users;
