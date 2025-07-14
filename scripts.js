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

document.addEventListener("DOMContentLoaded", () => {
  const dayPicker = document.getElementById("dayPicker");
  const monthPicker = document.getElementById("monthPicker");
  const registerButton = document.getElementById("registerButton");
  const tournamentButton = document.getElementById("tournamentButton");
  const historyButton = document.getElementById("historyButton");
  const historyDaysButton = document.getElementById("historyDaysButton");
  const historyMonthButton = document.getElementById("historyMonthButton");
  const classic_tournament = document.getElementById("classic_tournament");

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

  //insert innerHTML content into the classic_tournament
  //element when experimental data is ready


/*tournament creation modal*/
  const modal = document.getElementById("createTournamentModal");
  const openBtn = document.getElementById("openModal");
  const cancelBtn = document.getElementById("cancelTournament");
  const saveBtn = document.getElementById("saveTournament");

  openBtn.onclick = () => {
    modal.classList.remove("hidden");
  };

  cancelBtn.onclick = () => {
    modal.classList.add("hidden");
  };

  saveBtn.onclick = () => {
    const name = document.getElementById("tournamentName").value;
    const players = document.getElementById("playerCount").value;
    const date = document.getElementById("tournamentDate").value;

    console.log("Tournament Info:");
    console.log("Name:", name);
    console.log("Players:", players);
    console.log("Date:", date);

    modal.classList.add("hidden");
  };
  /*end*/
});
