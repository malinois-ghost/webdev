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

const getCurrentColor = () => `rgb(${getSliderR().value},${getSliderG().value},${getSliderB().value})`;

const setSliders = (color) => {
    const sliderParts = color.replace("rgb(", "").replace(")", "").split(",");
    getSliderR().value = sliderParts[0].trim();
    getSliderG().value = sliderParts[1].trim();
    getSliderB().value = sliderParts[2].trim();
    updateAndSaveSliders();
};

const saveSwatchesToLocalStorage = () => {
    const swatchesNodes = document.querySelectorAll(".savedSwatch");
    const swatches = [];

    for (const swatch of swatchesNodes) {
        swatches.push(swatch.style.backgroundColor);
    }

    localStorage.setItem("savedColors", JSON.stringify(swatches));
};

const update = () => {
    document.querySelector(".colorCube").style.backgroundColor = getCurrentColor();
};

const updateAndSaveSliders = () => {
    localStorage.setItem("r", getSliderR().value);
    localStorage.setItem("g", getSliderG().value);
    localStorage.setItem("b", getSliderB().value);
    update();
};

const addSwatchToDOM = (color) => {
    const wrapper = document.createElement("div");
    wrapper.className = "swatchWrapper";

    const swatch = document.createElement("div");
    swatch.className = "savedSwatch";
    swatch.style.backgroundColor = color;
    swatch.addEventListener("click", () => setSliders(color));

    const btnDelete = document.createElement("button");
    btnDelete.className = "btnDelete";
    btnDelete.textContent = "X";
    btnDelete.addEventListener("click", () => {
        wrapper.remove();
        saveSwatchesToLocalStorage();
    });

    wrapper.appendChild(swatch);
    wrapper.appendChild(btnDelete);
    document.querySelector("#savedColors").appendChild(wrapper);
};

const saveColor = () => {
    addSwatchToDOM(getCurrentColor());
    saveSwatchesToLocalStorage();
};

const loadData = () => {
    const r = localStorage.getItem("r");
    const g = localStorage.getItem("g");
    const b = localStorage.getItem("b");

    if (r !== null && g !== null && b !== null) {
        getSliderR().value = r;
        getSliderG().value = g;
        getSliderB().value = b;
    }

    const saved = JSON.parse(localStorage.getItem("savedColors"));
    if (saved) saved.forEach(addSwatchToDOM);
};

window.addEventListener("load", setup);