import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oktiojqphavkqeirbbul.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdGlvanFwaGF2a3FlaXJiYnVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIyMTc5OSwiZXhwIjoyMDc0Nzk3Nzk5fQ.poQL_q2pDavh7unnpAYpFGV4qJg2UCOWYxkwqx1qJZU';

const supabase = createClient(supabaseUrl, serviceKey);

async function updateAdminPassword() {
  try {
    console.log('🔑 Updating admin password to 1234567...');
    
    // First, get the admin user
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError);
      return;
    }
    
    // Find the admin user
    const adminUser = users.users.find(user => user.email === 'admin@example.com');
    
    if (!adminUser) {
      console.error('❌ Admin user not found. Please create admin@example.com first.');
      return;
    }
    
    console.log(`✅ Found admin user: ${adminUser.email} (ID: ${adminUser.id})`);
    
    // Update the admin user's password
    const { data, error } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      { password: '1234567' }
    );
    
    if (error) {
      console.error('❌ Error updating password:', error);
      return;
    }
    
    console.log('✅ Admin password updated successfully!');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 New Password: 1234567');
    console.log('');
    console.log('🌐 You can now login at: http://localhost:8080/login');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

updateAdminPassword();
