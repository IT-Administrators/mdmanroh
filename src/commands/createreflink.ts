import * as vscode from "vscode";
/** Create new reference linke command. */
export async function createNewReferenceLink() {
  // Get current editor
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  // Get currently open document
  const document = editor.document;

  // Ask for label
  const label = await vscode.window.showInputBox({
    prompt: "Enter the reference label (e.g. github)",
    validateInput: value => value.trim() === "" ? "Label cannot be empty" : null
  });
  if (!label) {
    return;
  }

  // Ask for URL
  const url = await vscode.window.showInputBox({
    prompt: "Enter the URL for this reference",
    validateInput: value => value.trim() === "" ? "URL cannot be empty" : null
  });
  if (!url) {
    return;
  }

  // Build reference line
  const referenceLine = `\n[${label}]: ${url}`;

  // Insert at end of document so all reference links are at the same region
  const end = new vscode.Position(document.lineCount, 0);

  editor.edit(edit => {
    edit.insert(end, referenceLine);
  });
}
