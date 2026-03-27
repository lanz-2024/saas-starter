import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export interface TRPCContext {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User | null;
}

export async function createTRPCContext(_opts: FetchCreateContextFnOptions): Promise<TRPCContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}
