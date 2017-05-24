// Module to control application life.
//var app = require('app');
var Test = require('./backend/test').Test;
const { ipcMain, BrowserWindow, app } = require('electron');
var electron = require('electron');
// Module to create native browser window.

console.log('ipcMain', ipcMain);
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform != 'darwin') {
    app.quit();
  }
});


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function () {
  // Create the browser window.

  mainWindow = new BrowserWindow({ width: 1920, height: 1080 });

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // Open the devtools.
  mainWindow.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  //============================= MAIN ROUTER=========================



  //ipcMain.addListener

  ipcMain.on('asynchronous-message', function (event, arg) {
    console.log(arg)  // prints "ping"
    Test()
      .then(function () {
        event.sender.send('asynchronous-reply', 'pong');
      });

  });

  ipcMain.on('synchronous-message', function (event, arg) {
    console.log(arg)  // prints "ping"
    Test()
      .then(function () {
        event.returnValue = 'pong';
      });

  });



});