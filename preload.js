const { contextBridge, ipcRenderer } = require("electron");

class Timer {
  constructor(id, onTick = null, tickInterval = 10) {
    this.id = id;
    this.startTime = null;
    this.running = false;
    this.timerId = null;
    this.onTick = onTick;
    this.tickInterval = tickInterval;

    // Try to load start time from localStorage
    const saved = localStorage.getItem(`timer_${id}_startTime`);
    if (saved) {
      this.startTime = parseInt(saved);
      this.running = true;
      this._startInternalLoop();
    }
  }

  _startInternalLoop() {
    this.timerId = setInterval(() => {
      if (!this.running || !this.startTime) return;
      if (typeof this.onTick === "function") {
        this.onTick(this.getFormattedTime(), this.getMinutes());
      }
    }, this.tickInterval);
  }

  start() {
    if (this.running) return;
    const elapsed = localStorage.getItem(`timer_${this.id}_pausedElapsed`)
    if (elapsed){
      this.startTime = Date.now() - parseInt(elapsed)
      localStorage.removeItem(`timer_${this.id}_pausedElapsed`)
    }else{
      this.startTime = Date.now();
      
    }
    localStorage.setItem(`timer_${this.id}_startTime`, this.startTime.toString());
    this.running = true;
    this._startInternalLoop();
  }

  pause() {
    if (!this.running) return;
    clearInterval(this.timerId);
    this.running = false;
    // Save elapsed time as offset
    const elapsed = Date.now() - this.startTime;
    localStorage.setItem(`timer_${this.id}_pausedElapsed`, elapsed.toString());
    localStorage.removeItem(`timer_${this.id}_startTime`);
  }

  reset() {
    clearInterval(this.timerId);
    this.running = false;
    this.startTime = null;
    localStorage.removeItem(`timer_${this.id}_startTime`);
    localStorage.removeItem(`timer_${this.id}_pausedElapsed`);
    if (typeof this.onTick === "function") {
      this.onTick("00:00:00", 0);
    }
  }

  getElapsed() {
    if (this.startTime) {
      return Date.now() - this.startTime;
    }
    const pausedElapsed = localStorage.getItem(`timer_${this.id}_pausedElapsed`);
    return pausedElapsed ? parseInt(pausedElapsed) : 0;
  }

  getMinutes() {
    const totalSeconds = Math.floor(this.getElapsed() / 1000);
    return Math.floor(totalSeconds / 60);
  }

  getPrice() {
    return Math.floor((this.getMinutes() * 500) / 60);
  }

  getFormattedTime() {
    const totalSeconds = Math.floor(this.getElapsed() / 1000);
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }
}

let tickHandler = null;
const timers = [];

