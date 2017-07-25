var vscode = require('vscode');
var fs = require('fs');
var ip = require('ip');
var cp = require('child_process');
var detect = require('detect-port');

function Previewer() {
  this.init.apply(this, arguments);
}

Previewer.prototype = {
  raxServerPort: 9999,
  init: function(conf) {
    var self = this;

    // var config = vscode.workspace.getConfiguration('rax');
    self.platform = conf.platform;
    self.projectPath = '/tmp/helloworld';//conf.projectPath;

    detect(self.raxServerPort, (err, _port) => {
      if (err) {
        console.error(err);
      }

      if (self.raxServerPort == _port) {
        self._startServer();
      } else {
        self._openWebview();
      }
    });
  },
  checkRaxServerStat: function() {

  },
  _startServer: function() {
    var self = this;

    var raxServer = cp.spawn('npm', ['run', 'start'], {cwd: this.projectPath});

    raxServer.stdout.on('data', function(data) {
      var str = data.toString();

      if (str.indexOf('Starting the development server') > -1) {
        self._openWebview();
      }
    });

    raxServer.stderr.on('data', function(data) {
      vscode.window.showErrorMessage(data.toString());
    });

    raxServer.on('error', function(e) {
      vscode.window.showErrorMessage(e);
    });

    raxServer.on('close', function(code) {
      console.log('rax server exited with ' + code);
    });
  },
  _openWebview: function() {
    var self = this;
    var htmlContent = self._getHtmlContent();
    var tmpFilePath = `/tmp/vscode-rax-extension-panels${parseInt(Math.random() * 100)}.html`;
    var columnOption = this.platform === 'web' ? vscode.ViewColumn.Two : vscode.ViewColumn.One;

    try {
      fs.writeFileSync(tmpFilePath, htmlContent);

      var uri = vscode.Uri.file(tmpFilePath);
      vscode.commands.executeCommand('vscode.previewHtml', uri, columnOption, 'Rax Preview').then((success) => { }, (error) => {
        vscode.window.showErrorMessage(error);
      });
    } catch(error) {
      vscode.window.showErrorMessage(error);
    }
  },
  _getHtmlContent: function() {
    if (this.platform === 'web') {
      var webviewUrl = `http://${ip.address()}:${this.raxServerPort}/`;
      var webTools = `
          <div style="width: 375px; height: 40px; text-align: left;">
              <input type="text" value="${webviewUrl}" style="width: 260px" />
              <a href="command:_webview.openDevTools">debug</a>
          </div>
      `;
      var width = 375;
      var height = 667;
    } else {
      var webviewUrl = `http://${ip.address()}:8088/`;
      var webTools = '';
      var width = '100%';
      var height = '100%';
    }

    return `
        <!DOCTYPE html>
        <html lang="en" style="height: 100%;">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="ie=edge">
                <title>Rax Preview</title>
                <style>
                    html, body {
                        height: 100%;
                    }
                    #content {
                        text-align: center;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                    }
                </style>
            </head>
            <body id="content">
                ${webTools}
                <iframe src="${webviewUrl}" width="${width}" height="${height}"
                    frameborder="1" scrolling="yes" style="pointer-events: auto;"> </iframe>
            </body>
        </html>
    `;
  }
};

module.exports = Previewer;