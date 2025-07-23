const Database = require("better-sqlite3");
const db = new Database("AlphaPool");

function initialize_db() {
  //edit this exec according to the form of the db later
  db.pragma("foreign_keys = ON");
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
            numberOfPlayers INTEGER,
            date TEXT NOT NULL,
            mode CHAR(1) NOT NULL, 
            type TEXT NOT NULL 
        );

        
        CREATE TABLE IF NOT EXISTS Players (
            playerId INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            UNIQUE(name)

        );

        CREATE TABLE IF NOT EXISTS TournamentPlayers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tournamentId INTEGER NOT NULL,
            playerId INTEGER NOT NULL,
            FOREIGN KEY (tournamentId) REFERENCES Tournaments(tournamentId) ON DELETE CASCADE,
            FOREIGN KEY (playerId) REFERENCES Players(playerId) ON DELETE CASCADE,
            UNIQUE(tournamentId, playerId)
        );
        
        CREATE TABLE IF NOT EXISTS LeaderboardPlayers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            leaderboardId INTEGER NOT NULL,
            playerId INTEGER NOT NULL,
            score INTEGER NOT NULL,
            FOREIGN KEY (leaderboardId) REFERENCES Tournaments(tournamentId) ON DELETE CASCADE,
            FOREIGN KEY (playerId) REFERENCES Players(playerId) ON DELETE CASCADE,
            UNIQUE(leaderboardId, playerId)
        );
        
        CREATE TABLE IF NOT EXISTS Matches (
            matchId INTEGER PRIMARY KEY AUTOINCREMENT,
            tournamentId INTEGER NOT NULL,
            round INTEGER DEFAULT 1,
            player1Id INTEGER,
            player2Id INTEGER,
            player1Score INTEGER DEFAULT -1,
            player2Score INTEGER DEFAULT -1,
            winnerId INTEGER,
            ancestorMatch1Id INTEGER,
            ancestorMatch2Id INTEGER,
            FOREIGN KEY (tournamentId) REFERENCES Tournaments(tournamentId) ON DELETE CASCADE,
            FOREIGN KEY (player1Id) REFERENCES Players(playerId) ON DELETE CASCADE,
            FOREIGN KEY (player2Id) REFERENCES Players(playerId) ON DELETE CASCADE,
            FOREIGN KEY (winnerId) REFERENCES Players(playerId) ON DELETE CASCADE,
            FOREIGN KEY (ancestorMatch1Id) REFERENCES Matches(matchId) ON DELETE CASCADE,
            FOREIGN KEY (ancestorMatch2Id) REFERENCES Matches(matchId) ON DELETE CASCADE
        );
        
        -- Create a trigger that fires AFTER a match is updated (after scores are set)
        CREATE TRIGGER IF NOT EXISTS update_winner_and_propagate
        AFTER UPDATE ON Matches
        FOR EACH ROW
        WHEN NEW.player1Score != -1 AND NEW.player2Score  != -1
        BEGIN
          
          -- 1. Set the winnerId based on which player has a higher score
          UPDATE Matches
          SET winnerId = 
            CASE 
              WHEN NEW.player1Score > NEW.player2Score THEN NEW.player1Id
              WHEN NEW.player2Score > NEW.player1Score THEN NEW.player2Id
              ELSE NULL -- In case of a tie
            END
          WHERE matchId = NEW.matchId;
          
          -- 2. Propagate winnerId to the next match if this match is ancestorMatch1
          UPDATE Matches
          SET player1Id = 
            CASE 
              WHEN NEW.player1Score > NEW.player2Score THEN NEW.player1Id
              WHEN NEW.player2Score > NEW.player1Score THEN NEW.player2Id
              ELSE NULL
            END
          WHERE ancestorMatch1Id = NEW.matchId;
          
          -- 3. Propagate winnerId to the next match if this match is ancestorMatch2
          UPDATE Matches
          SET player2Id = 
            CASE 
              WHEN NEW.player1Score > NEW.player2Score THEN NEW.player1Id
              WHEN NEW.player2Score > NEW.player1Score THEN NEW.player2Id
              ELSE NULL
            END
          WHERE ancestorMatch2Id = NEW.matchId;
          
        END;

        
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

