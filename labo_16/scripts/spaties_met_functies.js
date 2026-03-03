const setup = () => {
    let button = document.getElementsByClassName("button")[0];
    button.addEventListener("click", spaties);
}

const maakMetSpaties = (inputText) => {
    let result = "";

    let tekstZonderSpaties = inputText.replace(/ /g, "");

    for (let i = 0; i < tekstZonderSpaties.length; i++) {
        result += tekstZonderSpaties.charAt(i) + " ";
    }

    return result.trim();
}

const spaties = () => {
    let inputElement = document.getElementsByClassName("tekst")[0];
    let inputWaarde = inputElement.value;

    let resultaat = maakMetSpaties(inputWaarde);

    console.log(resultaat);
}

window.addEventListener("load", setup);