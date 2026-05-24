import { useEffect, useState, useMemo } from "react";
import { Product, AnalysisResponse } from "../types";
import { formatPrice } from "../data";
import { parseSimpleMarkdownToHtml } from "../utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp as TrendIcon,
  ShoppingBag,
  Clock,
  ExternalLink
} from "lucide-react";

interface AIAnalystPanelProps {
  product: Product | null;
  history: Product[];
  onAnalyze: (product: Product, history: Product[]) => Promise<void>;
  analysis: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
}

const RETAIL_MESSAGES = [
  "Buscando histórico del producto...",
  "Analizando descuentos reales de retail colombiano...",
  "Consultando estacionalidad de la categoría...",
  "Proyectando comportamiento cambiario (Fluctuaciones dólar TRM)...",
  "Corriendo simulación de eventos comerciales (Black Friday/Cyberlunes)...",
  "Calculando veredicto estacional definitivo..."
];

export default function AIAnalystPanel({
  product,
  history,
  onAnalyze,
  analysis,
  loading,
  error
}: AIAnalystPanelProps) {
  const [loadMessageIdx, setLoadMessageIdx] = useState(0);

  // Rotate helpful analytic messages on loading
  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadMessageIdx(0);
      interval = setInterval(() => {
        setLoadMessageIdx((prev) => (prev + 1) % RETAIL_MESSAGES.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Trigger analysis when product or history changes
  useEffect(() => {
    if (product) {
      onAnalyze(product, history);
    }
  }, [product, history]);

  // Format history data for pricing chart
  const chartData = useMemo(() => {
    if (!history || history.length === 0) return [];
    // Sort oldest to newest
    return [...history]
      .sort((a, b) => new Date(a.fechaCaptura).getTime() - new Date(b.fechaCaptura).getTime())
      .map((h) => ({
        fecha: h.fechaCaptura,
        "Precio Regular": h.precioRegular,
        "Precio Hoy": h.precioHoy,
        "Precio Tarjeta Alkosto": h.precioTarjetaAlkosto || undefined,
      }));
  }, [history]);

  if (!product) {
    return (
      <div className="bg-[#16181D] text-tech-text-secondary rounded-lg p-8 border border-tech-border flex flex-col items-center justify-center text-center h-full min-h-[500px] font-mono">
        <div className="w-16 h-16 rounded-md bg-tech-accent-dim border border-tech-accent/40 flex items-center justify-center text-tech-accent mb-4 animate-pulse shadow-[0_0_15px_rgba(0,245,255,0.15)]">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-sm font-bold text-white uppercase tracking-[0.16em] mb-2 leading-none">PRICING AI AUDITING INACTIVE</h3>
        <p className="text-[11px] text-[#9BA1AD] max-w-[280px] leading-relaxed font-sans">
          Seleccione un SKU del catálogo en la grilla izquierda para analizar el comportamiento estacional, elasticidad y devaluación histórica.
        </p>
      </div>
    );
  }

  // Determine badges colors
  const getVerdictBadge = (v: string) => {
    const norm = (v || "").toUpperCase();
    if (norm.includes("YA") || norm.includes("COMPRAR")) {
      return {
        bg: "bg-[#FF3B30]/15 border border-[#FF3B30] text-[#FF3B30] shadow-[0_0_15px_rgba(255,59,48,0.2)] animate-pulse",
        text: "text-white",
        label: "🔥 RECOMENDACIÓN: COMPRAR AHORA // MEJOR PRECIO"
      };
    }
    return {
      bg: "bg-amber-500/10 border border-amber-500/40 text-amber-400",
      text: "text-amber-300",
      label: "⏳ RECOMENDACIÓN: ESPERAR // TENDENCIA INFLADA"
    };
  };

  const getStateBadgeColor = (s: string) => {
    const norm = (s || "").toLowerCase();
    if (norm.includes("oferta") || norm.includes("real")) {
      return "bg-[#34C759]/15 text-[#34C759] border border-[#34C759]/25 font-mono text-[9px] uppercase tracking-wider";
    }
    if (norm.includes("estandar") || norm.includes("estable") || norm.includes("normal")) {
      return "bg-[#1E2127] text-tech-text-secondary border border-tech-border font-mono text-[9px] uppercase tracking-wider";
    }
    return "bg-[#FF3B30]/15 text-[#FF3B30] border border-[#FF3B30]/25 font-mono text-[9px] uppercase tracking-wider"; // Inflado
  };

  const getTrendIcon = (t: string) => {
    const norm = (t || "").toLowerCase();
    if (norm.includes("alza") || norm.includes("subir")) {
      return <TrendingUp className="w-3.5 h-3.5 text-[#FF3B30] inline mr-1" />;
    }
    if (norm.includes("baja") || norm.includes("caer")) {
      return <TrendingDown className="w-3.5 h-3.5 text-[#34C759] inline mr-1" />;
    }
    return <Minus className="w-3.5 h-3.5 text-tech-text-secondary inline mr-1" />;
  };

  const verdictConfig = analysis ? getVerdictBadge(analysis.verdict) : null;

  return (
    <div className="bg-[#16181D] border border-tech-border rounded-lg text-white shadow-xl overflow-hidden flex flex-col h-full min-h-[500px] font-mono">
      {/* Product Title / Overview Banner */}
      <div className="p-5 border-b border-tech-border bg-[#0D0E10]/40">
        <div className="flex justify-between items-start gap-3">
          <div>
            <span className="px-2 py-0.5 rounded-sm bg-tech-accent-dim border border-tech-accent/20 text-tech-accent font-black text-[9px] uppercase tracking-wider block w-fit mb-2">
              {product.marca} • {product.categoria}
            </span>
            <h2 className="text-sm font-bold text-white leading-snug font-sans">
              {product.descripcion}
            </h2>
            <p className="text-[10px] text-tech-text-secondary mt-1">SKU: <span className="text-white font-bold">{product.sku}</span></p>
          </div>
          <p className="text-[9px] text-tech-text-secondary font-bold font-mono bg-[#1E2127] border border-tech-border px-2 py-1 rounded-xs">
            DATA: {product.fechaCaptura}
          </p>
        </div>

        {/* Current values summaries */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          <div className="bg-[#0D0E10]/60 p-2.5 rounded-sm border border-tech-border">
            <span className="text-[9px] font-bold text-[#9BA1AD] uppercase tracking-wider block">PRECIO HOY</span>
            <span className="text-sm font-black text-tech-accent block font-mono mt-0.5">
              {formatPrice(product.precioHoy)}
            </span>
          </div>
          <div className="bg-[#0D0E10]/60 p-2.5 rounded-sm border border-tech-border">
            <span className="text-[9px] font-bold text-[#9BA1AD] uppercase tracking-wider block">PRECIO REGULAR</span>
            <span className="text-xs font-semibold text-slate-500 block font-mono line-through mt-0.5">
              {formatPrice(product.precioRegular)}
            </span>
          </div>
          {product.precioTarjetaAlkosto && (
            <div className="bg-amber-500/5 p-2.5 rounded-sm border border-amber-500/20 col-span-2 md:col-span-1">
              <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider block">CON TARJETA</span>
              <span className="text-sm font-black text-amber-500 block font-mono mt-0.5">
                {formatPrice(product.precioTarjetaAlkosto)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Historical Chart */}
      <div className="p-4 border-b border-tech-border bg-[#0D0E10]/15">
        <h3 className="text-[10px] font-black text-[#9BA1AD] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-tech-accent" />
          MÉTRICAS DE VARIACIÓN DE TARIFACION RETAIL
        </h3>
        
        {chartData.length > 1 ? (
          <div className="h-[140px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2F36" />
                <XAxis dataKey="fecha" stroke="#9BA1AD" fontSize={8} tickLine={false} />
                <YAxis stroke="#9BA1AD" fontSize={8} tickLine={false} domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#16181D", borderColor: "#2C2F36", color: "#FFFFFF" }}
                  labelStyle={{ fontWeight: "bold", fontSize: 9, color: "#00F5FF" }}
                  itemStyle={{ fontSize: 9 }}
                  formatter={(value: any) => [formatPrice(value), ""]}
                />
                <Line
                  name="Reg"
                  type="monotone"
                  dataKey="Precio Regular"
                  stroke="#4A505E"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  dot={{ r: 2 }}
                />
                <Line
                  name="Hoy"
                  type="monotone"
                  dataKey="Precio Hoy"
                  stroke="#00F5FF"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#00F5FF" }}
                />
                {product.precioTarjetaAlkosto && (
                  <Line
                    name="Tarjeta"
                    type="monotone"
                    dataKey="Precio Tarjeta Alkosto"
                    stroke="#FBBF24"
                    strokeWidth={1.5}
                    dot={{ r: 2 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="p-4 bg-[#0D0E10]/40 rounded-sm border border-tech-border text-center text-[11px] text-tech-text-secondary leading-relaxed">
            <p className="font-bold text-white uppercase tracking-wider text-[10px]">HISTÓRICO LIMITADO</p>
            <p className="mt-1 font-light">Este SKU carece de histórico en la base cargada. El modelo BI usará simulación estacional predictiva.</p>
          </div>
        )}
      </div>

      {/* Main Analysis Report Content */}
      <div className="p-5 overflow-y-auto max-h-[380px] flex-1 bg-[#16181D]/30">
        {loading ? (
          <div className="p-12 text-center space-y-4">
            <svg
              className="animate-spin h-8 w-8 text-tech-accent mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <div className="space-y-1">
              <p className="text-xs font-black tracking-[0.14em] text-tech-accent uppercase">
                EJECUTANDO PROYECCIÓN COGNITIVA
              </p>
              <p className="text-[10px] text-tech-text-secondary italic">
                {RETAIL_MESSAGES[loadMessageIdx]}
              </p>
            </div>
            
            {/* Visual Skeleton Placeholder */}
            <div className="w-full space-y-3 mt-4 animate-pulse">
              <div className="h-3 bg-tech-border rounded-xs w-3/4"></div>
              <div className="h-3 bg-tech-border rounded-xs"></div>
              <div className="h-3 bg-tech-border rounded-xs w-5/6"></div>
              <div className="h-3 bg-tech-border rounded-xs w-2/3"></div>
            </div>
          </div>
        ) : error ? (
          <div className="p-4 bg-[#FF3B30]/10 text-[#FF3B30] rounded-sm border border-[#FF3B30]/25 text-[11px] flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 text-[#FF3B30] mt-0.5" />
            <div className="space-y-1 flex-1">
              <p className="font-bold uppercase tracking-wider">ERROR DE PETICIÓN COGNITIVA AI</p>
              <p>{error}</p>
              <p className="font-light text-[10px] text-red-400">Verifique su setup o secrets panel para garantizar la validez de la GEMINI_API_KEY.</p>
            </div>
          </div>
        ) : analysis ? (
          <div className="space-y-5">
            {/* Verdict Box */}
            {verdictConfig && (
              <div className={`p-4 rounded-sm border text-center font-bold tracking-wider uppercase text-xs ${verdictConfig.bg}`}>
                <div className="mb-1">{verdictConfig.label}</div>
                <div className="text-[10px] uppercase font-light text-white/90">
                  Estado de Oferta: <span className="font-bold underline">{analysis.state}</span> • Variaciones: {analysis.trend}
                </div>
              </div>
            )}

            {/* Custom styled markdown report body */}
            <div 
              className="prose prose-sm prose-invert max-w-none text-[#E2E8F0] text-xs leading-relaxed font-sans"
              dangerouslySetInnerHTML={{ __html: parseSimpleMarkdownToHtml(analysis.markdown) }}
            />
          </div>
        ) : (
          <div className="p-8 text-center text-[#9BA1AD]">
            <ShoppingBag className="w-10 h-10 stroke-1 mx-auto text-[#2C2F36] mb-2" />
            <p className="text-xs font-bold uppercase tracking-widest text-[#FFFFFF]">Panel de Audicición Cognitivo</p>
            <p className="text-[11px] mt-1 text-tech-text-secondary leading-relaxed font-sans">
              Seleccione un producto en la tabla de listados para comenzar la simulación de variaciones y forecasting estacional.
            </p>
          </div>
        )}
      </div>

      {/* Corporate signature footnote */}
      <div className="bg-[#0D0E10] p-3 border-t border-tech-border flex items-center justify-between text-[10px] text-tech-text-secondary font-mono">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-tech-accent" />
          Model: Gemini 3.5 Flash Active
        </span>
        <span className="flex items-center gap-1 hover:text-tech-accent transition-colors cursor-pointer">
          PRICING CORE DECK // V3.5
          <ExternalLink className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}
