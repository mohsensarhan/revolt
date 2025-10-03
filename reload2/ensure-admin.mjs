import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnvFile(relativePath) {
  const fullPath = path.resolve(relativePath);
  if (!fs.existsSync(fullPath)) {
    return {};
  }
  const lines = fs.readFileSync(fullPath, 'utf-8').split(/\r?\n/);
  return Object.fromEntries(
    lines
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const idx = line.indexOf('=');
        if (idx === -1) return null;
        return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
      })
      .filter(Boolean)
  );
}

async function main() {
  const env = {
    ...loadEnvFile('.env.local'),
    ...process.env,
  };

  const supabaseUrl = env.VITE_SUPABASE_URL;
  const serviceKey = env.VITE_SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  const adminPassword = env.VITE_ADMIN_INITIAL_PASSWORD || 'TestAdmin2024!@#SecurePass';
  const adminEmail = 'admin@example.com';

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing Supabase credentials');
  }

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log('[Supabase] Creating or verifying admin user...');
  let userId = null;

  try {
    const { data } = await adminClient.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });
    if (data?.user?.id) {
      userId = data.user.id;
      console.log(`[Supabase] Created auth user ${userId}`);
    }
  } catch (error) {
    if (error?.code === 'email_exists' || error?.message?.includes('already') || error?.status === 422) {
      console.log('[Supabase] Admin user already exists, continuing');
    } else {
      throw error;
    }
  }

  if (!userId) {
    console.log('[Supabase] Looking up existing user');
    const { data: listData, error: listError } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (listError) {
      throw listError;
    }
    const existing = listData.users.find((user) => user.email === adminEmail);
    if (!existing) {
      throw new Error('Admin user not found after create attempt');
    }
    userId = existing.id;
  }

  await adminClient.auth.admin.updateUserById(userId, { password: adminPassword });
  console.log('[Supabase] Password reset to match .env value');

  const { data: existingRow } = await adminClient
    .from('users')
    .select('id, role')
    .eq('email', adminEmail)
    .maybeSingle();

  if (existingRow) {
    if (existingRow.role !== 'admin') {
      const { error: updateRoleError } = await adminClient
        .from('users')
        .update({ role: 'admin' })
        .eq('id', existingRow.id);
      if (updateRoleError) {
        throw updateRoleError;
      }
      console.log('[Supabase] Updated existing user role to admin');
    } else {
      console.log('[Supabase] User already has admin role');
    }
  } else {
    const { error: upsertError } = await adminClient
      .from('users')
      .upsert({ id: userId, email: adminEmail, role: 'admin' }, { onConflict: 'id' });

    if (upsertError) {
      throw upsertError;
    }

    console.log('[Supabase] Added admin metadata record');
  }

  console.log(`[Supabase] Admin user ready with id ${userId}`);
}

main().catch((error) => {
  console.error('[Supabase] Failed to ensure admin user:', error);
  process.exitCode = 1;
});
