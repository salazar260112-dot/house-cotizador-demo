import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Advisor {
  id: string;
  name: string;
  email: string;
  branch: string;
  role: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [advisor, setAdvisor] = useState<Advisor | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [recentQuotations] = useState([
    { id: 'COT-2026-001', client: 'Laura Hernández', date: '2026-06-07', total: '$45,999 MXN', status: 'Enviada' },
    { id: 'COT-2026-002', client: 'Miguel Ángel Ruiz', date: '2026-06-06', total: '$89,499 MXN', status: 'Pendiente' },
    { id: 'COT-2026-003', client: 'Sofía Martínez', date: '2026-06-05', total: '$23,999 MXN', status: 'Aprobada' },
    { id: 'COT-2026-004', client: 'Ricardo Torres', date: '2026-06-04', total: '$156,800 MXN', status: 'Enviada' },
    { id: 'COT-2026-005', client: 'Gabriela Flores', date: '2026-06-03', total: '$12,499 MXN', status: 'Vencida' },
  ]);

  useEffect(() => {
    const stored = sessionStorage.getItem('currentAdvisor');
    if (!stored) {
      navigate('/login');
      return;
    }
    const adv = JSON.parse(stored);
    if (adv.userRole === 'supervisor') {
      navigate('/supervisor/dashboard');
      return;
    }
    setAdvisor(adv);
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('currentAdvisor');
    navigate('/login');
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Aprobada':
        return 'bg-primary-100 text-primary-800 border-primary-200';
      case 'Enviada':
        return 'bg-secondary-100 text-secondary-800 border-secondary-200';
      case 'Pendiente':
        return 'bg-accent-100 text-accent-800 border-accent-200';
      case 'Vencida':
        return 'bg-foreground-100 text-foreground-600 border-foreground-200';
      default:
        return 'bg-background-200 text-foreground-700 border-background-300';
    }
  };

  const getStatsIconStyle = (color: string) => {
    switch (color) {
      case 'accent':
        return { bg: 'bg-accent-100', text: 'text-accent-600' };
      case 'secondary':
        return { bg: 'bg-secondary-100', text: 'text-secondary-600' };
      case 'primary':
      default:
        return { bg: 'bg-primary-100', text: 'text-primary-600' };
    }
  };

  if (!advisor) return null;

  const stats = [
    { label: 'Cotizaciones Hoy', value: '3', icon: 'ri-file-list-3-line', color: 'primary' },
    { label: 'Cotizaciones del Mes', value: '28', icon: 'ri-calendar-check-line', color: 'accent' },
    { label: 'Tasa de Aprobación', value: '64%', icon: 'ri-pie-chart-line', color: 'secondary' },
    { label: 'Ventas Cerradas', value: '12', icon: 'ri-trophy-line', color: 'primary' },
  ];

  return (
    <div className="min-h-screen bg-background-100">
      <nav className="bg-background-50 border-b border-background-200 sticky top-0 z-20">
        <div className="px-6 py-0">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-500 rounded-md flex items-center justify-center">
                <i className="ri-home-office-line text-lg text-background-50"></i>
              </div>
              <span className="text-sm font-semibold text-foreground-900 hidden sm:block">
                Cotizaciones House
              </span>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-background-100 transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary-700">
                    {advisor.name.charAt(0)}
                  </span>
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-foreground-800 leading-tight">
                    {advisor.name}
                  </p>
                  <p className="text-xs text-foreground-500 leading-tight">
                    {advisor.role} &middot; {advisor.branch}
                  </p>
                </div>
                <i className="ri-arrow-down-s-line text-foreground-500 text-sm"></i>
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-56 bg-background-50 border border-background-200 rounded-lg py-1 z-20">
                    <div className="px-4 py-2 border-b border-background-100">
                      <p className="text-sm font-medium text-foreground-800">{advisor.name}</p>
                      <p className="text-xs text-foreground-500">{advisor.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground-700 hover:bg-background-100 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-logout-box-r-line text-base"></i>
                      Cerrar Sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="px-6 py-6 max-w-[1280px] mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground-900">
            Bienvenido, {advisor.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-foreground-600 mt-1">
            {advisor.branch} &mdash; {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const iconStyle = getStatsIconStyle(stat.color);
            return (
              <div
                key={stat.label}
                className="bg-background-50 border border-background-200 rounded-lg p-5 hover:border-background-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-foreground-500 uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-foreground-900 mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-md ${iconStyle.bg} flex items-center justify-center`}>
                    <i className={`${stat.icon} text-lg ${iconStyle.text}`}></i>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="bg-background-50 border border-background-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-foreground-900">
                  Cotizaciones Recientes
                </h2>
                <span className="text-xs text-foreground-500">Últimas 5</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-background-200">
                      <th className="text-left py-3 px-2 text-xs font-medium text-foreground-500 uppercase tracking-wider whitespace-nowrap">
                        Folio
                      </th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-foreground-500 uppercase tracking-wider whitespace-nowrap">
                        Cliente
                      </th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-foreground-500 uppercase tracking-wider whitespace-nowrap">
                        Fecha
                      </th>
                      <th className="text-right py-3 px-2 text-xs font-medium text-foreground-500 uppercase tracking-wider whitespace-nowrap">
                        Total
                      </th>
                      <th className="text-center py-3 px-2 text-xs font-medium text-foreground-500 uppercase tracking-wider whitespace-nowrap">
                        Estatus
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentQuotations.map((q) => (
                      <tr
                        key={q.id}
                        className="border-b border-background-100 hover:bg-background-50 transition-colors"
                      >
                        <td className="py-3 px-2 text-foreground-800 font-medium whitespace-nowrap">
                          {q.id}
                        </td>
                        <td className="py-3 px-2 text-foreground-700 whitespace-nowrap">
                          {q.client}
                        </td>
                        <td className="py-3 px-2 text-foreground-600 whitespace-nowrap">
                          {q.date}
                        </td>
                        <td className="py-3 px-2 text-foreground-800 text-right font-medium whitespace-nowrap">
                          {q.total}
                        </td>
                        <td className="py-3 px-2 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(q.status)}`}
                          >
                            {q.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:w-[320px] flex flex-col gap-4">
            <div
              onClick={() => navigate('/cotizacion/nueva')}
              className="bg-primary-500 hover:bg-primary-600 rounded-lg p-6 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-background-50/20 rounded-lg flex items-center justify-center">
                  <i className="ri-add-line text-2xl text-background-50"></i>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-background-50">
                    Nueva Cotización
                  </h3>
                  <p className="text-sm text-background-50/80 mt-0.5">
                    Crear cotización desde cero
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-background-50 border border-background-200 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-foreground-800 mb-3">
                Acceso Rápido
              </h3>
              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-background-100 text-sm text-foreground-700 transition-colors cursor-pointer whitespace-nowrap">
                  <i className="ri-file-search-line text-base text-foreground-500"></i>
                  Buscar Cotización
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-background-100 text-sm text-foreground-700 transition-colors cursor-pointer whitespace-nowrap">
                  <i className="ri-download-line text-base text-foreground-500"></i>
                  Reporte Mensual
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-background-100 text-sm text-foreground-700 transition-colors cursor-pointer whitespace-nowrap">
                  <i className="ri-price-tag-3-line text-base text-foreground-500"></i>
                  Catálogo de Productos
                </button>
              </div>
            </div>

            <div className="bg-background-50 border border-background-200 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-foreground-800 mb-3">
                Información de Sucursal
              </h3>
              <div className="space-y-2 text-sm text-foreground-600">
                <div className="flex items-center gap-2">
                  <i className="ri-store-2-line text-base text-foreground-400"></i>
                  <span>{advisor.branch}</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="ri-user-star-line text-base text-foreground-400"></i>
                  <span>{advisor.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="ri-mail-line text-base text-foreground-400"></i>
                  <span className="text-xs">{advisor.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}