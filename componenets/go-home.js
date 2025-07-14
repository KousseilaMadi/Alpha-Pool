class GoHome extends HTMLElement{
    constructor(){
        super();
        const el = this.attachShadow({mode:'open'})
        let status
        status = this.getAttribute('status')
        el.innerHTML= `
        <style>
        #goHomeButton{
            background-color: #fff;
            border: none;
            border-radius: 1vh;
            padding: .6vh;
            width:6vh;
            height:6vh;
            position: absolute;
            background-image:url('../icons/home.png');
            background-size:cover;
            background-position:center;
            left: 3vh;
            ${(status)?"pointer-events:none; background-color:#777; border:3px solid #777;":"border:3px solid #fff;"}
        }
        #goHomeButton:hover{
            background-color: #ddd;
            border:3px solid #ddd;
        }
        #goHomeButton:active{
            background-color: #bbb;
            border:3px solid #bbb;
        }
        </style>
        <button id="goHomeButton" ${(status)?"disabled":""}></button>
        `
    }

    connectedCallback() {
    const btn = this.shadowRoot.getElementById('goHomeButton');
    if (btn) {
      btn.addEventListener('click', () => {
        window.myAPI.navigateTo('home')
      });
    }
  }

}
customElements.define('go-home', GoHome)