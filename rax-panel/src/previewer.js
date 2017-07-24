var vscode = require('vscode');
var fs = require('fs');
var ip = require('ip');

function Previewer() {
  this.init.apply(this, arguments);
}

Previewer.prototype = {
  init: function(conf) {
    // var config = vscode.workspace.getConfiguration('rax');

    this.platform = conf.platform;

    this.tmpFilePath = `/tmp/vscode-rax-extension-panels${parseInt(Math.random() * 100)}.html`;

    if (this.platform === 'web') {
      this.previewColumn = vscode.ViewColumn.Two;
      this.webviewUrl = 'http://127.0.0.1:3000/slider.html';
      this.webTools = `
          <div style="width: 375px; height: 40px; text-align: left;">
              <input type="text" value="${this.webviewUrl}" style="width: 260px" />
              <a href="command:_webview.openDevTools">debug</a>
          </div>
      `;
      this.width = 375;
      this.height = 667;
    } else {
      this.previewColumn = vscode.ViewColumn.One;
      this.webviewUrl = `http://${ip.address()}:8088/`;
      this.webTools = '';
      this.width = '100%';
      this.height = '100%';
    }

    var htmlContent = this._getHtmlContent();
    this._openWebviewWithContent(htmlContent);
  },
  _openWebviewWithContent: function(htmlContent) {
    try {
      fs.writeFileSync(this.tmpFilePath, htmlContent);

      var uri = vscode.Uri.file(this.tmpFilePath);
      vscode.commands.executeCommand('vscode.previewHtml', uri, this.columnOption, 'Rax Preview').then((success) => { }, (error) => {
        vscode.window.showErrorMessage(error);
      });
    } catch(error) {
      vscode.window.showErrorMessage(error);
    }
  },
  _getHtmlContent: function() {
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
                ${this.webTools}
                <iframe src="${this.webviewUrl}" width="${this.width}" height="${this.height}"
                    frameborder="1" scrolling="yes" style="pointer-events: auto;"> </iframe>
            </body>
        </html>
    `;
  }
};

module.exports = Previewer;