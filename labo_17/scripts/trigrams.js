const setup = () =>{
    let button = document.getElementsByClassName("button")[0];

    button.addEventListener("click", trigram)
}

const trigram = () =>{
    let output = document.getElementsByClassName("output")[0];

    let zin = document.getElementsByClassName("text")[0].value.trim().toLowerCase();
    let trigrams = "";

    for (let i = 0; i <= zin.length - 3; i++){
        trigrams += zin[i] + zin[i+1] + zin[i+2] + " - ";
    }

    trigrams = trigrams.slice(0, trigrams.length - 2);

    output.textContent = trigrams;
}

window.addEventListener('load', setup)