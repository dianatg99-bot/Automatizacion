import { PresetDataset, Product } from "./types";

export const PRESET_DATASETS: PresetDataset[] = [
  {
    name: "Tecnología y Cómputo (Alkosto / Ktronix)",
    description: "Computadores portátiles, monitores y cargadores. Incluye histórico de capturas para ver variaciones de precios.",
    category: "Computadores",
    csvContent: `SKU;Descripción;Marca;Categoría;Precio Regular;Precio Hoy;Precio Tarjeta Alkosto;Precio Anterior;Tiene Descuento;Descuento (%);Fecha de Captura
LAP-ASUS-X515;Portátil ASUS Vivobook Core i3 8GB 256GB SSD;ASUS;Tecnología;2299000;1999000;1899000;2299000;Si;13;2026-03-10
LAP-ASUS-X515;Portátil ASUS Vivobook Core i3 8GB 256GB SSD;ASUS;Tecnología;2299000;2099000;1999000;1999000;Si;9;2026-04-10
LAP-ASUS-X515;Portátil ASUS Vivobook Core i3 8GB 256GB SSD;ASUS;Tecnología;2299000;1649000;1549450;2099000;Si;28;2026-05-24
LAP-LENOV-IP3;Portátil Lenovo IdeaPad Slim 3 AMD Ryzen 5 16GB 512GB;Lenovo;Tecnología;3499000;2999000;2799000;3499000;Si;14;2026-03-10
LAP-LENOV-IP3;Portátil Lenovo IdeaPad Slim 3 AMD Ryzen 5 16GB 512GB;Lenovo;Tecnología;3499000;3199000;3049000;2999000;Si;9;2026-04-10
LAP-LENOV-IP3;Portátil Lenovo IdeaPad Slim 3 AMD Ryzen 5 16GB 512GB;Lenovo;Tecnología;3499000;2499000;2349000;3199000;Si;29;2026-05-24
LAP-HP-15FD;Portátil HP 15-FD Intel Core i5 16GB 512GB SSD;HP;Tecnología;4199000;3799000;3599000;4199000;Si;10;2026-03-10
LAP-HP-15FD;Portátil HP 15-FD Intel Core i5 16GB 512GB SSD;HP;Tecnología;4199000;3799000;3599000;3799000;Si;10;2026-04-10
LAP-HP-15FD;Portátil HP 15-FD Intel Core i5 16GB 512GB SSD;HP;Tecnología;4199000;3749000;3549000;3799000;Si;11;2026-05-24
LAP-MAC-AIR13;Apple MacBook Air 13" Chip M2 8GB 256GB;Apple;Tecnología;5999000;5499000;5299000;5999000;Si;8;2026-04-10
LAP-MAC-AIR13;Apple MacBook Air 13" Chip M2 8GB 256GB;Apple;Tecnología;5999000;5599000;5399000;5499000;Si;7;2026-05-24
MON-SAMS-F390;Monitor Curvo Samsung 24" FHD 60Hz;Samsung;Tecnología;899000;699000;649000;899000;Si;22;2026-04-10
MON-SAMS-F390;Monitor Curvo Samsung 24" FHD 60Hz;Samsung;Tecnología;899000;749000;699000;699000;Si;17;2026-05-24
ACC-LOGI-M185;Mouse Inalámbrico Logitech M185 Gris;Logitech;Tecnología;69900;59900;59900;69900;Si;14;2026-05-24
`
  },
  {
    name: "Celulares y Smartphones",
    description: "Dispositivos móviles Android y Apple. Contiene alta variación en descuentos de pago con tarjeta del almacén.",
    category: "Celulares",
    csvContent: `SKU;Descripción;Marca;Categoría;Precio Regular;Precio Hoy;Precio Tarjeta Alkosto;Precio Anterior;Tiene Descuento;Descuento (%);Fecha de Captura
CEL-SAMS-A54;SAMSUNG Galaxy A54 5G 128GB 8GB RAM;Samsung;Celulares;1999000;1499000;1399000;1999000;Si;25;2026-03-01
CEL-SAMS-A54;SAMSUNG Galaxy A54 5G 128GB 8GB RAM;Samsung;Celulares;1999000;1699000;1599000;1499000;Si;15;2026-04-01
CEL-SAMS-A54;SAMSUNG Galaxy A54 5G 128GB 8GB RAM;Samsung;Celulares;1999000;1899000;1899000;1699000;Si;5;2026-05-24
CEL-APPL-IP15;Apple iPhone 15 128GB Negro;Apple;Celulares;4599000;3999000;3849000;4599000;Si;13;2026-04-15
CEL-APPL-IP15;Apple iPhone 15 128GB Negro;Apple;Celulares;4599000;3599000;3499000;3999000;Si;22;2026-05-24
CEL-SAMS-S24U;SAMSUNG Galaxy S24 Ultra 512GB;Samsung;Celulares;6899000;5899000;5499000;6899000;Si;15;2026-04-15
CEL-SAMS-S24U;SAMSUNG Galaxy S24 Ultra 512GB;Samsung;Celulares;6899000;5999000;5599000;5899000;Si;13;2026-05-24
CEL-XIAO-RN13;Xiaomi Redmi Note 13 Pro 256GB;Xiaomi;Celulares;1499000;1199000;1099000;1499000;Si;20;2026-04-15
CEL-XIAO-RN13;Xiaomi Redmi Note 13 Pro 256GB;Xiaomi;Celulares;1499000;1099000;999000;1199000;Si;27;2026-05-24
CEL-MOT-G54;Motorola Moto G54 5G 256GB;Motorola;Celulares;899000;749000;719000;899000;Si;17;2026-05-24
`
  },
  {
    name: "Electrodomésticos y Hogar",
    description: "Neveras, Lavadoras y Televisores. Muestra comportamientos de precios estables con descuentos ocasionales.",
    category: "Electrodomésticos",
    csvContent: `SKU;Descripción;Marca;Categoría;Precio Regular;Precio Hoy;Precio Tarjeta Alkosto;Precio Anterior;Tiene Descuento;Descuento (%);Fecha de Captura
TV-LG-OLED55;Televisor LG OLED 55" 4K Smart TV EQ;LG;Electrodomésticos;5499000;4399000;4199000;5499000;Si;20;2026-03-01
TV-LG-OLED55;Televisor LG OLED 55" 4K Smart TV EQ;LG;Electrodomésticos;5499000;4499000;4299000;4399000;Si;18;2026-04-01
TV-LG-OLED55;Televisor LG OLED 55" 4K Smart TV EQ;LG;Electrodomésticos;5499000;3999000;3799000;4499000;Si;27;2026-05-24
NEV-MAB-400;Nevera Mabe No Frost 400 Litros Grafito;Mabe;Electrodomésticos;2699000;2499000;2399000;2699000;Si;7;2026-04-15
NEV-MAB-400;Nevera Mabe No Frost 400 Litros Grafito;Mabe;Electrodomésticos;2699000;2549000;2499000;2499000;Si;5;2026-05-24
LAV-SAMS-20;Lavadora Samsung Carga Superior 20kg;Samsung;Electrodomésticos;3299000;2899000;2749000;3299000;Si;12;2026-04-15
LAV-SAMS-20;Lavadora Samsung Carga Superior 20kg;Samsung;Electrodomésticos;3299000;2849000;2699000;2899000;Si;14;2026-05-24
TV-SAMS-75;Televisor Samsung 75" UHD LED Smart TV;Samsung;Electrodomésticos;4899000;4899000;4899000;4899000;No;0;2026-05-24
`
  }
];

