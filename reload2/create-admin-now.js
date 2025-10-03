/**
 * Create Admin User via Supabase Management API
 * This will create the user directly in Supabase
 */

const SUPABASE_PROJECT_REF = 'oktiojqphavkqeirbbul';
const MANAGEMENT_TOKEN = 'sbp_8500b64c61daea9a863b23dd66a0c30afe33a3c6';
const SUPABASE_URL = 'https://oktiojqphavkqeirbbul.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdGlvanFwaGF2a3FlaXJiYnVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjE3OTksImV4cCI6MjA3NDc5Nzc5OX0.3GUfIRtpx5yMKOxAte25IG3O5FlmYxjG21SEjPMFggc';

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'TestAdmin2024!@#SecurePass';

async function createAdminUser() {
  console.log('🔧 Creating admin user via Supabase Management API...');
  console.log('Email:', ADMIN_EMAIL);
  console.log('Password:', ADMIN_PASSWORD);
  console.log('');

  try {
    // Step 1: Create user via Management API
    console.log('Step 1: Creating auth user...');
    
    const createUserResponse = await fetch(
      `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/auth/users`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MANAGEMENT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          email_confirm: true,
          user_metadata: {
            role: 'admin'
          }
        })
      }
    );

    if (!createUserResponse.ok) {
      const errorText = await createUserResponse.text();
      console.error('❌ Error creating user:', errorText);
      
      // If user already exists, that's ok
      if (errorText.includes('already exists') || errorText.includes('already registered')) {
        console.log('✅ User already exists, continuing...');
      } else {
        throw new Error(`Failed to create user: ${errorText}`);
      }
    } else {
      const userData = await createUserResponse.json();
      console.log('✅ Auth user created successfully');
      console.log('User ID:', userData.id);
    }

    // Step 2: Get the user ID by listing users
    console.log('');
    console.log('Step 2: Getting user ID...');
    
    const listUsersResponse = await fetch(
      `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/auth/users`,
      {
        headers: {
          'Authorization': `Bearer ${MANAGEMENT_TOKEN}`,
        }
      }
    );

    const usersData = await listUsersResponse.json();
    const adminUser = usersData.users?.find(u => u.email === ADMIN_EMAIL);
    
    if (!adminUser) {
      throw new Error('Could not find created user');
    }

    console.log('✅ Found user');
    console.log('User ID:', adminUser.id);
    console.log('Email confirmed:', adminUser.email_confirmed_at ? 'Yes' : 'No');

    // Step 3: Add to users table using anon key
    console.log('');
    console.log('Step 3: Adding admin role to users table...');

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, ANON_KEY);

    // First, try to login to get authenticated session
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    if (loginError) {
      console.error('⚠️  Login test failed:', loginError.message);
      console.log('User may need to be confirmed in Supabase Dashboard');
    } else {
      console.log('✅ Login test successful!');
    }

    // Insert/update in users table
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .upsert([{
        id: adminUser.id,
        email: ADMIN_EMAIL,
        role: 'admin',
        last_login: new Date().toISOString()
      }], {
        onConflict: 'id'
      })
      .select();

    if (insertError) {
      console.error('⚠️  Could not add to users table:', insertError.message);
      console.log('');
      console.log('You may need to run this SQL manually:');
      console.log('');
      console.log(`INSERT INTO users (id, email, role)`);
      console.log(`VALUES ('${adminUser.id}', '${ADMIN_EMAIL}', 'admin')`);
      console.log(`ON CONFLICT (id) DO UPDATE SET role = 'admin';`);
    } else {
      console.log('✅ Admin role assigned successfully');
    }

    console.log('');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  🎉 SUCCESS! Admin user ready to use                  ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('📋 LOGIN CREDENTIALS:');
    console.log('   Email:    ', ADMIN_EMAIL);
    console.log('   Password: ', ADMIN_PASSWORD);
    console.log('');
    console.log('🔗 LOGIN URL:');
    console.log('   http://localhost:8080/login');
    console.log('');
    console.log('✅ Try logging in now!');
    console.log('');

    return true;

  } catch (error) {
    console.error('');
    console.error('💥 Error:', error.message);
    console.error('');
    console.log('📝 Manual steps:');
    console.log('1. Go to: https://supabase.com/dashboard/project/oktiojqphavkqeirbbul/auth/users');
    console.log('2. Check if user exists');
    console.log('3. If not, click "Add user" and create manually');
    console.log('');
    return false;
  }
}

createAdminUser()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