contextBridge.exposeInMainWorld("myAPI", {
  debug: () => console.log("debug:"),

  setTickHandler: (callback) => {
    tickHandler = callback;
  },

  createTimers: () => {
    for (let i = 0; i < 4; i++) {
      const timer = new Timer(i, (formattedTime, minutes) => {
        tickHandler?.(i, formattedTime, minutes);
      });
      timers.push(timer);
    }
  },

  startTimer: (id) => timers[id].start(),
  pauseTimer: (id) => timers[id].pause(),
  stopTimer: (id) => timers[id].reset(),
  getTime: (id) => timers[id].getFormattedTime(),
  getPrice: (id) => timers[id].getPrice(),

  alert: (table, time, price) => ipcRenderer.send("alert", table, time, price),
  fetchSessions: () => ipcRenderer.send("fetchSessions"),
  fetchSessions_date: (day, month, year) =>
    ipcRenderer.send("fetchSessions-date", day, month, year),
  fetchSessions_month: (month, year) =>
    ipcRenderer.send("fetchSessions-month", month, year),
  updateSessionsList: (callback) => {
    ipcRenderer.on("updateSessionsList", (_, data) => callback(data));
  },
  updateHistorySessionsList: (callback) => {
    ipcRenderer.on("updateHistorySessionsList", (_, data, totalAmount) =>
      callback(data, totalAmount)
    );
  },
  navigateTo: (page, id, mode) => {
    ipcRenderer.send("navigate-to", page, id, mode);
  },
  addTournament: (name, numberOfPlayers, date, mode, type, playersNames) =>
    ipcRenderer.send(
      "add-tournament",
      name,
      numberOfPlayers,
      date,
      mode,
      type,
      playersNames
    ),
  fetchTournaments: () => ipcRenderer.send("fetch-tournaments"),
  updateTournamentsList: (callback) => {
    ipcRenderer.on("tournaments-list", (_, data) => callback(data));
  },
  fetchTournament: (id) => ipcRenderer.send("fetch-tournament", id),
  getTournament: (callback) => {
    ipcRenderer.on("get-tournament", (_, data) => callback(data));
  },
  fetchLeaderboard: (id) => ipcRenderer.send("fetch-leaderboard", id),
  getLeaderboard: (callback) => {
    ipcRenderer.on("get-leaderboard", (_, data) => callback(data));
  },
  deleteTournament: (id, mode) =>
    ipcRenderer.send("delete-tournament", id, mode),
  onDeletedTournament: (callback) =>
    ipcRenderer.on("tournament-deleted", (_) => callback()),
  addToLeaderboard: (tournamentId, playerName, score) =>
    ipcRenderer.send("add-to-leaderboard", tournamentId, playerName, score),
  OnAddToLeaderboard: (callback) =>
    ipcRenderer.on("added-to-leaderboard", (_) => callback()),
  deleteFromLeaderboard: (tournamentId, playerName) =>
    ipcRenderer.send("delete-from-leaderboard", tournamentId, playerName),
  OnDeleteFromLeaderboard: (callback) =>
    ipcRenderer.on("deleted-from-leaderboard", (_) => callback()),
  deleteAllFromLeaderboard: (tournamentId) =>
    ipcRenderer.send("delete-all-from-leaderboard", tournamentId),
  OnDeleteAllFromLeaderboard: (callback) =>
    ipcRenderer.on("deleted-all-from-leaderboard", (_) => callback()),
  addMatch: (
    tournamentId,
    round,
    player1Name,
    player2Name,
    winnerId,
    ancestorMatch1Id,
    ancestorMatch2Id
  ) =>
    ipcRenderer.send(
      "add-match",
      tournamentId,
      round,
      player1Name,
      player2Name,
      winnerId,
      ancestorMatch1Id,
      ancestorMatch2Id
    ),
  addTournamentReply: (callback) =>
    ipcRenderer.on("add-tournament-reply", (_, tournamentId) =>
      callback(tournamentId)
    ),
  fetchPlayers: (tournamentId) =>
    ipcRenderer.send("fetch-players", tournamentId),
  getPlayers: (callback) =>
    ipcRenderer.on("get-players", (_, tournamentId, data) =>
      callback(tournamentId, data)
    ),
  updateMatchWinner: (matchId, winnerId) =>
    ipcRenderer.send("update-match-winner", matchId, winnerId),
  updateNextMatch: (nextMatchId, playerPosition, playerId) =>
    ipcRenderer.send("update-next-match", nextMatchId, playerPosition, playerId),
  updateScore: (matchId, playerNumber, newScore) => {
    ipcRenderer.send("update-score", matchId, playerNumber, newScore);
  },
  updateAncestor: (matchId, ancestorPosition, ancestorId) => {
    ipcRenderer.send("update-ancestor", matchId, ancestorPosition, ancestorId);
  },
  generatePdf: (data, mode) =>
    ipcRenderer.send("generate-pdf", data, mode),
  savePDFDialog: (mode) => {
    return ipcRenderer.invoke("save-pdf-dialog", mode);
  }
});