function getUniquePlayerName(baseName) {
  const getUniqueNameStmt = db.prepare(`
  SELECT
    CASE
      WHEN NOT EXISTS (SELECT 1 FROM Players WHERE name = ?) THEN ?
      ELSE (
        SELECT ? || ' ' || COALESCE(
          MAX(CAST(SUBSTR(name, LENGTH(?) + 2) AS INTEGER)) + 1,
          1
        )
        FROM Players
        WHERE name LIKE ? || ' %' AND name GLOB ? || ' [0-9]*'
      )
    END AS uniqueName
`);
  const { uniqueName } = getUniqueNameStmt.get(
    baseName, // EXISTS
    baseName, // THEN baseName
    baseName, // baseName || " " || max+1
    baseName, // LENGTH(baseName)
    baseName, // LIKE 'baseName %'
    baseName // GLOB 'baseName [0-9]*'
  );
  return uniqueName;
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
  let tournamentId;
  const addPlayersToTournament = db.transaction(() => {
    const r = insertTournament.run(name, numberOfPlayers, date, mode, type);
    tournamentId = r.lastInsertRowid;
    for (const playerName of playersNames) {
      let playerId;
      const result = insertPlayer.run(getUniquePlayerName(playerName));
      playerId = result.lastInsertRowid;
      linkToTournament.run(tournamentId, playerId);
    }
  });
  addPlayersToTournament();
  return tournamentId;
}

function fetch_tournaments() {
  const rows = db.prepare("SELECT * FROM Tournaments").all();
  return rows;
}
function fetch_tournament(id) {
  const getTournament = db.prepare(
    `SELECT * FROM Tournaments WHERE tournamentId = ?`
  );
  const getPlayers = db.prepare(
    `SELECT Players.playerId, Players.name FROM Players JOIN TournamentPlayers ON Players.playerId = TournamentPlayers.playerId WHERE TournamentPlayers.tournamentId = ?`
  );
  const getMatches = db.prepare(`SELECT 
      m.matchId,
      m.tournamentId,
      m.round,
      m.player1Score,
      m.player2Score,
      m.player1Id,
      p1.name AS player1Name,
      m.player2Id,
      p2.name AS player2Name,
      m.winnerId,
      pw.name AS winnerName,
      m.ancestorMatch1Id,
      m.ancestorMatch2Id
    FROM Matches m
    LEFT JOIN Players p1 ON m.player1Id = p1.playerId
    LEFT JOIN Players p2 ON m.player2Id = p2.playerId
    LEFT JOIN Players pw ON m.winnerId = pw.playerId
    WHERE m.tournamentId = ?`);
  const fetch = db.transaction((id) => {
    const tournament = getTournament.get(id);
    const players = getPlayers.all(id);
    const matches = getMatches.all(id);
    return { tournament, players, matches };
  });
  return fetch(id);
}

function delete_tournament(id, mode) {
  const getLinkedPLayersT = db.prepare(
    `SELECT playerId FROM TournamentPlayers WHERE tournamentId = ?`
  );
  const getLinkedPLayersL = db.prepare(
    `SELECT playerId FROM LeaderboardPlayers WHERE leaderboardId = ?`
  );
  const deleteMatches = db.prepare(
    `DELETE FROM Matches WHERE tournamentId = ?`
  );
  const deletePlayers = db.prepare(`DELETE FROM Players WHERE playerId = ?`);
  const unlinkPlayersT = db.prepare(
    `DELETE FROM TournamentPlayers WHERE tournamentId = ?`
  );
  const unlinkPlayersL = db.prepare(
    `DELETE FROM LeaderboardPlayers WHERE leaderboardId = ?`
  );
  const deleteTournament = db.prepare(
    `DELETE FROM Tournaments WHERE tournamentId = ?`
  );
  console.log(id, mode);

  const del = db.transaction((id, mode) => {
    if (mode === "E") {
      const players = getLinkedPLayersT.all(id);
      deleteMatches.run(id);
      unlinkPlayersT.run(id);
      deleteTournament.run(id);
      for (const player of players) {
        deletePlayers.run(player["playerId"]);
      }
    }
    if (mode === "C") {
      const players = getLinkedPLayersL.all(id);
      unlinkPlayersL.run(id);
      deleteTournament.run(id);
      for (const player of players) {
        deletePlayers.run(player["playerId"]);
      }
    }
  });
  del(id, mode);
}

