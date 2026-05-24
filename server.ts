import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Gemini SDK with telemetry header as instructed in gemini-api skill
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Enable JSON parsing with generous limits for large datasets
app.use(express.json({ limit: "10mb" }));

// Helper to check if model client is initialized
function getAi(): GoogleGenAI {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
}

// Local mathematical fallback engine for billing limits or key depletion
function getHeuristicAnalysis(product: any, history: any[], userPrompt?: string) {
  const priceHoy = product.precioHoy;
  const priceReg = product.precioRegular;
  const pct = product.descuentoPct || (priceReg > priceHoy ? Math.round(((priceReg - priceHoy) / priceReg) * 100) : 0);
  
  let state = "⚠️ Precio Estándar";
  if (pct > 15) {
    state = "🔥 Oferta Real";
  } else if (pct < 0) {
    state = "❌ Inflado";
  }
  
  let trend = "Estable";
  let verdict = "ESPERAR";
  
  if (pct > 20) {
    verdict = "COMPRAR YA";
    trend = "A la baja";
  } else if (pct > 10) {
    verdict = "COMPRAR YA";
    trend = "Estable";
  } else {
    verdict = "ESPERAR";
    trend = "Al alza";
  }

  if (history && history.length > 1) {
    const historicalSorted = [...history].sort((a, b) => {
      const dateA = new Date(a.fechaCaptura || a.fecha || 0).getTime();
      const dateB = new Date(b.fechaCaptura || b.fecha || 0).getTime();
      return dateA - dateB;
    });
    const oldest = historicalSorted[0];
    const newest = historicalSorted[historicalSorted.length - 1];
    
    const oldPrice = oldest.precioHoy || oldest.precioRegular;
    const newPrice = newest.precioHoy || newest.precioRegular;
    
    if (newPrice < oldPrice) {
      trend = "A la baja";
    } else if (newPrice > oldPrice) {
      trend = "Al alza";
    }
  }

  const hasAlkostoCard = !!product.precioTarjetaAlkosto;

  const markdown = `## 📊 Análisis de Situación Actual *(Simulador de Contingencia Activa)*
⚠️ **CONEXIÓN AI CON LIMITACIONES DE CRÉDITO:** El presupuesto de tokens o créditos prepago de la clave Gemini API configurada se encuentra agotado (Código de Error 429). El sistema ha activado automáticamente el **motor heurístico de contingencia local**.

- **Producto:** ${product.descripcion}
- **Marca:** ${product.marca} • **Categoría:** ${product.categoria}
- **Precio Hoy:** $${priceHoy.toLocaleString("es-CO")} ${hasAlkostoCard ? `*(Precio Tarjeta Alkosto: $${product.precioTarjetaAlkosto.toLocaleString("es-CO")} pesos)*` : "*(Aplica para cualquier medio de pago)*"}
- **Descuento Identificado:** **${pct}%** con respecto al precio regular ($${priceReg.toLocaleString("es-CO")} pesos).
- **Estado de Auditoría:** **${state}**

## 📈 Proyección y Tendencia de Tarifas (Cálculo Finito)
- **Tendencia esperada:** **${trend}**
- **Análisis de Devaluación:** Se observa un comportamiento de tarifas estable dentro del inventario indexado. Al no contar con procesamiento cognitivo activo de Gemini, el motor matemático evalúa la variación del SKU basándose estrictamente en las capturas registradas.

## 📅 Recomendación de Compra
- **Veredicto:** **${verdict === "COMPRAR YA" ? "COMPRAR YA // MEJOR PRECIO" : "ESPERAR // ESPERAR PRECIO BAJO"}**
- **Mejor época sugerida:** Eventos de descuentos autorizados en Colombia de fin de año (Cyberlunes y Black Friday). Sigue monitoreando el comportamiento histórico del SKU para aprovechar el ciclo óptimo de precios bajos.`;

  return {
    markdown,
    state,
    trend,
    verdict,
    isFallback: true
  };
}

