import * as vscode from "vscode";


// Implements VSCodeActionProvider interface
// A CodeActionProvider is responsible for telling VS Code:
// “At this cursor position, I have a suggestion (a code action) the user might want.”
// VS Code then shows a lightbulb or inline suggestion
/** Reference link provider. This toggles the little symbols next to the code for code actions. */
export class ReferenceLinkCodeActionProvider implements vscode.CodeActionProvider {
  // VS Code calls this method every time the cursor moves or the document changes
  provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] | undefined {
    const position = range.start;
    // This retrieves the entire text of the line where the cursor is
    const line = document.lineAt(position.line).text;
    // This gives the column number of the cursor within the line
    const cursorIndex = position.character;

    // Text before cursor
    const before = line.slice(0, cursorIndex);

    // Detect if inside a link label: "[something"
    // Capture the text inside the label, but only if the closing bracket hasn’t appeared yet
    const match = before.match(/\[([^\]]*)$/);
    if (!match) {
      return;
    }

    // Create and return the code action
    // VS Code expects an array of actions, so we return a single‑element array.
    return [this.createInsertLabelAction(document, position)];
  }
  // This creates a new code action with:
  // A title (shown in the UI)
  // A kind (QuickFix), which determines how VS Code groups it
  private createInsertLabelAction(document: vscode.TextDocument, position: vscode.Position): vscode.CodeAction {
    const action = new vscode.CodeAction(
      "Insert existing reference label",
      vscode.CodeActionKind.QuickFix
    );
    // The arguments allow the command to know:
    // Which document to operate on
    // Where the cursor was when the action was triggered
    action.command = {
      title: "Insert reference label",
      command: "refLinks.pickLabel",
      arguments: [document, position]
    };

    return action;
  }
}