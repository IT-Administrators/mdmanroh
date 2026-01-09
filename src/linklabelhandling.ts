import * as vscode from "vscode";
import { InlineLink } from "./interfaces/links";

/** Extract all labels from the specified document. */
export function extractReferenceLabels(document: { getText(): string }): { label: string; url: string }[] {
  const text = document.getText();
  const regex = /^\s*\[([^\]]+)\]:\s*(.+)$/gm;
  const items: { label: string; url: string }[] = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    items.push({ label: match[1], url: match[2] });
  }

  return items;
}
/** Extract all inline links from file. */
export function extractInlineLinks(document: {getText(): string; positionAt(offset: number): { line: number; character: number }; lineAt(line: number): { text: string }; lineCount: number;}): InlineLink[] {
  // Get document text
  const text = document.getText();
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  // Array to store inline links
  const links: InlineLink[] = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    const fullMatch = match[0];
    const linkText = match[1];
    const url = match[2];

    // Skip internal anchor links like (#something)
    if (url.startsWith("#")) {
      continue;
    }

    const start = document.positionAt(match.index);
    const end = document.positionAt(match.index + fullMatch.length);

    const startPos = new vscode.Position(start.line, start.character);
    const endPos = new vscode.Position(end.line, end.character);

    const lineText = document.lineAt(startPos.line).text;
    const trimmed = lineText.trim();

    // Skip image links
    if (trimmed.startsWith("![")) {
      continue;
    }

    // Skip ATX headings (#, ##, ###, ####, #####, ######)
    if (/^#{1,6}\s/.test(trimmed)) {
      continue;
    }

    // Skip ATX headings with trailing hashes
    if (/^#{1,6}\s.*#{1,6}\s*$/.test(trimmed)) {
      continue;
    }

    // Skip Setext headings (underlines)
    if (startPos.line < document.lineCount - 1) {
      const nextLine = document.lineAt(startPos.line + 1).text.trim();
      if (/^[-=]{3,}$/.test(nextLine)) {
        continue;
      }
    }

    links.push({
      text: linkText,
      url,
      range: new vscode.Range(startPos, endPos)
    });
  }

  return links;
}
