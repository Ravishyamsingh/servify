-- Delete users from auth.users (cascades to public tables)
DELETE FROM auth.users WHERE email IN ('admin@servify.com', 'vendor@servify.com', 'customer@servify.com');
