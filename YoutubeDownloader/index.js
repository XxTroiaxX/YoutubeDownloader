const electron = require("electron");
const url = require("url");
const path = require("path");
const ytdl = require("ytdl-core");
const fs = require("fs");

const {app, BrowserWindow, Menu, ipcMain} = electron;

app.on("ready", () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
        },
        width: 300,
        height: 180,
        resizable: false,
    });
    mainWindow.setMenuBarVisibility(false);

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "pages/MainWindow.html"),
        protocol: 'file',
        slashes: true,
    }));

    mainWindow.on('closed', () => {
        app.quit();
    });
});

ipcMain.on("item:link", async (e,item) => {
    if(islikend(item.link)){
        var info = await ytdl.getInfo(item.link);
        const title = getname(info.videoDetails.title);
        ytdl(item.link).pipe(fs.createWriteStream('../'+title+'.' + item.file)); 
        const data = {title:title, file: item.file};
        ErrorWindow("Sucesso");     
    }else{
        ErrorWindow("Link Invalido"); 
    }
});

function islikend(link){
    var video = link.toString().split("=")[1];
    if(video !== undefined){
        return true;
    }else{
        return false;
    }
}

function getname(string){
    var format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    var array = Array.from(string);
    for(var i = 0; i < array.length; i++){
        if(format.test(array[i]) == true){
            array[i] = "";
        }
    }
    var returnstring = array.join("");
    return returnstring;
}

let AddWindow;
function ErrorWindow(string){
    AddWindow = new BrowserWindow({
        width: 300,
        height: 120,
        title: "Add shopping list item",
        webPreferences: {
            nodeIntegration: true
        },
        resizable: false,
    });
    AddWindow.setMenuBarVisibility(false);

    AddWindow.loadURL(url.format({
        pathname: path.join(__dirname, "pages/ErrorPage.html"),
        protocol: 'file',
        slashes: true,
    }));

    AddWindow.webContents.once('dom-ready', () => {
        AddWindow.webContents.send('item:msg', string);
    });

    AddWindow.on("close", () => {
        AddWindow = null;
    });
}

ipcMain.on("item:close", () => {
    AddWindow.close();
});
