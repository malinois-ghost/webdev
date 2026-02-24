const setup = () => {
    let colorCube=document.getElementsByClassName("colorCube");

    let sliderRed = document.getElementsByClassName("sliderRed");
    let sliderGreen = document.getElementsByClassName("sliderGreen");
    let sliderBlue = document.getElementsByClassName("sliderBlue");

    sliderRed[0].addEventListener("change", update);
    sliderRed[0].addEventListener("input", update);
    sliderGreen[0].addEventListener("change", update);
    sliderGreen[0].addEventListener("input", update);
    sliderBlue[0].addEventListener("change", update);
    sliderBlue[0].addEventListener("input", update);

    let valueRed = sliderRed[0].value;
    let valueGreen = sliderGreen[0].value;
    let valueBlue = sliderBlue[0].value;

    colorCube[0].style.backgroundColor=`rgb(${valueRed},${valueGreen},${valueBlue})`;
}

const update = () => {
    let colorCube=document.getElementsByClassName("colorCube");

    let sliderRed = document.getElementsByClassName("sliderRed");
    let sliderGreen = document.getElementsByClassName("sliderGreen");
    let sliderBlue = document.getElementsByClassName("sliderBlue");

    let valueRed = sliderRed[0].value;
    let valueGreen = sliderGreen[0].value;
    let valueBlue = sliderBlue[0].value;

    colorCube[0].style.backgroundColor=`rgb(${valueRed},${valueGreen},${valueBlue})`;
}

window.addEventListener("load", setup);