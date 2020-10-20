const electron = require("electron");
const url = require("url");
const path = require("path");
const ytdl = require("ytdl-core");
const fs = require("fs");

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;

app.on("ready", () => {

    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
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
    try{
        var info = await ytdl.getInfo(item.link);
        const title = info.videoDetails.title.replace(" " , "_");
        ytdl(item.link).pipe(fs.createWriteStream('../'+title+'.' + item.file)); 
        const data = {title: title, file: item.file};
        mainWindow.webContents.send("item:success",data);
    }catch(ex){
        if(ex instanceof Error){
            mainWindow.webContents.send("item:videoidinvalid"); 
        }
        else{
            mainWindow.webContents.send("item:error");
            console.log(ex); 
        }
    }
})

