import { requireSupabase } from '@/lib/supabase';
import type { AppUser } from '@/types/app';

export async function listActiveAdvisors() {
  const client = requireSupabase();
  const { data, error } = await client
    .from('users')
    .select('id,nombre,email,rol,sucursal,activo')
    .eq('activo', true)
    .eq('rol', 'asesor')
    .order('nombre', { ascending: true });

  if (error) throw error;
  return (data || []) as AppUser[];
}

