import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured } from '@/lib/supabase';
import { loginWithDemoPassword } from '@/services/auth';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await loginWithDemoPassword(email, password);
      navigate(user.userRole === 'supervisor' ? '/supervisor/dashboard' : '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible iniciar sesion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-background-50 to-accent-500/5 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500" />

      <div className="relative z-10 w-full max-w-[420px] mx-4">
        <div className="bg-background-50 rounded-lg border border-background-200 p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <i className="ri-home-office-line text-2xl text-background-50"></i>
            </div>
            <h1 className="text-xl font-semibold text-foreground-900">
              Cotizaciones House
            </h1>
            <p className="text-sm text-foreground-600 mt-1">
              Portal de Asesores
            </p>
          </div>

          {!isSupabaseConfigured && (
            <div className="mb-5 bg-accent-50 border border-accent-200 text-accent-800 text-sm rounded-md px-4 py-3">
              Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para iniciar sesion.
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-accent-50 border border-accent-200 text-accent-800 text-sm rounded-md px-4 py-3 flex items-start gap-2">
                <i className="ri-error-warning-line text-base mt-0.5 flex-shrink-0"></i>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground-700 mb-1.5">
                Correo electronico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <i className="ri-mail-line text-foreground-400 text-base"></i>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="asesor@cotizacioneshouse.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-background-50 border border-background-300 rounded-md text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground-700 mb-1.5">
                Contrasena
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <i className="ri-lock-line text-foreground-400 text-base"></i>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contrasena"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-background-50 border border-background-300 rounded-md text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isSupabaseConfigured}
              className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 text-background-50 text-sm font-medium rounded-md transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line animate-spin"></i>
                  Verificando...
                </>
              ) : (
                <>
                  <i className="ri-login-box-line"></i>
                  Iniciar Sesion
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-background-200">
            <p className="text-xs text-foreground-500 text-center">
              Supervisor demo: house@gmail.com / 12345
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-foreground-500 mt-6">
          Generador de Cotizaciones House v1.0 - Uso exclusivo para asesores autorizados
        </p>
      </div>
    </div>
  );
}

