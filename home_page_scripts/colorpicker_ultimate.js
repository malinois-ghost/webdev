const setup = () => {
    // Slider listeners
    getSliderR().addEventListener("input", syncFromSliders);
    getSliderG().addEventListener("input", syncFromSliders);
    getSliderB().addEventListener("input", syncFromSliders);
    getSliderA().addEventListener("input", syncFromSliders);

    // Number field listeners
    getValR().addEventListener("input", syncFromInputs);
    getValG().addEventListener("input", syncFromInputs);
    getValB().addEventListener("input", syncFromInputs);
    getValA().addEventListener("input", syncFromInputs);

    document.querySelector("#btnSave").addEventListener("click", saveColor);
    document.querySelector("#btnInvert").addEventListener("click", invertColor);

    loadData();
    update();
};

// Getters
const getSliderR = () => document.querySelector(".sliderRed");
const getSliderG = () => document.querySelector(".sliderGreen");
const getSliderB = () => document.querySelector(".sliderBlue");
const getSliderA = () => document.querySelector(".sliderAlpha");

const getValR = () => document.querySelector(".valRed");
const getValG = () => document.querySelector(".valGreen");
const getValB = () => document.querySelector(".valBlue");
const getValA = () => document.querySelector(".valAlpha");

// Build RGBA string
const getCurrentColor = () =>
    `rgba(${getSliderR().value},${getSliderG().value},${getSliderB().value},${getSliderA().value / 100})`;

// Sync sliders → inputs
const syncFromSliders = () => {
    getValR().value = getSliderR().value;
    getValG().value = getSliderG().value;
    getValB().value = getSliderB().value;
    getValA().value = getSliderA().value;

    saveSliderValues();
    update();
};

// Sync inputs → sliders
const syncFromInputs = () => {
    getSliderR().value = getValR().value;
    getSliderG().value = getValG().value;
    getSliderB().value = getValB().value;
    getSliderA().value = getValA().value;

    saveSliderValues();
    update();
};

// Save slider values
const saveSliderValues = () => {
    localStorage.setItem("r_home_page", getSliderR().value);
    localStorage.setItem("g_home_page", getSliderG().value);
    localStorage.setItem("b_home_page", getSliderB().value);
    localStorage.setItem("a_home_page", getSliderA().value);
};

// Update preview
const update = () => {
    document.querySelector(".colorCube").style.backgroundColor = getCurrentColor();
};

// Invert color
const invertColor = () => {
    getSliderR().value = 255 - getSliderR().value;
    getSliderG().value = 255 - getSliderG().value;
    getSliderB().value = 255 - getSliderB().value;

    syncFromSliders();
};

// Normalize rgb() or rgba() into consistent RGBA array
const parseRGBA = (colorString) => {
    if (colorString.startsWith("rgb(")) {
        const parts = colorString
            .replace("rgb(", "")
            .replace(")", "")
            .split(",");

        return [
            parseInt(parts[0]),
            parseInt(parts[1]),
            parseInt(parts[2]),
            100 // alpha = 100% if missing
        ];
    }

    const parts = colorString
        .replace("rgba(", "")
        .replace(")", "")
        .split(",");

    return [
        parseInt(parts[0]),
        parseInt(parts[1]),
        parseInt(parts[2]),
        Math.round(parseFloat(parts[3]) * 100)
    ];
};

// Save swatch (with duplicate prevention)
const saveColor = () => {
    const currentColor = getCurrentColor();
    const swatches = document.querySelectorAll(".savedSwatch");

    const [r, g, b, a] = parseRGBA(currentColor);

    let duplicate = false;

    swatches.forEach(swatch => {
        const [sr, sg, sb, sa] = parseRGBA(swatch.style.backgroundColor);

        if (r === sr && g === sg && b === sb && a === sa) {
            duplicate = true;
        }
    });

    if (!duplicate) {
        addSwatchToDOM(currentColor);
        saveSwatchesToLocalStorage();
    }
};

// Add swatch to DOM
const addSwatchToDOM = (color) => {
    const wrapper = document.createElement("div");
    wrapper.className = "swatchWrapper";

    const swatch = document.createElement("div");
    swatch.className = "savedSwatch";
    swatch.style.backgroundColor = color;
    swatch.addEventListener("click", () => setSlidersFromColor(color));

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

// Load swatch into sliders
const setSlidersFromColor = (color) => {
    const [r, g, b, a] = parseRGBA(color);

    getSliderR().value = r;
    getSliderG().value = g;
    getSliderB().value = b;
    getSliderA().value = a;

    syncFromSliders();
};

// Save swatches
const saveSwatchesToLocalStorage = () => {
    const swatches = [...document.querySelectorAll(".savedSwatch")]
        .map(s => s.style.backgroundColor);

    localStorage.setItem("savedColors_home_page", JSON.stringify(swatches));
};

// Load data
const loadData = () => {
    const r = localStorage.getItem("r_home_page");
    const g = localStorage.getItem("g_home_page");
    const b = localStorage.getItem("b_home_page");
    const a = localStorage.getItem("a_home_page");

    if (r !== null) getSliderR().value = r;
    if (g !== null) getSliderG().value = g;
    if (b !== null) getSliderB().value = b;
    if (a !== null) getSliderA().value = a;

    syncFromSliders();

    const saved = JSON.parse(localStorage.getItem("savedColors_home_page"));
    if (saved) saved.forEach(addSwatchToDOM);
};

window.addEventListener("load", setup);
