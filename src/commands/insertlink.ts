import * as vscode from "vscode";
import { extractReferenceLabels } from "../linklabelhandling";

/** Insert a chosen reference label at current position. */
export async function pickReferenceLabel(
    document?: vscode.TextDocument,
    position?: vscode.Position
) {
    // If called from Command Palette, no args are passed -> use active editor
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    if (!document) {
        document = editor.document;
    }

    if (!position) {
        position = editor.selection.active;
    }

    // Sort labels
    const labels = extractReferenceLabels(document).sort((a, b) =>
        a.label.localeCompare(b.label)
    );

    if (labels.length === 0) {
        vscode.window.showInformationMessage("No reference labels found in this document.");
        return;
    }

    const picked = await vscode.window.showQuickPick(
        labels.map(r => ({ label: r.label, description: r.url })),
        { placeHolder: "Choose a reference label" }
    );

    if (!picked) {
        return;
    }

    const selection = editor.selection;
    const hasSelection = !selection.isEmpty;

    editor.edit(edit => {
        if (hasSelection) {
            edit.replace(selection, picked.label);
        } else {
            edit.insert(position!, picked.label);
        }
    });
}

