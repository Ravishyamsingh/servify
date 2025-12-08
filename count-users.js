import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://hejavmiisdwnuoyjhkei.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlamF2bWlpc2R3bnVveWpoa2VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwOTM4ODQsImV4cCI6MjA4MDY2OTg4NH0.UnjMjbLjj3JbEGGrrPHjTjjRexsHduYZ1QzrlawOeZQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function countUsers() {
    console.log('--- Fetching User Counts ---');

    const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('role');

    if (error) {
        console.error('❌ Failed to fetch user roles:', error.message);
        return;
    }

    const counts = {
        customer: 0,
        vendor: 0,
        admin: 0,
        other: 0
    };

    userRoles.forEach(user => {
        if (counts[user.role] !== undefined) {
            counts[user.role]++;
        } else {
            counts.other++;
        }
    });

    console.log('\n📊 User Distribution:');
    console.table(counts);
    console.log(`\nTotal Users: ${userRoles.length}`);
}

countUsers();
