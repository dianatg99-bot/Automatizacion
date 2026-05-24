export interface Product {
  id: string; // unique ID generated for client-side lists
  sku: string;
  descripcion: string;
  marca: string;
  categoria: string;
  precioRegular: number;
  precioHoy: number;
  precioTarjetaAlkosto: number | null;
  precioAnterior: number | null;
  tieneDescuento: boolean;
  descuentoPct: number;
  fechaCaptura: string;
  originalRow: Record<string, string>;
}

export interface AnalysisResponse {
  markdown: string;
  productName: string;
  brand: string;
  sku: string;
  precioHoy: number;
  precioTarjetaAlkosto: number | null;
  precioRegular: number;
  discountPct: number;
  state: "🔥 Oferta Real" | "⚠️ Precio Estándar" | "❌ Inflado" | string;
  trend: "Al alza" | "A la baja" | "Estable" | string;
  verdict: "COMPRAR YA" | "ESPERAR" | string;
  suggestedProducts?: string[]; // SKUs of top 3 alternatives
}

export interface PresetDataset {
  name: string;
  description: string;
  category: string;
  csvContent: string;
}
