const SUPABASE_URL = 'https://oktiojqphavkqeirbbul.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdGlvanFwaGF2a3FlaXJiYnVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIyMTc5OSwiZXhwIjoyMDc0Nzk3Nzk5fQ.poQL_q2pDavh7unnpAYpFGV4qJg2UCOWYxkwqx1qJZU';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdGlvanFwaGF2a3FlaXJiYnVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjE3OTksImV4cCI6MjA3NDc5Nzc5OX0.3GUfIRtpx5yMKOxAte25IG3O5FlmYxjG21SEjPMFggc';

async function createAdminUser() {
    console.log('🚀 Creating admin user using service role key...');
    
    try {
        // Step 1: Try to create user using auth admin endpoint with service role
        console.log('📧 Step 1: Creating admin user in auth system...');
        
        const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
            method: 'POST',
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@example.com',
                password: '123',
                data: {
                    role: 'admin'
                }
            })
        });

        let authUserId = null;
        
        if (authResponse.ok) {
            const authData = await authResponse.json();
            authUserId = authData.user?.id;
            console.log('✅ Admin user created in auth system');
            console.log(`   User ID: ${authUserId}`);
        } else {
            const errorText = await authResponse.text();
            if (errorText.includes('already registered') || errorText.includes('already in use')) {
                console.log('✅ Admin user already exists in auth system');
                
                // Try to get the existing user
                const signInResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
                    method: 'POST',
                    headers: {
                        'apikey': ANON_KEY,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: 'admin@example.com',
                        password: '123'
                    })
                });
                
                if (signInResponse.ok) {
                    const signInData = await signInResponse.json();
                    authUserId = signInData.user?.id;
                    console.log(`✅ Found existing user ID: ${authUserId}`);
                }
            } else {
                console.log('⚠️  Could not create auth user, will try database only');
            }
        }

        // Step 2: Create user record in the users table
        console.log('📋 Step 2: Creating user record in database...');
        
        let userIdToUse = authUserId;
        
        // If we don't have an auth user ID, generate a UUID for the database record
        if (!userIdToUse) {
            userIdToUse = '00000000-0000-0000-0000-000000000001'; // Fixed ID for database-only admin
            console.log('📝 Using fixed ID for database-only admin user');
        }
        
        const dbResponse = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                'apikey': ANON_KEY,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                id: userIdToUse,
                email: 'admin@example.com',
                role: 'admin'
            })
        });

        if (!dbResponse.ok) {
            const errorText = await dbResponse.text();
            if (errorText.includes('duplicate key') || errorText.includes('already exists')) {
                console.log('✅ User record already exists in database');
                
                // Update the existing record to ensure it has admin role
                const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userIdToUse}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                        'apikey': ANON_KEY,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        role: 'admin'
                    })
                });
                
                if (updateResponse.ok) {
                    console.log('✅ User record updated with admin role');
                } else {
                    console.log('⚠️  Could not update user record, but it may already be correct');
                }
            } else {
                throw new Error(`Failed to create user record: ${errorText}`);
            }
        } else {
            const dbData = await dbResponse.json();
            console.log('✅ User record created successfully in database');
        }

        // Step 3: Verify the setup
        console.log('🔍 Step 3: Verifying setup...');
        
        const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.admin@example.com`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                'apikey': ANON_KEY,
            }
        });

        if (!verifyResponse.ok) {
            throw new Error('Failed to verify user record');
        }

        const verifyData = await verifyResponse.json();
        if (verifyData.length > 0) {
            const userRecord = verifyData[0];
            console.log('✅ Setup verified successfully!');
            console.log(`   - Email: ${userRecord.email}`);
            console.log(`   - Role: ${userRecord.role}`);
            console.log(`   - ID: ${userRecord.id}`);
        } else {
            throw new Error('User record not found after creation');
        }

        console.log('\n🎉 Admin user setup completed successfully!');
        console.log('\n📋 Admin User Details:');
        console.log(`   - Email: admin@example.com`);
        console.log(`   - Password: 123`);
        console.log(`   - Role: admin`);
        console.log(`   - User ID: ${userIdToUse}`);
        console.log('\n🌐 You can now access:');
        console.log(`   - Dashboard: http://localhost:8084/`);
        console.log(`   - Admin Panel: http://localhost:8084/admin`);
        console.log('\n🔐 Login credentials:');
        console.log(`   - Email: admin@example.com`);
        console.log(`   - Password: 123`);
        console.log('\n⚠️  Note: If you still cannot login, you may need to:');
        console.log('   1. Check that the auth user exists in Supabase dashboard');
        console.log('   2. Verify email confirmation is not required');
        console.log('   3. Check Row Level Security policies');

        return true;

    } catch (error) {
        console.error('❌ Error during setup:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Check if the service role key is valid');
        console.log('2. Ensure the Supabase project is active');
        console.log('3. Verify you have internet connection');
        console.log('4. Check if the database tables exist');
        console.log('5. Try creating the user manually in Supabase dashboard');
        
        console.log('\n📋 Manual creation steps:');
        console.log('1. Go to your Supabase project dashboard');
        console.log('2. Authentication > Users > Create new user');
        console.log('   - Email: admin@example.com');
        console.log('   - Password: 123');
        console.log('3. Table Editor > users table');
        console.log('   - Insert record: email=admin@example.com, role=admin');
        
        return false;
    }
}

// Run the setup
createAdminUser()
    .then((success) => {
        if (success) {
            console.log('\n✨ Admin user should be ready! Try logging in at http://localhost:8084/admin 🚀');
            process.exit(0);
        } else {
            console.log('\n💥 Setup failed, but manual instructions provided above');
            process.exit(1);
        }
    })
    .catch((error) => {
        console.error('💥 Critical error:', error);
        process.exit(1);
    });
