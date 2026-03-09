const setup = () =>{
    let buttonA = document.getElementsByClassName("buttonA")[0];
    let buttonB = document.getElementsByClassName("buttonB")[0];

    buttonA.addEventListener("click", telMetIndexOf);
    buttonB.addEventListener("click", telMetLastIndexOf);
}

const telMetIndexOf = () => {
    let inputIndexOf = document.getElementsByClassName("inputIndexOf")[0].value.toLowerCase().trim();

    let outputIndexOf = document.getElementsByClassName("outputIndexOf")[0];

    let teller = 0;
    let index = inputIndexOf.indexOf("an");

    while (index !== -1) {
        teller++;
        index = inputIndexOf.indexOf("an", index + 1);
    }

    outputIndexOf.textContent = `an komt ${teller} keer voor.`;
}

const telMetLastIndexOf = () => {
    let inputLastIndexOf = document.getElementsByClassName("inputLastIndexOf")[0].value.toLowerCase().trim();

    let outputLastIndexOf = document.getElementsByClassName("outputLastIndexOf")[0];

    let teller = 0;
    let index = inputLastIndexOf.lastIndexOf("an");

    while (index !== -1) {
        teller++;
        index = inputLastIndexOf.lastIndexOf("an", index - 1);
    }

    outputLastIndexOf.textContent = `an komt ${teller} keer voor.`;
}

window.addEventListener("load", setup);