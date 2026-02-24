const setup = () => {
    let button1 = document.getElementsByClassName("button")[0];
    let button2 = document.getElementsByClassName("button")[1];
    let button3 = document.getElementsByClassName("button")[2];

    button1.addEventListener("click", () => changeBackgroundColor(button1));
    button2.addEventListener("click", () => changeBackgroundColor(button2));
    button3.addEventListener("click", () => changeBackgroundColor(button3));

    //extra
    let button1extra = document.getElementsByClassName("buttonExtra")[0];
    let button2extra = document.getElementsByClassName("buttonExtra")[1];
    let button3extra = document.getElementsByClassName("buttonExtra")[2];

    button1extra.addEventListener("click", () => changeBackgroundColorExtra(button1extra));
    button2extra.addEventListener("click", () => changeBackgroundColorExtra(button2extra));
    button3extra.addEventListener("click", () => changeBackgroundColorExtra(button3extra));
}

const changeBackgroundColor = (button) => {
    let buttons = document.getElementsByClassName("button");
    for(let i= 0; i < buttons.length; i++) {
        if(buttons[i] === button) {
            buttons[i].classList.toggle("buttonBlue")
        }
    }

}

//extra
const changeBackgroundColorExtra = (button) => {
    let buttonsExtra = document.getElementsByClassName("buttonExtra");
    for(let i= 0; i < buttonsExtra.length; i++) {
        if(buttonsExtra[i] === button){
            buttonsExtra[i].style.backgroundColor = "blue"
            buttonsExtra[i].style.color = "white"
        } else{
            buttonsExtra[i].style.backgroundColor = "white"
            buttonsExtra[i].style.color = "black"
        }
    }
}

window.addEventListener('load', setup);