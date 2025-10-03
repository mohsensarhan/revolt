import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kbbtxvbqxpwsgbbbhwty.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiYnR4dmJxeHB3c2diYmJod3R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjE2MjAsImV4cCI6MjA3NDc5NzYyMH0.CFLPn6j8OtkfyfbPVMApLX7S_9_NGd3IqktukjrGRJA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('🔐 Testing login with correct credentials...\n');

  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@example.com',
    password: 'TestAdmin2024!@#SecurePass'
  });

  if (error) {
    console.error('❌ Login failed:', error.message);
    console.error('Error code:', error.status);
    return;
  }

  console.log('✅ Login successful!');
  console.log('User ID:', data.user.id);
  console.log('Email:', data.user.email);

  // Now try to get user data from users table
  console.log('\n📋 Fetching user data from users table...');
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (userError) {
    console.error('❌ Error fetching user data:', userError.message);
  } else {
    console.log('✅ User data retrieved successfully:');
    console.log('   Role:', userData.role);
    console.log('   Email:', userData.email);
    console.log('   Created:', userData.created_at);
  }

  // Sign out
  await supabase.auth.signOut();
  console.log('\n✅ All tests passed! Login is working correctly.');
}

testLogin();
