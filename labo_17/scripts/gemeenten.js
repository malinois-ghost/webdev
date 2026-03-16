const setup = () => {
    let input = window.prompt("Geef gemeentes op", "stop").trim().toLowerCase();
    let array = [];

    array.push(input);

    while(input !== "stop"){
        input = window.prompt("Geef gemeentes op", "stop").trim().toLowerCase();
        array.push(input) ;
    }

    array = array.slice(0,-1);
    array = array.sort();

    let outputSelect = document.getElementsByClassName("output")[0];

    for (let i = 0; i < array.length; i++) {
        let option = document.createElement("option");
        option.value = array[i];
        option.textContent = array[i].charAt(0).toUpperCase() + array[i].slice(1);
        outputSelect.appendChild(option);
    }
}

window.addEventListener("load", setup);