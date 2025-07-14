class SideBar extends HTMLElement{
    constructor(){
        super();
        const el = this.attachShadow({mode:'open'})
        let selected
        selected = this.getAttribute('selected')
        el.innerHTML= `
        <style>
        .sidebar{
        //   background-color: var(--card-color);
          background-color: #3b3b3b77;
            backdrop-filter:blur(10px);
          width: 24vh;
          height: 96vh;
          margin-top: 2vh;
          border-radius: 2vh;
          margin-left: 2vh;
        }
        .sidebar header{
          width: 100%;
          display: flex;
          height: 10vh;
          background-image:url('../icons/alphapoollogo.png');
          background-size: contain;
          background-position:center;
          background-repeat:no-repeat;
          color: var(--card-color);
          margin-bottom: 3vh;
          justify-self:center;
          justify-content: center;
          align-items: center;
        }
        .sidebar ul{
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .sidebar li{
          width: 18;
          margin: 1vh;
          padding-left: 2vh;
          height: 6vh;
          border-radius: 1vh;
          display: flex;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          justify-content: flex-start;
          align-items: center;
        }
        .sidebar li:hover{
          background-color: var(--button-color);
          transition: 0.5s ease;
          color: var(--background-color);
        }
        .selected{
          background-color: var(--button-hover);
          color: var(--background-color);
        }
        .sidebar a{
          color: var(--text-color);
          font-size: 2.5vh;

          text-decoration: none;
          font-weight: 600;
        }
        </style>
        <div class="sidebar">
            <ul>
            </br>
                <header></header>
                <a href="index.html"><li>Acceuil</li></a>
                <a href="register.html"><li ${(selected === 'register')?`class="selected"`:""}>Caisse</li></a>
                <a href="history.html"><li ${(selected === 'history')?`class="selected"`:""}>Historique</li></a>
                <a href="tournaments.html"><li ${(selected === 'tournaments')?`class="selected"`:""}>Tournois</li></a>
           </ul>
        </div>`
    }

}
customElements.define('side-bar', SideBar)