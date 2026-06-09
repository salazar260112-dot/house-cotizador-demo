export type UserRole = 'asesor' | 'supervisor';
export type Currency = 'USD' | 'MXN';

export interface AppUser {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  sucursal: string;
  activo: boolean;
  role?: string;
  userRole?: 'advisor' | 'supervisor';
  name?: string;
  branch?: string;
}

export interface Product {
  id: string;
  sku: string;
  modelo: string;
  marca: string;
  descripcion: string;
  color: string;
  imagen_url: string;
  activo: boolean;
  precio_usd?: number;
  precio_mxn?: number;
}

export interface QuoteSummary {
  id: string;
  folio: string;
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
  estatus: string;
  pdf_url: string | null;
  created_at: string;
}

export interface QuoteLineInput {
  producto_id: string;
  sku: string;
  modelo: string;
  descripcion: string;
  cantidad: number;
  moneda: Currency;
  precio_unitario: number;
  subtotal: number;
}

