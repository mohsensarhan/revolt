import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kbbtxvbqxpwsgbbbhwty.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiYnR4dmJxeHB3c2diYmJod3R5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIyMTYyMCwiZXhwIjoyMDc0Nzk3NjIwfQ.j0l5E7wS0XHkEuqmo7kpsnEF9wpk2DBKO2qL4hCaV6Q';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiYnR4dmJxeHB3c2diYmJod3R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjE2MjAsImV4cCI6MjA3NDc5NzYyMH0.C7cYRM_uh2Mux7xsEa3VKx8b93u7AIZR--hXX3p67eU';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verify() {
  console.log('🔍 Verifying admin setup...\n');

  // 1. Check if user exists in Auth
  console.log('1️⃣ Checking Auth users...');
  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

  if (listError) {
    console.error('❌ Error listing users:', listError);
    return;
  }

  const adminAuthUser = users.find(u => u.email === 'admin@example.com');
  if (adminAuthUser) {
    console.log('✅ Admin user exists in Auth');
    console.log('   ID:', adminAuthUser.id);
    console.log('   Email:', adminAuthUser.email);
    console.log('   Email confirmed:', adminAuthUser.email_confirmed_at ? 'Yes' : 'No');
  } else {
    console.log('❌ Admin user NOT found in Auth');
    return;
  }

  // 2. Check if user exists in users table
  console.log('\n2️⃣ Checking users table...');
  const { data: usersData, error: usersError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', 'admin@example.com');

  if (usersError) {
    console.error('❌ Error querying users table:', usersError);
  } else if (usersData && usersData.length > 0) {
    console.log('✅ Admin user exists in users table');
    console.log('   Data:', JSON.stringify(usersData[0], null, 2));
  } else {
    console.log('❌ Admin user NOT found in users table');
  }

  // 3. Try to sign in
  console.log('\n3️⃣ Testing sign in...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'admin@example.com',
    password: 'TestAdmin2024!@#SecurePass'
  });

  if (signInError) {
    console.error('❌ Sign in failed:', signInError.message);

    // If email not confirmed, let's confirm it
    if (signInError.message.includes('Email not confirmed') || signInError.message.includes('not confirmed')) {
      console.log('\n4️⃣ Email not confirmed. Confirming now...');
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        adminAuthUser.id,
        { email_confirm: true }
      );

      if (updateError) {
        console.error('❌ Error confirming email:', updateError);
      } else {
        console.log('✅ Email confirmed! Try logging in again.');
      }
    }
  } else {
    console.log('✅ Sign in successful!');
    console.log('   User ID:', signInData.user.id);
    console.log('   Email:', signInData.user.email);
  }
}

verify();
