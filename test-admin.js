import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

const getEnvValue = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim() : null;
};

const SUPABASE_URL = getEnvValue('VITE_SUPABASE_URL');
const SERVICE_ROLE_KEY = getEnvValue('VITE_SUPABASE_SERVICE_ROLE_KEY');

console.log('URL:', SUPABASE_URL);
console.log('Key length:', SERVICE_ROLE_KEY ? SERVICE_ROLE_KEY.length : 0);

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function testAdmin() {
    console.log('--- Testing Admin Connection ---');

    // 1. Try to list users (limit 1)
    console.log('\n1. Listing 1 user...');
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });

    if (error) {
        console.error('❌ List users failed:', error.message);
    } else {
        console.log('✅ List users success. Count:', data.users.length);
    }

    // 2. Try to query a public table
    console.log('\n2. Querying service_categories...');
    const { data: cats, error: dbError } = await supabase.from('service_categories').select('count');

    if (dbError) {
        console.error('❌ DB query failed:', dbError.message);
    } else {
        console.log('✅ DB query success.');
    }
}

testAdmin();
