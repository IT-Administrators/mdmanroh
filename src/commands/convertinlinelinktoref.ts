import * as vscode from "vscode";
import { extractInlineLinks } from "../linklabelhandling";
import { InlineLink } from "../interfaces/links";

/** Command to convert the selected inline link to reference link.
 * Uses classic markdown reference link structure:
 * 
 * [linktext][label]
 * 
 * [label]: url
 */
export async function convertInlineLinkToReference() {
  // Get currently active editor
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const document = editor.document;

  // Extract all inline links
  const links = extractInlineLinks(document);

  if (links.length === 0) {
    vscode.window.showInformationMessage("No inline links found in this document.");
    return;
  }

  // Show QuickPick
  const picked = await vscode.window.showQuickPick(
    links.map(l => ({
      label: l.text,
      description: l.url,
      link: l
    })),
    { placeHolder: "Choose an inline link to convert" }
  );

  if (!picked) {
    return;
  }

  const link = picked.link;

  // Ask for a reference label
  const label = await vscode.window.showInputBox({
    prompt: "Enter a reference label",
    value: link.text.toLowerCase().replace(/\s+/g, "-")
  });

  if (!label) {
    return;
  }

  // Use the pure core function
  const { replacement, reference } = convertInlineToReferenceCore(
    { text: link.text, url: link.url },
    label
  );

  await editor.edit(edit => {
    // Replace inline link with reference-style link
    edit.replace(link.range, replacement);

    // Append reference definition at end of document
    const end = new vscode.Position(document.lineCount, 0);
    edit.insert(end, `\n${reference}`);
  });
}

interface InlineLinkCore {
  text: string;
  url: string;
}

export function convertInlineToReferenceCore(
  link: InlineLinkCore,
  label: string
): { replacement: string; reference: string } {
  const replacement = `[${link.text}][${label}]`;
  const reference = `[${label}]: ${link.url}`;
  return { replacement, reference };
}
