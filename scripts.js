function onRegisterLoad() {
  window.myAPI.createTimers();
  window.myAPI.setTickHandler((id, time, minutes) => {
    const card = document.querySelector(`counter-card[id='${id}']`);
    const timerDisplay = card.shadowRoot.getElementById(`timer_${id}`);
    const timerPrice = card.shadowRoot.getElementById(`price_${id}`);
    timerDisplay.textContent = time;
    timerPrice.textContent =
      Math.floor((minutes * 500) / 60).toString() + " DA";
  });
  window.myAPI.fetchSessions()
  console.log("timers created!");
}
function onPause(value) {
  console.log("pause: ", value);
  window.myAPI.pauseTimer(value);
}
function onStart(value) {
  console.log("start: ", value);
  window.myAPI.startTimer(value);
}
function onStop(value) {
  window.myAPI.alert(
    value + 1,
    window.myAPI.getTime(value),
    window.myAPI.getPrice(value)
  );
  console.log("stop: ", value);
  window.myAPI.stopTimer(value);
}
window.myAPI.updateSessionsList((data) => {
  const list = document.getElementById("sessionsList");
  list.innerHTML = "";

  data.reverse().forEach((el) => {
    list.innerHTML += `
        <tr>
            <td style="text-align: center; color: #fff;">${el["sessionId"]}</td>
            <td style="text-align: center; color: #fff;">${el["tableNumber"]}</td>
            <td style="text-align: center; color: #fff;">${el["time"]}</td>
            <td style="text-align: center; color: #fff;">${el["price"]} DA</td>
            </tr>`;
    // <td style="text-align: center; color: #fff;">${el['day']}/${el['month']}/${el['year']}</td>
  });
});

