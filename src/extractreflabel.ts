/** Extract all labels from the specified document. */
export function extractReferenceLabels(document: { getText(): string } ): { label: string; url: string }[] {
  const text = document.getText();
  const regex = /^\[([^\]]+)\]:\s*(.+)$/gm;
  const items: { label: string; url: string }[] = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    items.push({ label: match[1], url: match[2] });
  }

  return items;
}