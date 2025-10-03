
import { createClient } from '@supabase/supabase-js';

// Use the Supabase credentials provided
const supabaseUrl = 'https://oktiojqphavkqeirbbul.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdGlvanFwaGF2a3FlaXJiYnVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjE3OTksImV4cCI6MjA3NDc5Nzc5OX0.3GUfIRtpx5yMKOxAte25IG3O5FlmYxjG21SEjPMFggc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testRealtimeSubscription() {
  console.log('🚀 Testing real-time subscription functionality...
');

  try {
    // First, let's check the current state
    console.log('📊 Checking current database state...');
    const { data: initialData, error: initialError } = await supabase
      .from('executive_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (initialError) {
      console.error('Error fetching initial data:', initialError);
      return;
    }

    console.log('Initial metrics:', initialData);

    // Set up a real-time subscription
    console.log('📡 Setting up real-time subscription...');
    const subscription = supabase
      .channel('executive_metrics_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'executive_metrics'
        },
        (payload) => {
          console.log('📡 Real-time update received:', payload);
          if (payload.new) {
            console.log('📊 Updated metrics:', payload.new);
          }
        }
      )
      .subscribe();

    console.log('✅ Real-time subscription established');

    // Wait a bit for the subscription to be ready
    await sleep(3000);

    // Update the database directly
    console.log('📝 Updating database directly to trigger real-time event...');
    const { data: updateData, error: updateError } = await supabase
      .from('executive_metrics')
      .upsert({
        id: initialData.id,
        people_served: 7000000,
        meals_delivered: 380000000,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (updateError) {
      console.error('Error updating data:', updateError);
      return;
    }

    console.log('✅ Database updated successfully:', updateData);

    // Wait for the real-time event to be processed
    await sleep(5000);

    // Update again with different values
    console.log('📝 Updating database again with different values...');
    const { data: secondUpdateData, error: secondUpdateError } = await supabase
      .from('executive_metrics')
      .upsert({
        id: initialData.id,
        people_served: 8000000,
        meals_delivered: 420000000,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (secondUpdateError) {
      console.error('Error with second update:', secondUpdateError);
      return;
    }

    console.log('✅ Second database update successful:', secondUpdateData);

    // Wait for the second real-time event
    await sleep(5000);

    // Clean up the subscription
    console.log('🧹 Cleaning up subscription...');
    subscription.unsubscribe();

    console.log('✅ Test completed successfully');

  } catch (error) {
    console.error('❌ Error during real-time subscription test:', error);
  }
}

testRealtimeSubscription();