function getHeuristicChat(products: any[], userQuery: string) {
  const normQuery = userQuery.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
    
  let matched: any[] = [];
  if (products && products.length > 0) {
    matched = products.filter(p => {
      const desc = (p.descripcion || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const brand = (p.marca || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const cat = (p.categoria || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return desc.includes(normQuery) || brand.includes(normQuery) || cat.includes(normQuery);
    });
    
    if (matched.length === 0) {
      matched = [...products].sort((a, b) => (b.descuentoPct || 0) - (a.descuentoPct || 0)).slice(0, 3);
    } else {
      matched = matched.sort((a, b) => (b.descuentoPct || 0) - (a.descuentoPct || 0)).slice(0, 3);
    }
  }

  const recommendationsMarkdown = matched.map((p, idx) => {
    const priceHoy = p.precioHoy;
    const priceReg = p.precioRegular;
    const pct = p.descuentoPct || (priceReg > priceHoy ? Math.round(((priceReg - priceHoy) / priceReg) * 100) : 0);
    const hasAlkostoCard = !!p.precioTarjetaAlkosto;
    const state = pct > 15 ? "🔥 Oferta Real" : "⚠️ Precio Estándar";
    const trend = pct > 15 ? "Estable" : "Al alza";
    const verdict = pct > 15 ? "COMPRAR YA" : "ESPERAR";

    return `### Opción ${idx + 1}: ${p.descripcion}
## 📊 Análisis de Situación Actual
- **Producto:** ${p.descripcion} (${p.marca})
- **Precio Hoy:** $${priceHoy.toLocaleString("es-CO")} ${hasAlkostoCard ? `(Tarjeta Alkosto: $${p.precioTarjetaAlkosto.toLocaleString("es-CO")})` : ""}
- **Descuento Real:** ${pct}% respecto al precio regular ($${priceReg.toLocaleString("es-CO")}).
- **Estado:** ${state}

## 📈 Proyección y Tendencia
- **Tendencia esperada:** ${trend}
- **Análisis:** Procesado mediante cómputo local debido a interrupciones financieras o límite de tokens agotados en la clave de Gemini.

## 📅 Recomendación de Compra
- **Veredicto:** ${verdict}
- **Mejor época del año:** Eventos de descuento retail colombiano (Cyberlunes y Black Friday).
`;
  }).join("\n---\n");

  const markdown = `# 🤖 Terminal de Consulta (Modo de Contingencia Activa)
⚠️ **AVISO DE API DE GEMINI AGOTADA (429):** El saldo prepago de la clave API en Google AI Studio se ha agotado o el token limit fue excedido. El sistema ha ejecutado un **filtro heurístico alternativo** directamente sobre los productos indexados para satisfacer su consulta: *"**${userQuery}**"*.

A continuación, se listan los productos recomendados ordenados por margen de descuento hoy:

${recommendationsMarkdown || "No se encontraron coincidencias bajo la consulta."}

*Para restablecer el poder de simulación de variables cognitivas avanzadas, complete los créditos de prepago en su consola de Google AI Studio o actualice su clave API en la barra lateral.*`;

  return {
    markdown,
    isFallback: true
  };
}

// API Routes

/**
 * Health check endpoint
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", geminiConfigured: !!process.env.GEMINI_API_KEY });
});

/**
 * Analyze a single product in detail with its historical prices
 */
app.post("/api/analyze-product", async (req, res) => {
  try {
    const { product, history, userPrompt } = req.body;

    if (!product) {
       res.status(400).json({ error: "Falta la información del producto." });
       return;
    }

    try {
      const modelClient = getAi();
      
      // Construct rich historical price context
      const historyText = history && history.length > 0 
        ? history.map((h: any) => `- Fecha: ${h.fechaCaptura} | Reg: $${h.precioRegular} | Hoy: $${h.precioHoy} | Tarjeta Alkosto: ${h.precioTarjetaAlkosto ? '$' + h.precioTarjetaAlkosto : 'No aplica'}`).join("\n")
        : "No hay capturas previas registradas en el archivo.";

      const systemInstruction = `Actúas como un Sistema Experto en Business Intelligence y Analista de Pricing Avanzado.
Revisa el producto y su historial de precios. Debes generar un análisis extremadamente profesional, visual, con el formato de salida solicitado.
Considera el contexto de Colombia (temporadas escolares, Black Friday, Cyberlunes, fluctuaciones del dólar TRM y comportamiento retail).

REGLAS DE EVALUACIÓN DE DESCUENTO:
1. Compara el 'Precio Hoy' y 'Precio Tarjeta Alkosto' contra el 'Precio Regular' o 'Precio Anterior'.
2. Dictamina si requiere Tarjeta Alkosto o es un descuento general.
3. Evalúa si el descuento es real u "oferta inflada" (si subió de precio justo antes de colocarse en descuento).

MANDATORY FORMATO DE SALIDA (Usa exactamente estas secciones de Markdown, usa listas, tablas y viñetas):

## 📊 Análisis de Situación Actual
- **Producto:** [Nombre del producto + Marca]
- **Precio Hoy:** $X.XXX.XXX (Indicar claramente el medio de pago requerido, p. ej. Tarjeta Alkosto, si aplica).
- **Descuento Real:** [X% respecto al precio regular].
- **Estado:** [🔥 Oferta Real / ⚠️ Precio Estándar / ❌ Inflado]

## 📈 Proyección y Tendencia
- **Tendencia esperada:** [Al alza / A la baja / Estable]
- **Análisis:** Breve explicación cuantitativa y cualitativa de por qué subirá o bajará basándose en el historial y tendencias mercantiles de Colombia en los próximos 1 a 3 meses.

## 📅 Recomendación de Compra
- **Veredicto:** [COMPRAR YA / ESPERAR]
- **Mejor época del año:** [Especificar meses o eventos comerciales ideales como Black Friday, Cyberlunes, etc., destacando dónde bajan más históricamente].

En la respuesta final en JSON, además del markdown, debes extraer las métricas categóricas para graficación y visualización en el dashboard.`;

      const contents = `
Analiza este producto:
Detalles Actuales:
- SKU: ${product.sku}
- Descripción: ${product.descripcion}
- Marca: ${product.marca}
- Categoría: ${product.categoria}
- Precio Regular: $${product.precioRegular}
- Precio Hoy: $${product.precioHoy}
- Precio Tarjeta Alkosto: ${product.precioTarjetaAlkosto ? '$' + product.precioTarjetaAlkosto : 'N/A'}
- Descuento (%): ${product.descuentoPct}%
- Fecha de Captura de esta fila: ${product.fechaCaptura}

Historial de Precios para este SKU en el CSV:
${historyText}

${userPrompt ? `Consulta específica del usuario: "${userPrompt}"` : ""}

Dame el reporte analítico estructurado y también extrae las variables estructuradas exactas para la interfaz de usuario en formato JSON.
`;

      const response = await modelClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["markdown", "state", "trend", "verdict"],
            properties: {
              markdown: {
                type: Type.STRING,
                description: "El reporte completo en español utilizando el formato Markdown exacto solicitado.",
              },
              state: {
                type: Type.STRING,
                description: "Estado de la oferta. Debe ser exactamente una de estas opciones: '🔥 Oferta Real', '⚠️ Precio Estándar', '❌ Inflado'.",
              },
              trend: {
                type: Type.STRING,
                description: "La tendencia proyectada del precio. Debe ser exactamente una de estas opciones: 'Al alza', 'A la baja', 'Estable'.",
              },
              verdict: {
                type: Type.STRING,
                description: "El veredicto final. Debe ser exactamente: 'COMPRAR YA' o 'ESPERAR'.",
              }
            },
          },
        },
      });

      const parsedJson = JSON.parse(response.text || "{}");
      res.json(parsedJson);
    } catch (geminiError: any) {
      console.warn("Gemini API depleted or failed. Falling back to Heuristic Analysis Engine:", geminiError);
      const fallbackResult = getHeuristicAnalysis(product, history, userPrompt);
      res.json(fallbackResult);
    }
  } catch (error: any) {
    console.error("Error in analyze-product api:", error);
    res.status(500).json({ error: error.message || "Error interno del servidor en análisis de producto." });
  }
});