window.myAPI.updateHistorySessionsList((data, totalAmount) => {
  const dayList = document.getElementById("historySessionsListday");
  const monthList = document.getElementById("historySessionsListmonth");
  const totalSection = document.getElementById("totalSection");
  totalSection.shadowRoot.querySelector("#totalAmount").textContent =
    totalAmount + " DA";

  if (dayList) {
    dayList.innerHTML = "";
    if (!data.length > 0)
      dayList.innerHTML = `
            <tr>
            <td colspan="4" style="text-align: center; color: gray;">Vide</td>
            </tr>`;

            dayList.setAttribute('style', 'overflow-y:scroll;')
    data.reverse().forEach((el) => {
      dayList.innerHTML += `
            <tr>
            <td style="text-align: center; color: #fff;">${el["sessionId"]}</td>
            <td style="text-align: center; color: #fff;">${el["tableNumber"]}</td>
            <td style="text-align: center; color: #fff;">${el["time"]}</td>
            <td style="text-align: center; color: #fff;">${el["price"]} DA</td>
            </tr>`;
    });
  }

  if (monthList) {
    monthList.innerHTML = "";
    if (!data.length > 0)
      monthList.innerHTML = `
            <tr>
            <td colspan="5" style="text-align: center; color: gray;">Vide</td>
            </tr>`;
    data.reverse().forEach((el) => {
      monthList.innerHTML += `
            <tr>
            <td style="text-align: center; color: #fff;">${el["sessionId"]}</td>
            <td style="text-align: center; color: #fff;">${el["tableNumber"]}</td>
            <td style="text-align: center; color: #fff;">${el["time"]}</td>
            <td style="text-align: center; color: #fff;">${el["price"]} DA</td>
            <td style="text-align: center; color: #fff;">${el["day"]}/${el["month"]}/${el["year"]}</td>
            </tr>`;
    });
  }
});
window.myAPI.getTournament((data) => {
  console.log("Eliminatoire");
  console.log("selected: ", JSON.stringify(data));
  const bracket = document.getElementById("bracket");
  const leaderboard = document.getElementById("leaderboardContainer");
  const tournamentTitle = document.getElementById("tournamentTitle");
  bracket.classList.remove("hidden");
  leaderboard.classList.add("hidden");
  tournamentTitle.textContent =
    data["tournament"]["name"] + " ( " + "Eliminatoire" + " ) ";
  bracket.innerHTML = "";
  let round_1 = [];
  let round_2 = [];
  let round_3 = [];
  let round_4 = [];
  let round_5 = [];
  let round_6 = [];
  let round_7 = [];
  let rounds = [];
  // let spaces_1 = [1, 5, 14, 30, 60, 60, 60];
  // let spaces_2 = [2, 6, 13, 30, 65, 82, 120];
  let spaces_1 = [1, 5, 13, 30, 61, 125, 0];
  let spaces_2 = [2, 6, 14, 29, 62, 0, 0];
  for (let i = 0; i < data.matches.length; i++) {
    if (data.matches[i].round === 1) round_1.push(data.matches[i]);
    if (data.matches[i].round === 2) round_2.push(data.matches[i]);
    if (data.matches[i].round === 3) round_3.push(data.matches[i]);
    if (data.matches[i].round === 4) round_4.push(data.matches[i]);
    if (data.matches[i].round === 5) round_5.push(data.matches[i]);
    if (data.matches[i].round === 6) round_6.push(data.matches[i]);
    if (data.matches[i].round === 7) round_7.push(data.matches[i]);
  }

  rounds.push(round_1);
  rounds.push(round_2);
  rounds.push(round_3);
  rounds.push(round_4);
  rounds.push(round_5);
  rounds.push(round_6);
  rounds.push(round_7);
  console.log("round1: ", round_1);
  console.log("round2: ", round_2);
  console.log("round3: ", round_3);
  console.log("round4: ", round_4);
  console.log("round5: ", round_5);
  console.log("round6: ", round_6);
  console.log("round7: ", round_7);
  bracket.innerHTML = "";
  for (let u = 0; u < 7; u++) {
    let nextRound = u < 6 ? rounds[u + 1] : [];
    if (rounds[u].length > 0)
      buildRound(
        data.tournament.tournamentId,
        bracket,
        rounds[u],
        nextRound,
        u + 1,
        spaces_1[u],
        spaces_2[u]
      );
    if (nextRound.length > 0)
      for (let i = 0; i < rounds[u].length; i += 2) {
        window.myAPI.updateAncestor(
          nextRound[Math.floor(i / 2)].matchId,
          1,
          rounds[u][i].matchId
        );
        window.myAPI.updateAncestor(
          nextRound[Math.floor(i / 2)].matchId,
          2,
          rounds[u][i + 1].matchId
        );
      }
  }
  
  const printButton = document.getElementById("printButton");
  if (printButton) {
    printButton.addEventListener('click', () => {
      console.log('type:', typeof data.tournament.name)
      window.myAPI.savePDFDialog('E').then((filePath) => {
        if (filePath) {
          // use the filePath to generate or save your PDF
          console.log("User selected path:", filePath, 'E');
          window.myAPI.generatePdf({tournamentName: data.tournament.name, rounds: rounds}, filePath, 'E')
        }
      });
    })
  }
});

