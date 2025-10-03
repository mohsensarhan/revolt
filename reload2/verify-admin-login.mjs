import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oktiojqphavkqeirbbul.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdGlvanFwaGF2a3FlaXJiYnVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjE3OTksImV4cCI6MjA3NDc5Nzc5OX0.3GUfIRtpx5yMKOxAte25IG3O5FlmYxjG21SEjPMFggc';

const supabase = createClient(supabaseUrl, anonKey);

async function verifyAdminLogin() {
  try {
    console.log('🔐 Testing admin login with new password...');
    
    // Test login with the new password
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@example.com',
      password: '1234567'
    });
    
    if (error) {
      console.error('❌ Login failed:', error.message);
      return false;
    }
    
    if (data.user) {
      console.log('✅ Login successful!');
      console.log(`👤 User: ${data.user.email}`);
      console.log(`🆔 User ID: ${data.user.id}`);
      console.log(`📅 Last sign in: ${data.user.last_sign_in_at}`);
      
      // Check if user has admin role in the database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();
      
      if (userError) {
        console.log('⚠️  Could not verify admin role in database:', userError.message);
      } else {
        console.log(`🛡️  Database role: ${userData.role}`);
        if (userData.role === 'admin') {
          console.log('✅ User has admin privileges!');
        } else {
          console.log('⚠️  User does not have admin role in database');
        }
      }
      
      // Sign out after verification
      await supabase.auth.signOut();
      console.log('🚪 Signed out after verification');
      
      return true;
    }
    
    return false;
    
  } catch (error) {
    console.error('❌ Unexpected error during verification:', error);
    return false;
  }
}

verifyAdminLogin().then(success => {
  if (success) {
    console.log('');
    console.log('🎉 Admin password change verification completed successfully!');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: 1234567');
    console.log('🌐 Login URL: http://localhost:8080/login');
  } else {
    console.log('');
    console.log('❌ Verification failed. Please check the error messages above.');
  }
});
