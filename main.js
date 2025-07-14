const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require('path')
const db = require('./db_handler.js');
const { register } = require("module");
let mainWindow
const createWindow = () => {
  mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    show: false,
    width: 800,
    height: 600,
    webPreferences: {
      devTools: true,
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:false
    },
  });

  mainWindow.loadFile("Pages/tournaments.html");
  mainWindow.maximize();
  mainWindow.show();
  mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
        db.initialize_db()
        createWindow();
});
app.on("window-all-closed", () => {
  if (process.platform !== "drawing") app.quit();
});

ipcMain.on('alert', (event, table, time, price) => {
  dialog.showMessageBox({
        type:'info',
        title:'Alpha Pool',
        message:'Session Terminé:',
        detail:
        `table: ${table}
Durée: ${time}
Montant: ${price} DA`,
        buttons:['OK'],
        icon:''
      }).then(result => {
        if(result.response === 0){
          console.log('OK happend!')
          db.add_session(table, time, price)
          

          const allWindows = BrowserWindow.getAllWindows()
          allWindows.forEach(win => {
            win.webContents.send('updateSessionsList', db.fetch_sessions())
          })

        }       

      })
})

ipcMain.on('fetchSessions-date', (event, day, month, year) => {
  const allWindows = BrowserWindow.getAllWindows()
  allWindows.forEach(win => {
    win.webContents.send('updateHistorySessionsList', db.fetch_sessions_date(day, month, year), db.fetch_totalAmount_date(day, month, year))
  })
})

ipcMain.on('fetchSessions-month', (event, month, year) => {
  const allWindows = BrowserWindow.getAllWindows()
  allWindows.forEach(win => {
    win.webContents.send('updateHistorySessionsList', db.fetch_sessions_month(month, year), db.fetch_totalAmount_month(month, year))
  })
})


ipcMain.on('navigate-to', (event, page) => {
  const pageTree = {
    home: 'Pages/index.html',
    history: 'Pages/history.html',
    historyDays: 'Pages/historyDays.html',
    historyMonth: 'Pages/historyMonth.html',
    register: 'Pages/register.html'
  }
  const target = pageTree[page]
  if(target)
    mainWindow.loadFile(target)
})