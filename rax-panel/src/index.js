var vscode = require('vscode');
var path = require('path');
var cp = require('child_process');

var InitHandler = require('./init');
var PublishHandler = require('./publish');
var Previewer = require('./previewer');

// this method is called when your extension is activated
function activate(context) {
  var projectPath = '';

  var raxInit = vscode.commands.registerCommand('extension.rax-init', function() {
    var initer = new InitHandler(function() {
      projectPath = initer.projectPath;
    });
  });

  var webPreview = vscode.commands.registerCommand('extension.rax-web', function () {
    new Previewer({platform: 'web'});
  });

  var weexPreview = vscode.commands.registerCommand('extension.rax-weex', function () {
    var weex = path.join(__dirname, '../node_modules/.bin/weex');
    console.log(weex);
    var weexDebugger = cp.spawn(weex, ['debug']);

    weexDebugger.stdout.on('data', function(data) {
      var str = data.toString();

      if (str.indexOf('Launching Dev Tools') > -1) {
        new Previewer({platform: 'weex'});
      }
    });

    weexDebugger.stderr.on('data', function(data) {
      vscode.window.showErrorMessage(data.toString());
    });

    weexDebugger.on('error', function(e) {
      vscode.window.showErrorMessage(e);
    });

    weexDebugger.on('close', function(code) {
      console.log('weex debug process exited with ' + code);
    });
  });

  var raxPublish = vscode.commands.registerCommand('extension.rax-publish', () => {
    var publisher = new PublishHandler(projectPath);

    publisher.sendFile();
  });

  context.subscriptions.push(webPreview);
  context.subscriptions.push(weexPreview);
  context.subscriptions.push(raxInit);
  context.subscriptions.push(raxPublish);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;