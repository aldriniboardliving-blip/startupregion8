/**
 * Renders content authored in the RichTextEditor as faithful HTML.
 *
 * The editor stores basic HTML plus literal newlines (authors press Enter to
 * start a new paragraph without wrapping every block in <p>). Plain HTML
 * collapses those newlines, so the published page would not match what the
 * author wrote in the editor.
 *
 * To make the display match the editor we:
 *   1. Drop newline/whitespace runs that merely flank block-level elements
 *      (the editor's toolbar wraps headings/lists in \n\n...\n\n).
 *   2. Turn remaining runs of 2+ newlines into real paragraph breaks.
 *   3. Collapse single stray newlines to a single space.
 *
 * Block tags are handled separately so list items / headings never gain
 * phantom blank lines from whitespace between open and close tags.
 */

const BLOCK_TAGS =
  "h[1-6]|p|ul|ol|li|blockquote|div|section|pre|table|thead|tbody|tr|td|th|hr|figure|figcaption";

export function normalizeContentHtml(html: string): string {
  const source = String(html || "").replace(/\r\n?/g, "\n");

  return (
    source
      // 1. Remove line breaks that merely wrap block elements.
      .replace(new RegExp(`\\s*\\n\\s*(?=<\\/?(?:${BLOCK_TAGS})(?:\\s[^>]*)?>)`, "g"), "")
      .replace(new RegExp(`(?<=<\\/?(?:${BLOCK_TAGS})(?:\\s[^>]*)?>)\\s*\\n\\s*`, "g"), "")
      // 2. Preserve paragraph breaks typed with the Enter key.
      .replace(/\n{2,}/g, "<br/><br/>")
      // 3. Collapse the remaining single newlines to a normal space.
      .replace(/\n/g, " ")
      .trim()
  );
}