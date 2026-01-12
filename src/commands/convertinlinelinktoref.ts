import * as vscode from "vscode";
import { extractInlineLinks, extractReferenceLabels } from "../linklabelhandling";
import { InlineLink } from "../interfaces/links";

/** Command to convert the selected inline link to reference link.
 * Uses classic markdown reference link structure:
 * 
 * [linktext][label]
 * 
 * [label]: url
 */
export async function convertInlineLinkToReference() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const document = editor.document;

  const links = extractInlineLinks(document);
  if (links.length === 0) {
    vscode.window.showInformationMessage("No inline links found in this document.");
    return;
  }

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

  const existing = extractReferenceLabels(document);
  const existingLabels = existing.map(l => l.label.toLowerCase());

  const label = await vscode.window.showInputBox({
    prompt: "Enter a reference label",
    value: link.text.toLowerCase().replace(/\s+/g, "-"),
    validateInput: value => {
      if (value.trim() === "") {
        return "Label cannot be empty";
      }
      return null; // allow duplicates so QuickPick can run
    }
  });

  if (!label) {
    return;
  }

  const normalized = label.trim().toLowerCase();

  // Duplicate → show QuickPick of labels that CONTAIN the entered text
  if (existingLabels.includes(normalized)) {
    const matching = existing.filter(l =>
      l.label.toLowerCase().includes(normalized)
    );

    const pickedExisting = await vscode.window.showQuickPick(
      matching.map(l => ({
        label: l.label,
        description: l.url,
        full: l
      })),
      { placeHolder: `Labels containing "${normalized}" already exist. Choose one:` }
    );

    if (!pickedExisting) {
      return;
    }

    const chosen = pickedExisting.full;

    await editor.edit(edit => {
      edit.replace(link.range, `[${link.text}][${chosen.label}]`);
    });

    return;
  }


  // Normal case: create new reference
  const { replacement, reference } = convertInlineToReferenceCore(
    { text: link.text, url: link.url },
    label
  );

  await editor.edit(edit => {
    edit.replace(link.range, replacement);

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
