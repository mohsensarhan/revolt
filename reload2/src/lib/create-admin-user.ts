import { supabaseAdmin } from './supabase';

export async function createAdminUser() {
  console.log('🔧 Creating admin user...');

  // SECURITY: Password should be set via environment variable
  const adminPassword = import.meta.env.VITE_ADMIN_INITIAL_PASSWORD;

  if (!adminPassword || adminPassword.length < 12) {
    console.error('❌ SECURITY ERROR: VITE_ADMIN_INITIAL_PASSWORD must be set and at least 12 characters');
    console.error('   Set this in your .env.local file (NOT committed to git)');
    return false;
  }

  try {
    // Step 1: Create the auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
      email: 'admin@example.com',
      password: adminPassword,
    });

    if (authError) {
      // Check if user already exists
      if (authError.message.includes('already registered')) {
        console.log('✅ Admin user already exists in auth system');
      } else {
        console.error('❌ Error creating auth user:', authError);
        return false;
      }
    } else {
      console.log('✅ Auth user created successfully');
    }

    // Step 2: Get the user ID
    const { data: { user }, error: getUserError } = await supabaseAdmin.auth.getUser();
    
    if (getUserError || !user) {
      console.error('❌ Error getting user info:', getUserError);
      return false;
    }

    // Step 3: Create the user record in the users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .upsert([{
        id: user.id,
        email: 'admin@example.com',
        role: 'admin',
      }])
      .select()
      .single();

    if (userError) {
      console.error('❌ Error creating user record:', userError);
      return false;
    }

    console.log('✅ Admin user record created successfully');
    console.log('📋 Admin User Details:');
    console.log(`   - Email: admin@example.com`);
    console.log(`   - Password: [REDACTED - check your .env.local file]`);
    console.log(`   - Role: admin`);
    console.log(`   - User ID: ${user.id}`);
    
    console.log('\n🎉 Admin user setup completed!');
    console.log('You can now login at http://localhost:8084/admin');
    
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error creating admin user:', error);
    return false;
  }
}

// Auto-run if this file is executed directly
if (typeof window === 'undefined') {
  createAdminUser()
    .then((success) => {
      if (success) {
        console.log('\n✨ Admin user ready! 🚀');
        process.exit(0);
      } else {
        console.log('\n💥 Failed to create admin user');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Critical error:', error);
      process.exit(1);
    });
}
