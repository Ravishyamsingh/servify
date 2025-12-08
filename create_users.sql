-- Enable pgcrypto for password hashing
create extension if not exists pgcrypto;

-- 1. Create Admin User (admin@servify.com / password123)
WITH new_admin AS (
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@servify.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"System Admin"}',
    now(),
    now()
  ) RETURNING id
)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM new_admin;

-- 2. Create Vendor User (vendor@servify.com / password123)
WITH new_vendor AS (
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'vendor@servify.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"John Vendor"}',
    now(),
    now()
  ) RETURNING id
)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'vendor' FROM new_vendor;

-- 3. Create Customer User (customer@servify.com / password123)
WITH new_customer AS (
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'customer@servify.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Alice Customer"}',
    now(),
    now()
  ) RETURNING id
)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'customer' FROM new_customer;
