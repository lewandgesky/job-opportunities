import { createClient } from '@supabase/supabase-js';

// Client Supabase admin avec la clé service_role (bypass RLS)
// À utiliser UNIQUEMENT dans les API Routes côté serveur
// JAMAIS exposer cette clé côté client
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
