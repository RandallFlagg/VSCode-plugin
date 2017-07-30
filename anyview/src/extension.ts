'use strict';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

  let disposable = vscode.commands.registerCommand('extension.anyview', fileUri => {
    let uri;

    if (!fileUri) {
      let editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      let document = editor.document;
      if (!document) {
        return;
      }

      let uri = document.uri;
      if (!uri) {
        return;
      }
    } else {
      uri = fileUri;
    }

    vscode.commands
        .executeCommand(
            'vscode.previewHtml', uri, vscode.ViewColumn.Two, 'Preview')
        .then(() => {}, (error) => { vscode.window.showErrorMessage(error); });
  });

  context.subscriptions.push(disposable);

}

export function deactivate() {}