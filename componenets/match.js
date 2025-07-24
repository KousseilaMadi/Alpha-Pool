class Match extends HTMLElement {
  constructor() {
    super();
    const el = this.attachShadow({ mode: "open" });
    let player_1 = this.getAttribute("player_1");
    let player_2 = this.getAttribute("player_2");
    let nextMatch = this.getAttribute("nextMatch");
    let matchId = this.getAttribute("matchId");
    let player_1Id = this.getAttribute("player_1Id");
    let player_2Id = this.getAttribute("player_2Id");
    let player_1Score = this.getAttribute("player1Score");
    let player_2Score = this.getAttribute("player2Score");
    let winnerId = this.getAttribute("winnerId");
    let tournamentId = this.getAttribute("tournamentId");

    el.innerHTML = `
        <style>
        .match {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          background-color: var(--text-color);
          border-radius: 1vh;
          width: 23vh;
          height: 5vh;
        }

        .player{
          height:100%;
          width: 100%;
          padding-left: 1vh;
          padding-right: 1vh;
          text-align: center; /*aligns the text left-right*/
          align-content: center; /*aligns the text top-bottom*/
          background-color: #cfcfcf67;
          border-width: 0;
          font-size: 1.6vh;
        }
        .leftPlayer{
          border-radius: 1vh 0vh 0vh 1vh;
        }
        .rightPlayer{
          border-radius: 0vh 1vh 1vh 0vh;
        }
        .player:hover{
          background-color: var(--button-hover);
        }
        .vs{
          flex: 0 0 auto;
          text-align: center;
          padding-left: 1vh;
          padding-right: 1vh;
          font-weight: 600;
          font-size: 1.8vh;
        }
        .winner{
        background-color:#88ff88;
        }
        .loser{
          text-color:#ababab;
        background-color:#cd7878df;}
        </style>
        <div class="match">
            <button ${
              Number(player_1Id) === Number(winnerId)
                ? `class="player leftPlayer winner"`
                : Number(player_2Id) === Number(winnerId)
                ? `class="player leftPlayer loser"`
                : `class="player leftPlayer"`
            } onclick="updateMatch(${tournamentId}, ${matchId}, ${player_1Id}, ${nextMatch}, 1, ${player_1Score})">${
      (player_1 !== 'null') ? `${player_1} (${player_1Score > -1 ? player_1Score : ""})` : ""
    }

    </button>
            <div class="vs">VS</div>
            <button ${
              Number(player_2Id) === Number(winnerId)
                ? `class="player rightPlayer winner"`
                : Number(player_1Id) === Number(winnerId)
                ? `class="player rightPlayer loser"`
                : `class="player rightPlayer"`
            } onclick="updateMatch(${tournamentId}, ${matchId}, ${player_2Id}, ${nextMatch}, 2, ${player_2Score})">${
      (player_2 !== 'null') ? `${player_2} (${player_2Score > -1 ? player_2Score : ""})` : ""
    }</button>
        </div>
        `;
  }
}
customElements.define("match-el", Match);
