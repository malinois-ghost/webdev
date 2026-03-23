const setup = () => {
    document.querySelectorAll("li").forEach(li => li.className = "listitem");

    const img = document.createElement("img");
    img.setAttribute("src", "images/foto.jpg");
    img.setAttribute("alt", "foto hond");
    img.setAttribute("id", "img");
    document.body.appendChild(img);

    const footer = document.createElement("footer");
    const a = document.createElement("a");
    a.setAttribute("href", "../oefeningen_nodes.html");
    a.textContent = "Oefeningen nodes";
    footer.appendChild(a);
    document.body.appendChild(footer);
};

window.addEventListener("load", setup);