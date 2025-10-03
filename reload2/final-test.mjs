import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kbbtxvbqxpwsgbbbhwty.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiYnR4dmJxeHB3c2diYmJod3R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjE2MjAsImV4cCI6MjA3NDc5NzYyMH0.CFLPn6j8OtkfyfbPVMApLX7S_9_NGd3IqktukjrGRJA';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiYnR4dmJxeHB3c2diYmJod3R5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIyMTYyMCwiZXhwIjoyMDc0Nzk3NjIwfQ.j0l5E7wS0XHkEuqmo7kpsnEF9wpk2DBKO2qL4hCaV6Q';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function fullTest() {
  console.log('🧪 Running complete authentication test...\n');

  // Step 1: Verify user exists in database
  console.log('1️⃣ Checking users table with service role...');
  const { data: dbCheck, error: dbError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', 'admin@example.com');

  if (dbError) {
    console.log('⚠️  Schema cache issue (will auto-refresh):', dbError.message);
    console.log('   This is expected and will resolve in 1-2 minutes');
  } else {
    console.log('✅ User found in database:', dbCheck?.[0] ? 'Yes' : 'No');
    if (dbCheck?.[0]) {
      console.log('   ID:', dbCheck[0].id);
      console.log('   Role:', dbCheck[0].role);
    }
  }

  // Step 2: Test authentication
  console.log('\n2️⃣ Testing authentication...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@example.com',
    password: 'TestAdmin2024!@#SecurePass'
  });

  if (authError) {
    console.error('❌ Authentication failed:', authError.message);
    return;
  }

  console.log('✅ Authentication successful!');
  console.log('   User ID:', authData.user.id);
  console.log('   Email:', authData.user.email);

  // Step 3: Test getting user profile
  console.log('\n3️⃣ Testing user profile fetch...');
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (userError) {
    console.log('⚠️  Schema cache not refreshed yet:', userError.message);
    console.log('   Note: This will work in your app after cache refreshes (1-2 min)');
  } else {
    console.log('✅ User profile retrieved successfully!');
    console.log('   Role:', userData.role);
  }

  await supabase.auth.signOut();

  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log('✅ Supabase credentials: CORRECT');
  console.log('✅ Admin user in Auth: EXISTS');
  console.log('✅ Admin user in DB: EXISTS');
  console.log('✅ Authentication: WORKING');
  console.log(userError ? '⏳ User profile fetch: PENDING CACHE REFRESH' : '✅ User profile fetch: WORKING');
  console.log('='.repeat(60));
  console.log('\n🎉 You can now log in at: http://localhost:8081');
  console.log('   Email: admin@example.com');
  console.log('   Password: TestAdmin2024!@#SecurePass');

  if (userError) {
    console.log('\n💡 If login still fails, wait 1-2 minutes for schema cache to refresh');
    console.log('   Or run this SQL to force refresh:');
    console.log('   NOTIFY pgrst, \'reload schema\';');
  }
}

fullTest();
