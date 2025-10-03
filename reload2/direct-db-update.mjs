
import { PostgreSQL } from './mcp_server.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function directDbUpdate() {
  console.log('🚀 Testing direct database update to verify real-time sync...
');

  // Initialize PostgreSQL connection
  const pg = new PostgreSQL();

  try {
    // First, let's check the current state
    console.log('📊 Checking current database state...');
    const initialResult = await pg.query(`
      SELECT * FROM executive_metrics 
      ORDER BY created_at DESC 
      LIMIT 1
    `);

    console.log('Initial metrics:', initialResult);

    // Update a metric directly in the database
    console.log('📝 Updating metrics directly in database...');
    await pg.query(`
      UPDATE executive_metrics 
      SET people_served = 7500000, updated_at = NOW()
      WHERE id = (SELECT id FROM executive_metrics ORDER BY created_at DESC LIMIT 1)
    `);

    console.log('✅ Updated people_served to 7,500,000 directly in database');

    // Verify the update
    const updatedResult = await pg.query(`
      SELECT people_served FROM executive_metrics 
      ORDER BY created_at DESC 
      LIMIT 1
    `);

    console.log('Updated metrics in DB:', updatedResult);

    if (updatedResult && updatedResult[0] && updatedResult[0].people_served === 7500000) {
      console.log('✅ Database updated successfully');
    } else {
      console.log('❌ Database update failed');
    }

    // Update another metric
    console.log('📝 Updating another metric directly in database...');
    await pg.query(`
      UPDATE executive_metrics 
      SET meals_delivered = 450000000, updated_at = NOW()
      WHERE id = (SELECT id FROM executive_metrics ORDER BY created_at DESC LIMIT 1)
    `);

    console.log('✅ Updated meals_delivered to 450,000,000 directly in database');

    // Verify the second update
    const secondUpdatedResult = await pg.query(`
      SELECT meals_delivered FROM executive_metrics 
      ORDER BY created_at DESC 
      LIMIT 1
    `);

    console.log('Second updated metrics in DB:', secondUpdatedResult);

    if (secondUpdatedResult && secondUpdatedResult[0] && secondUpdatedResult[0].meals_delivered === 450000000) {
      console.log('✅ Database updated successfully with second metric');
    } else {
      console.log('❌ Database update failed for second metric');
    }

    // Update scenario factors
    console.log('📝 Updating scenario factors directly in database...');
    await pg.query(`
      UPDATE executive_metrics 
      SET scenario_factors = '{"economicGrowth": 2.5, "inflationRate": 15.0, "donorSentiment": 75.0}', updated_at = NOW()
      WHERE id = (SELECT id FROM executive_metrics ORDER BY created_at DESC LIMIT 1)
    `);

    console.log('✅ Updated scenario factors directly in database');

    // Verify the scenario factors update
    const scenarioResult = await pg.query(`
      SELECT scenario_factors FROM executive_metrics 
      ORDER BY created_at DESC 
      LIMIT 1
    `);

    console.log('Updated scenario factors in DB:', scenarioResult);

    if (scenarioResult && scenarioResult[0] && scenarioResult[0].scenario_factors) {
      console.log('✅ Database updated successfully with scenario factors');
      console.log('   Scenario factors:', scenarioResult[0].scenario_factors);
    } else {
      console.log('❌ Database update failed for scenario factors');
    }

    console.log('
✅ Direct database update test completed');
    console.log('   Check if the UI updates in real-time with these changes');

  } catch (error) {
    console.error('❌ Error during direct database update:', error.message);
  } finally {
    await sleep(2000);
    console.log('
✅ Direct database update test finished');
  }
}

directDbUpdate();
