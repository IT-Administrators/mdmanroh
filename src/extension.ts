import * as vscode from "vscode";
import { createNewReferenceLink } from "./commands/createreflink";
import { ReferenceLinkCodeActionProvider} from "./actionprovider/reflinkprovider";
import { convertInlineLinkToReference } from "./commands/convertinlinelinktoref";
import { pickReferenceLabel } from "./commands/insertlink";

export function activate(context: vscode.ExtensionContext) {
	// Create code action provider.
	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider("markdown", new ReferenceLinkCodeActionProvider(),{
			providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
		}
	)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("refLinks.pickLabel", pickReferenceLabel)
	);

	// Register the "create new reference" command 
	context.subscriptions.push( 
		vscode.commands.registerCommand("mdmanroh.createNewReference", createNewReferenceLink)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("mdmanroh.convertInlineToReference", convertInlineLinkToReference)
	); 
	
	context.subscriptions.push(
		vscode.commands.registerCommand("mdmanroh.pickLabel", pickReferenceLabel)
	);
}

export function deactivate() {}

