var vscode = require('vscode');
var fs = require('fs');

const activate = context => {
    const raxInit = vscode.commands.registerCommand('extension.rax-init', () => {
        console.log('helo');
    });
    context.subscriptions.push(raxInit);
}

exports.activate = activate;

// this method is called when your extension is deactivated
const deactivate = () => {
}

exports.deactivate = deactivate;