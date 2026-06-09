export interface QuotationProduct {
  id: string;
  sku: string;
  description: string;
  brand: string;
  quantity: number;
  currency: 'USD' | 'MXN';
  unitPrice: number;
  subtotal: number;
}

export interface Quotation {
  id: string;
  date: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  city: string;
  branch: string;
  advisor: string;
  leadSource: string;
  products: QuotationProduct[];
  notes: string;
  validityDays: number;
  subtotal: number;
}