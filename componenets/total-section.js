class TotalSection extends HTMLElement{
    constructor(){
        super();
        const el = this.attachShadow({mode:'open'})
        let total
        total = this.getAttribute('total')
        el.innerHTML= `
        <style>
        #totalAmount{
            font-size: 2.4vh;
            color: var(--theme-color);
            font-weight: 600;
        }
        #totalLabel{
            font-size: 2vh;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #fff;
            padding: 1vh;
        }
        #container{
            display: flex;
            justify-content: space-between;
            flex-direction: row;
            align-items: center;
            border-radius: 1vh;
            width: 25vh;
            height: 4vh;
            background-color: var(--card-color);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 1vh;
        }
        </style>
        <div id="container">
          <label for="totalAmount" id="totalLabel">Totale:</label>
          <p id="totalAmount">${total} DA</p>
        </div>
        `
    }
}
customElements.define('total-section', TotalSection)