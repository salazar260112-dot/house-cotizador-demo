import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BRANCHES, QUOTE_STATUSES } from '@/lib/constants';
import { getCurrentUser, logout } from '@/services/auth';
import { listQuotes } from '@/services/quotes';
import { listActiveAdvisors } from '@/services/users';
import type { QuoteSummary } from '@/types/app';

interface User {
  id: string;
  name: string;
  email: string;
  branch: string;
  role: string;
  userRole: string;
}

function getMonthName(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('es-MX', { month: 'long' });
}

function getMonthKey(dateStr: string): string {
  return dateStr.substring(0, 7);
}

function formatMXN(amount: number): string {
  return `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
}

export default function SupervisorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [quotations, setQuotations] = useState<QuoteSummary[]>([]);
  const [allAdvisors, setAllAdvisors] = useState<{ id: string; name: string }[]>([]);
  const [loadError, setLoadError] = useState('');

  const today = new Date().toISOString().slice(0, 10);
  const defaultStart = new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1).toISOString().slice(0, 10);
  const [filterStartDate, setFilterStartDate] = useState(defaultStart);
  const [filterEndDate, setFilterEndDate] = useState(today);
  const [filterOrigin, setFilterOrigin] = useState('');
  const [filterAdvisor, setFilterAdvisor] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    const u = getCurrentUser() as User | null;
    if (!u) {
      navigate('/login');
      return;
    }
    if (u.userRole !== 'supervisor') {
      navigate('/dashboard');
      return;
    }
    setUser(u);
  }, [navigate]);

  useEffect(() => {
    Promise.all([listQuotes(), listActiveAdvisors()])
      .then(([quotes, advisors]) => {
        setQuotations(quotes);
        setAllAdvisors(advisors.map((a) => ({ id: a.id, name: a.nombre })));
      })
      .catch((error) => setLoadError(error instanceof Error ? error.message : 'No fue posible cargar el dashboard.'));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      if (filterStartDate && q.fecha_cotizacion < filterStartDate) return false;
      if (filterEndDate && q.fecha_cotizacion > filterEndDate) return false;
      if (filterOrigin && q.origen !== filterOrigin) return false;
      if (filterAdvisor && q.asesor_id !== filterAdvisor) return false;
      if (filterStatus && q.estatus !== filterStatus) return false;
      return true;
    });
  }, [quotations, filterStartDate, filterEndDate, filterOrigin, filterAdvisor, filterStatus]);

  const now = today;
  const currentMonth = now.substring(0, 7);
  const threeMonthsAgo = defaultStart;

  const monthQuotations = useMemo(
    () => filteredQuotations.filter((q) => getMonthKey(q.fecha_cotizacion) === currentMonth),
    [filteredQuotations, currentMonth]
  );

  const quarterQuotations = useMemo(
    () => filteredQuotations.filter((q) => q.fecha_cotizacion >= threeMonthsAgo),
    [filteredQuotations, threeMonthsAgo]
  );

  const totalMonthCount = monthQuotations.length;
  const totalQuarterCount = quarterQuotations.length;
  const totalMonthAmount = monthQuotations.reduce((s, q) => s + q.total, 0);
  const totalQuarterAmount = quarterQuotations.reduce((s, q) => s + q.total, 0);
  const avgTicket = totalQuarterCount > 0 ? totalQuarterAmount / totalQuarterCount : 0;

  const originBreakdown = useMemo(() => {
    const map: Record<string, { count: number; amount: number }> = {};
    BRANCHES.forEach((o) => { map[o] = { count: 0, amount: 0 }; });
    quarterQuotations.forEach((q) => {
      if (map[q.origen]) {
        map[q.origen].count += 1;
        map[q.origen].amount += q.total;
      }
    });
    return map;
  }, [quarterQuotations]);

  const advisorPerformance = useMemo(() => {
    const map: Record<string, {
      name: string;
      origin: string;
      count: number;
      amount: number;
      lastDate: string;
    }> = {};
    filteredQuotations.forEach((q) => {
      const key = q.asesor_id || q.asesor_nombre;
      if (!map[key]) {
        map[key] = { name: q.asesor_nombre, origin: q.origen, count: 0, amount: 0, lastDate: q.fecha_cotizacion };
      }
      map[key].count += 1;
      map[key].amount += q.total;
      if (q.fecha_cotizacion > map[key].lastDate) map[key].lastDate = q.fecha_cotizacion;
    });
    return Object.values(map).sort((a, b) => b.amount - a.amount);
  }, [filteredQuotations]);

  const originCards = useMemo(() => {
    const totalCount = totalQuarterCount;
    return BRANCHES.map((origin) => {
      const data = originBreakdown[origin] || { count: 0, amount: 0 };
      const percentage = totalCount > 0 ? ((data.count / totalCount) * 100).toFixed(1) : '0.0';
      return {
        origin,
        count: data.count,
        amount: data.amount,
        avg: data.count > 0 ? data.amount / data.count : 0,
        percentage,
      };
    });
  }, [originBreakdown, totalQuarterCount]);

  const quarterlyData = useMemo(() => {
    const months = Array.from({ length: 3 }, (_, index) => {
      const d = new Date(new Date().getFullYear(), new Date().getMonth() - (2 - index), 1);
      return d.toISOString().slice(0, 7);
    });
    const data: { month: string; origin: string; advisor: string; count: number; amount: number }[] = [];
    months.forEach((month) => {
      const monthQs = filteredQuotations.filter((q) => getMonthKey(q.fecha_cotizacion) === month);
      BRANCHES.forEach((origin) => {
        const originQs = monthQs.filter((q) => q.origen === origin);
        const advisorsInOrigin = Array.from(new Set(originQs.map((q) => q.asesor_nombre)));
        advisorsInOrigin.forEach((advisor) => {
          const advQs = originQs.filter((q) => q.asesor_nombre === advisor);
          if (advQs.length > 0) {
            data.push({
              month: getMonthName(month + '-01'),
              origin,
              advisor,
              count: advQs.length,
              amount: advQs.reduce((s, q) => s + q.total, 0),
            });
          }
        });
      });
    });
    return data;
  }, [filteredQuotations]);

  const quarterAmountByMonth = useMemo(() => {
    const months = Array.from({ length: 3 }, (_, index) => {
      const d = new Date(new Date().getFullYear(), new Date().getMonth() - (2 - index), 1);
      return d.toISOString().slice(0, 7);
    });
    return months.map((month) => {
      const monthQs = filteredQuotations.filter((q) => getMonthKey(q.fecha_cotizacion) === month);
      return {
        month: getMonthName(month + '-01'),
        count: monthQs.length,
        amount: monthQs.reduce((s, q) => s + q.total, 0),
      };
    });
  }, [filteredQuotations]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background-100">
      {/* ===== NAV BAR ===== */}
      <nav className="bg-background-50 border-b border-background-200 sticky top-0 z-30">
        <div className="px-6 py-0">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-foreground-800 rounded-md flex items-center justify-center">
                <i className="ri-dashboard-line text-lg text-background-50"></i>
              </div>
              <div className="hidden sm:block">
                <span className="text-sm font-semibold text-foreground-900">
                  Dashboard Supervisor
                </span>
                <span className="mx-2 text-foreground-300">|</span>
                <span className="text-xs text-foreground-500">Cotizaciones House</span>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-background-100 transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-8 h-8 rounded-full bg-foreground-800 flex items-center justify-center">
                  <span className="text-xs font-semibold text-background-50">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-foreground-800 leading-tight">
                    {user.name}
                  </p>
                  <p className="text-xs text-foreground-500 leading-tight">
                    {user.role}
                  </p>
                </div>
                <i className="ri-arrow-down-s-line text-foreground-500 text-sm"></i>
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 w-56 bg-background-50 border border-background-200 rounded-lg py-1 z-20">
                    <div className="px-4 py-2 border-b border-background-100">
                      <p className="text-sm font-medium text-foreground-800">{user.name}</p>
                      <p className="text-xs text-foreground-500">{user.email}</p>
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

      {/* ===== MAIN CONTENT ===== */}
      <div className="px-6 py-6 max-w-[1400px] mx-auto space-y-6">
        {/* --- HEADER --- */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground-900">
            Panel de Control Ejecutivo
          </h1>
          <p className="text-sm text-foreground-600 mt-1">
            {user.name} &mdash; {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {loadError && (
          <div className="bg-accent-50 border border-accent-200 text-accent-800 text-sm rounded-md px-4 py-3 flex items-start gap-2">
            <i className="ri-error-warning-line text-base mt-0.5 flex-shrink-0"></i>
            <span>{loadError}</span>
          </div>
        )}

        {/* ===== SECTION 1: KPI CARDS ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="bg-background-50 border border-background-200 rounded-lg p-5">
            <p className="text-xs font-medium text-foreground-500 uppercase tracking-wider">Cotizaciones del Mes</p>
            <p className="text-2xl font-bold text-foreground-900 mt-2">{totalMonthCount}</p>
            <p className="text-xs text-foreground-400 mt-1">{new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}</p>
          </div>

          <div className="bg-background-50 border border-background-200 rounded-lg p-5">
            <p className="text-xs font-medium text-foreground-500 uppercase tracking-wider">Cotizaciones Trimestre</p>
            <p className="text-2xl font-bold text-foreground-900 mt-2">{totalQuarterCount}</p>
            <p className="text-xs text-foreground-400 mt-1">Ultimos 3 meses</p>
          </div>

          <div className="bg-background-50 border border-background-200 rounded-lg p-5">
            <p className="text-xs font-medium text-foreground-500 uppercase tracking-wider">Monto Cotizado Mes</p>
            <p className="text-2xl font-bold text-foreground-900 mt-2">{formatMXN(totalMonthAmount)}</p>
            <p className="text-xs text-foreground-400 mt-1">{totalMonthCount} operaciones</p>
          </div>

          <div className="bg-background-50 border border-background-200 rounded-lg p-5">
            <p className="text-xs font-medium text-foreground-500 uppercase tracking-wider">Monto Cotizado Trimestre</p>
            <p className="text-2xl font-bold text-foreground-900 mt-2">{formatMXN(totalQuarterAmount)}</p>
            <p className="text-xs text-foreground-400 mt-1">{totalQuarterCount} operaciones</p>
          </div>

          <div className="bg-background-50 border border-background-200 rounded-lg p-5">
            <p className="text-xs font-medium text-foreground-500 uppercase tracking-wider">Ticket Promedio</p>
            <p className="text-2xl font-bold text-foreground-900 mt-2">{formatMXN(avgTicket)}</p>
            <p className="text-xs text-foreground-400 mt-1">Trimestral</p>
          </div>

          <div className="bg-background-50 border border-background-200 rounded-lg p-5">
            <p className="text-xs font-medium text-foreground-500 uppercase tracking-wider">Orígenes Activos</p>
            <p className="text-2xl font-bold text-foreground-900 mt-2">
              {BRANCHES.filter((o) => originBreakdown[o] && originBreakdown[o].count > 0).length}
            </p>
            <p className="text-xs text-foreground-400 mt-1">de {BRANCHES.length} totales</p>
          </div>
        </div>

        {/* ===== SECTION 2: FILTERS ===== */}
        <div className="bg-background-50 border border-background-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <i className="ri-filter-3-line text-lg text-foreground-600"></i>
            <h2 className="text-sm font-semibold text-foreground-800">Filtros</h2>
            {filteredQuotations.length < quotations.length && (
              <span className="text-xs text-foreground-400 ml-2">
                ({filteredQuotations.length} de {quotations.length} cotizaciones)
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div>
              <label htmlFor="startDate" className="block text-xs font-medium text-foreground-500 mb-1">Fecha Inicial</label>
              <input
                id="startDate"
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="px-3 py-2 text-sm bg-background-50 border border-background-300 rounded-md text-foreground-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-xs font-medium text-foreground-500 mb-1">Fecha Final</label>
              <input
                id="endDate"
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="px-3 py-2 text-sm bg-background-50 border border-background-300 rounded-md text-foreground-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>

            <div>
              <label htmlFor="filterOrigin" className="block text-xs font-medium text-foreground-500 mb-1">Sucursal / Origen</label>
              <div className="relative">
                <select
                  id="filterOrigin"
                  value={filterOrigin}
                  onChange={(e) => setFilterOrigin(e.target.value)}
                  className="px-3 py-2 text-sm bg-background-50 border border-background-300 rounded-md text-foreground-900 appearance-none cursor-pointer focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all pr-8"
                >
                  <option value="">Todos</option>
                  {BRANCHES.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <i className="ri-arrow-down-s-line text-foreground-400 text-sm"></i>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="filterAdvisor" className="block text-xs font-medium text-foreground-500 mb-1">Asesor</label>
              <div className="relative">
                <select
                  id="filterAdvisor"
                  value={filterAdvisor}
                  onChange={(e) => setFilterAdvisor(e.target.value)}
                  className="px-3 py-2 text-sm bg-background-50 border border-background-300 rounded-md text-foreground-900 appearance-none cursor-pointer focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all pr-8"
                >
                  <option value="">Todos</option>
                  {allAdvisors.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <i className="ri-arrow-down-s-line text-foreground-400 text-sm"></i>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="filterStatus" className="block text-xs font-medium text-foreground-500 mb-1">Estatus</label>
              <div className="relative">
                <select
                  id="filterStatus"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 text-sm bg-background-50 border border-background-300 rounded-md text-foreground-900 appearance-none cursor-pointer focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all pr-8"
                >
                  <option value="">Todos</option>
                  {QUOTE_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <i className="ri-arrow-down-s-line text-foreground-400 text-sm"></i>
                </div>
              </div>
            </div>

            {(filterOrigin || filterAdvisor || filterStatus) && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilterOrigin('');
                    setFilterAdvisor('');
                    setFilterStatus('');
                    setFilterStartDate(defaultStart);
                    setFilterEndDate(today);
                  }}
                  className="px-3 py-2 text-sm text-foreground-500 hover:text-foreground-700 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1"
                >
                  <i className="ri-close-line"></i>
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ===== SECTION 3: PERFORMANCE BY ORIGIN CARDS ===== */}
        <div>
          <h2 className="text-base font-semibold text-foreground-800 mb-4 flex items-center gap-2">
            <i className="ri-store-2-line text-lg text-foreground-600"></i>
            Rendimiento por Sucursal / Origen
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {originCards.map((card) => {
              const isHighPerformer = card.amount > totalQuarterAmount / BRANCHES.length;
              return (
                <div
                  key={card.origin}
                  className="bg-background-50 border border-background-200 rounded-lg p-5 hover:border-background-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground-800">{card.origin}</h3>
                    {isHighPerformer && card.count > 0 && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 border border-primary-200">
                        Alto rendimiento
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground-500">Cotizaciones</span>
                      <span className="text-sm font-bold text-foreground-900">{card.count}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground-500">Monto Total</span>
                      <span className="text-sm font-bold text-foreground-900">{formatMXN(card.amount)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground-500">Ticket Promedio</span>
                      <span className="text-sm font-semibold text-foreground-700">{formatMXN(card.avg)}</span>
                    </div>

                    <div className="pt-3 border-t border-background-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-foreground-500">Participación</span>
                        <span className="text-sm font-bold text-foreground-900">{card.percentage}%</span>
                      </div>
                      <div className="mt-2 w-full h-2 bg-background-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full transition-all duration-500"
                          style={{ width: `${card.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== SECTION 4: ADVISOR PERFORMANCE TABLE ===== */}
        <div>
          <h2 className="text-base font-semibold text-foreground-800 mb-4 flex items-center gap-2">
            <i className="ri-team-line text-lg text-foreground-600"></i>
            Rendimiento por Asesor
          </h2>

          <div className="bg-background-50 border border-background-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-background-200 bg-background-50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider whitespace-nowrap">
                      Asesor
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider whitespace-nowrap">
                      Sucursal / Origen
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider whitespace-nowrap">
                      Cotizaciones
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider whitespace-nowrap">
                      Monto Total
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider whitespace-nowrap">
                      Ticket Promedio
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider whitespace-nowrap">
                      Última Cotización
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {advisorPerformance.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-foreground-400 text-sm">
                        No hay datos con los filtros seleccionados
                      </td>
                    </tr>
                  ) : (
                    advisorPerformance.map((adv, idx) => (
                      <tr
                        key={adv.name}
                        className="border-b border-background-100 hover:bg-background-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-semibold text-secondary-700">
                                {adv.name.charAt(0)}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-foreground-800 whitespace-nowrap">
                              {adv.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs text-foreground-600 whitespace-nowrap">{adv.origin}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-sm font-semibold text-foreground-800">{adv.count}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-semibold text-foreground-800 whitespace-nowrap">
                            {formatMXN(adv.amount)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm text-foreground-700 whitespace-nowrap">
                            {formatMXN(adv.count > 0 ? adv.amount / adv.count : 0)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-xs text-foreground-500 whitespace-nowrap">{adv.lastDate}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ===== SECTION 5: QUARTERLY VIEW ===== */}
        <div>
          <h2 className="text-base font-semibold text-foreground-800 mb-4 flex items-center gap-2">
            <i className="ri-bar-chart-grouped-line text-lg text-foreground-600"></i>
            Vista Trimestral
          </h2>

          {/* --- Monthly Summary Row --- */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {quarterAmountByMonth.map((m) => (
              <div key={m.month} className="bg-background-50 border border-background-200 rounded-lg p-4">
                <p className="text-xs font-medium text-foreground-500 uppercase tracking-wider capitalize">{m.month}</p>
                <div className="flex items-end justify-between mt-2">
                  <p className="text-xl font-bold text-foreground-900">{m.count} cot.</p>
                  <p className="text-sm font-semibold text-foreground-700">{formatMXN(m.amount)}</p>
                </div>
                <div className="mt-3 w-full h-1.5 bg-background-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(...quarterAmountByMonth.map((x) => x.amount)) > 0
                        ? (m.amount / Math.max(...quarterAmountByMonth.map((x) => x.amount))) * 100
                        : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* --- Detailed Quarterly Table --- */}
          <div className="bg-background-50 border border-background-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-background-200 bg-background-50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider whitespace-nowrap">
                      Mes
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider whitespace-nowrap">
                      Sucursal / Origen
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider whitespace-nowrap">
                      Asesor
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider whitespace-nowrap">
                      Cotizaciones
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-foreground-500 uppercase tracking-wider whitespace-nowrap">
                      Monto Cotizado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {quarterlyData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-foreground-400 text-sm">
                        No hay datos trimestrales con los filtros seleccionados
                      </td>
                    </tr>
                  ) : (
                    quarterlyData.map((row, idx) => (
                      <tr
                        key={`${row.month}-${row.origin}-${row.advisor}`}
                        className="border-b border-background-100 hover:bg-background-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="text-xs font-medium text-foreground-600 capitalize whitespace-nowrap">
                            {row.month}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs text-foreground-600 whitespace-nowrap">{row.origin}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs text-foreground-800 whitespace-nowrap">{row.advisor}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-sm font-semibold text-foreground-800">{row.count}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-semibold text-foreground-800 whitespace-nowrap">
                            {formatMXN(row.amount)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
