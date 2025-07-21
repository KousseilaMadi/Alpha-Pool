class Match extends HTMLElement{
    constructor(){
        super();
        const el = this.attachShadow({mode:'open'})
        let player_1 = this.getAttribute('player_1')
        let player_2 = this.getAttribute('player_2')

        el.innerHTML= `
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
          background-color: rgb(94, 255, 0);
        }
        .vs{
          flex: 0 0 auto;
          text-align: center;
          padding-left: 1vh;
          padding-right: 1vh;
          font-weight: 600;
          font-size: 1.8vh;
        }
        </style>
        <div class="match">
            <button class="player leftPlayer" id="">${player_1}</button>
            <div class="vs">VS</div>
            <button class="player rightPlayer" id="">${player_2}</button>
        </div>
        `
    }
}
customElements.define('match-el', Match)