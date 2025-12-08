import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file manually since dotenv might not be installed
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
    console.log('Please add VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key to your .env file');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const users = [
    { email: 'admin@servify.com', password: 'password123', role: 'admin', name: 'System Admin' },
    { email: 'vendor@servify.com', password: 'password123', role: 'vendor', name: 'John Vendor' },
    { email: 'customer@servify.com', password: 'password123', role: 'customer', name: 'Alice Customer' }
];

async function seedUsers() {
    console.log('--- Seeding Users ---');

    for (const user of users) {
        console.log(`\nCreating ${user.role}: ${user.email}...`);

        // 1. Create User in Auth
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true,
            user_metadata: { name: user.name }
        });

        if (authError) {
            console.error(`❌ Failed to create auth user: ${authError.message}`);
            // If user already exists, we try to fetch their ID to ensure role assignment
            if (authError.message.includes('already registered')) {
                console.log('User already exists, attempting to assign role...');
                // Note: We can't easily get the ID of an existing user without listing them, 
                // but for this script we'll assume we might need to delete them first if we want a clean slate.
                // For now, let's just skip.
            }
            continue;
        }

        const userId = authUser.user.id;
        console.log(`✅ Auth user created (ID: ${userId})`);

        // 2. Assign Role in public.user_roles
        const { error: roleError } = await supabase
            .from('user_roles')
            .upsert({ user_id: userId, role: user.role });

        if (roleError) {
            console.error(`❌ Failed to assign role: ${roleError.message}`);
        } else {
            console.log(`✅ Role '${user.role}' assigned`);
        }

        // 3. Create Vendor Profile if needed
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

    console.log('\n✨ Seeding complete!');
}

seedUsers();
