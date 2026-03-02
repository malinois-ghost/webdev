const setup = () => {
    let herberekenen = document.getElementsByClassName("herberekenen")[0];

    herberekenen.addEventListener("click", herbereken);
}

const herbereken = () => {
    let product = document.getElementsByClassName("product");
    let prijs = document.getElementsByClassName("prijs");
    let aantal = document.getElementsByClassName("aantal");
    let btw = document.getElementsByClassName("btw");
    let subtotaal = document.getElementsByClassName("subtotaal");

    let totaal = document.getElementsByClassName("totaal")[0];

    let totaalprijs = 0;

    for (let i = 0; i < product.length; i++) {
        let btw_prijs = (parseFloat(prijs[i].textContent) * parseInt(aantal[i].value) * (parseInt(btw[i].textContent) / 100));
        subtotaal[i].textContent = `${(parseFloat(prijs[i].textContent) * parseInt(aantal[i].value) + btw_prijs).toFixed(2)} Eur`;
    }

    for (let i = 0; i < subtotaal.length; i++) {
        totaalprijs += parseFloat(subtotaal[i].textContent);
    }

    totaal.textContent = `${totaalprijs.toFixed(2)} Eur`;
}

window.addEventListener('load', setup)