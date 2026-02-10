const setup = () => {
    let btnSubstring = document.getElementById("btnSubstring");
    btnSubstring.addEventListener("click", substring);
}

const substring = () => {
    let txtInput = document.getElementById("txtInput");
    let txtVan = document.getElementById("txtVan");
    let txtTot = document.getElementById("txtTot");
    let tekst = txtInput.value;
    let van = txtVan.value;
    let tot = txtTot.value;

    tekst = tekst.substring(van, tot);
    console.log(tekst);

    let pElement = document.getElementById("txtOutput");
    pElement.innerHTML = tekst;
}

window.addEventListener("load", setup);