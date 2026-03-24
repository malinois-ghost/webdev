const setup = () => {
    getSliderR().addEventListener("change", update);
    getSliderR().addEventListener("input", update);
    getSliderG().addEventListener("change", update);
    getSliderG().addEventListener("input", update);
    getSliderB().addEventListener("change", update);
    getSliderB().addEventListener("input", update);

    document.querySelector("#btnSave").addEventListener("click", saveColor);
    update();
};

const getSliderR = () => document.querySelector(".sliderRed");
const getSliderG = () => document.querySelector(".sliderGreen");
const getSliderB = () => document.querySelector(".sliderBlue");

const setSliders = (color) => {
    const parts = color.replace("rgb(", "").replace(")", "").split(",");
    getSliderR().value = parts[0].trim();
    getSliderG().value = parts[1].trim();
    getSliderB().value = parts[2].trim();
    update();
};

const getCurrentColor = () => {
    return `rgb(${getSliderR().value},${getSliderG().value},${getSliderB().value})`;
};

const update = () => {
    document.querySelector(".colorCube").style.backgroundColor = getCurrentColor();
};

const saveColor = () => {
    const color = getCurrentColor();

    const swatch = document.createElement("div");
    swatch.className = "savedSwatch";
    swatch.style.backgroundColor = color;

    const btnDelete = document.createElement("button");
    btnDelete.className = "btnDelete";
    btnDelete.textContent = "X";

    btnDelete.addEventListener("click", () => swatch.remove());

    swatch.addEventListener("click", (e) => {
        if (e.target !== btnDelete) setSliders(swatch.style.backgroundColor);
    });

    swatch.appendChild(btnDelete);
    document.querySelector("#savedColors").appendChild(swatch);
};

window.addEventListener("load", setup);