import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface TRPCContext {
  supabase: SupabaseClient<Database>;
  user: User | null;
}

export async function createTRPCContext(
  _opts: FetchCreateContextFnOptions,
): Promise<TRPCContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}
