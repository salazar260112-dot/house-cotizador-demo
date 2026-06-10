import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BRANCHES, LEAD_SOURCES, PDF_POLICY } from '@/lib/constants';
import { getCurrentUser, logout } from '@/services/auth';
import { searchProducts } from '@/services/products';
import { createQuoteAndRequestPdf } from '@/services/quotes';
import { renderQuotationHtml } from '@/services/quoteTemplate';
import { listActiveAdvisors } from '@/services/users';
import type { Product } from '@/types/app';

interface Advisor {
  id: string;
  name?: string;
  nombre?: string;
  email: string;
  branch?: string;
  sucursal?: string;
  role: string;
  userRole: string;
}

interface CartProduct {
  id: string;
  sku: string;
  model: string;
  description: string;
  brand: string;
  color: string;
  image: string;
  priceUsd: number;
  priceMxn: number;
  quantity: number;
  currency: 'USD' | 'MXN';
  unitPrice: number;
  subtotal: number;
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function formatCurrency(amount: number, currency: 'USD' | 'MXN'): string {
  if (currency === 'USD') {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
  }
  return `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
}

const IVA_RATE = 0.16;

function downloadPdfOnDevice(pdfUrl: string, fileName = 'cotizacion-house.pdf') {
  const link = document.createElement('a');
  link.href = pdfUrl;
  link.download = fileName;
  link.target = '_blank';
  link.rel = 'noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function NewQuotation() {
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  const [advisor, setAdvisor] = useState<Advisor | null>(null);
  const [advisorsByBranch, setAdvisorsByBranch] = useState<Record<string, { id: string; name: string }[]>>({});
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [date, setDate] = useState(getTodayDate());
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [city, setCity] = useState('');
  const [origen, setOrigen] = useState('');
  const [branch, setBranch] = useState('');
  const [selectedAdvisor, setSelectedAdvisor] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [leadSource, setLeadSource] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [cartProducts, setCartProducts] = useState<CartProduct[]>([]);

  const [notes, setNotes] = useState('');
  const [validityDays, setValidityDays] = useState(15);

  const [showPreview, setShowPreview] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    const adv = getCurrentUser() as Advisor | null;
    if (!adv) {
      navigate('/login');
      return;
    }
    if (adv.userRole === 'supervisor') {
      navigate('/supervisor/dashboard');
      return;
    }
    setAdvisor(adv);
    const userBranch = adv.branch || adv.sucursal || '';
    const userName = adv.name || adv.nombre || '';
    setOrigen(userBranch);
    setBranch(userBranch);
    setSelectedAdvisor(userName);
  }, [navigate]);

  useEffect(() => {
    listActiveAdvisors()
      .then((users) => {
        const grouped = users.reduce<Record<string, { id: string; name: string }[]>>((acc, user) => {
          if (!acc[user.sucursal]) acc[user.sucursal] = [];
          acc[user.sucursal].push({ id: user.id, name: user.nombre });
          return acc;
        }, {});
        setAdvisorsByBranch(grouped);
      })
      .catch((error) => setFormError(error instanceof Error ? error.message : 'No fue posible cargar asesores.'));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    try {
      const filtered = await searchProducts(query);
      setSearchResults(filtered);
      setShowSearchResults(filtered.length > 0);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No fue posible buscar productos.');
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const addToCart = (product: Product) => {
    const priceMxn = Number(product.precio_mxn || 0);
    const priceUsd = Number(product.precio_usd || 0);
    const exists = cartProducts.find((cp) => cp.id === product.id);
    if (exists) {
      setCartProducts((prev) =>
        prev.map((cp) =>
          cp.id === product.id
            ? { ...cp, quantity: cp.quantity + 1, subtotal: (cp.quantity + 1) * cp.unitPrice }
            : cp
        )
      );
    } else {
      setCartProducts((prev) => [
        ...prev,
        {
          id: product.id,
          sku: product.sku,
          model: product.modelo,
          description: product.descripcion,
          brand: product.marca,
          color: product.color,
          image: product.imagen_url,
          priceUsd,
          priceMxn,
          quantity: 1,
          currency: 'MXN',
          unitPrice: priceMxn,
          subtotal: priceMxn,
        },
      ]);
    }
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const removeFromCart = (productId: string) => {
    setCartProducts((prev) => prev.filter((cp) => cp.id !== productId));
  };

  const updateQuantity = (productId: string, qty: number) => {
    if (qty < 1) return;
    setCartProducts((prev) =>
      prev.map((cp) =>
        cp.id === productId ? { ...cp, quantity: qty, subtotal: qty * cp.unitPrice } : cp
      )
    );
  };

  const updateCurrency = (productId: string, currency: 'USD' | 'MXN') => {
    setCartProducts((prev) =>
      prev.map((cp) => {
        if (cp.id !== productId) return cp;
        const newPrice = currency === 'USD' ? cp.priceUsd : cp.priceMxn;
        return { ...cp, currency, unitPrice: newPrice, subtotal: cp.quantity * newPrice };
      })
    );
  };

  const updateUnitPrice = (productId: string, price: number) => {
    if (price < 0) return;
    setCartProducts((prev) =>
      prev.map((cp) =>
        cp.id === productId ? { ...cp, unitPrice: price, subtotal: cp.quantity * price } : cp
      )
    );
  };

  const totalSubtotal = cartProducts.reduce((sum, cp) => sum + cp.subtotal, 0);
  const totalIva = totalSubtotal * IVA_RATE;
  const grandTotal = totalSubtotal + totalIva;

  const validateQuotation = () => {
    if (!clientName.trim()) return 'Captura el nombre del cliente.';
    if (!clientPhone.trim()) return 'Captura el telefono del cliente.';
    if (!clientEmail.trim()) return 'Captura el correo del cliente.';
    if (!city.trim()) return 'Captura la ciudad del cliente.';
    if (!origen.trim()) return 'Selecciona el origen de la cotizacion.';
    if (!branch.trim()) return 'Selecciona la sucursal.';
    if (origen === 'Proyectos Directos' && !responsiblePerson.trim()) return 'Captura el responsable interno.';
    if (origen !== 'Proyectos Directos' && !selectedAdvisor.trim()) return 'Selecciona el asesor responsable.';
    if (cartProducts.length === 0) return 'Agrega al menos un producto.';
    return '';
  };

  const getResponsibleName = () => (origen === 'Proyectos Directos' ? responsiblePerson : selectedAdvisor);
  const getMainCurrency = () => (cartProducts.some((p) => p.currency === 'USD') ? 'USD' : 'MXN');
  const buildQuoteDetail = () =>
    cartProducts.map((cp) => ({
      producto_id: cp.id,
      sku: cp.sku,
      modelo: cp.model,
      descripcion: cp.description,
      marca: cp.brand,
      color: cp.color,
      imagen_url: cp.image,
      cantidad: cp.quantity,
      moneda: cp.currency,
      precio_unitario: cp.unitPrice,
      subtotal: cp.subtotal,
    }));

  const handlePrintPdf = async () => {
    setFormError('');
    setSuccessMessage('');
    setGeneratedPdfUrl('');
    const validation = validateQuotation();
    if (validation) {
      setFormError(validation);
      return;
    }

    setGeneratingPdf(true);
    try {
      const responsibleName = getResponsibleName();
      const mainCurrency = getMainCurrency();
      const quote = await createQuoteAndRequestPdf({
        fecha_cotizacion: date,
        cliente_nombre: clientName,
        cliente_telefono: clientPhone,
        cliente_correo: clientEmail,
        cliente_ciudad: city,
        origen,
        sucursal: branch,
        asesor_id: advisor?.id || '',
        asesor_nombre: responsibleName,
        asesor_email: advisor?.email || '',
        fuente_lead: leadSource,
        observaciones: notes,
        subtotal: totalSubtotal,
        total: grandTotal,
        moneda_principal: mainCurrency,
        validity_days: validityDays,
        detalle: buildQuoteDetail(),
      });
      const pdfUrl = quote.pdf_url || '';
      setGeneratedPdfUrl(pdfUrl);
      if (pdfUrl) {
        downloadPdfOnDevice(pdfUrl, `${quote.folio || 'cotizacion-house'}.pdf`);
      }
      setSuccessMessage(
        quote.pdf_url
          ? `Cotizacion ${quote.folio} generada, enviada al correo del cliente y lista para descarga.`
          : `Cotizacion ${quote.folio} guardada. Falta configurar el webhook de PDF para generar la URL.`
      );
      setShowPreview(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No fue posible generar la cotizacion.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!advisor) return null;

  const previewHtml = renderQuotationHtml({
    quote: {
      folio: 'COT-PREVIA',
      fecha_cotizacion: date,
      cliente_nombre: clientName || 'Cliente por confirmar',
      cliente_telefono: clientPhone || 'Por confirmar',
      cliente_correo: clientEmail || 'cliente@correo.com',
      cliente_ciudad: city || 'Ciudad por confirmar',
      origen: origen || 'Origen por confirmar',
      sucursal: branch || 'Sucursal por confirmar',
      asesor_id: advisor.id,
      asesor_nombre: getResponsibleName() || advisor.name || advisor.nombre || 'Asesor House',
      fuente_lead: leadSource || 'No especificada',
      observaciones: notes,
      subtotal: totalSubtotal,
      total: grandTotal,
      moneda_principal: getMainCurrency(),
    },
    detalle: buildQuoteDetail(),
    validityDays,
  });

  return (
    <div className="min-h-screen bg-background-100">
      {/* ===== NAV BAR ===== */}
      <nav className="bg-background-50 border-b border-background-200 sticky top-0 z-30">
        <div className="px-6 py-0">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-9 h-9 bg-primary-500 rounded-md flex items-center justify-center cursor-pointer hover:bg-primary-600 transition-colors"
              >
                <i className="ri-home-office-line text-lg text-background-50"></i>
              </button>
              <div className="hidden sm:flex items-center gap-2 text-sm text-foreground-500">
                <button onClick={() => navigate('/dashboard')} className="hover:text-primary-600 transition-colors whitespace-nowrap cursor-pointer">
                  Dashboard
                </button>
                <i className="ri-arrow-right-s-line text-xs"></i>
                <span className="text-foreground-800 font-medium">Nueva Cotización</span>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-background-100 transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary-700">
                    {(advisor.name || advisor.nombre || '').charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground-800 hidden sm:block">
                  {advisor.name || advisor.nombre}
                </span>
                <i className="ri-arrow-down-s-line text-foreground-500 text-sm"></i>
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 w-56 bg-background-50 border border-background-200 rounded-lg py-1 z-20">
                    <div className="px-4 py-2 border-b border-background-100">
                      <p className="text-sm font-medium text-foreground-800">{advisor.name || advisor.nombre}</p>
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

      {/* ===== MAIN CONTENT ===== */}
      <div className="px-6 py-6 max-w-[1280px] mx-auto">
        <h1 className="text-2xl font-semibold text-foreground-900 mb-6">Nueva Cotización</h1>

        {formError && (
          <div className="mb-4 bg-accent-50 border border-accent-200 text-accent-800 text-sm rounded-md px-4 py-3 flex items-start gap-2">
            <i className="ri-error-warning-line text-base mt-0.5 flex-shrink-0"></i>
            <span>{formError}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 bg-primary-50 border border-primary-200 text-primary-800 text-sm rounded-md px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-2">
            <i className="ri-checkbox-circle-line text-base mt-0.5 flex-shrink-0"></i>
            <span>{successMessage}</span>
            </div>
            {generatedPdfUrl && (
              <a
                href={generatedPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-background-50 rounded-md text-sm font-medium whitespace-nowrap"
              >
                <i className="ri-download-2-line"></i>
                Abrir PDF
              </a>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ===== LEFT COLUMN ===== */}
          <div className="flex-1 space-y-6">
            {/* --- CLIENT INFO CARD --- */}
            <div className="bg-background-50 border border-background-200 rounded-lg p-6">
              <h2 className="text-base font-semibold text-foreground-800 mb-5 flex items-center gap-2">
                <i className="ri-user-3-line text-lg text-primary-500"></i>
                Datos del Cliente
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-foreground-700 mb-1.5">
                    Fecha
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-background-50 border border-background-300 rounded-md text-foreground-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="clientName" className="block text-sm font-medium text-foreground-700 mb-1.5">
                    Nombre del Cliente <span className="text-accent-500">*</span>
                  </label>
                  <input
                    id="clientName"
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Nombre completo"
                    className="w-full px-3 py-2.5 text-sm bg-background-50 border border-background-300 rounded-md text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="clientPhone" className="block text-sm font-medium text-foreground-700 mb-1.5">
                    Teléfono <span className="text-accent-500">*</span>
                  </label>
                  <input
                    id="clientPhone"
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="555 123 4567"
                    className="w-full px-3 py-2.5 text-sm bg-background-50 border border-background-300 rounded-md text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="clientEmail" className="block text-sm font-medium text-foreground-700 mb-1.5">
                    Correo Electrónico
                  </label>
                  <input
                    id="clientEmail"
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="cliente@correo.com"
                    className="w-full px-3 py-2.5 text-sm bg-background-50 border border-background-300 rounded-md text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-foreground-700 mb-1.5">
                    Ciudad
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ciudad"
                    className="w-full px-3 py-2.5 text-sm bg-background-50 border border-background-300 rounded-md text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="origen" className="block text-sm font-medium text-foreground-700 mb-1.5">
                    Origen de Cotización <span className="text-accent-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="origen"
                      value={origen}
                      onChange={(e) => {
                        setOrigen(e.target.value);
                        setSelectedAdvisor('');
                        setResponsiblePerson('');
                      }}
                      className="w-full px-3 py-2.5 text-sm bg-background-50 border border-background-300 rounded-md text-foreground-900 appearance-none cursor-pointer focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    >
                      <option value="">Seleccionar origen...</option>
                      {BRANCHES.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <i className="ri-arrow-down-s-line text-foreground-400"></i>
                    </div>
                  </div>
                </div>

                {origen === 'Proyectos Directos' ? (
                  <div>
                    <label htmlFor="responsiblePerson" className="block text-sm font-medium text-foreground-700 mb-1.5">
                      Responsable Interno <span className="text-accent-500">*</span>
                    </label>
                    <input
                      id="responsiblePerson"
                      type="text"
                      value={responsiblePerson}
                      onChange={(e) => setResponsiblePerson(e.target.value)}
                      placeholder="Nombre del responsable del proyecto"
                      className="w-full px-3 py-2.5 text-sm bg-background-50 border border-background-300 rounded-md text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                  </div>
                ) : (
                  <div>
                    <label htmlFor="selectedAdvisor" className="block text-sm font-medium text-foreground-700 mb-1.5">
                      Asesor Responsable <span className="text-accent-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="selectedAdvisor"
                        value={selectedAdvisor}
                        onChange={(e) => setSelectedAdvisor(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm bg-background-50 border border-background-300 rounded-md text-foreground-900 appearance-none cursor-pointer focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                      >
                        <option value="">Seleccionar asesor...</option>
                        {(advisorsByBranch[origen] || []).map((adv) => (
                          <option key={adv.id} value={adv.name}>{adv.name}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <i className="ri-arrow-down-s-line text-foreground-400"></i>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="branch" className="block text-sm font-medium text-foreground-700 mb-1.5">
                    Sucursal
                  </label>
                  <div className="relative">
                    <select
                      id="branch"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-background-50 border border-background-300 rounded-md text-foreground-900 appearance-none cursor-pointer focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    >
                      {BRANCHES.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <i className="ri-arrow-down-s-line text-foreground-400"></i>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="leadSource" className="block text-sm font-medium text-foreground-700 mb-1.5">
                    Fuente del Lead
                  </label>
                  <div className="relative">
                    <select
                      id="leadSource"
                      value={leadSource}
                      onChange={(e) => setLeadSource(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-background-50 border border-background-300 rounded-md text-foreground-900 appearance-none cursor-pointer focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    >
                      <option value="">Seleccionar fuente...</option>
                      {LEAD_SOURCES.map((ls) => (
                        <option key={ls} value={ls}>{ls}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <i className="ri-arrow-down-s-line text-foreground-400"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* --- PRODUCT SEARCH CARD --- */}
            <div className="bg-background-50 border border-background-200 rounded-lg p-6">
              <h2 className="text-base font-semibold text-foreground-800 mb-5 flex items-center gap-2">
                <i className="ri-search-line text-lg text-primary-500"></i>
                Agregar Productos
              </h2>

              <div ref={searchRef} className="relative">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <i className="ri-search-line text-foreground-400 text-sm"></i>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => { if (searchResults.length > 0) setShowSearchResults(true); }}
                    placeholder="Buscar por SKU, modelo o código..."
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-background-50 border border-background-300 rounded-md text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSearchResults(false); }}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                    >
                      <i className="ri-close-line text-foreground-400 hover:text-foreground-600"></i>
                    </button>
                  )}
                </div>

                {showSearchResults && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-background-50 border border-background-200 rounded-lg shadow-sm z-20 max-h-[400px] overflow-y-auto">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-start gap-4 p-4 border-b border-background-100 last:border-b-0 hover:bg-background-50 transition-colors"
                      >
                        <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-background-100">
                          <img
                            src={product.imagen_url || 'https://placehold.co/120x120?text=House'}
                            alt={product.descripcion}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-medium text-foreground-500 bg-background-100 px-1.5 py-0.5 rounded">
                              {product.sku}
                            </span>
                            <span className="text-xs text-foreground-400">{product.marca}</span>
                          </div>
                          <p className="text-sm text-foreground-800 mt-1 line-clamp-2">{product.descripcion}</p>
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span className="text-xs text-foreground-500">
                              Color: {product.color || 'No especificado'}
                            </span>
                            <span className="text-xs font-medium text-primary-700">
                              Precio manual en cotizacion
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => addToCart(product)}
                          className="flex-shrink-0 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-background-50 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                        >
                          <i className="ri-add-line"></i>
                          Agregar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* --- PRODUCTS TABLE CARD --- */}
            <div className="bg-background-50 border border-background-200 rounded-lg p-6">
              <h2 className="text-base font-semibold text-foreground-800 mb-5 flex items-center gap-2">
                <i className="ri-shopping-cart-2-line text-lg text-primary-500"></i>
                Productos en Cotización
                {cartProducts.length > 0 && (
                  <span className="text-xs font-normal text-foreground-500 ml-2">
                    ({cartProducts.length} producto{cartProducts.length !== 1 ? 's' : ''})
                  </span>
                )}
              </h2>

              {cartProducts.length === 0 ? (
                <div className="text-center py-12 text-foreground-400">
                  <div className="w-16 h-16 mx-auto mb-3 bg-background-100 rounded-lg flex items-center justify-center">
                    <i className="ri-shopping-cart-line text-2xl"></i>
                  </div>
                  <p className="text-sm">No hay productos agregados</p>
                  <p className="text-xs mt-1">Busca productos por SKU, modelo o código en la sección superior</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-background-200">
                        <th className="text-left py-3 px-2 text-xs font-medium text-foreground-500 uppercase tracking-wider whitespace-nowrap">
                          SKU
                        </th>
                        <th className="text-left py-3 px-2 text-xs font-medium text-foreground-500 uppercase tracking-wider whitespace-nowrap">
                          Descripción
                        </th>
                        <th className="text-center py-3 px-2 text-xs font-medium text-foreground-500 uppercase tracking-wider whitespace-nowrap">
                          Cantidad
                        </th>
                        <th className="text-center py-3 px-2 text-xs font-medium text-foreground-500 uppercase tracking-wider whitespace-nowrap">
                          Moneda
                        </th>
                        <th className="text-right py-3 px-2 text-xs font-medium text-foreground-500 uppercase tracking-wider whitespace-nowrap">
                          Precio
                        </th>
                        <th className="text-right py-3 px-2 text-xs font-medium text-foreground-500 uppercase tracking-wider whitespace-nowrap">
                          Subtotal
                        </th>
                        <th className="text-center py-3 px-2 text-xs font-medium text-foreground-500 uppercase tracking-wider whitespace-nowrap">
                          Acción
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartProducts.map((cp) => (
                        <tr key={cp.id} className="border-b border-background-100 hover:bg-background-50 transition-colors">
                          <td className="py-3 px-2">
                            <span className="text-xs font-mono font-medium text-foreground-500 bg-background-100 px-1.5 py-0.5 rounded whitespace-nowrap">
                              {cp.sku}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <div>
                              <p className="text-sm text-foreground-800 line-clamp-1">{cp.description}</p>
                              <p className="text-xs text-foreground-500 mt-0.5">{cp.brand} &middot; {cp.color}</p>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => updateQuantity(cp.id, cp.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center border border-background-300 rounded hover:bg-background-100 transition-colors cursor-pointer"
                              >
                                <i className="ri-subtract-line text-xs text-foreground-600"></i>
                              </button>
                              <input
                                type="number"
                                value={cp.quantity}
                                onChange={(e) => updateQuantity(cp.id, parseInt(e.target.value) || 1)}
                                min="1"
                                className="w-12 text-center text-sm mx-1 py-1 bg-background-50 border border-background-300 rounded text-foreground-900 focus:outline-none focus:border-primary-500"
                              />
                              <button
                                onClick={() => updateQuantity(cp.id, cp.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center border border-background-300 rounded hover:bg-background-100 transition-colors cursor-pointer"
                              >
                                <i className="ri-add-line text-xs text-foreground-600"></i>
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex justify-center">
                              <div className="inline-flex rounded-md border border-background-300 overflow-hidden">
                                <button
                                  onClick={() => updateCurrency(cp.id, 'MXN')}
                                  className={`px-2 py-1 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                                    cp.currency === 'MXN'
                                      ? 'bg-primary-500 text-background-50'
                                      : 'bg-background-50 text-foreground-600 hover:bg-background-100'
                                  }`}
                                >
                                  MXN
                                </button>
                                <button
                                  onClick={() => updateCurrency(cp.id, 'USD')}
                                  className={`px-2 py-1 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                                    cp.currency === 'USD'
                                      ? 'bg-primary-500 text-background-50'
                                      : 'bg-background-50 text-foreground-600 hover:bg-background-100'
                                  }`}
                                >
                                  USD
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex justify-end">
                              <div className="relative w-[130px]">
                                <span className="absolute inset-y-0 left-2 flex items-center text-xs text-foreground-400 pointer-events-none">
                                  $
                                </span>
                                <input
                                  type="number"
                                  value={cp.unitPrice}
                                  onChange={(e) => updateUnitPrice(cp.id, parseFloat(e.target.value) || 0)}
                                  min="0"
                                  step="0.01"
                                  className="w-full pl-6 pr-2 py-1.5 text-sm text-right bg-background-50 border border-background-300 rounded text-foreground-900 focus:outline-none focus:border-primary-500"
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <span className="text-sm font-semibold text-foreground-800 whitespace-nowrap">
                              {formatCurrency(cp.subtotal, cp.currency)}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <button
                              onClick={() => removeFromCart(cp.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-accent-50 text-foreground-400 hover:text-accent-600 transition-colors cursor-pointer"
                              title="Eliminar producto"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* ===== RIGHT COLUMN ===== */}
          <div className="lg:w-[340px] flex flex-col gap-4">
            {/* --- SUMMARY CARD --- */}
            <div className="bg-background-50 border border-background-200 rounded-lg p-6 sticky top-[72px]">
              <h2 className="text-base font-semibold text-foreground-800 mb-5 flex items-center gap-2">
                <i className="ri-file-text-line text-lg text-primary-500"></i>
                Resumen
              </h2>

              <div className="border-b border-background-200 pb-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground-600">Productos</span>
                  <span className="text-sm font-medium text-foreground-800">{cartProducts.length}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground-600">Subtotal</span>
                  <span className="text-sm font-semibold text-foreground-900">
                    {formatCurrency(totalSubtotal, getMainCurrency())}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground-600">IVA 16%</span>
                  <span className="text-sm font-semibold text-foreground-900">
                    {formatCurrency(totalIva, getMainCurrency())}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-background-200">
                  <span className="text-sm font-medium text-foreground-800">Total</span>
                  <span className="text-lg font-bold text-foreground-900">
                    {formatCurrency(grandTotal, getMainCurrency())}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="notes" className="block text-sm font-medium text-foreground-700 mb-1.5">
                  Observaciones
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Notas adicionales, condiciones especiales..."
                  className="w-full px-3 py-2.5 text-sm bg-background-50 border border-background-300 rounded-md text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
                />
                <p className="text-xs text-foreground-400 mt-1 text-right">{notes.length}/500</p>
              </div>

              <div className="mb-5">
                <label htmlFor="validity" className="block text-sm font-medium text-foreground-700 mb-1.5">
                  Vigencia de Cotización
                </label>
                <div className="relative">
                  <select
                    id="validity"
                    value={validityDays}
                    onChange={(e) => setValidityDays(parseInt(e.target.value))}
                    className="w-full px-3 py-2.5 text-sm bg-background-50 border border-background-300 rounded-md text-foreground-900 appearance-none cursor-pointer focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  >
                    <option value={7}>7 días</option>
                    <option value={15}>15 días</option>
                    <option value={30}>30 días</option>
                    <option value={60}>60 días</option>
                    <option value={90}>90 días</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <i className="ri-arrow-down-s-line text-foreground-400"></i>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setShowPreview(true)}
                  className="w-full py-2.5 border border-background-300 text-foreground-700 text-sm font-medium rounded-md hover:bg-background-100 transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
                >
                  <i className="ri-eye-line"></i>
                  Vista Previa
                </button>

                <button
                  onClick={handlePrintPdf}
                  disabled={generatingPdf || cartProducts.length === 0}
                  className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 text-background-50 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {generatingPdf ? (
                    <>
                      <i className="ri-loader-4-line animate-spin"></i>
                      Generando...
                    </>
                  ) : (
                    <>
                      <i className="ri-file-pdf-line"></i>
                      Generar PDF
                    </>
                  )}
                </button>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-2.5 text-foreground-500 text-sm font-medium rounded-md hover:text-foreground-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== PREVIEW MODAL ===== */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[5vh]">
          <div className="absolute inset-0 bg-foreground-950/40" onClick={() => setShowPreview(false)} />
          <div className="relative bg-background-50 rounded-lg w-full max-w-[980px] max-h-[90vh] overflow-hidden mx-4">
            <div className="sticky top-0 bg-background-50 border-b border-background-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-foreground-900">Vista Previa de Cotización</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-background-100 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-lg text-foreground-500"></i>
              </button>
            </div>

            <div className="bg-background-100 p-4 h-[calc(90vh-136px)] overflow-auto">
              <iframe
                title="Vista previa de cotizacion"
                srcDoc={previewHtml}
                className="w-full h-full min-h-[760px] bg-background-50 border border-background-200 rounded-md"
              />
            </div>

            <div className="hidden">
              <div className="text-center border-b border-background-200 pb-5">
                <div className="w-12 h-12 bg-primary-500 rounded-md flex items-center justify-center mx-auto mb-3">
                  <i className="ri-home-office-line text-xl text-background-50"></i>
                </div>
                <h3 className="text-lg font-bold text-foreground-900">Cotizaciones House</h3>
                <p className="text-xs text-foreground-500 mt-1">
                  Cotización generada el {date} &mdash; Vigencia: {validityDays} días
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex gap-2">
                  <span className="text-foreground-500 font-medium whitespace-nowrap">Cliente:</span>
                  <span className="text-foreground-800">{clientName || '—'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-foreground-500 font-medium whitespace-nowrap">Teléfono:</span>
                  <span className="text-foreground-800">{clientPhone || '—'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-foreground-500 font-medium whitespace-nowrap">Correo:</span>
                  <span className="text-foreground-800">{clientEmail || '—'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-foreground-500 font-medium whitespace-nowrap">Ciudad:</span>
                  <span className="text-foreground-800">{city || '—'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-foreground-500 font-medium whitespace-nowrap">Origen:</span>
                  <span className="text-foreground-800">{origen}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-foreground-500 font-medium whitespace-nowrap">
                    {origen === 'Proyectos Directos' ? 'Responsable:' : 'Asesor:'}
                  </span>
                  <span className="text-foreground-800">
                    {origen === 'Proyectos Directos' ? (responsiblePerson || '—') : (selectedAdvisor || '—')}
                  </span>
                </div>
              </div>

              <div className="border-t border-background-200 pt-5">
                <h4 className="text-sm font-semibold text-foreground-800 mb-3">Productos</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-background-200">
                      <th className="text-left py-2 px-2 text-xs font-medium text-foreground-500">SKU</th>
                      <th className="text-left py-2 px-2 text-xs font-medium text-foreground-500">Descripción</th>
                      <th className="text-center py-2 px-2 text-xs font-medium text-foreground-500">Cant.</th>
                      <th className="text-right py-2 px-2 text-xs font-medium text-foreground-500">Precio</th>
                      <th className="text-right py-2 px-2 text-xs font-medium text-foreground-500">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartProducts.map((cp) => (
                      <tr key={cp.id} className="border-b border-background-100">
                        <td className="py-2 px-2 text-xs text-foreground-600">{cp.sku}</td>
                        <td className="py-2 px-2 text-xs text-foreground-800">{cp.brand} - {cp.description.slice(0, 50)}...</td>
                        <td className="py-2 px-2 text-xs text-center text-foreground-800">{cp.quantity}</td>
                        <td className="py-2 px-2 text-xs text-right text-foreground-700">{formatCurrency(cp.unitPrice, cp.currency)}</td>
                        <td className="py-2 px-2 text-xs text-right font-medium text-foreground-800">{formatCurrency(cp.subtotal, cp.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {cartProducts.length === 0 && (
                  <p className="text-center text-sm text-foreground-400 py-4">Sin productos en la cotización</p>
                )}
              </div>

              <div className="border-t border-background-200 pt-4 flex justify-end">
                <div className="text-right">
                  <span className="text-sm text-foreground-600">Subtotal: </span>
                  <span className="text-lg font-bold text-foreground-900">
                    ${totalSubtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {notes && (
                <div className="border-t border-background-200 pt-4">
                  <h4 className="text-sm font-semibold text-foreground-800 mb-2">Observaciones</h4>
                  <p className="text-sm text-foreground-600">{notes}</p>
                </div>
              )}

              <div className="border-t border-background-200 pt-4">
                <h4 className="text-sm font-semibold text-foreground-800 mb-2">Politica comercial</h4>
                <p className="text-xs text-foreground-600">{PDF_POLICY}</p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-background-50 border-t border-background-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 border border-background-300 text-foreground-700 text-sm font-medium rounded-md hover:bg-background-100 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cerrar
              </button>
              <button
                onClick={() => { setShowPreview(false); handlePrintPdf(); }}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-background-50 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
              >
                <i className="ri-file-pdf-line"></i>
                Generar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
