import { Product } from "../types";
import { formatPrice } from "../data";
import { BarChart3, Percent, CreditCard, ChevronDown } from "lucide-react";

interface MetricsProps {
  products: Product[];
}

export default function DashboardMetrics({ products }: MetricsProps) {
  // Calculate stats based on the latest date for each SKU in the products list
  const getLatestProducts = () => {
    // Group by SKU and keep latest capture
    const map = new Map<string, Product>();
    products.forEach((p) => {
      const existing = map.get(p.sku);
      if (!existing || new Date(p.fechaCaptura) > new Date(existing.fechaCaptura)) {
        map.set(p.sku, p);
      }
    });
    return Array.from(map.values());
  };

  const latestItems = getLatestProducts();
  const totalProducts = latestItems.length;
  
  const maxDiscountItem = latestItems.reduce(
    (max, item) => (item.descuentoPct > max.descuentoPct ? item : max),
    { descuentoPct: 0 } as any
  );

  const alkostoCardOpportunities = latestItems.filter(
    (p) => p.precioTarjetaAlkosto && p.precioTarjetaAlkosto < p.precioHoy
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 font-mono">
      {/* Metric 1 */}
      <div className="bg-tech-card rounded-lg border border-tech-border p-5 flex items-center justify-between shadow-xs transition-all hover:border-tech-accent/40 group">
        <div>
          <span className="text-[10px] font-bold text-tech-text-secondary uppercase tracking-[0.14em] block">
            Índice de SKUs
          </span>
          <span className="text-3xl font-black text-white mt-1.5 block">
            {totalProducts}
          </span>
          <span className="text-xs text-tech-text-secondary mt-1.5 block font-sans">
            Productos únicos analizados
          </span>
        </div>
        <div className="w-12 h-12 rounded-lg bg-tech-accent/5 border border-tech-accent/20 group-hover:border-tech-accent/40 flex items-center justify-center text-tech-accent transition-all">
          <BarChart3 className="w-5 h-5" />
        </div>
      </div>

      {/* Metric 2 */}
      <div className="bg-tech-card rounded-lg border border-tech-border p-5 flex items-center justify-between shadow-xs transition-all hover:border-tech-accent/40 group">
        <div>
          <span className="text-[10px] font-bold text-tech-text-secondary uppercase tracking-[0.14em] block">
            Descuento Máximo Actual
          </span>
          <span className="text-3xl font-black text-tech-accent mt-1.5 block flex items-baseline gap-1">
            {maxDiscountItem.descuentoPct}%
          </span>
          <span className="text-xs text-slate-400 mt-1.5 block truncate max-w-[200px] font-sans font-medium">
            {maxDiscountItem.descripcion ? `${maxDiscountItem.marca} - ${maxDiscountItem.descripcion}` : "Ninguno activo"}
          </span>
        </div>
        <div className="w-12 h-12 rounded-lg bg-tech-accent/10 border border-tech-accent flex items-center justify-center text-tech-accent shadow-[0_0_10px_rgba(0,245,255,0.15)] transition-all">
          <Percent className="w-5 h-5" />
        </div>
      </div>

      {/* Metric 3 */}
      <div className="bg-tech-card rounded-lg border border-tech-border p-5 flex items-center justify-between shadow-xs transition-all hover:border-tech-accent/40 group">
        <div>
          <span className="text-[10px] font-bold text-tech-text-secondary uppercase tracking-[0.14em] block">
            Fidelización Alkosto
          </span>
          <span className="text-3xl font-black text-amber-500 mt-1.5 block">
            {alkostoCardOpportunities}
          </span>
          <span className="text-xs text-tech-text-secondary mt-1.5 block font-sans">
            Ofertas exclusivas con Tarjeta
          </span>
        </div>
        <div className="w-12 h-12 rounded-lg bg-amber-500/5 border border-amber-500/20 group-hover:border-amber-500/40 flex items-center justify-center text-amber-500 transition-all">
          <CreditCard className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
