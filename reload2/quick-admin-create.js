/**
 * Quick Admin User Creator
 * Run this to create an admin user that you can immediately login with
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oktiojqphavkqeirbbul.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdGlvanFwaGF2a3FlaXJiYnVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjE3OTksImV4cCI6MjA3NDc5Nzc5OX0.3GUfIRtpx5yMKOxAte25IG3O5FlmYxjG21SEjPMFggc';

// Test credentials
const TEST_EMAIL = 'admin@example.com';
const TEST_PASSWORD = 'TestAdmin2024!@#SecurePass';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdminUser() {
  console.log('🔧 Creating admin user...');
  console.log('Email:', TEST_EMAIL);
  console.log('Password:', TEST_PASSWORD);
  console.log('');

  try {
    // Step 1: Sign up the user
    console.log('Step 1: Creating auth user...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      options: {
        emailRedirectTo: undefined,
        data: {
          role: 'admin'
        }
      }
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('✅ User already exists in auth system');
        console.log('');
        console.log('User ID:', signUpData?.user?.id || 'unknown');
      } else {
        console.error('❌ Error creating user:', signUpError.message);
        return false;
      }
    } else {
      console.log('✅ Auth user created successfully');
      console.log('User ID:', signUpData.user?.id);
    }

    // Get the user ID
    const userId = signUpData?.user?.id;
    if (!userId) {
      console.error('❌ Could not get user ID');
      return false;
    }

    // Step 2: Try to login to verify credentials work
    console.log('');
    console.log('Step 2: Testing login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    if (loginError) {
      console.error('❌ Login test failed:', loginError.message);
      console.log('');
      console.log('⚠️  This might be because:');
      console.log('   1. Email confirmation is required');
      console.log('   2. User needs to be confirmed in Supabase Dashboard');
      console.log('');
      console.log('To fix:');
      console.log('   1. Go to: https://supabase.com/dashboard/project/oktiojqphavkqeirbbul/auth/users');
      console.log('   2. Find user:', TEST_EMAIL);
      console.log('   3. Click "Confirm user" if needed');
      console.log('   4. Try login again');
      return false;
    } else {
      console.log('✅ Login test successful!');
      console.log('Session created:', !!loginData.session);
    }

    // Step 3: Add to users table with admin role
    console.log('');
    console.log('Step 3: Adding admin role...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert([{
        id: userId,
        email: TEST_EMAIL,
        role: 'admin',
        last_login: new Date().toISOString()
      }], {
        onConflict: 'id'
      })
      .select();

    if (userError) {
      console.error('❌ Error adding user to users table:', userError.message);
      console.log('');
      console.log('This might be because the users table doesn\'t exist yet.');
      console.log('Run the database setup first: supabase-init.sql');
      return false;
    } else {
      console.log('✅ Admin role assigned successfully');
    }

    console.log('');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  🎉 SUCCESS! Admin user created and ready to use      ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('📋 LOGIN CREDENTIALS:');
    console.log('   Email:    ', TEST_EMAIL);
    console.log('   Password: ', TEST_PASSWORD);
    console.log('');
    console.log('🔗 LOGIN URL:');
    console.log('   http://localhost:8080/login');
    console.log('');
    console.log('✅ You can now login and access the admin panel!');
    console.log('');

    return true;

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return false;
  }
}

// Run it
createAdminUser()
  .then((success) => {
    if (success) {
      process.exit(0);
    } else {
      console.log('');
      console.log('❌ Setup incomplete - see errors above');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
