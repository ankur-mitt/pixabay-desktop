// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, net} = require('electron');
const path = require('path');

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        },
        resizable: false,
    });

    // and load the index.html of the app.
    mainWindow.loadFile('index.html').then(() => {
        console.log("SearchHome:OK");
    });

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    let searchResultsWindow;
    ipcMain.on('image:search', (event, query) => {
        // create new window to show results
        searchResultsWindow = new BrowserWindow({
            width: 1000,
            height: 750,
            webPreferences: {
                preload: path.join(__dirname, 'resultspreload.js'),
                contextIsolation: true,
            },
        });
        searchResultsWindow.loadFile('results.html').then(() => {
            console.log("SearchResults:OK");
        });

        // send request
        const PIXABAY_API_KEY = '19924221-e28808b55f2a913395464249c';
        const URL = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo`;
        const request = net.request(URL);
        request.on('response', (response) => {
            response.on('data', (chunk) => {
                const data = JSON.parse(chunk.toString('utf8'));
                const {hits: images} = data;
                // send images data when it is ready
                searchResultsWindow.webContents.on('did-finish-load', () => {
                    searchResultsWindow.webContents.send('image:results', images, query);
                });
            });
            response.on('end', () => {
                console.log("SearchRequest:OK");
            });
        });
        request.end();
    });

    ipcMain.on('image:open', (event, largeImageURL) => {
        const imageWindow = new BrowserWindow({
            useContentSize: true,
            webPreferences: {
                contextIsolation: true,
            },
            parent: searchResultsWindow,
            modal: true,
        });
        imageWindow.setMenu(null);
        imageWindow.loadURL(largeImageURL).then(() => {
            console.log('OpenImage:OK');
        });
    });

});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
