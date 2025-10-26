const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fs = require("fs");
const path = require("path");
const { app } = require('electron');

async function generatePDF(data, outputPath, mode) {

const logoPath = path.join(__dirname, "icons", "logo.png");
const logo = fs.readFileSync(logoPath, { encoding: "base64" });

 const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText('Hello PDF-Lib!', {
    x: 50,
    y: 350,
    size: 24,
    font,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDoc.save();

  fs.writeFileSync(outputPath, pdfBytes);
  console.log('PDF created successfully!');


  let html = ``
  let page_code = ``
  if (mode === "E") {
    const spacers = [0, 1, 3, 7, 15, 30, 40];
      page_code = `
      
      `

      html = `
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Tournament Bracket</title>
        <style>
          body {
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            height: 50%;
            width: 100%;
            justify-content: center;
            align-items: center;
            background-color: #fbfbfb;
          }
          .header {
          display:flex;
          justify-content:space-between;
          padding-left:2vh;
          padding-right:2vh;
          }
          .title {
            font-size: 3vh;
            font-weight:600;
            text-align: center;
          }
          .bracket {
            display: flex;
            gap: 2vh;
            align-items: center;
            justify-content: center;
          }
          .round {
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            background-color: #d8d8d8;
            padding-top: 1vh;
            padding-bottom: 1vh;
            padding-left: 1vh;
          }
          .match {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background-color: #f2f2f2;
            border-radius: 0.2vh;
            width: 21vh;
            height: 6vh;
            justify-content: space-around;
          }
          .player {
            height: 2.8vh;
            width: 100%;
            display: flex;
            justify-content: space-between;
            flex-direction: row;
          }
          .playerName {
            font-size: small;
            width: 85%;
            padding-left: 1vh;
            background-color: #ebeaeb;
            height: 2.8vh;
          }
          .playerScore {
            font-size: small;
            font-weight: 600;
            width: 15%;
            text-align: center;
            background-color: #35789e;
            color: #f4f4f4;
            height: 2.8vh;
          }
          .smallSpacer {
            height: 1vh;
          }
          .bigSpacer {
            height: 7vh;
          }
          .winner {
            background-color: #00ff0040;
          }
          .loser {
            background-color: #ff000040;
          }
        </style>
    </head>
    <body>
        <div class="header">
          <p class="title">${data.tournamentName}</p>
          <img style=" width:16vh; height:auto; border-radius:1vh;" src="data:image/png;base64,${logo}"/>
        </div>
        <div class="bracket">`;
      let roundsCount = 0
      for (let i = 0; i < data.rounds.length; i++) {
        if(data.rounds[i].length > 0)
          roundsCount++
      }

      for (let u = 0; u < data.rounds.length; u++) {
        if (data.rounds[u].length > 0) {
          html += `
          <div class="round">
          <h3>${
            Number(roundsCount - u) === 2
              ? `Demi-Final`
              : Number(roundsCount - u) === 1
              ? `Final`
              : `Tour ${u + 1}`
          }</h3>
            `;
          for (let i = 0; i < data.rounds[u].length; i++) {
            html += `
              <div class="match">
              <div class="player">
              <div class="playerName ${
                data.rounds[u][i].player1Score > data.rounds[u][i].player2Score &&
                data.rounds[u][i].player1Score > -1 &&
                data.rounds[u][i].player2Score > -1
                  ? "winner"
                  : data.rounds[u][i].player1Score <
                      data.rounds[u][i].player2Score &&
                    data.rounds[u][i].player1Score > -1 &&
                    data.rounds[u][i].player2Score > -1
                  ? "loser"
                  : ""
              }">${(data.rounds[u][i].player1Name)?data.rounds[u][i].player1Name:''}</div>
              <div class="playerScore">${
                data.rounds[u][i].player1Score > -1
                  ? data.rounds[u][i].player1Score
                  : ""
              }</div>
              </div>

              <div class="player">
              <div class="playerName  ${
                data.rounds[u][i].player1Score < data.rounds[u][i].player2Score &&
                data.rounds[u][i].player1Score > -1 &&
                data.rounds[u][i].player2Score > -1
                  ? "winner"
                  : data.rounds[u][i].player1Score >
                      data.rounds[u][i].player2Score &&
                    data.rounds[u][i].player1Score > -1 &&
                    data.rounds[u][i].player2Score > -1
                  ? "loser"
                  : ""
              }">${(data.rounds[u][i].player2Name)?data.rounds[u][i].player2Name:''}</div>
              <div class="playerScore">${
                data.rounds[u][i].player2Score > -1
                  ? data.rounds[u][i].player2Score
                  : ""
              }</div>
              </div>
              </div>`//match

              if(data.rounds[u].length > i+1){

                html += `
                <div class="smallSpacer"></div>`;
                for(let o = 0 ;o<Number(spacers[u]);o++){
                html += `
                <div class="bigSpacer"></div>`;
                }
              }
          }
          html += `</div>`;//round
        }
      }

    //bracket
      html += `
      </div>
    </body>
    </html>
      `;
    // Load HTML into Puppeteer
  }
  if (mode === "C") {
    html = `<html>
<head>
  <meta charset="UTF-8">
  <title>Tournament Bracket</title>
    <style>
      body {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        height: 50%;
        width: 100%;
        align-items: center;
        font-size: 2vh;
        background-color: #fbfbfb;
      }
      .header {
      display:flex;
      justify-content:space-between;
      flex-direction: row;
      padding-left:2vh;
      padding-right:2vh;
      margin-bottom:2vh;
      }
      .title {
        font-size: 3vh;
        font-weight:600;
        text-align: center;
      }
      .logo {
        width:16vh; 
        height:auto; 
        border-radius:1vh;
      }
      table {
        color: #000000;
        background-color: #b4b4b4;
        align-self: center;
      }
      thead {
        background-color: #919191;
        color: #000000;
      }
      th {
        padding: 1vh;
      }
      td {
        padding: 1vh;
      }
    </style>
</head>
<body>
    <div class="header"><p class="title">${data.tournament.name}</p> <img class="logo" src="data:image/png;base64,${logo}"/></div>
    <div style="display: flex; justify-content: center; align-items: center;">

      <table style="width: 60vh; border-radius: .3vh;">
        <thead>
          <tr>
            <th>#</th>
            <th>Joueur</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody id="leaderboardTable" style="background-color: var(--highlight-color);" >`
        if(data.players.length === 0){

          html +=`<tr>
          <td colspan="3" style="text-align: center; color: gray;">Vide</td>
          </tr>
          `}else{
            for (let u = 0; u < data.players.length; u++) {
              
              html +=`<tr>
              <td style="text-align: center;" >${u+1}</td>
              <td style="text-align: center;">${data.players[u].name}</td>
              <td style="text-align: center;">${data.players[u].score}</td>
              </tr>
              `
              }
            }
          `</tbody>
      </table>
    </div>
      
    </body>
</html>
`;
  }
  



}

module.exports = generatePDF;
