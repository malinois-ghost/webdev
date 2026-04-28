const setup = () => {
    const input = document.querySelector('.searchInput');
    const searchBtn = document.querySelector('.searchBtn');

    searchBtn.addEventListener("click", handleSearch);
    input.addEventListener('keydown', e => {
        if (e.key === "Enter") handleSearch();
    });

    document.getElementById("sortNewest").addEventListener("click", sortHistoryNewest);
    document.getElementById("sortOldest").addEventListener("click", sortHistoryOldest);

    loadHistory();
};

const google = query => ({
    title: "Google",
    url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
    color: "card-google"
});

const youtube = query => ({
    title: "YouTube",
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
    color: "card-youtube"
});

const x = query => ({
    title: "X",
    url: `https://x.com/hashtag/${encodeURIComponent(query)}`,
    color: "card-x"
});

const instagram = query => ({
    title: "Instagram",
    url: `https://www.instagram.com/explore/tags/${encodeURIComponent(query)}/`,
    color: "card-instagram"
});

const homePage = () => ({
    title: "Home Page",
    url: `https://malinois-ghost.github.io/webdev/`,
    color: "card-home"
});

const commands = new Map([
    ["/g", google],
    ["/y", youtube],
    ["/x", x],
    ["/i", instagram],
    ["/h", homePage],
]);

const noQueryCommands = new Set(["/h"]);

const handleSearch = () => {
    const text = document.querySelector(".searchInput").value.trim();

    if (!text.startsWith("/")) {
        alert("Invalid command");
        return;
    }

    const prefix = text.substring(0, 2);
    const query = text.substring(3);

    const commandFn = commands.get(prefix);

    if (!commandFn) {
        alert("Unknown command prefix");
        return;
    }

    if (!query && !noQueryCommands.has(prefix)) {
        alert("Geen zoekopdracht ingegeven");
        return;
    }

    const { title, url, color } = commandFn(query);

    window.open(url, "_blank");

    saveToHistory(title, query || "", url, color);
    addCard(title, query || "", url, color);

    document.querySelector(".searchInput").value = "";
};

const saveToHistory = (title, text, url, color) => {
    let history = localStorage.getItem("history");

    if (history) {
        history = JSON.parse(history);
    } else {
        history = [];
    }

    const readable = new Date().toLocaleString();
    const iso = new Date().toISOString();

    history.push({ title, text, url, color, timestamp: readable, ts: iso });
    localStorage.setItem("history", JSON.stringify(history));
};

const loadHistory = () => {
    let history = localStorage.getItem("history");

    if (history) {
        history = JSON.parse(history);
    } else {
        history = [];
    }

    history = history.map(item => {
        if (!item.ts) {
            item.ts = new Date(item.timestamp).toISOString();
        }
        return item;
    });

    localStorage.setItem("history", JSON.stringify(history));
    renderHistory(history);
};

const sortHistoryNewest = () => {
    let history = localStorage.getItem("history");

    if (history) {
        history = JSON.parse(history);
    } else {
        history = [];
    }

    history.sort((a, b) => new Date(a.ts) - new Date(b.ts));
    localStorage.setItem("history", JSON.stringify(history));
    renderHistory(history);
};

const sortHistoryOldest = () => {
    let history = localStorage.getItem("history");

    if (history) {
        history = JSON.parse(history);
    } else {
        history = [];
    }

    history.sort((a, b) => new Date(b.ts) - new Date(a.ts));
    localStorage.setItem("history", JSON.stringify(history));
    renderHistory(history);
};

const renderHistory = (history) => {
    const container = document.getElementById("historyContainer");
    container.innerHTML = "";

    history.forEach(({ title, text, url, color, timestamp }) => {
        addCard(title, text, url, color, timestamp);
    });
};


const addCard = (title, text, url, color, timestamp) => {
    const container = document.getElementById("historyContainer");

    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4 mb-4";

    const card = document.createElement("div");
    card.className = `card h-100 ${color}`;

    const body = document.createElement("div");
    body.className = "card-body";

    const h5 = document.createElement("h5");
    h5.className = "card-title";
    h5.textContent = title;

    const p = document.createElement("p");
    p.className = "card-text";
    p.textContent = text;

    const a = document.createElement("a");
    a.className = "btn btn-light btn-sm";
    a.href = url;
    a.target = "_blank";
    a.textContent = "Go!";

    body.appendChild(h5);
    body.appendChild(p);
    body.appendChild(a);

    const footer = document.createElement("div");
    footer.className = "card-footer";
    footer.textContent = timestamp || new Date().toLocaleString();

    footer.style.color = "white";
    footer.style.borderTop = "1px solid white";
    footer.style.backgroundColor = "rgba(0,0,0,0.4)";

    card.appendChild(body);
    card.appendChild(footer);
    col.appendChild(card);

    container.prepend(col);
};

window.addEventListener("load", setup);