function fetch_leaderboard(id) {
  const getTournament = db.prepare(
    `SELECT * FROM Tournaments WHERE tournamentId = ?`
  );
  const getPlayers = db.prepare(
    `SELECT Players.name, Players.playerId, LeaderboardPlayers.score FROM Players JOIN LeaderboardPlayers ON Players.playerId = LeaderboardPlayers.playerId WHERE LeaderboardPlayers.leaderboardId = ? ORDER BY LeaderboardPlayers.score ASC`
  );
  const fetch = db.transaction((id) => {
    const tournament = getTournament.get(id);
    const players = getPlayers.all(id);
    return { tournament, players };
  });
  return fetch(id);
}

///to check
function add_to_leaderboard(leaderboardId, playerName, score) {
  const findPlayer = db.prepare(`
    SELECT playerId FROM Players WHERE name = ?
  `);

  const insertPlayer = db.prepare(`
    INSERT INTO Players (name) VALUES (?)
  `);

  const linkPlayer = db.prepare(`
    INSERT INTO LeaderboardPlayers (leaderboardId, playerId, score) VALUES (?,?,?)
  `);

  const checkLink = db.prepare(`
    SELECT 1 FROM LeaderboardPlayers
    WHERE leaderboardId = ? AND playerId = ?
  `);

  const updateScore = db.prepare(`
    UPDATE LeaderboardPlayers
    SET score = ?
    WHERE leaderboardId = ? AND playerId = ?
  `);

  const add = db.transaction(() => {
    let player = findPlayer.get(playerName);

    //if player exists and it s linked -> update
    // if it doesnt exist -> add him -> link him
    //if it exists and not linked -> no need for it

    // If player does not exist, insert them
    let playerId;
    if (!player) {
      //player does not exist
      const result = insertPlayer.run(playerName);
      playerId = result.lastInsertRowid;
      linkPlayer.run(leaderboardId, playerId, score);
    } else {
      //player exists

      playerId = player.playerId;
      const isLinked = checkLink.get(leaderboardId, playerId);
      if (!isLinked) {
        throw new Error(
          `Player '${playerName}' is not linked to leaderboard ${leaderboardId}.`
        );
      }

      updateScore.run(score, leaderboardId, playerId);
    }

    // Update score
  });

  try {
    add();
  } catch (err) {
    console.error(err.message);
  }
}

function delete_from_leaderboard(leaderboardId, playerName) {
  const getPlayerId = db.prepare(`
    SELECT playerId FROM Players WHERE name = ?
  `);

  const checkPlayer = db.prepare(`
    SELECT 1 FROM LeaderboardPlayers
    WHERE leaderboardId = ? AND playerId = ?
  `);

  const deleteFromLeaderboard = db.prepare(`
    DELETE FROM LeaderboardPlayers
    WHERE leaderboardId = ? AND playerId = ?
  `);

  const deletePlayer = db.prepare(`
    DELETE FROM Players WHERE playerId = ?
  `);

  const remove = db.transaction(() => {
    const player = getPlayerId.get(playerName);
    if (!player) {
      throw new Error(`Player '${playerName}' not found.`);
    }
    const playerId = player.playerId;
    const exists = checkPlayer.get(leaderboardId, playerId);
    if (!exists) {
      throw new Error(
        `Player ${playerId} is not part of leaderboard ${leaderboardId}`
      );
    }

    deleteFromLeaderboard.run(leaderboardId, playerId);
    deletePlayer.run(playerId);
  });

  try {
    remove();
  } catch (err) {
    console.error(err.message);
  }
}

