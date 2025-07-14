const Database = require('better-sqlite3')
const db = new Database('AlphaPool')

function initialize_db(){
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

        CREATE TABLE IF NOT EXISTS Tournaments (
            tournamentId INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            date TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS Players (
            playerId INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL

        );

        `
)
        console.log("db initialized .")
}

function add_session(table, time, price){
    const now = new Date()
    const adjustedDate = new Date(now)
    if(now.getHours() >= 0 && now.getHours() <= 3)
        adjustedDate.setDate(adjustedDate.getDate() - 1)
    const day = String(adjustedDate.getDate()).padStart(2,'0')
    const month = String(adjustedDate.getMonth() + 1).padStart(2,'0')
    const year = adjustedDate.getFullYear()
    console.log(`date:${day}/${month}/${year}`)
    const stmt = db.prepare(`
        INSERT INTO Sessions(tableNumber, time, price, day, month, year) VALUES (?,?,?,?,?,?)
        `)
    stmt.run(table, time, price, day, month, year)
        
}

function fetch_sessions(){
    const rows = db.prepare('SELECT * FROM Sessions').all()
return rows
}

function fetch_sessions_date(day, month, year){
    const rows = db.prepare('SELECT * FROM Sessions WHERE day = ? AND month = ? AND year = ?').all(day, month, year)
return rows
}

function fetch_sessions_month(month, year){
    const rows = db.prepare('SELECT * FROM Sessions WHERE month = ? AND year = ?').all(month, year)
return rows
}

function fetch_totalAmount_date(day, month, year){
    const row = db.prepare('SELECT SUM(price) as Total FROM Sessions WHERE day = ? AND month = ? AND year = ?').get(day, month, year)
return row.Total || 0
}

function fetch_totalAmount_month(month, year){
    const row = db.prepare('SELECT SUM(price) as Total FROM Sessions WHERE month = ? AND year = ?').get(month, year)
return row.Total || 0
}



module.exports ={
    initialize_db, 
    add_session, 
    fetch_sessions, 
    fetch_sessions_date, 
    fetch_sessions_month,
    fetch_totalAmount_date,
    fetch_totalAmount_month
}