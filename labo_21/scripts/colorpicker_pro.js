const setup = () => {
    getSliderR().addEventListener("input", updateAndSaveSliders);
    getSliderG().addEventListener("input", updateAndSaveSliders);
    getSliderB().addEventListener("input", updateAndSaveSliders);

    document.querySelector("#btnSave").addEventListener("click", saveColor);

    loadData();
    update();
};

const getSliderR = () => document.querySelector(".sliderRed");
const getSliderG = () => document.querySelector(".sliderGreen");
const getSliderB = () => document.querySelector(".sliderBlue");

const update = () => {
    document.querySelector(".colorCube").style.backgroundColor = getCurrentColor();
};

const getCurrentColor = () => {
    return `rgb(${getSliderR().value},${getSliderG().value},${getSliderB().value})`;
}

const saveColor = () => {
    const color = getCurrentColor();
    addSwatchToDOM(color);
    saveSwatchesToLocalStorage();
};

const addSwatchToDOM = (color) => {
    const swatch = document.createElement("div");
    swatch.className = "savedSwatch";
    swatch.style.backgroundColor = color;

    const btnDelete = document.createElement("button");
    btnDelete.className = "btnDelete";
    btnDelete.textContent = "X";

    btnDelete.addEventListener("click", () => {
        swatch.remove();
        saveSwatchesToLocalStorage();
    });

    swatch.addEventListener("click", () => {
        setSliders(color);
    });

    swatch.appendChild(btnDelete);
    document.querySelector("#savedColors").appendChild(swatch);
};

const setSliders = (color) => {
    const parts = color.replace("rgb(", "").replace(")", "").split(",");
    getSliderR().value = parts[0].trim();
    getSliderG().value = parts[1].trim();
    getSliderB().value = parts[2].trim();
    updateAndSaveSliders();
};

const updateAndSaveSliders = () => {
    const colorState = {
        r: getSliderR().value,
        g: getSliderG().value,
        b: getSliderB().value
    };
    localStorage.setItem("sliderSettings", JSON.stringify(colorState));
    update();
};

const saveSwatchesToLocalStorage = () => {
    const swatchesNodes = document.querySelectorAll(".savedSwatch");
    const swatches = [];

    for (const swatch of swatchesNodes) {
        swatches.push(swatch.style.backgroundColor);
    }

    localStorage.setItem("savedColors", JSON.stringify(swatches));
};

const loadData = () => {
    const savedSliders = JSON.parse(localStorage.getItem("sliderSettings"));
    if (savedSliders) {
        getSliderR().value = savedSliders.r;
        getSliderG().value = savedSliders.g;
        getSliderB().value = savedSliders.b;
    }

    const savedColors = JSON.parse(localStorage.getItem("savedColors"));
    if (savedColors) {
        savedColors.forEach(color => addSwatchToDOM(color));
    }
};

window.addEventListener("load", setup);