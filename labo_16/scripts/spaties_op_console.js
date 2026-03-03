const setup = () => {
    let button = document.getElementsByClassName("button")[0];

    button.addEventListener("click", spaties);
}

const spaties = () => {
    let tekst = document.getElementsByClassName("tekst")[0];
    tekst = tekst.value.replace(/ /g, "").split('').join(' ');
    console.log(tekst)
}

window.addEventListener("load", setup);