function buildRound(
  tournamentId,
  bracket,
  round,
  nextRound,
  number,
  spacer_1Count,
  spacer_2Count
) {
  bracket.innerHTML += `<div class="round" id=round_${number} style="border-left: 1vh solid gray;"></div>`;
  const roundEl = document.getElementById(`round_${number}`);
  roundEl.innerHTML += `<p style="font-size:2.4vh; color: #808080; font-weight:700;">${(nextRound.length === 1)?'Demi-Final':(nextRound.length === 0)?'Final':`Tour ${number}`}</p>`;
  for (let i = 0; i < round.length; i += 2) {
    if (round.length === 1) {
      roundEl.innerHTML += `<match-el player1Score="${round[i].player1Score}" player2Score="${round[i].player2Score}" tournamentId="${tournamentId}" winnerId="${round[i].winnerId}" player_1="${round[i].player1Name}" player_2="${round[i].player2Name}" player_1Id="${round[i].player1Id}" player_2Id="${round[i].player2Id}" matchId="${round[i].matchId}"></match-el>`;
    } else {
      roundEl.innerHTML += `<match-el player1Score="${
        round[i].player1Score
      }" player2Score="${
        round[i].player2Score
      }" tournamentId="${tournamentId}" winnerId="${
        round[i].winnerId
      }" player_1="${round[i].player1Name}" player_2="${
        round[i].player2Name
      }" player_1Id="${round[i].player1Id}" player_2Id="${
        round[i].player2Id
      }" matchId="${round[i].matchId}" nextMatch="${
        nextRound[Math.floor(i / 2)].matchId
      }"></match-el>`;

      for (let s = 0; s < spacer_1Count; s++) {
        roundEl.innerHTML += `<div class="spacer"></div>`;
      }
      if (Number(i + 1) === Number(round.length - 1)) {
        //to avoid adding spaces after the last match is added
        roundEl.innerHTML += `<match-el player1Score="${
          round[i + 1].player1Score
        }" player2Score="${
          round[i + 1].player2Score
        }" tournamentId="${tournamentId}" winnerId="${
          round[i + 1].winnerId
        }" player_1="${round[i + 1].player1Name}" player_2="${
          round[i + 1].player2Name
        }" matchId="${round[i + 1].matchId}" nextMatch="${
          nextRound[Math.floor(Number(i + 1) / 2)].matchId
        }" player_1Id="${round[i + 1].player1Id}" player_2Id="${
          round[i + 1].player2Id
        }"></match-el>`;
      } else {
        roundEl.innerHTML += `<match-el player1Score="${
          round[i + 1].player1Score
        }" player2Score="${
          round[i + 1].player2Score
        }" tournamentId="${tournamentId}" winnerId="${
          round[i + 1].winnerId
        }" player_1="${round[i + 1].player1Name}" player_2="${
          round[i + 1].player2Name
        }" matchId="${round[i + 1].matchId}" nextMatch="${
          nextRound[Math.floor(Number(i + 1) / 2)].matchId
        }" player_1Id="${round[i + 1].player1Id}" player_2Id="${
          round[i + 1].player2Id
        }"></match-el>`;
        for (let s = 0; s < spacer_2Count; s++) {
          roundEl.innerHTML += '<div class="spacer"></div>';
        }
      }
    }
  }
}

function updateMatch(
  tournamentId,
  matchId,
  winnerId,
  nextMatchId,
  playerPosition,
  score
) {
  //update match
  //update next match
  console.log(
    "tournamentId:",
    tournamentId,
    "matchId:",
    matchId,
    "winnerId:",
    winnerId,
    "nextMatchId:",
    nextMatchId,
    "playerPosition:",
    playerPosition,
    "score:",
    score
  );
  // window.myAPI.updateMatchWinner(matchId, winnerId)
  // window.myAPI.updateNextMatch(nextMatchId, playerPosition, winnerId)
  const scoreModal = document.getElementById("scoreModal");
  const input = document.getElementById("scoreInput");
  const output = document.getElementById("scoreOutput");
  const saveScore = document.getElementById("saveScore");
  const scoreInput = document.getElementById("scoreInputField");
  const scoreOutput = document.getElementById("scoreOutputField");
  const ok = document.getElementById("ok");
  scoreModal.classList.remove("hidden");
  if (score > -1) {
    output.classList.remove("hidden");
    input.classList.add("hidden");
    scoreOutput.textContent = score;
    if (ok)
      ok.addEventListener("click", () => {
        output.classList.add("hidden");
        scoreModal.classList.add("hidden");
      });
  } else {
    output.classList.add("hidden");
    input.classList.remove("hidden");
    if (saveScore && scoreInput) {
      saveScore.addEventListener("click", () => {
        if (Number(scoreInput.value) > -1) {
          window.myAPI.updateScore(matchId, playerPosition, scoreInput.value);
          scoreInput.classList.remove("required");
          console.log(scoreInput.value);
          input.classList.add("hidden");
          scoreModal.classList.add("hidden");
          scoreInput.value = 0;
          scoreInput.textContent = 0;
          location.reload();
          // window.myAPI.fetchTournament(tournamentId)
        } else {
          scoreInput.classList.add("required");
        }
      });
    }
  }
}

