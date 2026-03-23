const setup = () => {
    getSliders().forEach(slider => {
        slider.addEventListener("change", update);
        slider.addEventListener("input", update);
    });

    document.getElementById("btnSave").addEventListener("click", saveColor);

    update();
};

const getSliders = () => [
    document.getElementsByClassName("sliderRed")[0],
    document.getElementsByClassName("sliderGreen")[0],
    document.getElementsByClassName("sliderBlue")[0]
];

const getCurrentColor = () => {
    const [r, g, b] = getSliders().map(s => s.value);
    return `rgb(${r},${g},${b})`;
};

const update = () => {
    document.getElementsByClassName("colorCube")[0].style.backgroundColor = getCurrentColor();
};

const setSliders = (color) => {
    const [r, g, b] = color.match(/\d+/g);
    const sliders = getSliders();
    sliders[0].value = r;
    sliders[1].value = g;
    sliders[2].value = b;
    update();
};

const saveColor = () => {
    const color = getCurrentColor();

    const swatch = document.createElement("div");
    swatch.className = "savedSwatch";
    swatch.style.backgroundColor = color;

    swatch.addEventListener("click", (event) => {
        if (event.target.classList.contains("btnDelete")) return;
        setSliders(swatch.style.backgroundColor);
    });

    const btnDelete = document.createElement("button");
    btnDelete.className = "btnDelete";
    btnDelete.textContent = "X";
    btnDelete.addEventListener("click", () => {
        document.getElementById("savedColors").removeChild(swatch);
    });

    swatch.appendChild(btnDelete);
    document.getElementById("savedColors").appendChild(swatch);
};

window.addEventListener("load", setup);