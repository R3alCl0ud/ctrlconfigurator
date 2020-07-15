const {app, BrowserWindow, globalShortcut} = require('electron')
const locals = {/* ...*/}
const setupPug = require('electron-pug')
const isDev = require("electron-is-dev");

// Standard stuff

app.on('ready', async () => {
    try {
        let pug = await setupPug({pretty: true}, locals)
        pug.on('error', err => console.error('electron-pug error', err))
    } catch (err) {
        // Could not initiate 'electron-pug'
    }

    let mainWindow = new BrowserWindow({ width: 1600, height: 900, webPreferences:{allowRunningInsecureContent: true,nodeIntegration: true}})
    mainWindow.setMenuBarVisibility(false)
    mainWindow.loadURL(`file://${__dirname}/views/index.pug`)
    // the rest...
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit()
})


//prevent refresh
app.whenReady().then(() => {
    if (!isDev) {
        globalShortcut.register("CommandOrControl+R", () => {
            console.log("CommandOrControl+R is pressed: Shortcut Disabled");
        });
    }
});


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
