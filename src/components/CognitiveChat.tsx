import React, { useState, useRef, useEffect, useMemo } from "react";
import { Product } from "../types";
import { parseSimpleMarkdownToHtml } from "../utils";
import { Sparkles, MessageSquareCode, ArrowUp, Loader2, RefreshCw } from "lucide-react";

interface CognitiveChatProps {
  products: Product[];
  onChatQuery: (query: string) => Promise<string>;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const QUICK_PROMPTS = [
  "Top 3 portátiles i5 o Ryzen 5",
  "Mejores ofertas con Tarjeta Alkosto",
  "Recomiéndame un celular Samsung",
  "¿Cuándo es mejor comprar televisores?"
];

export default function CognitiveChat({ products, onChatQuery }: CognitiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "👋 ¡Hola! Soy tu **Analista de Precios AI**. \n\nPuedo ayudarte a encontrar el mejor hardware o electrodoméstico de la base de datos cargada. Pregúntame cosas como:\n\n* *'Dame un top 3 de los mejores portátiles...'* \n* *'¿Qué celulares tienen mayores descuentos hoy?'* \n* *'¿El iPhone actual tiene oferta real o es inflado?'* \n\nEscribe tu pregunta o selecciona uno de los accesos directos abajo para comenzar."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest bubble
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const queryText = input;
    setInput("");
    
    // Append User Message
    const userMsgId = `user-${Date.now()}`;
    setMessages((prev) => [...prev, { id: userMsgId, role: "user", text: queryText }]);
    setLoading(true);

    try {
      const respMarkdown = await onChatQuery(queryText);
      const assistantMsgId = `assistant-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: assistantMsgId, role: "assistant", text: respMarkdown }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          text: "⚠️ Ocurrió una falla conectando con el analista de precios server. Verifique la API key o limite de tokens."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPromptClick = (p: string) => {
    setInput(p);
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        text: "👋 Historial reiniciado. He recargado el estado del catálogo. Pregúntame lo que quieras."
      }
    ]);
  };

  return (
    <div className="bg-tech-card rounded-lg border border-tech-border shadow-xs flex flex-col h-[520px] font-mono">
      {/* Console Header */}
      <div className="p-4 border-b border-tech-border flex items-center justify-between bg-[#1D2026]/70">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-sm bg-tech-accent-dim border border-tech-accent/40 text-tech-accent flex items-center justify-center shadow-[0_0_10px_rgba(0,245,255,0.15)]">
            <MessageSquareCode className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-[0.12em] flex items-center gap-1.5">
              Consultor de Compras Cognitivo
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[8px] font-black bg-tech-accent-dim border border-tech-accent/42 text-tech-accent uppercase tracking-widest font-mono ml-2">
                EXPERT MODE
              </span>
            </h3>
            <p className="text-[10px] text-[#9BA1AD] mt-1 font-sans">Analizador automático de variables bajo index de catálogo real-time</p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-1.5 px-3 rounded-sm border border-tech-border hover:border-tech-accent bg-tech-bg hover:bg-tech-card text-[10px] uppercase font-black tracking-wider text-tech-text-secondary hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
          title="Reiniciar conversación"
        >
          <RefreshCw className="w-3 h-3 text-tech-accent" />
          Limpiar Terminal
        </button>
      </div>

      {/* Bubble Chat Streams */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#111317]/50">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-sm p-4 border leading-relaxed ${
                  isUser
                    ? "bg-[#1E2127]/90 border-tech-border text-white text-xs font-sans"
                    : "bg-[#16181D] border-tech-border text-slate-100 text-xs font-sans shadow-xs border-l-[3px] border-l-tech-accent"
                }`}
              >
                {isUser ? (
                  <p className="text-xs whitespace-pre-wrap font-sans">{m.text}</p>
                ) : (
                  <div
                    className="prose prose-sm prose-invert max-w-none text-xs leading-relaxed space-y-1 text-slate-200"
                    dangerouslySetInnerHTML={{ __html: parseSimpleMarkdownToHtml(m.text) }}
                  />
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#1E2127] border border-tech-border rounded-sm p-4 text-[#9BA1AD] space-y-2 max-w-[85%] font-mono">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-tech-accent animate-spin" />
                <span className="text-[10px] font-black text-tech-accent uppercase tracking-widest animate-pulse">
                  SOPORTE COGNITIVO PROCESANDO...
                </span>
              </div>
              <p className="text-[11px] text-[#9BA1AD] italic font-sans">Indexando variabilidad del inventario de almacenes y formulando informe predictivo...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggest tags */}
      <div className="px-4 py-2 bg-[#16181D]/80 border-t border-tech-border flex items-center gap-2 overflow-x-auto">
        <span className="text-[9px] text-[#9BA1AD] uppercase tracking-wider font-extrabold block shrink-0 font-mono">Sugerencias:</span>
        <div className="flex gap-1.5 py-1">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => handleQuickPromptClick(p)}
              className="text-[10px] bg-tech-bg hover:bg-tech-accent-dim hover:text-tech-accent text-[#9BA1AD] rounded-sm border border-tech-border px-3 py-1 transition-all shrink-0 font-bold font-mono whitespace-nowrap uppercase tracking-wider cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input submission bar */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-tech-border flex gap-2 bg-tech-card">
        <input
          type="text"
          placeholder="Ej: Recomiéndame un portátiles Intel i5 con el mejor descuento hoy..."
          className="flex-1 px-4 py-2.5 border border-tech-border rounded-sm text-xs bg-tech-bg text-white focus:outline-hidden focus:border-tech-accent placeholder:text-[#9BA1AD] font-sans"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2.5 rounded-sm bg-tech-accent hover:opacity-90 disabled:bg-[#1E2127] text-[#0D0E10] disabled:text-[#9BA1AD] transition-all flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,245,255,0.2)] cursor-pointer"
        >
          <ArrowUp className="w-5 h-5 text-neutral-900 stroke-3" />
        </button>
      </form>
    </div>
  );
}
