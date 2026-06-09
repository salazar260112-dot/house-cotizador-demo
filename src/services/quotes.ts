import { PDF_POLICY } from '@/lib/constants';
import { requireSupabase } from '@/lib/supabase';
import type { Currency, QuoteLineInput, QuoteSummary } from '@/types/app';

interface CreateQuoteInput {
  fecha_cotizacion: string;
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_correo: string;
  cliente_ciudad: string;
  origen: string;
  sucursal: string;
  asesor_id: string;
  asesor_nombre: string;
  fuente_lead: string;
  observaciones: string;
  subtotal: number;
  total: number;
  moneda_principal: Currency;
  detalle: QuoteLineInput[];
}

function getPdfWebhookUrl() {
  return import.meta.env.VITE_N8N_WEBHOOK_GENERAR_PDF || import.meta.env.N8N_WEBHOOK_GENERAR_PDF || '';
}

function getAppBaseUrl() {
  return import.meta.env.VITE_APP_BASE_URL || import.meta.env.APP_BASE_URL || window.location.origin;
}

export async function createQuoteAndRequestPdf(input: CreateQuoteInput) {
  const client = requireSupabase();

  const { data: quote, error: quoteError } = await client
    .from('cotizaciones')
    .insert({
      fecha_cotizacion: input.fecha_cotizacion,
      cliente_nombre: input.cliente_nombre,
      cliente_telefono: input.cliente_telefono,
      cliente_correo: input.cliente_correo,
      cliente_ciudad: input.cliente_ciudad,
      origen: input.origen,
      sucursal: input.sucursal,
      asesor_id: input.asesor_id,
      asesor_nombre: input.asesor_nombre,
      fuente_lead: input.fuente_lead,
      observaciones: input.observaciones,
      subtotal: input.subtotal,
      total: input.total,
      moneda_principal: input.moneda_principal,
      estatus: 'Pendiente',
    })
    .select('*')
    .single();

  if (quoteError) throw quoteError;

  const detalle = input.detalle.map((line) => ({
    ...line,
    cotizacion_id: quote.id,
  }));

  const { error: detailError } = await client.from('cotizacion_detalle').insert(detalle);
  if (detailError) throw detailError;

  const webhookUrl = getPdfWebhookUrl();
  let pdfUrl = '';

  if (webhookUrl) {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_base_url: getAppBaseUrl(),
        politica_pdf: PDF_POLICY,
        cotizacion: quote,
        detalle,
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n no pudo generar el PDF (${response.status})`);
    }

    const result = await response.json().catch(() => ({}));
    pdfUrl = result.pdf_url || result.pdfUrl || result.url || '';
  }

  if (pdfUrl) {
    const { data: updated, error: updateError } = await client
      .from('cotizaciones')
      .update({ pdf_url: pdfUrl, estatus: 'Enviada' })
      .eq('id', quote.id)
      .select('*')
      .single();
    if (updateError) throw updateError;
    return updated as QuoteSummary;
  }

  return quote as QuoteSummary;
}

export async function listQuotes() {
  const client = requireSupabase();
  const { data, error } = await client
    .from('cotizaciones')
    .select('*')
    .order('fecha_cotizacion', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as QuoteSummary[];
}

