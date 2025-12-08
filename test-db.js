import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://hejavmiisdwnuoyjhkei.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlamF2bWlpc2R3bnVveWpoa2VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwOTM4ODQsImV4cCI6MjA4MDY2OTg4NH0.UnjMjbLjj3JbEGGrrPHjTjjRexsHduYZ1QzrlawOeZQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testConnection() {
    console.log('--- Testing Supabase Connection ---');

    // Test 1: Service Categories
    console.log('\n1. Fetching Service Categories...');
    const { data: categories, error: catError } = await supabase
        .from('service_categories')
        .select('name, slug')
        .limit(3);

    if (catError) {
        console.error('❌ Failed to fetch categories:', catError.message);
    } else {
        console.log('✅ Categories fetched successfully:');
        console.table(categories);
    }

    // Test 2: Vendors
    console.log('\n2. Fetching Vendors...');
    const { data: vendors, error: vendError } = await supabase
        .from('vendors')
        .select('business_name, city, rating')
        .limit(3);

    if (vendError) {
        console.error('❌ Failed to fetch vendors:', vendError.message);
    } else {
        console.log('✅ Vendors fetched successfully:');
        if (vendors.length === 0) {
            console.log('(No vendors found in database, but connection is good)');
        } else {
            console.table(vendors);
        }
    }
}

testConnection();