window.myAPI.getLeaderboard((data) => {
  console.log("Classement");
  console.log("selected: ", data);
  const bracket = document.getElementById("bracket");
  const leaderboardContainer = document.getElementById("leaderboardContainer");
  const tournamentTitle = document.getElementById("tournamentTitle");
  bracket.classList.add("hidden");
  leaderboardContainer.classList.remove("hidden");
  tournamentTitle.textContent =
    data["tournament"]["name"] + " ( " + "Classement" + " ) ";
  const leaderboard = document.getElementById("leaderboard");
  if (leaderboard) {
    leaderboard.innerHTML = "";
    for (let i = 0; i < data.players.length; i++) {
      leaderboard.innerHTML += `
      <div class="leaderboard-el">
                <h2>${data.players[i]["name"]}</h2>
                <h2>${data.players[i]["score"]}</h2>
              </div>`;
    }
  }


  const printButton = document.getElementById("printButton");
  if (printButton) {
    printButton.addEventListener('click', () => {

      window.myAPI.savePDFDialog('C').then((filePath) => {
        if (filePath) {
          // use the filePath to generate or save your PDF
          console.log("User selected path:", filePath, 'C');
          window.myAPI.generatePdf(data, filePath, 'C')
        }
      });
    })
  }

});

const deleteButton = document.getElementById("del-btn");
const addButton = document.getElementById("add-btn");
const suppButton = document.getElementById("sup-btn");

if (deleteButton) {
  deleteButton.addEventListener("click", () => {
    deleteFromLeaderboard();
  });
}

if (addButton) {
  addButton.addEventListener("click", () => {
    addToLeaderboard();
  });
}

if (suppButton) {
  suppButton.addEventListener("click", () => {
    deleteAllFromLeaderboard();
  });
}

window.myAPI.onDeletedTournament(() => {
  window.myAPI.fetchTournaments();
});

function manageTournament(id, mode) {
  window.myAPI.navigateTo("manageTournament", id, mode);
}

function deleteTournament(id, mode) {
  console.log(id, mode);
  window.myAPI.deleteTournament(id, mode);
}

window.myAPI.addTournamentReply((tournamentId) => {
  console.log(tournamentId);
  window.myAPI.fetchPlayers(tournamentId); //fetch the players to create the matches of round 1 with their names
});

window.myAPI.getPlayers((tournamentId, playersList) => {
  console.log("players:", tournamentId, playersList);
  for (let i = 0; i < parseInt(playersList.length); i += 2) {
    console.log("index ", i, " ", playersList[i]);
    console.log("index ", i + 1, " ", playersList[i + 1]);
    window.myAPI.addMatch(
      tournamentId,
      1,
      playersList[i].playerId,
      playersList[i + 1].playerId,
      null,
      null,
      null
    );
  }
  mCount = playersList.length / 2;
  rCount = 1;
  //TODO: check if this works fine.. later on: i think it works
  while (mCount > 1) {
    mCount = mCount / 2;
    rCount++;
    for (let i = 0; i < mCount; i++) {
      window.myAPI.addMatch(tournamentId, rCount, null, null, null, null, null);
    }
  }
});

window.myAPI.updateTournamentsList((data) => {
  const tournamentsList = document.getElementById("tournaments_list");
  if (tournamentsList) {
    tournamentsList.innerHTML = "";
    console.log(data.length);
    if (data.length > 0) {
      data.forEach((el) => {
        tournamentsList.innerHTML += `
        <li class="tournament_item">
                <div class="tournament_info">
                  <h3>${el.name}</h3>
                  ${el.date}
                </br>
                  ${el.numberOfPlayers} Joueurs
                </div>
                <div style="align-content: center; display: flex; gap: 2vh;">
                  <button class="edit_manage_tournament" style="font-size: 2.4vh;" onclick='manageTournament(${el.tournamentId}, "${el.mode}")'>G&eacute;rer</button>
                  <button class="delete" onclick='deleteTournament(${el.tournamentId}, "${el.mode}")'><img src="../icons/delete.png" style="filter: invert(100%) sepia(3%) saturate(256%) hue-rotate(280deg) brightness(116%) contrast(100%);"></button>
                  </div>
              </li>
        `;
        console.log("name:", el["name"]);
        console.log("numberOfPlayers:", el["numberOfPlayers"]);
        console.log("type:", el["type"]);
        console.log("mode:", el["mode"]);
        console.log("tournamentId:", el["tournamentId"]);
      });
    }
  }
});

window.myAPI.OnAddToLeaderboard(() => {
  const leaderboard = document.getElementById("leaderboard");
  if (leaderboard) {
    console.log("leaderbaord\n");
  }
});

window.myAPI.OnDeleteFromLeaderboard(() => {
  const leaderboard = document.getElementById("leaderboard");
  if (leaderboard) {
    console.log("leaderbaord\n");
  }
});

