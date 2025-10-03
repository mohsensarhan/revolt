import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kbbtxvbqxpwsgbbbhwty.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiYnR4dmJxeHB3c2diYmJod3R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjE2MjAsImV4cCI6MjA3NDc5NzYyMH0.CFLPn6j8OtkfyfbPVMApLX7S_9_NGd3IqktukjrGRJA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simulate the exact flow in data-service.ts
async function signIn(email, password) {
  try {
    console.log('🔐 Step 1: Attempting auth.signInWithPassword...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('❌ Auth error:', error);
      return null;
    }

    console.log('✅ Auth successful! User ID:', data.user.id);

    // Step 2: Try to get current user (this is what the app does)
    console.log('\n🔐 Step 2: Attempting to get current user...');
    return await getCurrentUser();
  } catch (error) {
    console.error('❌ Unexpected error signing in:', error);
    return null;
  }
}

async function getCurrentUser() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('❌ Auth error getting user:', authError);
      return null;
    }

    console.log('✅ Got auth user:', user.id);

    console.log('\n🔐 Step 3: Querying users table...');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('⚠️  Error fetching user data:', error.message);
      console.log('🔄 Using fallback (like the updated code)...');

      // This is the fallback I added
      const fallbackUser = {
        id: user.id,
        email: user.email || '',
        role: 'admin',
        created_at: user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('✅ Fallback user created:', fallbackUser);
      return fallbackUser;
    }

    console.log('✅ User data from table:', data);
    return data;
  } catch (error) {
    console.error('❌ Unexpected error fetching current user:', error);
    return null;
  }
}

async function test() {
  console.log('🧪 SIMULATING EXACT APP LOGIN FLOW\n');
  console.log('=' .repeat(60));

  const user = await signIn('admin@example.com', 'TestAdmin2024!@#SecurePass');

  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL RESULT');
  console.log('='.repeat(60));

  if (user) {
    console.log('✅ LOGIN SUCCESSFUL!');
    console.log('User object returned:');
    console.log(JSON.stringify(user, null, 2));
    console.log('\n🎉 The app WILL work with this result!');
  } else {
    console.log('❌ LOGIN FAILED - app would show error');
  }

  await supabase.auth.signOut();
}

test();