function delete_all_from_leaderboard(leaderboardId) {
  const getPlayerIds = db.prepare(`
    SELECT playerId FROM LeaderboardPlayers WHERE leaderboardId = ?
  `);

  const deleteFromLeaderboard = db.prepare(`
    DELETE FROM LeaderboardPlayers WHERE leaderboardId = ?
  `);

  const deletePlayer = db.prepare(`
    DELETE FROM Players WHERE playerId = ?
  `);

  const del = db.transaction(() => {
    const players = getPlayerIds.all(leaderboardId);

    deleteFromLeaderboard.run(leaderboardId);

    for (const { playerId } of players) {
      deletePlayer.run(playerId);
    }
  });

  del();
}

function add_match(
  tournamentId,
  round,
  player1Name,
  player2Name,
  winnerId,
  ancestorMatch1Id,
  ancestorMatch2Id
) {
  const insertMatch = db.prepare(
    `INSERT INTO Matches(tournamentId, round, player1Id, player2Id, winnerId, ancestorMatch1Id, ancestorMatch2Id) VALUES(?,?,?,?,?,?,?)`
  );
  // const getPlayerId = db.prepare(`SELECT playerId FROM Players WHERE name = ?`);
  // const player1 = getPlayerId.get(player1Name);
  // const player2 = getPlayerId.get(player2Name);
  // if (!player1 || !player2) {
  //   throw new Error("One or both players not found in the database.");
  // }

  // const player1Id = player1.playerId
  // const player2Id = player2.playerId
  // console.log(player1Id)
  // console.log(player2Id)

  insertMatch.run(
    tournamentId,
    round,
    player1Name,
    player2Name,
    winnerId || null,
    ancestorMatch1Id || null,
    ancestorMatch2Id || null
  );
}

function fetch_players(tournamentId) {
  const playersList = db.prepare(
    "SELECT Players.playerId, Players.name from Players JOIN TournamentPlayers ON Players.playerId = TournamentPlayers.playerId WHERE TournamentPlayers.tournamentId = ?"
  );
  return playersList.all(tournamentId);
}

function update_match_p1(matchId, player1Id) {
  const updateMatch = db.prepare(
    "UPDATE Matches SET player1Id = ? WHERE matchId = ?"
  );
  updateMatch.run(player1Id, matchId);
}

function update_match_p2(matchId, player2Id) {
  const updateMatch = db.prepare(
    "UPDATE Matches SET player2Id = ? WHERE matchId = ?"
  );
  updateMatch.run(player2Id, matchId);
}

function checkName(name) {
  const checkName = db.prepare(`
    SELECT 1 FROM Players WHERE name = ?
    `);

  const player = checkName.get(name);
  if (player) {
    return `un Joueur avec le nom ${name} Exist déja`;
  } else {
    return "available";
  }
}

function setMatchWinner(matchId, playerId) {
  const updateMatch = db.prepare(
    "UPDATE Matches SET winnerId = ? WHERE matchId = ?"
  );
  updateMatch.run(playerId, matchId);
}

function updateScore(matchId, playerNumber, newScore){
  const updateScore1 = db.prepare(`UPDATE Matches SET player1Score = ? WHERE matchId = ?`)
  const updateScore2 = db.prepare(`UPDATE Matches SET player2Score = ? WHERE matchId = ?`)
  


  if(playerNumber === 1)
    updateScore1.run(newScore, matchId)
  if(playerNumber === 2)
    updateScore2.run(newScore, matchId)

  // console.log(db.exec(`SELECT * FROM Matches WHERE ancestorMatch1Id = ? OR ancestorMatch2Id = ?;`).all(matchId, matchId))

}

function updateAncestor(matchId, ancestorPosition, ancestorId){
  const updateAnc1 = db.prepare(`UPDATE Matches SET ancestorMatch1Id = ? WHERE matchId = ?`)
  const updateAnc2 = db.prepare(`UPDATE Matches SET ancestorMatch2Id = ? WHERE matchId = ?`)

  if(ancestorPosition === 1)
    updateAnc1.run(ancestorId, matchId)

  if(ancestorPosition === 2)
    updateAnc2.run(ancestorId, matchId)


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
  fetch_tournament,
  fetch_leaderboard,
  delete_tournament,
  add_to_leaderboard,
  delete_from_leaderboard,
  delete_all_from_leaderboard,
  add_match,
  update_match_p1,
  update_match_p2,
  checkName,
  fetch_players,
  setMatchWinner,
  updateScore,
  updateAncestor
};
