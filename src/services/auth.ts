import { requireSupabase } from '@/lib/supabase';
import type { AppUser } from '@/types/app';

const STORAGE_KEY = 'currentAdvisor';

export function normalizeUser(user: AppUser) {
  return {
    ...user,
    name: user.nombre,
    branch: user.sucursal,
    role: user.rol === 'supervisor' ? 'Supervisor' : 'Asesor',
    userRole: user.rol === 'supervisor' ? 'supervisor' : 'advisor',
  };
}

export function getCurrentUser(): ReturnType<typeof normalizeUser> | null {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  return JSON.parse(stored);
}

export function setCurrentUser(user: AppUser) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeUser(user)));
}

export function logout() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export async function loginWithDemoPassword(email: string, password: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('users')
    .select('id,nombre,email,rol,sucursal,activo')
    .eq('email', email.trim().toLowerCase())
    .eq('password_demo', password)
    .eq('activo', true)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Credenciales invalidas. Verifique su correo y contrasena.');

  setCurrentUser(data as AppUser);
  return normalizeUser(data as AppUser);
}

