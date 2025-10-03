import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kbbtxvbqxpwsgbbbhwty.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiYnR4dmJxeHB3c2diYmJod3R5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIyMTYyMCwiZXhwIjoyMDc0Nzk3NjIwfQ.j0l5E7wS0XHkEuqmo7kpsnEF9wpk2DBKO2qL4hCaV6Q';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  // Get auth user
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const authUser = users.find(u => u.email === 'admin@example.com');

  console.log('Auth user ID:', authUser?.id);

  // Get database user
  const { data: dbUsers } = await supabase.from('users').select('*').eq('email', 'admin@example.com');
  console.log('Database user:', dbUsers?.[0]);

  if (authUser && dbUsers?.[0] && authUser.id !== dbUsers[0].id) {
    console.log('\n⚠️  ID MISMATCH! Fixing...');
    await supabase.from('users').delete().eq('email', 'admin@example.com');
    await supabase.from('users').insert({
      id: authUser.id,
      email: 'admin@example.com',
      role: 'admin'
    });
    console.log('✅ Fixed!');
  }
}

check();
