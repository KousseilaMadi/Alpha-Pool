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

window.myAPI.editTournament((data) => {
  //when selecting a tournament to edit
  console.log("editing: ", JSON.stringify(data));
  const name = document.getElementById("Tname");
  const mode = document.getElementById("Tmode");
  const type = document.getElementById("Ttype");
  const date = document.getElementById("Tdate");
  const players = document.getElementById("Tplayers");
  const playersList = document.getElementById("playersList");
  name.textContent = data["name"];
  mode.textContent =
    data["mode"] === "C"
      ? "Classement"
      : data["mode"] === "E"
      ? "Eliminatoire"
      : "NAN";
  type.textContent = data["type"];
  date.textContent = data["date"];
  players.textContent = data["numberOfPlayers"] + " Joueurs";
  playersList.innerHTML = "";
  for (let u = 0; u < data["numberOfPlayers"]; u++) {
    playersList.innerHTML += `
    <li><input type="text" placeholder="joueur ${u + 1}" id="${u}"></li>
    `;
  }
});

window.myAPI.manageTournament((data) => {
  //when selecting a tournament to manage
  console.log("managing: ", JSON.stringify(data));
});

function editTournament(id) {
  window.myAPI.navigateTo("editTournament", id);
}

function manageTournament(id) {
  window.myAPI.navigateTo("manageTournament", id);
}

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
                  <h3>${el["name"]}</h3>
                  ${el["date"]}
                </br>
                  ${el["numberOfPlayers"]} Joueurs
                </div>
                <div>
                  <button class="edit_manage_tournament" style="font-size: 2.4vh;" onclick="manageTournament(${el["tournamentId"]})">Gérer</button>
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
      window.myAPI.navigateTo("tournament");
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
    if (action === "edit") window.myAPI.fetchTournamentEdit(url.get("id"));
    if (action === "manage") window.myAPI.fetchTournamentManage(url.get("id"));
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

      if (playersCount.value === "") {
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

      let tournamentPlayers = []

      if (playersFilled && infoFilled) {
        console.log("Tournament Info:");
        console.log("Name:", name.value);
        console.log("Players:", playersCount.value);
        console.log("Date:", date.value);
        console.log("Mode:", mode.value);
        console.log("Type:", type.value);
        console.log("Players:\n");

        for (let i = 0; i < parseInt(playersCount.value); i++) {
          const el = document.getElementById("field_" + i);
          tournamentPlayers.push(el.value)
        }
        if (modal) modal.classList.add("hidden");
      } else {
        console.log("empty field");
      }
      console.log(tournamentPlayers)
      window.myAPI.addTournament(
        name.value.toString(),
        parseInt(playersCount.value),
        date.value.toString(),
        mode.value.toString().charAt(0),
        type.value.toString(),
        tournamentPlayers
      );
      //edit this fucntion
      window.myAPI.fetchTournament();
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
});
