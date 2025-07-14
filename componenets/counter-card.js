class CounterCard extends HTMLElement{
    constructor(){
        super();
        const el = this.attachShadow({mode:'open'})
        let id
        id = this.getAttribute('id')
        el.innerHTML= `
        <style>
        h1{
          font-size: 3vh;
          color:var(--button-hover);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .start:hover{
          background-color:#43a047;
        }
        .stop:hover{
          background-color:#e53935;
        }
        .pause:hover{
          background-color:#757575;
        }
        .start:active{
          background-color:#2E6D30;
        }
        .stop:active{
          background-color:#922422;
        }
        .pause:active{
          background-color:#535353;
        }
        .stats{
        display:flex;
        flex-direction:column;
        justify-content:flex-start;
        align-items:center;
        }
        .chronometer{
          display:flex;
          font-size: 4vh;
          color:var(--text-color);
          justify-content:center;
          align-items:center;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          border-radius:2vh;
        }
        .price{
          display:flex;
          font-size: 3vh;
          color:var(--text-color);
          justify-content:center;
          align-items:center;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 1vh;
          border-radius:1vh;
        }
        .counterCard{
          display: flex;
          flex-direction:column;
          background-color: var(--card-color);
          height: 30vh;
          width: 35vh;
          border-radius: 1.2vh;
          align-items: center;
          padding:1vh;
          justify-content: space-around;
        }
        .buttons{
        display:flex;
        flex-direction:row;
        }
        button{
          display: flex;
          justify-content: center;
          width: 3vh;
          height: 3vh;
          border: none;
          justify-items: center;
          align-items: center;
          border-radius: .5vh;
          margin: 1vh;
          background-color: var(--control-buttons-color);
        }
        button img{
          display: inline-block;

          width: 1.5vh;
          height: 1.5vh;
        }
        </style>
        <div class="counterCard">
        <h1>Table ${Number(id)+1}</h1>
        <div class="stats">
          <div class="chronometer" id="timer_${id}">00:00:00</div>
          <div class="price" id="price_${id}">0 DA</div>
        </div>
        <div class="buttons">  
        <button onclick="onStart(${id})" class="start">
                <img src="../icons/start.png" alt="commencer">
            </button>
            <button onclick="onPause(${id})" class="pause">
                <img src="../icons/pause.png" alt="pause">
            </button>
            <button onclick="onStop(${id})" class="stop">
                <img src="../icons/stop.png" alt="arrêter">
            </button>
        </div>
            </div>
        `
    }
}
customElements.define('counter-card', CounterCard)