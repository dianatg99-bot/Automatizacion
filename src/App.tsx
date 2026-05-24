import React, { useState, useEffect, useMemo } from "react";
import { Product, AnalysisResponse } from "./types";
import { PRESET_DATASETS, parseCSV } from "./data";
import DashboardMetrics from "./components/DashboardMetrics";
import ProductTable from "./components/ProductTable";
import AIAnalystPanel from "./components/AIAnalystPanel";
import CognitiveChat from "./components/CognitiveChat";
import { 
  Sparkles, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  Database, 
  AlertCircle, 
  BookOpen, 
  Share2,
  Cpu
} from "lucide-react";

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedDatasetIdx, setSelectedDatasetIdx] = useState(0);
  
  // Filtering options
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedSku, setSelectedSku] = useState("");
  
  // Custom CSV custom state
  const [customCsvName, setCustomCsvName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Analysis API state
  const [aiAnalysis, setAiAnalysis] = useState<AnalysisResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Load first default template on mount
  useEffect(() => {
    const defaultData = PRESET_DATASETS[0];
    const parsed = parseCSV(defaultData.csvContent);
    setProducts(parsed);
    if (parsed.length > 0) {
      // Focus on the first product's SKU
      setSelectedSku(parsed[0].sku);
    }
  }, []);

  // Update when changing preset dropdown
  const handleSelectPreset = (idx: number) => {
    setSelectedDatasetIdx(idx);
    setCustomCsvName(null);
    const preset = PRESET_DATASETS[idx];
    const parsed = parseCSV(preset.csvContent);
    setProducts(parsed);
    setSelectedCategory("Todas");
    if (parsed.length > 0) {
      setSelectedSku(parsed[0].sku);
    } else {
      setSelectedSku("");
    }
    setAiAnalysis(null);
    setAiError(null);
  };

  // Parse custom CSV content
  const loadCustomCSV = (text: string, filename: string) => {
    try {
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        alert("El archivo CSV no tiene el formato esperado de productos o está vacío. Asegúrate de separar con comas (,) o punto y coma (;) e incluir columnas válidas.");
        return;
      }
      setProducts(parsed);
      setCustomCsvName(filename);
      setSelectedDatasetIdx(-1);
      setSelectedCategory("Todas");
      setSelectedSku(parsed[0].sku);
      setAiAnalysis(null);
      setAiError(null);
    } catch (err: any) {
      alert("Error al parsear el archivo CSV: " + err.message);
    }
  };

  // File Picker custom triggers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        loadCustomCSV(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  // Drag and drop standard actions
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith(".csv")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        loadCustomCSV(text, file.name);
      };
      reader.readAsText(file);
    } else {
      alert("Por favor arrastra únicamente archivos de formato .csv");
    }
  };

  // Retrieve current selected product details and historical data list
  const selectedProduct = useMemo(() => {
    if (!selectedSku) return null;
    // Find latest product record for this SKU
    const matching = products.filter((p) => p.sku === selectedSku);
    if (matching.length === 0) return null;
    // Return latest record chronologically
    return matching.sort((a, b) => new Date(b.fechaCaptura).getTime() - new Date(a.fechaCaptura).getTime())[0];
  }, [products, selectedSku]);

  const selectedProductHistory = useMemo(() => {
    if (!selectedSku) return [];
    return products.filter((p) => p.sku === selectedSku);
  }, [products, selectedSku]);

  // Execute server-side Detail SKU intelligence analysis
  const executeSkuAnalysis = async (productObj: Product, historyList: Product[]) => {
    setAiLoading(true);
    setAiAnalysis(null);
    setAiError(null);

    try {
      const res = await fetch("/api/analyze-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: productObj,
          history: historyList
        }),
      });

      if (!res.ok) {
        const rawErr = await res.json();
        throw new Error(rawErr.error || "Falla del backend de análisis");
      }

      const decoded = await res.json();
      setAiAnalysis(decoded);
    } catch (err: any) {
      console.error("AI analysis call failure:", err);
      setAiError(err.message || "No se pudo conectar con el servidor experto de pricing.");
    } finally {
      setAiLoading(false);
    }
  };

  // Execute server-side general conversational queries
  const executeChatQuery = async (queryText: string): Promise<string> => {
    try {
      const res = await fetch("/api/chat-dataset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: products,
          userQuery: queryText
        }),
      });

      if (!res.ok) {
        const rawErr = await res.json();
        throw new Error(rawErr.error || "Falla del backend cognitivo");
      }

      const decoded = await res.json();
      return decoded.markdown || "No recibí respuesta formateada del analista experto.";
    } catch (err: any) {
      console.error("Cognitive Chat query call failure:", err);
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-tech-bg text-[#FFFFFF] font-sans tracking-tight">
      {/* Executive Global Navigation bar */}
      <header className="bg-[#16181D]/90 backdrop-blur-md border-b border-tech-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-tech-accent/10 border border-tech-accent flex items-center justify-center text-tech-accent shadow-[0_0_15px_rgba(0,245,255,0.25)]" id="app-logo">
              <Cpu className="w-5.5 h-5.5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black text-tech-accent tracking-[0.16em] font-mono leading-none uppercase" id="app-title">
                  PRICING INSIGHT PRO // BI EXPERT
                </h1>
                <span className="bg-[#1F2127] border border-tech-border text-tech-accent text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest font-mono">
                  AI V3.5
                </span>
              </div>
              <p className="text-[11px] text-tech-text-secondary font-mono mt-1" id="app-subtitle">
                Sistema Experto en Business Intelligence y Optimización Real-Time de Precios
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5 bg-[#1F2127] px-3 py-1.5 rounded-md border border-tech-border">
            <span className="w-2 h-2 bg-tech-accent rounded-full animate-ping"></span>
            <span className="text-[10px] text-tech-accent font-bold font-mono uppercase tracking-wider">
              CLIENT-SERVER SYSTEM STATUS: ACTIVE
            </span>
          </div>
        </div>
      </header>

      {/* Main Core Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Top Control Center (Presets Selection & Custom Importer) */}
        <div className="bg-tech-card rounded-lg border border-tech-border p-5 shadow-xs">
          <div className="flex flex-col lg:flex-row gap-5 items-stretch justify-between">
            {/* Presets List */}
            <div className="space-y-2 lg:max-w-md flex-1">
              <label className="text-[10px] font-bold text-tech-text-secondary uppercase tracking-[0.15em] block flex items-center gap-1.5 font-mono">
                <Database className="w-3.5 h-3.5 text-tech-accent" />
                Catálogo Index & Colección de Datos
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {PRESET_DATASETS.map((preset, idx) => (
                  <button
                    key={preset.name}
                    onClick={() => handleSelectPreset(idx)}
                    className={`p-3 text-left rounded-md text-xs leading-normal font-bold transition-all flex flex-col justify-between border font-mono ${
                      selectedDatasetIdx === idx
                        ? "bg-tech-accent-dim border-tech-accent text-tech-accent shadow-[0_0_12px_rgba(0,245,255,0.15)]"
                        : "bg-[#1E2127]/80 hover:bg-[#1E2127] border-tech-border text-tech-text-secondary"
                    }`}
                  >
                    <span className="font-black uppercase tracking-wider">{preset.category}</span>
                    <span className="font-medium mt-1 line-clamp-1 text-slate-400 text-[10px]">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Drag & Drop Area */}
            <div className="flex-1">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[90px] font-mono ${
                  isDragging
                    ? "border-tech-accent bg-tech-accent-dim text-tech-accent"
                    : "border-tech-border hover:border-tech-accent/60 bg-tech-bg hover:bg-tech-card text-tech-text-secondary"
                }`}
                onClick={() => document.getElementById("csv-file-picker")?.click()}
                id="file-drop-target"
              >
                <Upload className={`w-5.5 h-5.5 mb-1.5 text-tech-accent transition-transform ${isDragging ? "translate-y-[-4px]" : ""}`} />
                <p className="text-xs font-bold text-white uppercase tracking-wider">
                  {customCsvName ? `✓ CARGADO: ${customCsvName}` : "Indexar Archivo CSV Propio"}
                </p>
                <p className="text-[10px] text-tech-text-secondary font-light mt-1">
                  Arrastra tu base de datos o haz clic para importar. Compatibilidad total de columnas.
                </p>
                <input
                  type="file"
                  id="csv-file-picker"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Numerical Metrics Summary Cards */}
        <DashboardMetrics products={products} />

        {/* Bento Grid containing Product Table (Left/Center) & AI detailed Analyst (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Column Left: Catalogue listings and filters */}
          <div className="lg:col-span-7 flex flex-col h-full" id="catalog-listing-container">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-4 bg-tech-accent rounded-xs"></div>
              <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-tech-text-secondary font-mono">
                Catálogo Principal de Precios Registrados
              </h2>
            </div>
            
            <ProductTable
              products={products}
              selectedSku={selectedSku}
              onSelectProduct={setSelectedSku}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          </div>

          {/* Column Right: AI Analytical details dashboard side card */}
          <div className="lg:col-span-4 lg:col-start-9 flex flex-col h-full font-sans" id="analyst-report-container">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-4 bg-tech-accent rounded-xs"></div>
              <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-tech-text-secondary font-mono">
                Consola Cyber AI: Forecasting & Inteligencia
              </h2>
            </div>

            <AIAnalystPanel
              product={selectedProduct}
              history={selectedProductHistory}
              onAnalyze={executeSkuAnalysis}
              analysis={aiAnalysis}
              loading={aiLoading}
              error={aiError}
            />
          </div>

        </div>

        {/* Bottom Full-Width Section: Conversational Cognitive Co-Pilot Chatbox */}
        <div className="pt-4" id="cognitive-chat-section">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-4 bg-tech-accent rounded-xs"></div>
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-tech-text-secondary font-mono">
              Consola Interactiva / Analista de Pricing Cognitivo
            </h2>
          </div>
          
          <CognitiveChat
            products={products}
            onChatQuery={executeChatQuery}
          />
        </div>

      </main>

      {/* Global Executive footer */}
      <footer className="bg-tech-card border-t border-tech-border py-8 mt-12 text-center text-xs text-tech-text-secondary font-mono">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-bold text-white uppercase tracking-wider text-[11px]">Pricing Insight Pro — Advanced Pricing Expert System</p>
          <p className="font-light max-w-2xl mx-auto leading-relaxed text-[11px] text-[#9BA1AD]">
            Indexación automática de productos, cálculo dinámico de variaciones contra precios regular y base anterior, y modelado deductivo de proyección de acuerdo con políticas de seguridad de datos de retail colombiano.
          </p>
          <div className="pt-3 flex items-center justify-center gap-5 text-[10px] uppercase font-bold tracking-[0.2em] text-tech-accent">
            <span>ALKOSTO</span>
            <span>KTRONIX</span>
            <span>ÉXITO</span>
            <span>JUMBO</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
