var vscode = require('vscode');
var path = require('path');
var cp = require('child_process');

var SHOP_MOD = '创建A项目';
var BRAND_MOD = '创建B项目';
var PHILOSOPHER_MOD = '创建C项目';

function InitHandler() {
  this.init.apply(this, arguments);
}

InitHandler.prototype = {
  init: function(callback) {
    this.callback = callback;
    this.projectType = '';
    this.projectName = '';
    this.projectPath = '/tmp';
    this._setProjectInfo();
  },
  _setProjectInfo: function() {
    var self = this;
    var pickScaffold = vscode.window.showQuickPick([SHOP_MOD, BRAND_MOD, PHILOSOPHER_MOD]);

    pickScaffold.then(function(e) {

      switch (e) {
        case SHOP_MOD:
          self.projectType = 'A';
          self._setProjectName();
          break;
        case BRAND_MOD:
          self.projectType = 'B';
          self._setProjectName();
          break;
        case PHILOSOPHER_MOD:
          self.projectType = 'C';
          self._setProjectName();
          break;
        default:
          vscode.window.showErrorMessage('创建失败：未选择项目类型');
          break;
      }
    });
  },
  _setProjectName: function() {
    var self = this;
    var setName = vscode.window.showInputBox();

    setName.then(function(name) {
      if (name) {
        self.projectName = name;
        self.projectPath = path.join(self.projectPath, self.projectName);
        self._createProject();
      } else {
        vscode.window.showErrorMessage('创建失败：未设置项目名称');
      }
    });
  },
  _createProject: function() {
    var self = this;
    var rax = path.join(__dirname, '../node_modules/.bin/rax');
    var options = {
      cwd: path.join(self.projectPath, '..')
    };

    try {
      /**
       * rax-cli
       * 215
       * tnpm
       *
       * 85
       * answers = {
       * projectName: argv['_'][1],
       * projectAuthor: 'rax',
       * autoInstallModules: true
       * };
       *
       */

      var raxIniter = cp.spawn(rax, ['init', self.projectName], options);

      raxIniter.stdout.on('data', function(data) {
        var str = data.toString();

        console.log(str);
      });

      raxIniter.stderr.on('data', function(data) {
        vscode.window.showErrorMessage(data.toString());
      });

      raxIniter.on('error', function(e) {
        vscode.window.showErrorMessage(e);
      });

      raxIniter.on('close', function(code) {
        console.log('rax process exited with ' + code);

        if (code == 0) {
          var uri = vscode.Uri.file(self.projectPath);
          vscode.commands.executeCommand('vscode.openFolder', uri).then(() => {}, (error) => {
            vscode.window.showErrorMessage(error);
          });
        }
      });
    } catch(e) {
      console.error(e);
    }

  },
};

module.exports = InitHandler;