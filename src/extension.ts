import * as vscode from "vscode";
import { createNewReferenceLink } from "./commands/createreflink";
import { extractReferenceLabels } from "./linklabelhandling";
import { ReferenceLinkCodeActionProvider} from "./actionprovider/reflinkprovider";
import { convertInlineLinkToReference } from "./commands/convertinlinelinktoref";

export function activate(context: vscode.ExtensionContext) {
	// Create code action provider.
	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider("markdown", new ReferenceLinkCodeActionProvider(),{
			providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
		}
	)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("refLinks.pickLabel", async (document: vscode.TextDocument, position: vscode.Position) => {
			// Sort labels
			const labels = extractReferenceLabels(document).sort((a, b) => a.label.localeCompare(b.label));
			// Catch no labels exist
			if (labels.length === 0) {
				vscode.window.showInformationMessage("No reference labels found in this document.");
				return;
			}
			// Get picked item form quickpick.
			const picked = await vscode.window.showQuickPick( 
				labels.map(r => ({ label: r.label, description: r.url })), 
				{ placeHolder: "Choose a reference label" } 
			);

			if (!picked) {
				return;
			}
			// Get active editor
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				return;
			}
			// Check if text is selected
			const selection = editor.selection; 
			const hasSelection = !selection.isEmpty;

			editor.edit(edit => {
				// If there is text selected it will be replaced
				if (hasSelection) {  
					edit.replace(selection, picked.label); 
				} else { 
					// Insert at cursor 
					edit.insert(position, picked.label); 
				}
			});
		})
	);

	// Register the "create new reference" command 
	context.subscriptions.push( 
	vscode.commands.registerCommand("mdmanroh.createNewReference", createNewReferenceLink)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("mdmanroh.convertInlineToReference", convertInlineLinkToReference)
	);

}

export function deactivate() {}

