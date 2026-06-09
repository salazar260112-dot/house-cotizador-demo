import { PDF_POLICY } from '@/lib/constants';
import type { Currency, QuoteLineInput, QuoteSummary } from '@/types/app';

interface RenderQuoteHtmlInput {
  quote: Partial<QuoteSummary>;
  detalle: QuoteLineInput[];
  validityDays: number;
  appBaseUrl?: string;
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatCurrency(value: number, currency: Currency = 'MXN') {
  const locale = currency === 'USD' ? 'en-US' : 'es-MX';
  const amount = Number(value || 0).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `$${amount} ${currency}`;
}

function formatDate(value?: string) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function resolveLogoUrl(appBaseUrl?: string) {
  const baseUrl = appBaseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${baseUrl.replace(/\/$/, '')}/assets/house-logo.jpg`;
}

export function renderQuotationHtml({
  quote,
  detalle,
  validityDays,
  appBaseUrl,
}: RenderQuoteHtmlInput) {
  const logoUrl = resolveLogoUrl(appBaseUrl);
  const currency = quote.moneda_principal || detalle[0]?.moneda || 'MXN';
  const subtotal = Number(quote.subtotal ?? detalle.reduce((sum, item) => sum + Number(item.subtotal || 0), 0));
  const total = Number(quote.total ?? subtotal * 1.16);
  const iva = Math.max(total - subtotal, 0);
  const date = quote.fecha_cotizacion || new Date().toISOString().slice(0, 10);
  const folio = quote.folio || 'COT-PREVIA';
  const rows = detalle
    .map((item) => {
      const imageHtml = item.imagen_url
        ? `<img class="product-image" src="${escapeHtml(item.imagen_url)}" alt="${escapeHtml(item.modelo || item.sku)}" />`
        : '<div class="image-slot">Imagen</div>';

      return `
        <tr>
          <td class="qty">${escapeHtml(item.cantidad)}</td>
          <td class="brand">${escapeHtml(item.marca || 'House')}</td>
          <td class="model">${escapeHtml(item.modelo || item.sku)}</td>
          <td class="description">${escapeHtml(item.descripcion)}</td>
          <td class="money">${formatCurrency(Number(item.precio_unitario || 0), item.moneda)}</td>
          <td class="money">${formatCurrency(Number(item.subtotal || 0), item.moneda)}</td>
          <td>${imageHtml}</td>
        </tr>
      `;
    })
    .join('');

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(folio)} | House Electrodomesticos</title>
  <style>
    :root {
      --ink: #172126;
      --muted: #637078;
      --line: #d9e0e3;
      --soft: #f4f7f8;
      --brand: #0d9488;
      --brand-dark: #0f766e;
      --accent: #e7b65c;
    }

    * { box-sizing: border-box; }

    @page {
      size: Letter;
      margin: 0;
    }

    body {
      margin: 0;
      background: #fff;
      color: var(--ink);
      font-family: Arial, Helvetica, sans-serif;
      font-size: 12px;
      line-height: 1.35;
    }

    .page {
      width: 216mm;
      min-height: 279mm;
      margin: 0 auto;
      background: #fff;
      overflow: hidden;
    }

    .top-rule {
      height: 10px;
      background: linear-gradient(90deg, var(--brand), var(--brand-dark) 48%, var(--accent));
    }

    .content { padding: 24px 30px 22px; }

    .header {
      display: grid;
      grid-template-columns: 1fr 265px;
      gap: 26px;
      align-items: start;
      margin-bottom: 20px;
    }

    .brand-block {
      display: flex;
      gap: 18px;
      align-items: center;
    }

    .logo {
      width: 190px;
      height: auto;
      display: block;
    }

    .quote-title {
      border-left: 1px solid var(--line);
      padding-left: 18px;
    }

    .quote-title h1 {
      margin: 0 0 5px;
      font-size: 26px;
      letter-spacing: 0;
      color: var(--ink);
    }

    .quote-title p {
      margin: 0;
      color: var(--muted);
      font-size: 12px;
    }

    .folio-card {
      border: 1px solid var(--line);
      border-radius: 8px;
      overflow: hidden;
    }

    .folio-card .folio-head {
      background: var(--ink);
      color: #fff;
      padding: 10px 14px;
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
    }

    .folio-card .folio-head strong { font-size: 14px; }

    .folio-card .folio-body {
      padding: 12px 14px;
      display: grid;
      gap: 8px;
    }

    .small-row {
      display: flex;
      justify-content: space-between;
      gap: 14px;
    }

    .label {
      color: var(--muted);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0;
      font-weight: 700;
    }

    .value {
      color: var(--ink);
      font-weight: 700;
      text-align: right;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1.05fr 0.95fr;
      gap: 14px;
      margin-bottom: 16px;
    }

    .panel {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 13px 14px;
      background: #fff;
    }

    .panel h2 {
      margin: 0 0 10px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0;
      color: var(--brand-dark);
    }

    .details {
      display: grid;
      grid-template-columns: 105px 1fr;
      gap: 6px 10px;
    }

    .details span:nth-child(odd) {
      color: var(--muted);
      font-weight: 700;
    }

    .details span:nth-child(even) {
      color: var(--ink);
      font-weight: 600;
    }

    .branch-list { display: grid; gap: 7px; }

    .branch {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      border-bottom: 1px solid var(--soft);
      padding-bottom: 6px;
    }

    .branch:last-child { border-bottom: 0; padding-bottom: 0; }

    .intro {
      margin: 0 0 14px;
      padding: 12px 14px;
      background: var(--soft);
      border-left: 4px solid var(--brand);
      border-radius: 0 8px 8px 0;
      color: #36434a;
    }

    table { border-collapse: collapse; width: 100%; }

    .items {
      border: 1px solid var(--line);
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 14px;
    }

    .items thead th {
      background: var(--ink);
      color: #fff;
      padding: 10px 8px;
      text-align: left;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0;
    }

    .items tbody td {
      padding: 10px 8px;
      border-bottom: 1px solid var(--line);
      vertical-align: top;
    }

    .items tbody tr:last-child td { border-bottom: 0; }
    .items .qty { width: 48px; text-align: center; font-weight: 700; }
    .items .brand { color: var(--brand-dark); font-weight: 800; }
    .items .model { font-weight: 800; color: var(--ink); white-space: nowrap; }
    .items .description { min-width: 225px; color: #2e3a40; }
    .items .money { text-align: right; white-space: nowrap; font-weight: 700; }

    .image-slot,
    .product-image {
      width: 72px;
      height: 54px;
      border-radius: 6px;
    }

    .image-slot {
      border: 1px dashed #b8c4c9;
      background: #fafcfc;
      color: #8a979d;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      text-transform: uppercase;
      font-weight: 700;
    }

    .product-image {
      object-fit: contain;
      border: 1px solid var(--line);
      background: #fff;
    }

    .summary-area {
      display: grid;
      grid-template-columns: 1fr 268px;
      gap: 16px;
      margin-bottom: 14px;
      align-items: start;
    }

    .note-box {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 12px 14px;
      min-height: 93px;
    }

    .note-box h3,
    .totals h3,
    .terms h3 {
      margin: 0 0 8px;
      font-size: 12px;
      text-transform: uppercase;
      color: var(--brand-dark);
    }

    .totals {
      border: 1px solid var(--line);
      border-radius: 8px;
      overflow: hidden;
    }

    .totals h3 { padding: 12px 14px 0; }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 7px 14px;
      border-top: 1px solid var(--soft);
      gap: 12px;
    }

    .total-row.grand {
      background: var(--brand);
      color: #fff;
      font-size: 16px;
      font-weight: 800;
      padding: 12px 14px;
    }

    .terms {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 12px 14px;
      background: #fff;
    }

    .terms-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 18px;
      margin: 0;
      padding-left: 16px;
      color: #354249;
    }

    .terms-grid li { margin-bottom: 3px; }

    .policy {
      margin-top: 12px;
      padding: 10px 12px;
      background: #fff7e8;
      border: 1px solid #f1d19b;
      border-radius: 8px;
      color: #5d4314;
      font-weight: 700;
    }

    .footer {
      margin-top: 14px;
      display: flex;
      justify-content: space-between;
      gap: 18px;
      color: var(--muted);
      font-size: 10px;
      border-top: 1px solid var(--line);
      padding-top: 10px;
    }
  </style>
</head>
<body>
  <main class="page">
    <div class="top-rule"></div>
    <div class="content">
      <header class="header">
        <div class="brand-block">
          <img class="logo" src="${escapeHtml(logoUrl)}" alt="House Electrodomesticos" />
          <div class="quote-title">
            <h1>Cotizacion</h1>
            <p>Propuesta comercial de electrodomesticos premium</p>
          </div>
        </div>

        <aside class="folio-card">
          <div class="folio-head">
            <span>Folio</span>
            <strong>${escapeHtml(folio)}</strong>
          </div>
          <div class="folio-body">
            <div class="small-row"><span class="label">Fecha</span><span class="value">${escapeHtml(formatDate(date))}</span></div>
            <div class="small-row"><span class="label">Validez</span><span class="value">${escapeHtml(validityDays)} dias naturales</span></div>
            <div class="small-row"><span class="label">Moneda</span><span class="value">${escapeHtml(currency)}</span></div>
          </div>
        </aside>
      </header>

      <section class="info-grid">
        <div class="panel">
          <h2>Datos del cliente</h2>
          <div class="details">
            <span>Cliente</span><span>${escapeHtml(quote.cliente_nombre)}</span>
            <span>Telefono</span><span>${escapeHtml(quote.cliente_telefono)}</span>
            <span>Correo</span><span>${escapeHtml(quote.cliente_correo)}</span>
            <span>Ciudad</span><span>${escapeHtml(quote.cliente_ciudad)}</span>
            <span>Origen</span><span>${escapeHtml(quote.origen)}</span>
          </div>
        </div>

        <div class="panel">
          <h2>Atencion comercial</h2>
          <div class="details">
            <span>Asesor</span><span>${escapeHtml(quote.asesor_nombre)}</span>
            <span>Sucursal</span><span>${escapeHtml(quote.sucursal)}</span>
            <span>Fuente</span><span>${escapeHtml(quote.fuente_lead || 'No especificada')}</span>
            <span>Entrega</span><span>Segun cobertura</span>
          </div>
        </div>
      </section>

      <section class="panel" style="margin-bottom: 14px;">
        <h2>Sucursales</h2>
        <div class="branch-list">
          <div class="branch"><strong>Hermosillo</strong><span>Suc. Colosio Tel. (662) 215.2678</span></div>
          <div class="branch"><strong>Culiacan</strong><span>Suc. Culiacan Tel. (667) 715.1054</span></div>
          <div class="branch"><strong>Los Cabos</strong><span>Suc. Cabo Tel. (624) 104.3844</span></div>
        </div>
      </section>

      <p class="intro">
        Por medio de la presente se enlista la siguiente cotizacion de productos. Los precios finales, promociones y disponibilidad deberan ser confirmados por el asesor responsable antes de la compra.
      </p>

      <section class="items">
        <table>
          <thead>
            <tr>
              <th>Cant.</th>
              <th>Marca</th>
              <th>Modelo / SKU</th>
              <th>Descripcion</th>
              <th>Precio unitario</th>
              <th>Subtotal</th>
              <th>Imagen</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </section>

      <section class="summary-area">
        <div class="note-box">
          <h3>Observaciones</h3>
          <p>${escapeHtml(quote.observaciones || 'Sin observaciones adicionales.')}</p>
        </div>

        <div class="totals">
          <h3>Resumen</h3>
          <div class="total-row"><span>Productos</span><strong>${escapeHtml(detalle.length)}</strong></div>
          <div class="total-row"><span>Subtotal</span><strong>${formatCurrency(subtotal, currency)}</strong></div>
          <div class="total-row"><span>IVA 16%</span><strong>${formatCurrency(iva, currency)}</strong></div>
          <div class="total-row grand"><span>Total</span><span>${formatCurrency(total, currency)}</span></div>
        </div>
      </section>

      <section class="terms">
        <h3>Condiciones generales</h3>
        <ol class="terms-grid">
          <li>Precios incluyen IVA cuando aplique.</li>
          <li>Anticipos y formas de pago sujetos a confirmacion del asesor.</li>
          <li>Garantia de 1 ano por defecto de fabrica otorgada por el fabricante.</li>
          <li>La entrega fuera del area de reparto puede generar cargo adicional.</li>
          <li>Al recibir el producto, revisar que la caja se encuentre en buen estado.</li>
          <li>No abrir cajas danadas; reportar inmediatamente al asesor.</li>
          <li>Modelos obsoletos o descontinuados deberan recotizarse.</li>
          <li>Tiempo de entrega sujeto a disponibilidad y confirmacion.</li>
        </ol>
        <div class="policy">${escapeHtml(PDF_POLICY)}</div>
      </section>

      <footer class="footer">
        <span>House Electrodomesticos | Cotizacion generada por el sistema interno de asesores</span>
        <span>Pagina 1 de 1</span>
      </footer>
    </div>
  </main>
</body>
</html>`;
}
