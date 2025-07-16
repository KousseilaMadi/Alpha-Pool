const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");
const db = require("./db_handler.js");
const { register } = require("module");
let mainWindow;
const createWindow = () => {
  mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    show: false,
    width: 800,
    height: 600,
    webPreferences: {
      devTools: true,
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile("Pages/tournaments.html");
  mainWindow.maximize();
  mainWindow.show();
  mainWindow.webContents.openDevTools();
};
app.whenReady().then(() => {
  db.initialize_db();
  createWindow();
});
app.on("window-all-closed", () => {
  if (process.platform !== "drawing") app.quit();
});

ipcMain.on("alert", (event, table, time, price) => {
  dialog
    .showMessageBox({
      type: "info",
      title: "Alpha Pool",
      message: "Session Terminé:",
      detail: `table: ${table}
Durée: ${time}
Montant: ${price} DA`,
      buttons: ["OK"],
      icon: "",
    })
    .then((result) => {
      if (result.response === 0) {
        console.log("OK happend!");
        db.add_session(table, time, price);

        const allWindows = BrowserWindow.getAllWindows();
        allWindows.forEach((win) => {
          win.webContents.send("updateSessionsList", db.fetch_sessions());
        });
      }
    });
});

ipcMain.on("fetchSessions-date", (event, day, month, year) => {
  const allWindows = BrowserWindow.getAllWindows();
  allWindows.forEach((win) => {
    win.webContents.send(
      "updateHistorySessionsList",
      db.fetch_sessions_date(day, month, year),
      db.fetch_totalAmount_date(day, month, year)
    );
  });
});

ipcMain.on("fetchSessions-month", (event, month, year) => {
  const allWindows = BrowserWindow.getAllWindows();
  allWindows.forEach((win) => {
    win.webContents.send(
      "updateHistorySessionsList",
      db.fetch_sessions_month(month, year),
      db.fetch_totalAmount_month(month, year)
    );
  });
});

ipcMain.on("add-tournament", (event, name, numberOfPlayers, date, mode, type, playersNames) => {
  db.add_tournament(name, numberOfPlayers, date, mode, type, playersNames);
});

ipcMain.on("fetch-tournaments", (event) => {
  const allWindows = BrowserWindow.getAllWindows();
  allWindows.forEach((win) => {
    win.webContents.send("tournaments-list", db.fetch_tournaments());
  });
});

ipcMain.on("fetch-tournament-edit", (event, id) => {
  const allWindows = BrowserWindow.getAllWindows();
  allWindows.forEach((win) => {
    win.webContents.send("tournament-edit", db.fetch_tournament_edit(id));
  });
});

ipcMain.on("fetch-tournament-manage", (event, id) => {
  const allWindows = BrowserWindow.getAllWindows();
  allWindows.forEach((win) => {
    win.webContents.send("tournament-manage", db.fetch_tournament_manage(id));
  });
});
// ipcMain.on('', (event) => {

// })

ipcMain.on("navigate-to", (event, page, id) => {
  const pageTree = {
    home: "Pages/index.html",
    history: "Pages/history.html",
    historyDays: "Pages/historyDays.html",
    historyMonth: "Pages/historyMonth.html",
    register: "Pages/register.html",
    editTournament: "Pages/edit_tournament.html",
    manageTournament: "Pages/manage_tournament.html",
  };
  const target = pageTree[page];
  if (target)
    mainWindow.loadFile(target, {
      query: {
        id: id
      },
    });
});
