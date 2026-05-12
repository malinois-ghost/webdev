let allMessages = [];

// ── Helpers ──────────────────────────────────────────────────────────────────

const emoji = new Map();

const emojify = (text) => {
    emoji.set(":)", '\uD83D\uDE0A');
    emoji.set(":(", '\uD83D\uDE22');
    emoji.set(":p", '\uD83D\uDE1B');
    emoji.set(":D", '\uD83D\uDE04');
    emoji.set(":o", '\uD83D\uDE2E');
    emoji.set(":|", '\uD83D\uDE10');
    emoji.set(";)", '\uD83D\uDE09');
    emoji.set("<3", '\u2764\uFE0F');

    emoji.forEach((value, key) => {
        while (text.includes(key)) {
            text = text.replace(key, value);
        }
    });
    return text;
}

const saveMessages = () => {
    localStorage.setItem('chatMessages', JSON.stringify(allMessages));
}

const loadMessages = () => {
    const stored = localStorage.getItem('chatMessages');
    if (stored) {
        allMessages = JSON.parse(stored);
    }
    renderMessages();
}

const saveUser = () => {
    let storedUser = sessionStorage.getItem('username');

    if (storedUser === null) {
        let options = document.querySelectorAll('#message-sender option');
        let arrayUsers = [];
        for (let i = 0; i < options.length; i++) {
            arrayUsers.push(options[i].value);
        }
        let randomUser = arrayUsers[Math.floor(Math.random() * arrayUsers.length)];
        sessionStorage.setItem('username', randomUser);
    }
    loadUser();
};

const loadUser = () => {
    let storedUser = sessionStorage.getItem('username');
    if (storedUser !== null) {
        document.getElementById('message-sender').value = storedUser;
    }
};

// ── Rendering ─────────────────────────────────────────────────────────────────

const renderMessages = () => {
    const chatBox = document.querySelector('#chat-box');
    const currentUser = document.querySelector('#message-sender').value;

    chatBox.textContent = "";

    for (let i = 0; i < allMessages.length; i++) {
        const msg = allMessages[i];

        const messageDiv = document.createElement('div');
        messageDiv.className = (msg.sender === currentUser) ? "message same-user" : "message";

        const timeSpan = document.createElement('span');
        timeSpan.className = "timestamp";
        timeSpan.textContent = msg.fullTime;

        const senderSpan = document.createElement('span');
        senderSpan.className = "sender";

        if (msg.sender === currentUser) {
            const deleteBtn = document.createElement('button');
            deleteBtn.addEventListener('click', () => deleteOne(msg.id));
            senderSpan.appendChild(deleteBtn);
        }

        const nameSpan = document.createElement('span');
        nameSpan.textContent = msg.sender;
        senderSpan.appendChild(nameSpan);

        const textP = document.createElement('p');
        textP.textContent = msg.text;
        textP.style.margin = "0";

        messageDiv.appendChild(timeSpan);
        messageDiv.appendChild(senderSpan);
        messageDiv.appendChild(textP);

        chatBox.prepend(messageDiv);
    }
}

// ── Button functions ──────────────────────────────────────────────────────────

const send = () => {
    const input = document.querySelector('#message-input');
    const sender = document.querySelector('#message-sender').value;
    const text = input.value.trim();

    if (text !== "") {
        const now = new Date();

        const dateStr = now.toLocaleDateString('nl-NL', { day: '2-digit', month: 'short', year: '2-digit' })
            .replace(/\./g, '');
        const timeStr = now.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });

        const newMessage = {
            id: Date.now(),
            sender: sender,
            text: emojify(text),
            fullTime: `${dateStr} ${timeStr}`
        };

        allMessages.push(newMessage);
        saveMessages();
        input.value = "";
        input.focus();
        renderMessages();
    }
}

const deleteLast = () => {
    const currentUser = document.querySelector('#message-sender').value;

    for (let i = allMessages.length - 1; i >= 0; i--) {
        if (allMessages[i].sender === currentUser) {
            allMessages.splice(i, 1);
            saveMessages();
            renderMessages();
            break;
        }
    }
}

const deleteOne = (id) => {
    allMessages = allMessages.filter(msg => msg.id !== id);
    saveMessages();
    renderMessages();
}

const clearAll = () => {
    localStorage.removeItem('chatMessages');
    allMessages = [];
    renderMessages();
}

// ── Setup ─────────────────────────────────────────────────────────────────────

const setup = () => {
    const sendButton = document.querySelector('#send-button');
    const clearAllButton = document.querySelector('#clear-all');
    const userSelect = document.querySelector('#message-sender');

    sendButton.addEventListener('click', send);
    sendButton.addEventListener('keydown', e => {
        if (e.key === "Enter") handleSearch();
    });
    clearAllButton.addEventListener('click', clearAll);

    document.addEventListener('keydown', (enter) => {
        if (enter.key === 'Enter') send();
    });

    document.addEventListener('keydown', (del) => {
        if (del.key === 'Delete') clearAll();
    });

    document.addEventListener('keydown', (esc) => {
        if (esc.key === 'Escape') deleteLast();
    });

    userSelect.addEventListener('change', (e) => {
        sessionStorage.setItem('username', e.target.value);
        renderMessages();
    });

    saveUser();
    loadMessages();

    document.querySelector('#message-input').focus();
}

window.addEventListener('load', setup);