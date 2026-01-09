import * as vscode from "vscode";

/** Representation of a InlineLink. */
export interface InlineLink {
  text: string;
  url: string;
  range: vscode.Range;
}