var vscode = require('vscode');
var fs = require('fs');
var path = require('path');
var cp = require('child_process');
var ip = require('ip');

var HackerHands = require('./hackerhands');

var HTML_FILE_PATH = '/tmp/vscode-rax-extension-panels.html';
var getHtmlContent = function(host, port, path, width, height) {
    width = width || 375;
    height = height || 667;

    return `
        <!DOCTYPE html>
        <html lang="en" style="height: 100%;">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="ie=edge">
                <title>Rax Preview</title>
            </head>
            <body style="text-align: center; height: 100%;">
                <iframe src="http://${host}:${port}${path}" width="${width}" height="${height}" frameborder="0" scrolling="yes" style="pointer-events: auto;"> </iframe>
            </body>
        </html>
    `;
}

var openWebviewWithContent = function(htmlContent, columnOption) {
    columnOption = columnOption || vscode.ViewColumn.One;

    fs.writeFileSync(HTML_FILE_PATH, htmlContent);

    var uri = vscode.Uri.file(HTML_FILE_PATH);
    var success = vscode.commands.executeCommand('vscode.previewHtml', uri, columnOption, 'Rax Preview').then((success) => { }, (error) => {
        vscode.window.showErrorMessage(error);
    });
}

// this method is called when your extension is activated
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "rax-panel" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var webPreview = vscode.commands.registerCommand('extension.rax-web', function () {
        // var config = vscode.workspace.getConfiguration('rax');
        // var previewHost = config.get('host');
        // var previewPort = config.get('port');
        // var previewPath = config.get('path');
        var previewHost = '127.0.0.1';
        var previewPort = '3000';
        var previewPath = '/slider.html';
        var fileContent = `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="ie=edge">
                    <title>Rax Preview</title>
                </head>
                <body style="text-align: center">
                    <iframe src="http://${previewHost}:${previewPort}${previewPath}" width="375" height="667" frameborder="0" scrolling="yes" style="pointer-events: auto;"> </iframe>
                </body>
            </html>
        `;

        try {
            // fs.writeFileSync(HTML_FILE_PATH, fileContent);
            HTML_FILE_PATH = '/etc/hosts';

            var uri = vscode.Uri.file(HTML_FILE_PATH);

            var success = vscode.commands.executeCommand('vscode.previewHtml', uri, vscode.ViewColumn.Two, 'Rax Preview').then((success) => { }, (error) => {
                vscode.window.showErrorMessage(error);
            });
        } catch(error) {
            vscode.window.showErrorMessage(error);
        }
    });

    var weexPreview = vscode.commands.registerCommand('extension.rax-weex', function () {
        var weex = path.join(__dirname, 'node_modules/.bin/weex');
        var weexDebugger = cp.spawn(weex, ['debug']);
        var weexDebuggerPort = '8088';

        weexDebugger.stdout.on('data', function(data) {
            var str = data.toString();

            console.log(str);

            if (str.indexOf('Launching Dev Tools') > -1) {
                var host = ip.address();
                var htmlContent = getHtmlContent(host, weexDebuggerPort, '/', '100%', '100%');

                openWebviewWithContent(htmlContent);
            }
        });

        weexDebugger.stderr.on('data', function(data) {
            vscode.window.showErrorMessage(data.toString());
        });

        weexDebugger.on('close', function(code) {
            console.log('weex debug process exited with ' + code);
        });
    });

    var helloHacker = vscode.commands.registerCommand('extension.rax-hello', function () {
        var hh = new HackerHands();

        hh.sendFile();
    });

    context.subscriptions.push(webPreview);
    context.subscriptions.push(weexPreview);
    context.subscriptions.push(helloHacker);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;