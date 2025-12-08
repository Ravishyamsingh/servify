import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file manually
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

const getEnvValue = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim() : null;
};

const SUPABASE_URL = getEnvValue('VITE_SUPABASE_URL');
const SERVICE_ROLE_KEY = getEnvValue('VITE_SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY in .env file');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const targetEmails = ['admin@servify.com', 'vendor@servify.com', 'customer@servify.com'];

const users = [
    { email: 'admin@servify.com', password: 'password123', role: 'admin', name: 'System Admin' },
    { email: 'vendor@servify.com', password: 'password123', role: 'vendor', name: 'John Vendor' },
    { email: 'customer@servify.com', password: 'password123', role: 'customer', name: 'Alice Customer' }
];

async function resetUsers() {
    console.log('--- Resetting Users ---');

    // 1. List and Delete existing users
    console.log('\n1. Cleaning up existing users...');
    const { data: { users: existingUsers }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('❌ Failed to list users:', listError.message);
        return;
    }

    for (const user of existingUsers) {
        if (targetEmails.includes(user.email)) {
            console.log(`Deleting ${user.email}...`);
            const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
            if (deleteError) {
                console.error(`❌ Failed to delete ${user.email}:`, deleteError.message);
            } else {
                console.log(`✅ Deleted ${user.email}`);
            }
        }
    }

    // 2. Recreate Users
    console.log('\n2. Creating new users...');
    for (const user of users) {
        console.log(`\nCreating ${user.role}: ${user.email}...`);

        // Create User in Auth
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true,
            user_metadata: { name: user.name }
        });

        if (authError) {
            console.error(`❌ Failed to create auth user: ${authError.message}`);
            continue;
        }

        const userId = authUser.user.id;
        console.log(`✅ Auth user created (ID: ${userId})`);

        // Assign Role in public.user_roles
        const { error: roleError } = await supabase
            .from('user_roles')
            .upsert({ user_id: userId, role: user.role });

        if (roleError) {
            console.error(`❌ Failed to assign role: ${roleError.message}`);
        } else {
            console.log(`✅ Role '${user.role}' assigned`);
        }

        // Create Vendor Profile if needed
        if (user.role === 'vendor') {
            const { error: vendorError } = await supabase
                .from('vendors')
                .upsert({
                    id: userId,
                    business_name: "John's Repairs",
                    city: "Mumbai",
                    is_verified: true
                });

            if (vendorError) {
                console.error(`❌ Failed to create vendor profile: ${vendorError.message}`);
            } else {
                console.log(`✅ Vendor profile created`);
            }
        }
    }

    console.log('\n✨ Reset complete! You can now log in.');
}

resetUsers();
