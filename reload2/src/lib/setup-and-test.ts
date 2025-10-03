import { setupDatabase, createExecFunction } from './database-setup';
import { dataService } from './data-service';

export async function initializeSystem() {
  console.log('🚀 Initializing EFB Dashboard System with Supabase...');
  
  try {
    // Step 1: Create database function
    console.log('📋 Step 1: Creating database function...');
    await createExecFunction();
    
    // Step 2: Setup database schema
    console.log('🏗️ Step 2: Setting up database schema...');
    await setupDatabase();
    
    // Step 3: Test database connection
    console.log('🔌 Step 3: Testing database connection...');
    const isConnected = await dataService.checkConnection();
    
    if (isConnected) {
      console.log('✅ Database connection successful!');
      
      // Step 4: Test data retrieval
      console.log('📊 Step 4: Testing data retrieval...');
      const metrics = await dataService.getExecutiveMetrics();
      
      if (metrics) {
        console.log('✅ Executive metrics loaded successfully!');
        console.log('📈 Current Metrics:');
        console.log(`   - Meals Delivered: ${metrics.meals_delivered.toLocaleString()}`);
        console.log(`   - People Served: ${metrics.people_served.toLocaleString()}`);
        console.log(`   - Cost Per Meal: EGP ${metrics.cost_per_meal}`);
        console.log(`   - Program Efficiency: ${metrics.program_efficiency}%`);
        console.log(`   - Coverage: ${metrics.coverage_governorates}/27 governorates`);
      } else {
        console.log('⚠️  No executive metrics found (this is normal for first run)');
      }
      
      // Step 5: Test real-time subscription
      console.log('🔄 Step 5: Testing real-time capabilities...');
      const unsubscribe = dataService.subscribeToExecutiveMetrics((updatedMetrics) => {
        console.log('📡 Real-time update received:', updatedMetrics);
      });
      
      // Wait a moment then unsubscribe
      setTimeout(() => {
        if (unsubscribe) unsubscribe();
        console.log('✅ Real-time subscription test completed');
      }, 2000);
      
      console.log('\n🎉 System initialization completed successfully!');
      console.log('\n📝 Next Steps:');
      console.log('1. Visit http://localhost:8084/ to see the dashboard');
      console.log('2. Visit http://localhost:8084/admin to access the admin panel');
      console.log('3. Create an admin user in Supabase Auth to access admin features');
      console.log('4. Use the admin panel to manage metrics and users');
      
      return true;
    } else {
      console.error('❌ Database connection failed!');
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Check your Supabase project URL and keys');
      console.log('2. Ensure your Supabase project is active');
      console.log('3. Verify internet connection');
      console.log('4. Check Supabase service status');
      
      return false;
    }
    
  } catch (error) {
    console.error('❌ System initialization failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure you have a valid Supabase project');
    console.log('2. Check your environment variables in .env.local');
    console.log('3. Verify Supabase credentials are correct');
    console.log('4. Make sure you have internet access');
    
    return false;
  }
}

// Auto-run initialization if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - don't auto-run
  console.log('📱 Browser environment detected. Run initializeSystem() manually.');
} else {
  // Node.js environment - auto-run
  initializeSystem()
    .then((success) => {
      if (success) {
        console.log('\n✨ All systems go! 🚀');
        process.exit(0);
      } else {
        console.log('\n💥 Initialization failed. Please check the errors above.');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Critical error during initialization:', error);
      process.exit(1);
    });
}
