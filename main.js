const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");
const db = require("./db_handler.js");
const { register } = require("module");
const { match } = require("assert");
const generatePDF = require("./generatePDF");

let mainWindow;
const createWindow = () => {
  mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    show: false,
    width: 800,
    height: 600,
    webPreferences: {
      devTools: false,
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile("Pages/index.html");
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

ipcMain.on("fetchSessions", (event) => {
  const allWindows = BrowserWindow.getAllWindows();
  allWindows.forEach((win) => {
    win.webContents.send("updateSessionsList", db.fetch_sessions());
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

ipcMain.on(
  "add-tournament",
  (event, name, numberOfPlayers, date, mode, type, playersNames) => {
    const tournamentId = db.add_tournament(
      name,
      numberOfPlayers,
      date,
      mode,
      type,
      playersNames
    );
    const allWindows = BrowserWindow.getAllWindows();
    allWindows.forEach((win) => {
      win.webContents.send("add-tournament-reply", tournamentId);
    });
  }
);

ipcMain.on("fetch-players", (event, tournamentId) => {
  const allWindows = BrowserWindow.getAllWindows();
  allWindows.forEach((win) => {
    win.webContents.send(
      "get-players",
      tournamentId,
      db.fetch_players(tournamentId)
    );
  });
});

ipcMain.on(
  "add-match",
  (
    event,
    tournamentId,
    round,
    player1Name,
    player2Name,
    winnerId,
    ancestorMatch1Id,
    ancestorMatch2Id
  ) => {
    db.add_match(
      tournamentId,
      round,
      player1Name,
      player2Name,
      winnerId,
      ancestorMatch1Id,
      ancestorMatch2Id
    );
  }
);

ipcMain.on("fetch-tournaments", (event) => {
  const allWindows = BrowserWindow.getAllWindows();
  allWindows.forEach((win) => {
    win.webContents.send("tournaments-list", db.fetch_tournaments());
  });
});

ipcMain.on("fetch-tournament", (event, id) => {
  const allWindows = BrowserWindow.getAllWindows();
  allWindows.forEach((win) => {
    win.webContents.send("get-tournament", db.fetch_tournament(id));
  });
});

ipcMain.on("fetch-leaderboard", (event, id) => {
  const allWindows = BrowserWindow.getAllWindows();
  allWindows.forEach((win) => {
    win.webContents.send("get-leaderboard", db.fetch_leaderboard(id));
  });
});

ipcMain.on("delete-tournament", (event, id, mode) => {
  const allWindows = BrowserWindow.getAllWindows();
  db.delete_tournament(id, mode);
  allWindows.forEach((win) => {
    win.webContents.send("tournament-deleted");
  });
});

ipcMain.on("add-to-leaderboard", (event, tournamentId, playerName, score) => {
  db.add_to_leaderboard(tournamentId, playerName, score);
  const allWindows = BrowserWindow.getAllWindows();
  allWindows.forEach((win) => {
    win.webContents.send("added-to-leaderboard");
  });
});

ipcMain.on("delete-from-leaderboard", (event, tournamentId, playerName) => {
  db.delete_from_leaderboard(tournamentId, playerName);
  const allWindows = BrowserWindow.getAllWindows();
  allWindows.forEach((win) => {
    win.webContents.send("deleted-from-leaderboard");
  });
});

ipcMain.on("delete-all-from-leaderboard", (event, tournamentId) => {
  db.delete_all_from_leaderboard(tournamentId);
  const allWindows = BrowserWindow.getAllWindows();
  allWindows.forEach((win) => {
    win.webContents.send("deleted-all-from-leaderboard");
  });
});

ipcMain.on("update-match-winner", (event, matchId, winnerId) => {
  try {
    db.setMatchWinner(matchId, winnerId);
  } catch (e) {
    throw new Error(e);
  }
});

ipcMain.on(
  "update-next-match",
  (event, nextMatchId, playerPosition, playerId) => {
    if (playerPosition === 1) {
      try {
        db.update_match_p1(nextMatchId, playerId);
        console.log("gg");
      } catch (e) {
        throw new Error(e);
      }
    }
    if (playerPosition === 2) {
      try {
        db.update_match_p2(nextMatchId, playerId);
      } catch (e) {
        throw new Error(e);
      }
    }
  }
);

ipcMain.on("update-score", (event, matchId, playerNumber, newScore) => {
  db.updateScore(matchId, playerNumber, newScore);
});

ipcMain.on(
  "update-ancestor",
  (event, matchId, ancestorPosition, ancestorId) => {
    db.updateAncestor(matchId, ancestorPosition, ancestorId);
  }
);

ipcMain.on("generate-pdf", (event, data, filePath) => {
  generatePDF(data, filePath);
});

ipcMain.handle("save-pdf-dialog", async () => {
  const { filePath, canceled } = await dialog.showSaveDialog({
    title: "Enregistrer Pdf",
    defaultPath: "tournoi.pdf",
    filters: [{ name: "fichiers Pdf", extensions: ["pdf"] }],
  });

  return canceled ? null : filePath;
});

ipcMain.on("navigate-to", (event, page, id, mode) => {
  const pageTree = {
    home: "Pages/index.html",
    history: "Pages/history.html",
    historyDays: "Pages/historyDays.html",
    historyMonth: "Pages/historyMonth.html",
    register: "Pages/register.html",
    tournaments: "Pages/tournaments.html",
    manageTournament: "Pages/manage_tournament.html",
  };
  const target = pageTree[page];
  if (target)
    mainWindow.loadFile(target, {
      query: {
        id: id,
        mode: mode,
      },
    });
});
