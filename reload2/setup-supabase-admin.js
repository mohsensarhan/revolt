const SUPABASE_URL = 'https://oktiojqphavkqeirbbul.supabase.co';
const MANAGEMENT_TOKEN = 'sbp_8500b64c61daea9a863b23dd66a0c30afe33a3c6';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdGlvanFwaGF2a3FlaXJiYnVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjE3OTksImV4cCI6MjA3NDc5Nzc5OX0.3GUfIRtpx5yMKOxAte25IG3O5FlmYxjG21SEjPMFggc';

async function setupSupabaseAdmin() {
    console.log('🚀 Setting up Supabase admin user with management token...');
    
    try {
        // Step 1: Create the admin user using the management API
        console.log('📧 Step 1: Creating admin user...');
        
        const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MANAGEMENT_TOKEN}`,
                'apikey': ANON_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@example.com',
                password: '123',
                email_confirm: true
            })
        });

        if (!userResponse.ok) {
            const errorText = await userResponse.text();
            if (errorText.includes('already registered')) {
                console.log('✅ Admin user already exists');
            } else {
                throw new Error(`Failed to create user: ${errorText}`);
            }
        } else {
            const userData = await userResponse.json();
            console.log('✅ Admin user created successfully');
            console.log(`   User ID: ${userData.id}`);
        }

        // Step 2: Get the user ID
        console.log('🔍 Step 2: Getting user ID...');
        
        const getUsersResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${MANAGEMENT_TOKEN}`,
                'apikey': ANON_KEY,
            }
        });

        if (!getUsersResponse.ok) {
            throw new Error('Failed to get users');
        }

        const usersData = await getUsersResponse.json();
        const adminUser = usersData.users.find(user => user.email === 'admin@example.com');
        
        if (!adminUser) {
            throw new Error('Admin user not found after creation');
        }

        console.log(`✅ Found admin user: ${adminUser.id}`);

        // Step 3: Create user record in the users table using service role
        console.log('📋 Step 3: Creating user record in database...');
        
        const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdGlvanFwaGF2a3FlaXJiYnVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIyMTc5OSwiZXhwIjoyMDc0Nzk3Nzk5fQ.poQL_q2pDavh7unnpAYpFGV4qJg2UCOWYxkwqx1qJZU';
        
        const dbResponse = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': ANON_KEY,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                id: adminUser.id,
                email: 'admin@example.com',
                role: 'admin'
            })
        });

        if (!dbResponse.ok) {
            const errorText = await dbResponse.text();
            if (errorText.includes('duplicate key')) {
                console.log('✅ User record already exists in database');
            } else {
                throw new Error(`Failed to create user record: ${errorText}`);
            }
        } else {
            const dbData = await dbResponse.json();
            console.log('✅ User record created successfully in database');
        }

        // Step 4: Verify the setup
        console.log('🔍 Step 4: Verifying setup...');
        
        const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${adminUser.id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': ANON_KEY,
            }
        });

        if (!verifyResponse.ok) {
            throw new Error('Failed to verify user record');
        }

        const verifyData = await verifyResponse.json();
        if (verifyData.length > 0) {
            console.log('✅ Setup verified successfully!');
        } else {
            throw new Error('User record not found after creation');
        }

        console.log('\n🎉 Supabase admin setup completed successfully!');
        console.log('\n📋 Admin User Details:');
        console.log(`   - Email: admin@example.com`);
        console.log(`   - Password: 123`);
        console.log(`   - Role: admin`);
        console.log(`   - User ID: ${adminUser.id}`);
        console.log('\n🌐 You can now access:');
        console.log(`   - Dashboard: http://localhost:8084/`);
        console.log(`   - Admin Panel: http://localhost:8084/admin`);
        console.log('\n🔐 Login credentials:');
        console.log(`   - Email: admin@example.com`);
        console.log(`   - Password: 123`);

        return true;

    } catch (error) {
        console.error('❌ Error during setup:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Check if the management token is valid');
        console.log('2. Ensure the Supabase project is active');
        console.log('3. Verify you have internet connection');
        console.log('4. Check if the database tables exist');
        
        return false;
    }
}

// Run the setup
setupSupabaseAdmin()
    .then((success) => {
        if (success) {
            console.log('\n✨ All systems ready! 🚀');
            process.exit(0);
        } else {
            console.log('\n💥 Setup failed');
            process.exit(1);
        }
    })
    .catch((error) => {
        console.error('💥 Critical error:', error);
        process.exit(1);
    });