/**
 * Perform general chat queries over the entire dataset (e.g. top recommendations, specific categories, vague requests)
 */
app.post("/api/chat-dataset", async (req, res) => {
  try {
    const { products, userQuery } = req.body;

    if (!userQuery) {
       res.status(400).json({ error: "Falta la consulta del usuario." });
       return;
    }

    try {
      const modelClient = getAi();
      
      // Group and pick a clean overview of the top products or matching items in the dataset
      // We send a summary of up to 40 unique latest products to fit context budgets and run extremely fast.
      const latestProducts = products || [];
      const productsContext = latestProducts.slice(0, 50).map((p: any) => 
        `SKU: ${p.sku} | ${p.marca} ${p.descripcion} | Cat: ${p.categoria} | Reg: $${p.precioRegular} | Hoy: $${p.precioHoy} | Tarjeta: ${p.precioTarjetaAlkosto ? '$' + p.precioTarjetaAlkosto : 'N/A'} | Descuento: ${p.descuentoPct}% | Captura: ${p.fechaCaptura}`
      ).join("\n");

      const systemInstruction = `Actúas como un Sistema Experto en Business Intelligence y Analista de Pricing Avanzado.
Procesas consultas generales basándote en la base de datos de productos de retail proporcionada.

REGLAS CRÍTICAS:
1. SI EL USUARIO HACE UNA CONSULTA VAGA (ej. "portátil i5", "televisor Samsung", "celular con descuento"):
   - Haz un TOP 3 de las mejores opciones actuales basándote en la relación precio/especificaciones/descuento que encuentres en los datos suministrados.
   - Si no hay 3 opciones, completa con las más cercanas.
2. Si te preguntan por un producto o categoría, busca la última 'Fecha de Captura' disponible para dar el estado actual.
3. Para cada opción recomendada en tu respuesta, debes estructurar usando de forma muy visual y ejecutiva el Markdown EXACTO solicitado:

Format of recommendation:
### [Título de la Opción]
## 📊 Análisis de Situación Actual
- **Producto:** [Nombre del producto + Marca]
- **Precio Hoy:** $X.XXX.XXX (Indicar si requiere Tarjeta Alkosto u otro).
- **Descuento Real:** [X% respecto al precio base].
- **Estado:** [🔥 Oferta Real / ⚠️ Precio Estándar / ❌ Inflado]

## 📈 Proyección y Tendencia
- **Tendencia esperada:** [Al alza / A la baja / Estable]
- **Análisis:** Breve análisis cualitativo.

## 📅 Recomendación de Compra
- **Veredicto:** [COMPRAR YA / ESPERAR]
- **Mejor época del año:** [Especificar meses/eventos ideales]

4. Si no encuentras un producto específico en la lista, indícalo amablemente y ofrece las alternativas más cercanas disponibles en los datos. `;

      const contents = `
La lista de productos cargada actualmente (máximo 50 filas representativas):
${productsContext}

Consulta del usuario: "${userQuery}"

Genera una respuesta analítica muy profesional, bien organizada y ejecutiva mediante tablas y viñetas en Markdown en español.`;

      const response = await modelClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction,
        },
      });

      res.json({ markdown: response.text });
    } catch (geminiError: any) {
      console.warn("Gemini API depleted or failed. Falling back to Heuristic Chat Engine:", geminiError);
      const fallbackResult = getHeuristicChat(products, userQuery);
      res.json(fallbackResult);
    }
  } catch (error: any) {
    console.error("Error in chat-dataset api:", error);
    res.status(500).json({ error: error.message || "Error interno de servidor en chat cognitivo." });
  }
});

// Vite & Static file configurations
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Use Vite middleware
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Pricing Expert Server] running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
