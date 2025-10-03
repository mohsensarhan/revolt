import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kbbtxvbqxpwsgbbbhwty.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiYnR4dmJxeHB3c2diYmJod3R5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIyMTYyMCwiZXhwIjoyMDc0Nzk3NjIwfQ.j0l5E7wS0XHkEuqmo7kpsnEF9wpk2DBKO2qL4hCaV6Q';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertAdmin() {
  console.log('📝 Inserting admin user into users table...');

  const { data, error } = await supabase
    .from('users')
    .insert({
      id: '3218df1e-f252-4cee-b04d-85353b37d662',
      email: 'admin@example.com',
      role: 'admin'
    })
    .select();

  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Admin user inserted successfully!');
    console.log(data);
    console.log('\n✨ Now try logging in with:');
    console.log('   Email: admin@example.com');
    console.log('   Password: TestAdmin2024!@#SecurePass');
  }
}

insertAdmin();