export function parseCSV(csvText: string): Product[] {
  if (!csvText) return [];
  // Use regex to split on common newline formats (\r\n or \n) OR physical newlines in string format
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return [];

  // Determine separator: usually semicolon (;) or comma (,)
  const header = lines[0];
  let sep = ";";
  if (header.includes(";")) {
    sep = ";";
  } else if (header.includes(",")) {
    sep = ",";
  } else if (header.includes("\t")) {
    sep = "\t";
  }
  const columns = header.split(sep).map(c => c.replace(/^["']|["']$/g, "").trim());

  // Helper to normalize strings for robust mapping
  const normalizeHeader = (str: string) => {
    return str.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accent mark diacritics
      .replace(/[^a-z0-9]/g, ""); // keep alphanumeric characters only
  };

  // Find corresponding index for each column type once (pre-computation)
  const findColumnIndex = (targetNames: string[]): number => {
    const normalizedTargets = targetNames.map(normalizeHeader);
    return columns.findIndex(col => {
      const normCol = normalizeHeader(col);
      return normalizedTargets.some(t => normCol.includes(t) || t.includes(normCol));
    });
  };

  const idxSku = findColumnIndex(["sku", "ref", "referencia", "id"]);
  const idxDesc = findColumnIndex(["descripcion", "nombre", "producto", "description"]);
  const idxMarca = findColumnIndex(["marca", "fabricante", "brand"]);
  const idxCat = findColumnIndex(["categoria", "seccion", "grupo", "category"]);
  const idxReg = findColumnIndex(["precio regular", "preciolista", "regular", "precio base", "precio anterior"]);
  const idxHoy = findColumnIndex(["precio hoy", "preciohoy", "precio actual", "precio"]);
  const idxTarj = findColumnIndex(["precio tarjeta alkosto", "precio tarjeta", "tarjeta alkosto", "tarjeta"]);
  const idxAnt = findColumnIndex(["precio anterior", "anterior", "precioant"]);
  const idxDescuentoStr = findColumnIndex(["tiene descuento", "descuento", "promo"]);
  const idxDescuentoPct = findColumnIndex(["descuento %", "descuento(%)", "% descuento", "porcentaje"]);
  const idxFecha = findColumnIndex(["fecha de captura", "fecha captura", "fecha", "captura"]);

  const parsedProducts: Product[] = [];

  const cleanNumber = (valStr: string): number => {
    if (!valStr) return 0;
    let clean = valStr.replace(/[^0-9,\\.]/g, "");
    const dotsCount = (clean.match(/\./g) || []).length;
    const commasCount = (clean.match(/,/g) || []).length;
    if (dotsCount > 1 && commasCount === 0) {
      clean = clean.replace(/\./g, "");
    } else if (dotsCount === 1 && commasCount === 0) {
      const parts = clean.split(".");
      if (parts[1] && parts[1].length === 3) {
        clean = clean.replace(".", "");
      }
    } else if (commasCount > 0) {
      clean = clean.replace(/\./g, "").replace(",", ".");
    }
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  const todayStr = new Date().toISOString().split("T")[0];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = line.split(sep).map(v => v.replace(/^["']|["']$/g, "").trim());
    if (values.length < columns.length) continue;

    const sku = idxSku !== -1 ? values[idxSku] : "";
    const descripcion = idxDesc !== -1 ? values[idxDesc] : "";
    if (!sku || !descripcion) continue;

    const marca = idxMarca !== -1 ? values[idxMarca] : "Genérico";
    const categoria = idxCat !== -1 ? values[idxCat] : "Otros";
    const precioRegular = idxReg !== -1 ? cleanNumber(values[idxReg]) : 0;
    const precioHoy = idxHoy !== -1 ? cleanNumber(values[idxHoy]) : 0;
    const precioTarjetaAlkostoVal = idxTarj !== -1 ? cleanNumber(values[idxTarj]) : 0;
    const precioTarjetaAlkosto = (precioTarjetaAlkostoVal > 0 && precioTarjetaAlkostoVal < precioHoy) ? precioTarjetaAlkostoVal : null;
    const precioAnteriorVal = idxAnt !== -1 ? cleanNumber(values[idxAnt]) : 0;
    const precioAnterior = precioAnteriorVal > 0 ? precioAnteriorVal : null;

    const tieneDescuentoValue = idxDescuentoStr !== -1 ? values[idxDescuentoStr].toLowerCase() : "";
    const tieneDescuento = tieneDescuentoValue.startsWith("s") || tieneDescuentoValue.startsWith("y") || tieneDescuentoValue === "1" || tieneDescuentoValue === "true" || (precioRegular > precioHoy);

    const descuentoPctVal = idxDescuentoPct !== -1 ? cleanNumber(values[idxDescuentoPct]) : 0;
    const calculatedDescuentoPct = precioRegular > 0 ? Math.round(((precioRegular - precioHoy) / precioRegular) * 100) : 0;
    const descuentoPct = descuentoPctVal > 0 ? descuentoPctVal : (calculatedDescuentoPct > 0 ? calculatedDescuentoPct : 0);

    const fechaCaptura = (idxFecha !== -1 && values[idxFecha]) ? values[idxFecha] : todayStr;

    // Build raw rowObj matching original layout mapping for compatibility
    const rowObj: Record<string, string> = {};
    columns.forEach((col, cIdx) => {
      rowObj[col] = values[cIdx] || "";
    });

    parsedProducts.push({
      id: `${sku}-${fechaCaptura}-${i}`,
      sku,
      descripcion,
      marca,
      categoria,
      precioRegular: precioRegular || precioHoy,
      precioHoy: precioHoy,
      precioTarjetaAlkosto,
      precioAnterior,
      tieneDescuento,
      descuentoPct,
      fechaCaptura,
      originalRow: rowObj
    });
  }

  return parsedProducts;
}

export function formatPrice(num: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}
