/**
 * Parses simple markdown headers, bullets, and bold text into clean React components
 * with custom Tailwind CSS styling. This provides high-fidelity, polished output.
 */
import { JSX } from "react";

export function parseSimpleMarkdownToHtml(markdown: string): string {
  if (!markdown) return "";
  
  let html = markdown;

  // Replace primary headers
  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-xs font-bold text-white mt-4 mb-2 uppercase tracking-wide font-mono">$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2 class="text-xs font-black text-tech-accent border-b border-tech-border pb-1 mt-5 mb-2.5 flex items-center gap-1.5 uppercase tracking-wider font-mono">$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1 class="text-sm font-black text-white tracking-widest border-b border-tech-border pb-1 mt-6 mb-3 uppercase font-mono">$1</h1>');

  // Replace bold text
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>');

  // Replace tables
  // Simple markdown table parser
  const lines = html.split("\n");
  let tableActive = false;
  let tableHeaders: string[] = [];
  const processedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("|") && line.endsWith("|")) {
      const cells = line.split("|").map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      
      if (!tableActive) {
        tableActive = true;
        tableHeaders = cells;
        // Skip header separator row if it's there
        if (lines[i+1] && lines[i+1].includes("-|")) {
          i++; // Skip the separator row
        }
        processedLines.push('<div class="overflow-x-auto my-3 border border-tech-border rounded-sm bg-[#0D0E10]/40"><table class="min-w-full divide-y divide-tech-border text-xs font-mono">');
        processedLines.push('<thead class="bg-[#1D2026]/70"><tr>');
        tableHeaders.forEach(th => {
          processedLines.push(`<th class="px-3 py-2 text-left text-[9px] font-black text-tech-accent uppercase tracking-wider">${th}</th>`);
        });
        processedLines.push('</tr></thead><tbody class="divide-y divide-tech-border/60 bg-transparent">');
      } else {
        processedLines.push('<tr>');
        cells.forEach(cell => {
          processedLines.push(`<td class="px-3 py-1.5 text-slate-200 font-sans text-xs">${cell}</td>`);
        });
        processedLines.push('</tr>');
      }
    } else {
      if (tableActive) {
        tableActive = false;
        processedLines.push('</tbody></table></div>');
      }
      processedLines.push(lines[i]);
    }
  }
  if (tableActive) {
    processedLines.push('</tbody></table></div>');
  }
  html = processedLines.join("\n");

  // Format bullets
  // Look for list items starting with - or * and format them nicely with custom bullets
  html = html.replace(/^\s*[\-\*]\s+(.*?)$/gm, '<li class="flex items-start gap-2 text-slate-200 leading-relaxed py-1 font-sans text-xs"><span class="text-tech-accent mt-2 shrink-0 block w-1.5 h-1.5 rounded-xs bg-tech-accent"></span><span class="flex-1">$1</span></li>');

  // Wrap contiguous lists in actual <ul> blocks
  // Simple post processing trick: replace bullet series
  const wrappedLines: string[] = [];
  let listActive = false;
  
  html.split("\n").forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('<li')) {
      if (!listActive) {
        listActive = true;
        wrappedLines.push('<ul class="space-y-1 my-3 pl-1">');
      }
      wrappedLines.push(line);
    } else {
      if (listActive) {
        listActive = false;
        wrappedLines.push('</ul>');
      }
      wrappedLines.push(line);
    }
  });
  if (listActive) {
    wrappedLines.push('</ul>');
  }
  html = wrappedLines.join("\n");

  // Format line breaks for normal text (non-html tags)
  html = html.split("\n").map(l => {
    const tl = l.trim();
    if (!tl) return '<div class="h-2"></div>';
    if (tl.startsWith("<li") || tl.startsWith("<ul") || tl.startsWith("</ul") || tl.startsWith("<h") || tl.startsWith("<div") || tl.startsWith("<table") || tl.startsWith("<tr") || tl.startsWith("<td") || tl.startsWith("<th")) {
      return l;
    }
    return `<p class="text-slate-300 leading-relaxed text-xs mb-2 font-sans">${l}</p>`;
  }).join("\n");

  return html;
}
