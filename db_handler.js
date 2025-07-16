const Database = require("better-sqlite3");
const db = new Database("AlphaPool");

function initialize_db() {
  //edit this exec according to the form of the db later
  db.exec(`
        CREATE TABLE IF NOT EXISTS Sessions (
            sessionId INTEGER PRIMARY KEY AUTOINCREMENT,
            tableNumber INTEGER NOT NULL,
            time TEXT NOT NULL,
            price FLOAT NOT NULL,
            day INTEGER CHECK(day < 32),
            month TEXT CHECK(length(month) <= 10),
            year INTEGER CHECK(year < 3000)
        );


        CREATE TABLE IF NOT EXISTS Tournaments (
            tournamentId INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            numberOfPlayers INTEGER NOT NULL,
            date TEXT NOT NULL,
            mode CHAR(1) NOT NULL, 
            type TEXT NOT NULL 
        );

        
        CREATE TABLE IF NOT EXISTS Players (
            playerId INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL

        );

        CREATE TABLE IF NOT EXISTS TournamentPlayers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tournamentId INTEGER NOT NULL,
            playerId INTEGER NOT NULL,
            FOREIGN KEY (tournamentId) REFERENCES Tournaments(tournamentId),
            FOREIGN KEY (playerId) REFERENCES Players(playerId),
            UNIQUE(tournamentId, playerId)
        );
        
        CREATE TABLE IF NOT EXISTS Matches (
            matchId INTEGER PRIMARY KEY AUTOINCREMENT,
            tournamentId INTEGER NOT NULL,
            round INTEGER DEFAULT 1,
            player1Id INTEGER,
            player2Id INTEGER,
            winnerId INTEGER,
            ancestorMatch1Id INTEGER,
            ancestorMatch2Id INTEGER,
            FOREIGN KEY (tournamentId) REFERENCES Tournaments(tournamentId),
            FOREIGN KEY (player1Id) REFERENCES Players(playerId),
            FOREIGN KEY (player2Id) REFERENCES Players(playerId),
            FOREIGN KEY (winnerId) REFERENCES Players(playerId),
            FOREIGN KEY (ancestorMatch1Id) REFERENCES Matches(matchId),
            FOREIGN KEY (ancestorMatch2Id) REFERENCES Matches(matchId)
        );
        
        
        `);
  console.log("db initialized .");
}

function add_session(table, time, price) {
  const now = new Date();
  const adjustedDate = new Date(now);
  if (now.getHours() >= 0 && now.getHours() <= 3)
    adjustedDate.setDate(adjustedDate.getDate() - 1);
  const day = String(adjustedDate.getDate()).padStart(2, "0");
  const month = String(adjustedDate.getMonth() + 1).padStart(2, "0");
  const year = adjustedDate.getFullYear();
  console.log(`date:${day}/${month}/${year}`);
  const stmt = db.prepare(`
        INSERT INTO Sessions(tableNumber, time, price, day, month, year) VALUES (?,?,?,?,?,?)
        `);
  stmt.run(table, time, price, day, month, year);
}

function fetch_sessions() {
  const rows = db.prepare("SELECT * FROM Sessions").all();
  return rows;
}

function fetch_sessions_date(day, month, year) {
  const rows = db
    .prepare("SELECT * FROM Sessions WHERE day = ? AND month = ? AND year = ?")
    .all(day, month, year);
  return rows;
}

function fetch_sessions_month(month, year) {
  const rows = db
    .prepare("SELECT * FROM Sessions WHERE month = ? AND year = ?")
    .all(month, year);
  return rows;
}

function fetch_totalAmount_date(day, month, year) {
  const row = db
    .prepare(
      "SELECT SUM(price) as Total FROM Sessions WHERE day = ? AND month = ? AND year = ?"
    )
    .get(day, month, year);
  return row.Total || 0;
}

function fetch_totalAmount_month(month, year) {
  const row = db
    .prepare(
      "SELECT SUM(price) as Total FROM Sessions WHERE month = ? AND year = ?"
    )
    .get(month, year);
  return row.Total || 0;
}

function add_tournament(name, numberOfPlayers, date, mode, type, playersNames) {
  const insertTournament = db.prepare(
    `INSERT INTO Tournaments(name, numberOfPlayers, date, mode, type) VALUES (?,?,?,?,?)`
  );
  const insertPlayer = db.prepare(`INSERT INTO Players (name) VALUES (?)`);
  const getPlayerByName = db.prepare(
    `SELECT playerId FROM Players WHERE LOWER(name) = LOWER(?)`
  );
  const linkToTournament = db.prepare(
    `INSERT INTO TournamentPlayers(tournamentId, playerId) VALUES(?, ?)`
  );
  const addPLayersToTournament = db.transaction(() => {
    const r = insertTournament.run(name, numberOfPlayers, date, mode, type);
    const tournamentId = r.lastInsertRowid;
    for (const playerName of playersNames) {
      let playerId;
      const result = insertPlayer.run(playerName);
      playerId = result.lastInsertRowid;
      linkToTournament.run(tournamentId, playerId);
    }
  });
  addPLayersToTournament();
}

function fetch_tournaments() {
  const rows = db.prepare("SELECT * FROM Tournaments").all();
  return rows;
}
//mazal
function fetch_tournament(id) {
    const getTournament = db.prepare(`SELECT * FROM Tournaments WHERE tournamentId = ?`)
    const getPlayers = db.prepare(`SELECT Players.name FROM Players JOIN TournamentPlayers ON Players.playerId = TournamentPlayers.playerId WHERE TournamentPlayers.tournamentId = ?`)
    const getMatches = db.prepare(`SELECT * FROM Matches WHERE tournamentId = ?`)
    const fetch = db.transaction(() => {
        const tournament = getTournament.get(id)
        const players = getPlayers.all(id)
        const matches = getMatches.all(id)
        return {tournament, players, matches}
    })
    return fetch()
}


module.exports = {
  initialize_db,
  add_session,
  fetch_sessions,
  fetch_sessions_date,
  fetch_sessions_month,
  fetch_totalAmount_date,
  fetch_totalAmount_month,
  add_tournament,
  fetch_tournaments,
  fetch_tournament_edit,
  fetch_tournament_manage,
};
