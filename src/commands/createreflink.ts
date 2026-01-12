import * as vscode from "vscode";
import { extractReferenceLabels } from "../linklabelhandling";
/** Create new reference linke command. */
export async function createNewReferenceLink() {
  // Get current editor
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  // Get current window
  const document = editor.document;

  // Collect existing reference labels
  const existing = extractReferenceLabels(document);
  const existingLabels = existing.map(l => l.label.toLowerCase());

  // Ask for label (only check for empty)
  let label = await vscode.window.showInputBox({
    prompt: "Enter the reference label (e.g. github)",
    validateInput: value => {
      if (value.trim() === "") {
        return "Label cannot be empty";
      }
      return null;
    }
  });

  if (!label) {
    return;
  }

  let normalized = label.trim().toLowerCase();

  // Check for EXACT match
  const hasExact = existing.some(
    l => l.label.toLowerCase() === normalized
  );

  if (hasExact) {
    // Show all labels containing the entered text
    const matching = existing.filter(l =>
      l.label.toLowerCase().includes(normalized)
    );

    const pickedExisting = await vscode.window.showQuickPick(
      matching.map(l => ({
        label: l.label,
        description: l.url,
        full: l
      })),
      {
        placeHolder: `Labels containing "${normalized}" already exist. Choose one to reuse, or press Esc to create a new one.`
      }
    );

    if (pickedExisting) {
      const chosen = pickedExisting.full;

      // Insert the chosen reference label at cursor
      const position = editor.selection.active;

      await editor.edit(edit => {
        edit.insert(position, chosen.label);
      });

      return;
    }

    // ESC pressed → ask for label again
    label = await vscode.window.showInputBox({
      prompt: "Enter a NEW reference label",
      validateInput: value => {
        if (value.trim() === "") {
          return "Label cannot be empty";
        }
        return null;
      }
    });

    if (!label) {
      return;
    }

    normalized = label.trim().toLowerCase();
  }

  // Ask for URL (only for new labels)
  const url = await vscode.window.showInputBox({
    prompt: "Enter the URL for this reference",
    validateInput: value => value.trim() === "" ? "URL cannot be empty" : null
  });

  if (!url) {
    return;
  }

  const referenceLine = `\n[${label}]: ${url}`;
  const end = new vscode.Position(document.lineCount, 0);

  await editor.edit(edit => {
    edit.insert(end, referenceLine);
  });
}