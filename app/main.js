// Module to control application life.
//var app = require('app');
var Test = require('./server/test').Test;
const Router = require('./server/Router');
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

  //=============================START MAIN ROUTER=========================

  ipcMain.on('stabilazed_volume', Router.stabilazed_volume);
  ipcMain.on('stabilazed_different', Router.stabilazed_different);
  ipcMain.on('load_ship', Router.load_ship);
  ipcMain.on('build_model', Router.build_model);

  //===============================END MAIN ROUTER=========================
  
});