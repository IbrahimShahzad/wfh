const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

// Set Environment
process.env.NODE_ENV = 'development';

let mainWindow;
let addWindow;
let notepadWindow;

// Listen for the app to be ready
app.on('ready',function(){
    // Create new window
    mainWindow = new BrowserWindow({
        // fullscreen: true,
        webPreferences: {
            // enable nodeIntegration [default: disabled]
            nodeIntegration: true
        }
    });
    
    // load html
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname,'wfh.html'),
        protocol:  'file:',
        slashes: true
    }));

    app.on('closed',function(){
        app.quit();
    });

    // Build menu from the template
    const  mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    
    // Insert Main Menu
    Menu.setApplicationMenu(mainMenu);

});

// Handle create Add Window
function createAddWindow(){
    // Create new add window
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'List Item',
        webPreferences: {
            // enable nodeIntegration [default: disabled]
            nodeIntegration: true
        }
    });
    
    // load html
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname,'addWindow.html'),
        protocol:  'file:',
        slashes: true
    }));

    // on window close
    addWindow.on('close',function(){
        addWindow = null;
    });
}

// Handle create notepad Window
function createNotepadWindow(){
    // Create new notepad window
    notepadWindow = new BrowserWindow({
        // width: 300,
        // height: 200,
        title: 'ToDo List',
        webPreferences: {
            // enable nodeIntegration [default: disabled]
            nodeIntegration: true
        }
    });
    
    // load html
    notepadWindow.loadURL(url.format({
        pathname: path.join(__dirname,'notepad.html'),
        protocol:  'file:',
        slashes: true
    }));

    // on window close
    notepadWindow.on('close',function(){
        notepadWindow = null;
    });
}

// Catch item: add
ipcMain.on('item:add',function(e,item){
    console.log(item);
    mainWindow.webContents.send('item:add',item);
    addWindow.close();
});

// create Menu Template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item',
                click(){
                    createAddWindow();
                }

            },
            {
                label: 'Clear Item',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Notepad',
                accelerator: process.platform == 'darwin' ? 'Command+N' : 'Ctrl+N',
                click(){
                    createNotepadWindow();
                }

            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

// if MAC add empty object to the menu
if(process.platform=='darwin'){
    mainMenuTemplate.unshift({});
}

// Add Developer Tools
if(process.env.NODE_ENV!='production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}