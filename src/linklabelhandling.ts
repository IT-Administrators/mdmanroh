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
  // Get content of current document
  const text = document.getText();
  // Regex for links
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;

  const links: InlineLink[] = [];

  // Detect fenced code blocks (``` ... ```)
  const lines = text.split("\n");
  let inFenced = false;
  const fencedMap = new Array(lines.length).fill(false);

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    if (/^```/.test(trimmed)) {
      inFenced = !inFenced;
      fencedMap[i] = inFenced;
      continue;
    }

    fencedMap[i] = inFenced;
  }

  // Detect indented code blocks (4+ spaces or a tab)
  const indentedMap = new Array(lines.length).fill(false);

  for (let i = 0; i < lines.length; i++) {
    if (/^( {4,}|\t)/.test(lines[i])) {
      indentedMap[i] = true;
    }
  }

  let match;
  while ((match = regex.exec(text)) !== null) {
    const fullMatch = match[0];
    const linkText = match[1];
    const url = match[2];

    // Skip internal anchor links like (#something)
    if (url.startsWith("#")) {
      continue;
    }

    // Skip malformed links
    if (/\s/.test(url)) {
      continue;
    }
    if (url.includes("\n")) {
      continue;
    }
    if (url.includes("(") || url.includes(")")) {
      continue;
    }

    const start = document.positionAt(match.index);
    const end = document.positionAt(match.index + fullMatch.length);

    const startPos = new vscode.Position(start.line, start.character);
    const endPos = new vscode.Position(end.line, end.character);

    const lineText = document.lineAt(startPos.line).text;
    const trimmed = lineText.trim();

    // Skip fenced code blocks
    if (fencedMap[startPos.line]) {
      continue;
    }

    // Skip indented code blocks
    if (indentedMap[startPos.line]) {
      continue;
    }

    // Skip blockquotes
    if (trimmed.startsWith(">")) {
      continue;
    }

    // Skip image links
    if (trimmed.startsWith("![")) {
      continue;
    }

    // Skip ATX headings
    if (/^#{1,6}\s/.test(trimmed)) {
      continue;
    }

    // Skip ATX headings with trailing hashes
    if (/^#{1,6}\s.*#{1,6}\s*$/.test(trimmed)) {
      continue;
    }

    // Skip Setext headings
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

