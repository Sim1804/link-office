/**
 * Assainit une chaîne HTML pour neutraliser toute injection XSS
 * (scripts, iframes, gestionnaires d'événements, URIs javascript:)
 */
export function sanitizeHtmlContent(html: string): string {
  if (!html) return "";
  let clean = html;
  // 1. Suppression des balises exécutables ou dangereuses
  clean = clean.replace(/<\s*(script|iframe|object|embed|applet|style|meta|link|base)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "");
  clean = clean.replace(/<\s*(script|iframe|object|embed|applet|style|meta|link|base)[^>]*\/?>/gi, "");
  // 2. Suppression des gestionnaires d'événements (onload, onerror, onclick, etc.)
  clean = clean.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  // 3. Neutralisation des protocoles exécutables (javascript:, vbscript:)
  clean = clean.replace(/(href|src|action)\s*=\s*["']?\s*(?:javascript|vbscript):[^"'>\s]*/gi, '$1="#"');
  clean = clean.replace(/(href|src|action)\s*=\s*["']?\s*data:(?!image\/(?:png|jpeg|jpg|webp|gif);base64,)[^"'>\s]*/gi, '$1="#"');
  return clean;
}

/**
 * Convertit un contenu média Markdown en HTML sémantique
 * ou préserve le code HTML s'il a déjà été généré par un éditeur WYSIWYG (TipTap),
 * tout en garantissant un assainissement strict anti-XSS.
 */
export function formatMediaContent(content: string): string {
  if (!content) return "";

  // Si le contenu comporte déjà des balises de bloc HTML standard, on l'assainit et le renvoie
  const isHtml = /<\/?(p|h[1-6]|ul|ol|li|blockquote|div|section|article)\b/i.test(content);
  if (isHtml) {
    return sanitizeHtmlContent(content);
  }

  let text = content.replace(/\r\n/g, "\n");

  // 1. Blocs de code (ASCII / diagrammes)
  const codeBlocks: string[] = [];
  text = text.replace(/```([\s\S]*?)```/g, (_match, code) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(`<pre><code>${code.trim()}</code></pre>`);
    return `\n\n${placeholder}\n\n`;
  });

  // 2. Titres (h2, h3)
  text = text.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  text = text.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  text = text.replace(/^# (.*$)/gim, "<h2>$1</h2>");

  // 3. Lignes séparatrices horizontales
  text = text.replace(/^---$/gim, "<hr />");

  // 4. Citations (blockquotes)
  text = text.replace(/^> (.*$)/gim, "<blockquote><p>$1</p></blockquote>");

  // 5. Gras et Italique
  text = text.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // 6. Liens Markdown
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // 7. Listes à puces non ordonnées
  text = text.replace(/^\s*[-*]\s+(.*$)/gim, "<li>$1</li>");
  text = text.replace(/(<li>(?:(?!<\/li>)[\s\S])*?<\/li>(?:\s*<li>(?:(?!<\/li>)[\s\S])*?<\/li>)*)/g, "<ul>$1</ul>");

  // 8. Listes ordonnées (numérotées)
  text = text.replace(/^\s*\d+\.\s+(.*$)/gim, "<oli>$1</oli>");
  text = text.replace(/(<oli>(?:(?!<\/oli>)[\s\S])*?<\/oli>(?:\s*<oli>(?:(?!<\/oli>)[\s\S])*?<\/oli>)*)/g, "<ol>$1</ol>");
  text = text.replace(/<oli>/g, "<li>").replace(/<\/oli>/g, "</li>");

  // 9. Paragraphes
  const rawParagraphs = text.split(/\n{2,}/);
  const formattedBlocks = rawParagraphs.map((block) => {
    const trimmed = block.trim();
    if (!trimmed) return "";

    if (/^<(h[1-6]|ul|ol|blockquote|pre|hr|div)/i.test(trimmed) || trimmed.startsWith("__CODE_BLOCK_")) {
      return trimmed;
    }

    return `<p>${trimmed.replace(/\n/g, "<br/>")}</p>`;
  });

  let result = formattedBlocks.filter(Boolean).join("\n\n");

  // Restauration des blocs de code
  codeBlocks.forEach((codeHtml, idx) => {
    result = result.replace(`__CODE_BLOCK_${idx}__`, codeHtml);
  });

  return sanitizeHtmlContent(result);
}