window.myAPI.OnDeleteAllFromLeaderboard(() => {
  const leaderboard = document.getElementById("leaderboard");
  if (leaderboard) {
    console.log("leaderbaord\n");
  }
});
function addToLeaderboard() {
  const playerName = document.getElementById("playerName");
  const score = document.getElementById("score");
  let filled = false;
  if (playerName.value !== "") {
    playerName.classList.remove("required");
    filled = true;
  } else {
    filled = false;
    playerName.classList.add("required");
  }
  if (score.value !== "") {
    score.classList.remove("required");
    filled = true;
  } else {
    filled = false;
    score.classList.add("required");
  }
  if (filled) {
    const url = new URLSearchParams(window.location.search);
    window.myAPI.addToLeaderboard(url.get("id"), playerName.value, score.value);
    window.myAPI.fetchLeaderboard(url.get("id"));
  }
}

function deleteFromLeaderboard() {
  const playerName = document.getElementById("playerName");
  let filled = false;
  if (playerName.value !== "") {
    playerName.classList.remove("required");
    filled = true;
  } else {
    filled = false;
    playerName.classList.add("required");
  }
  if (filled) {
    const url = new URLSearchParams(window.location.search);
    window.myAPI.deleteFromLeaderboard(url.get("id"), playerName.value);
    window.myAPI.fetchLeaderboard(url.get("id"));
  }
}

function deleteAllFromLeaderboard() {
  const url = new URLSearchParams(window.location.search);
  window.myAPI.deleteAllFromLeaderboard(url.get("id"));
  window.myAPI.fetchLeaderboard(url.get("id"));
}

