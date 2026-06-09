import { requireSupabase } from '@/lib/supabase';
import type { Product } from '@/types/app';

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const client = requireSupabase();
  const pattern = `%${q}%`;
  const { data, error } = await client
    .from('cotizador_productos')
    .select('id,sku,modelo,marca,descripcion,color,categoria,imagen_url,activo,precio_usd,precio_mxn')
    .eq('activo', true)
    .or(`sku.ilike.${pattern},modelo.ilike.${pattern},marca.ilike.${pattern},descripcion.ilike.${pattern}`)
    .order('marca', { ascending: true })
    .limit(20);

  if (error) throw error;
  return (data || []) as Product[];
}

