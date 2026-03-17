const setup = () => {
    const button = document.getElementsByClassName("btn")[0];

    button.addEventListener("click", toonResultaat)
}

const toonResultaat = () => {
    const isRoker = document.getElementById('roker').checked;
    console.log(isRoker ? "is roker" : "is geen roker");

    const taalElement = document.querySelector('input[name="taal"]:checked');
    const taal = taalElement ? taalElement.value : "geen selectie";
    console.log("moedertaal is " + taal);

    const buurland = document.getElementById('buurland').value;
    console.log("favoriete buurland is " + buurland);

    const bestellingSelect = document.getElementById('bestelling');
    const geselecteerdeOpties = Array.from(bestellingSelect.selectedOptions).map(option => option.value);
    console.log("bestelling bestaat uit " + geselecteerdeOpties.join(' '));
}

window.addEventListener("load", setup);