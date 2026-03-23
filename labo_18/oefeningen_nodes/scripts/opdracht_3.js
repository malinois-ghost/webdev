const setup = () => {
    document.getElementById("btnAdd").addEventListener("click", voegToe);
};

const voegToe = () => {
    const p = document.createElement("p");
    p.textContent = "Nieuw p-element";
    document.getElementById("myDIV").appendChild(p);
};

window.addEventListener("load", setup);