document.addEventListener("DOMContentLoaded", () => {
  const dayPicker = document.getElementById("dayPicker");
  const monthPicker = document.getElementById("monthPicker");
  const registerButton = document.getElementById("registerButton");
  const tournamentButton = document.getElementById("tournamentButton");
  const historyButton = document.getElementById("historyButton");
  const historyDaysButton = document.getElementById("historyDaysButton");
  const historyMonthButton = document.getElementById("historyMonthButton");
  const tournamentsList = document.getElementById("tournaments_list");

  if (dayPicker)
    dayPicker.addEventListener("change", (event) => {
      const selectedDate = event.target.value;
      const year = selectedDate.toString().split("-")[0];
      const month = selectedDate.toString().split("-")[1];
      const day = selectedDate.toString().split("-")[2];
      console.log("Date selected", day, month, year);
      window.myAPI.fetchSessions_date(day, month, year);
    });

  if (monthPicker)
    monthPicker.addEventListener("change", (event) => {
      const selectedDate = event.target.value;
      const year = selectedDate.toString().split("-")[0];
      const month = selectedDate.toString().split("-")[1];
      console.log("Month selected", year, month);
      window.myAPI.fetchSessions_month(month, year);
    });

  if (registerButton)
    registerButton.addEventListener("click", () => {
      window.myAPI.navigateTo("register");
    });

  if (tournamentButton)
    tournamentButton.addEventListener("click", () => {
      window.myAPI.navigateTo("tournaments");
    });

  if (historyButton)
    historyButton.addEventListener("click", () => {
      window.myAPI.navigateTo("history");
    });

  if (historyDaysButton)
    historyDaysButton.addEventListener("click", () => {
      window.myAPI.navigateTo("historyDays");
    });

  if (historyMonthButton)
    historyMonthButton.addEventListener("click", () => {
      window.myAPI.navigateTo("historyMonth");
    });

  //tmp
  if (tournamentsList) {
    window.myAPI.fetchTournaments();
  }

  const url = new URLSearchParams(window.location.search);
  if (url.size > 0) {
    console.log("size:", url.size);
    let action = window.location.pathname.split("/").pop().split("_")[0];
    console.log("name:", action);
    if (action === "manage") {
      url.get("mode") === "E"
        ? window.myAPI.fetchTournament(url.get("id"))
        : window.myAPI.fetchLeaderboard(url.get("id"));
    }
  }
  //insert innerHTML content into the classic_tournament
  //element when experimental data is ready

  /*tournament creation modal*/
  const modal = document.getElementById("createTournamentModal");
  const openBtn = document.getElementById("openModal");
  const cancelBtn = document.getElementById("cancelTournament");
  const saveBtn = document.getElementById("saveTournament");

  if (openBtn)
    openBtn.onclick = () => {
      modal.classList.remove("hidden");
      const today = new Date().toISOString().split("T")[0];
      const date = document.getElementById("tournamentDate");
      date.value = today;
    };

  if (cancelBtn)
    cancelBtn.onclick = () => {
      modal.classList.add("hidden");
    };

  if (saveBtn)
    saveBtn.onclick = () => {
      const name = document.getElementById("tournamentName");
      const playersCount = document.getElementById("playerCount");
      const date = document.getElementById("tournamentDate");
      const mode = document.getElementById("tournamentMode");
      const type = document.getElementById("tournamentType");

      let playersFilled = true;
      let infoFilled = false;
      if (
        name.value === "" ||
        playersCount.value === "" ||
        date.value === "" ||
        mode.value === "" ||
        type.value === ""
      ) {
        infoFilled = false;
      } else {
        infoFilled = true;
      }
      if (name.value === "") {
        name.classList.add("required");
      } else {
        name.classList.remove("required");
      }
      if (mode.value === "E")
        if (
          playersCount.value === "" ||
          !Number.isInteger(Math.log2(playersCount.value))
        ) {
          playersCount.classList.add("required");
        } else {
          playersCount.classList.remove("required");
        }

      if (date.value === "") {
        date.classList.add("required");
      } else {
        date.classList.remove("required");
      }

      if (mode.value === "") {
        mode.classList.add("required");
      } else {
        mode.classList.remove("required");
      }

      if (type.value === "") {
        type.classList.add("required");
      } else {
        type.classList.remove("required");
      }

      if (mode.value === "E")
        for (let i = 0; i < parseInt(playersCount.value); i++) {
          const el = document.getElementById("field_" + i);
          if (!el || el.value === "") {
            playersFilled = false;
            el.classList.add("required");
            break;
          }
          el.classList.remove("required");
          console.log(playersFilled);
        }

      let tournamentPlayers = [];

      if (
        playersFilled &&
        infoFilled &&
        Number.isInteger(Math.log2(playersCount.value))
      ) {
        console.log("Tournament Info:");
        console.log("Name:", name.value);
        console.log("Players:", playersCount.value);
        console.log("Date:", date.value);
        console.log("Mode:", mode.value);
        console.log("Type:", type.value);
        console.log("Players:\n");

        for (let i = 0; i < parseInt(playersCount.value); i++) {
          const el = document.getElementById("field_" + i);
          tournamentPlayers.push(el.value);
        }

        // console.log(tournamentPlayers);
        window.myAPI.addTournament(
          name.value.toString(),
          parseInt(playersCount.value),
          date.value.toString(),
          mode.value.toString().charAt(0),
          type.value.toString(),
          tournamentPlayers
        );
        window.myAPI.fetchTournaments();
        if (modal) modal.classList.add("hidden");
      } else {
        console.log("empty field");
      }

      // window.myAPI.fetchTournament(18);//test purposes only
    };
  /*end*/

  const playersCount = document.getElementById("playerCount");
  const playersList = document.getElementById("playersList");
  if (playersCount && playersList) {
    playersCount.addEventListener("change", () => {
      playersList.innerHTML = "";
      for (let u = 0; u < playersCount.value; u++) {
        playersList.innerHTML += `<li><input type="text" id="field_${u}" placeholder="Joueure ${
          u + 1
        }"></li>`;
      }
    });
  }

  const modeSelector = document.getElementById("tournamentMode");
  if (modeSelector) {
    const playersList = document.getElementById("modal-right");
    const playerCount = document.getElementById("playerCount");
    const playerCountLabel = document.getElementById("playerCountLabel");
    modeSelector.addEventListener("change", () => {
      if (modeSelector.value === "E") {
        console.log("e");
        playersList.classList.remove("hidden");
        playerCount.classList.remove("hidden");
        playerCountLabel.classList.remove("hidden");
      }
      if (modeSelector.value === "C") {
        console.log("c");
        playersList.classList.add("hidden");
        playerCount.classList.add("hidden");
        playerCountLabel.classList.add("hidden");
      }
    });
  }

});
