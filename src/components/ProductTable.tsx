import { useState, useMemo, useEffect } from "react";
import { Product } from "../types";
import { formatPrice } from "../data";
import { Search, ChevronDown, ChevronUp, Tag, Percent, ArrowUpDown } from "lucide-react";

interface ProductTableProps {
  products: Product[];
  selectedSku: string;
  onSelectProduct: (sku: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

type SortField = "descripcion" | "marca" | "precioHoy" | "descuentoPct" | "fechaCaptura";
type SortOrder = "asc" | "desc";

export default function ProductTable({
  products,
  selectedSku,
  onSelectProduct,
  selectedCategory,
  setSelectedCategory,
}: ProductTableProps) {
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("Todas");
  const [sortField, setSortField] = useState<SortField>("descuentoPct");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [visibleCount, setVisibleCount] = useState(50);

  // Reset pagination if filters are modified to prevent rendering overhead
  useEffect(() => {
    setVisibleCount(50);
  }, [selectedCategory, selectedBrand, search, sortField, sortOrder, products]);

  // Get only the latest pricing records for the main listing
  const latestProductsList = useMemo(() => {
    const map = new Map<string, Product>();
    products.forEach((p) => {
      const existing = map.get(p.sku);
      if (!existing || new Date(p.fechaCaptura) > new Date(existing.fechaCaptura)) {
        map.set(p.sku, p);
      }
    });
    return Array.from(map.values());
  }, [products]);

  // Extract unique brands and categories for filtering dropdowns
  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.marca) set.add(p.marca);
    });
    return ["Todas", ...Array.from(set)];
  }, [products]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.categoria) set.add(p.categoria);
    });
    return ["Todas", ...Array.from(set)];
  }, [products]);

  // Handle columns sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Filtered and sorted list
  const filteredAndSorted = useMemo(() => {
    let list = [...latestProductsList];

    // Category filter
    if (selectedCategory !== "Todas") {
      list = list.filter(
        (p) => p.categoria.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Brand filter
    if (selectedBrand !== "Todas") {
      list = list.filter(
        (p) => p.marca.toLowerCase() === selectedBrand.toLowerCase()
      );
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.descripcion.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.marca.toLowerCase().includes(q)
      );
    }

    // Sorting
    list.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      // Handle strings
      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [latestProductsList, selectedCategory, selectedBrand, search, sortField, sortOrder]);

  return (
    <div className="bg-tech-card rounded-lg border border-tech-border shadow-xs overflow-hidden flex flex-col h-full font-mono">
      {/* Search & Filter Header */}
      <div className="p-4 border-b border-tech-border space-y-3 bg-[#1D2026]/70">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-tech-text-secondary" />
            <input
              type="text"
              placeholder="Buscar por descripción, marca o SKU..."
              className="w-full pl-9 pr-4 py-2 border border-tech-border rounded-md text-xs bg-tech-bg text-white focus:outline-hidden focus:border-tech-accent focus:ring-1 focus:ring-tech-accent/40 placeholder:text-tech-text-secondary font-sans transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Brand Filter */}
          <div className="flex gap-2">
            <select
              className="px-3 py-2 border border-tech-border rounded-md text-xs bg-tech-bg text-white focus:outline-hidden focus:border-tech-accent font-bold max-w-[170px]"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="Todas" className="bg-tech-bg text-white">Todas las Marcas</option>
              {brands.filter(b => b !== "Todas").map((b) => (
                <option key={b} value={b} className="bg-tech-bg text-white">{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-wider transition-all border ${
                selectedCategory === cat
                  ? "bg-tech-accent-dim border-tech-accent text-tech-accent shadow-[0_0_8px_rgba(0,245,255,0.15)]"
                  : "bg-tech-bg hover:bg-[#1E2127] border-tech-border text-tech-text-secondary hover:text-white"
              }`}
            >
              {cat === "Todas" ? "Todas las Categorías" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-y-auto max-h-[440px] flex-1">
        {filteredAndSorted.length === 0 ? (
          <div className="p-12 text-center text-tech-text-secondary space-y-2">
            <Tag className="w-12 h-12 stroke-1 mx-auto text-tech-border" />
            <p className="font-bold text-white text-sm uppercase tracking-wider">No se encontraron productos</p>
            <p className="text-xs">Usa otros filtros o importa un archivo de datos diferente.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-tech-border text-left">
            <thead className="bg-[#0D0E10] sticky top-0 border-b border-tech-border z-10">
              <tr>
                <th
                  className="px-4 py-3 text-[10px] font-bold text-tech-text-secondary uppercase tracking-[0.14em] cursor-pointer hover:text-tech-accent transition-colors"
                  onClick={() => handleSort("descripcion")}
                >
                  <span className="flex items-center gap-1 font-mono">
                    Producto 
                    <ArrowUpDown className="w-3 h-3 text-tech-accent/60" />
                  </span>
                </th>
                <th
                  className="px-4 py-3 text-[10px] font-bold text-tech-text-secondary uppercase tracking-[0.14em] cursor-pointer hover:text-tech-accent transition-colors"
                  onClick={() => handleSort("marca")}
                >
                  Marca
                </th>
                <th
                  className="px-4 py-3 text-[10px] font-bold text-tech-text-secondary uppercase tracking-[0.14em] cursor-pointer hover:text-tech-accent transition-colors text-right"
                  onClick={() => handleSort("precioHoy")}
                >
                  <span className="flex items-center justify-end gap-1 font-mono">
                    Precio Hoy
                    <ArrowUpDown className="w-3 h-3 text-tech-accent/60" />
                  </span>
                </th>
                <th
                  className="px-4 py-3 text-[10px] font-bold text-tech-text-secondary uppercase tracking-[0.14em] cursor-pointer hover:text-tech-accent transition-colors text-center"
                  onClick={() => handleSort("descuentoPct")}
                >
                  <span className="flex items-center justify-center gap-1 font-mono">
                    Desc.
                    <ArrowUpDown className="w-3 h-3 text-tech-accent/60" />
                  </span>
                </th>
                <th className="px-4 py-3 text-[10px] font-bold text-tech-text-secondary uppercase tracking-[0.14em] text-right font-mono">
                  Tarj Alkosto
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#16181D]/40 divide-y divide-[#23262E]">
              {filteredAndSorted.slice(0, visibleCount).map((product) => {
                const isSelected = product.sku === selectedSku;
                return (
                  <tr
                    key={product.id}
                    onClick={() => onSelectProduct(product.sku)}
                    className={`cursor-pointer transition-colors relative group ${
                      isSelected
                        ? "bg-tech-accent-dim/40 border-l-[3px] border-tech-accent"
                        : "hover:bg-[#1E2127]/60"
                    }`}
                  >
                    <td className="px-4 py-3 font-sans">
                      <div className="font-bold text-white text-xs group-hover:text-tech-accent transition-colors">
                        {product.descripcion}
                      </div>
                      <div className="text-[10px] font-mono text-tech-text-secondary mt-1">
                        SKU: <span className="text-white/80 font-bold">{product.sku}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-400 font-sans">
                      {product.marca}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-bold text-tech-accent text-xs font-mono">
                        {formatPrice(product.precioHoy)}
                      </div>
                      {product.precioRegular > product.precioHoy && (
                        <div className="text-[10px] text-slate-500 line-through font-mono">
                          {formatPrice(product.precioRegular)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {product.descuentoPct > 0 ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-black bg-[#34C759]/15 text-[#34C759] border border-[#34C759]/20">
                          {product.descuentoPct}%
                        </span>
                      ) : (
                        <span className="text-xs text-tech-text-secondary">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {product.precioTarjetaAlkosto ? (
                        <div className="text-[10px] font-extrabold text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-sm py-0.5 px-1.5 inline-block font-mono">
                          {formatPrice(product.precioTarjetaAlkosto)}
                        </div>
                      ) : (
                        <span className="text-xs text-tech-text-secondary/40 font-mono">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {filteredAndSorted.length > visibleCount && (
          <div className="p-4 text-center bg-[#16181D]/30 border-t border-tech-border">
            <button
              onClick={() => setVisibleCount((prev) => prev + 100)}
              className="px-5 py-2 hover:border-tech-accent border border-[#2C2F36] rounded bg-tech-bg hover:bg-[#1E2127] text-[10px] font-black text-tech-accent uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_10px_rgba(0,245,255,0.05)] hover:shadow-[0_0_15px_rgba(0,245,255,0.15)]"
            >
              Cargar más productos (+100)
            </button>
          </div>
        )}
      </div>
      <div className="bg-[#1D2026]/70 p-3.5 border-t border-tech-border text-[10px] text-[#9BA1AD] font-bold uppercase tracking-wider flex items-center justify-between">
        <span>Mostrando {Math.min(visibleCount, filteredAndSorted.length)} de {filteredAndSorted.length} ({latestProductsList.length} total)</span>
        <span className="text-tech-accent/80 font-light text-[9px] animate-pulse">Haga clic sobre un producto para auditar</span>
      </div>
    </div>
  );
}
