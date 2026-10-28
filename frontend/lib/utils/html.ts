/**
 * Decode HTML entities in a string while preserving HTML structure
 * Handles both encoded HTML (e.g., &lt;p&gt;) and already decoded HTML (<p>)
 *
 * @param html - The HTML string that may contain encoded entities
 * @returns The decoded HTML string
 */
export function decodeHtmlEntities(html: string): string {
  // Check if content has encoded HTML entities
  const hasEncodedEntities = /&(?:lt|gt|amp|quot|#39|nbsp);/i.test(html);

  if (!hasEncodedEntities) {
    // Already decoded or plain text - return as is
    return html;
  }

  if (typeof window === 'undefined') {
    // Server-side: basic decode for common entities
    return html
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
  }

  // Client-side: use textarea trick to decode entities while preserving HTML
  const textarea = document.createElement('textarea');
  textarea.innerHTML = html;
  return textarea.value;
}
