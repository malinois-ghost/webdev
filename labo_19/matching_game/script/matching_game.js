let global = {
    COLS:                   4,
    ROWS:                   3,
    CARD_TYPES_COUNT:       6,
    MATCH_COUNT:            2,
    IMAGE_PATH_PREFIX:      "images/",
    IMAGE_PATH_SUFFIX:      ".png",
    CARD_BACK_IMAGE:        "images/back_face.png",
    CARD_BACK_AUDIO_IMAGE:  "images/back_face_audio.png",
    AUDIO_PATH_PREFIX:      "sounds/arcade/",
    AUDIO_PATH_SUFFIX:      ".mp3",
    WAIT_TIME:              1200,
    FLIP_SOUND_DURATION:    550,

    attempts:               0,
    flippedCards:           [],
    isBusy:                 false,
    isGameRunning:          false,
    isAudioMode:            false
};

const ALL_LEGENDS = [
    "Ballistic", "Bangalore", "Fuse", "Mad_Maggie", "Revenant",
    "Alter", "Ash", "Horizon", "Octane", "Pathfinder", "Wraith",
    "Bloodhound", "Crypto", "Seer", "Sparrow", "Valkyrie", "Vantage",
    "Catalyst", "Caustic", "Rampart", "Wattson",
    "Conduit", "Gibraltar", "Lifeline", "Loba", "Mirage", "Newcastle"
];

const ALL_SOUND_TYPES = [
    "Bell", "Bloop", "Chime", "Clap", "Ding", "Ping",
    "Laser", "Zap", "Phase", "Zing", "Sweep", "Charge",
    "Crash", "Jingle", "Blip", "Down", "ZapAlt", "BlipAlt"
];

const cardSecrets = new Map();
const audioMapping = new Map();
const gameSounds = {};
const cardSounds = {};

let activeSound = null;

const playSound = (audioElement) => {
    if (activeSound) {
        activeSound.pause();
        activeSound.currentTime = 0;
    }
    const sfx = audioElement.cloneNode();
    activeSound = sfx;
    sfx.play().catch(() => {});
    sfx.addEventListener("ended", () => {
        if (activeSound === sfx) activeSound = null;
    }, { once: true });
};

const playGameSound = (name) => {
    const sfx = gameSounds[name];
    if (sfx) playSound(sfx);
};

const playCardSound = (soundName) => {
    const cached = cardSounds[soundName];
    if (cached) playSound(cached);
};

const setup = () => {
    const overlay = document.createElement("div");
    overlay.id = "gameOverOverlay";
    overlay.innerHTML = `
        <p id="overlayMessage"></p>
        <div id="finalStats"></div>
    `;
    document.body.appendChild(overlay);

    document.getElementById("startBtn").addEventListener("click", startGame);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && global.isGameRunning) abortGame();
    });

    const slider = document.getElementById("matchCountSlider");
    slider.addEventListener("input", () => {
        document.getElementById("sliderValueDisplay").textContent = slider.value;
    });

    document.getElementById("audioModeToggle").addEventListener("change", (e) => {
        global.isAudioMode = e.target.checked;
    });

    preloadGameSounds();
};

const preloadGameSounds = () => {
    ["flip", "match", "wrong", "start", "win", "abort"].forEach((name) => {
        const audio = new Audio("sounds/" + name + ".mp3");
        audio.load();
        gameSounds[name] = audio;
    });
};

const preloadCardSounds = (soundNames) => {
    soundNames.forEach((name) => {
        if (cardSounds[name]) return;
        const audio = new Audio(global.AUDIO_PATH_PREFIX + name + global.AUDIO_PATH_SUFFIX);
        audio.load();
        cardSounds[name] = audio;
    });
};

const startGame = () => {
    global.MATCH_COUNT = parseInt(document.getElementById("matchCountSlider").value);
    global.isAudioMode = document.getElementById("audioModeToggle").checked;

    global.attempts      = 0;
    global.flippedCards  = [];
    global.isBusy        = false;
    global.isGameRunning = true;

    activeSound = null;

    cardSecrets.clear();
    audioMapping.clear();

    document.body.classList.remove("busy");
    document.getElementById("attemptsDisplay").textContent = "Attempts: 0";
    document.getElementById("gameOverOverlay").classList.remove("visible");

    const startBtn = document.getElementById("startBtn");
    startBtn.textContent = "Playing...";
    startBtn.disabled = true;
    document.getElementById("matchCountSlider").disabled = true;
    document.getElementById("audioModeToggle").disabled = true;

    calculateGrid();
    buildPlayField();
    playGameSound("start");
};

const calculateGrid = () => {
    const totalCards = global.CARD_TYPES_COUNT * global.MATCH_COUNT;
    const availableW = window.innerWidth - 80;
    const availableH = window.innerHeight - 160;
    const screenRatio = availableW / availableH;

    let bestCols = 1, bestRows = totalCards, bestScore = Infinity;

    for (let c = 1; c <= totalCards; c++) {
        if (totalCards % c !== 0) continue;
        const r = totalCards / c;
        const currentRatioScore = Math.abs((c / r) - screenRatio);
        if (currentRatioScore < bestScore) {
            bestScore = currentRatioScore;
            bestCols = c;
            bestRows = r;
        }
    }

    global.COLS = bestCols;
    global.ROWS = bestRows;
    document.getElementById("playField").style.gridTemplateColumns = `repeat(${global.COLS}, 1fr)`;
};

const buildPlayField = () => {
    const playField = document.getElementById("playField");
    playField.innerHTML = "";

    const selectedLegends = pickRandom(ALL_LEGENDS, global.CARD_TYPES_COUNT);
    const selectedSounds = pickRandom(ALL_SOUND_TYPES, global.CARD_TYPES_COUNT);

    selectedLegends.forEach((legend, index) => {
        audioMapping.set(legend, selectedSounds[index]);
    });

    if (global.isAudioMode) {
        preloadCardSounds(selectedSounds);
    }

    const deck = [];
    selectedLegends.forEach((legend) => {
        for (let i = 0; i < global.MATCH_COUNT; i++) {
            deck.push(legend);
        }
    });

    shuffle(deck).forEach((legend) => {
        playField.appendChild(createCard(legend));
    });
};

const createCard = (legendName) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("card-wrapper");

    const card = document.createElement("div");
    card.classList.add("card");

    const id = crypto.randomUUID();
    card.dataset.id = id;
    cardSecrets.set(id, legendName);

    const backFace = document.createElement("div");
    backFace.classList.add("card-back");
    const backImg = document.createElement("img");

    backImg.src = global.isAudioMode ? global.CARD_BACK_AUDIO_IMAGE : global.CARD_BACK_IMAGE;
    backImg.alt = "card back";
    backFace.appendChild(backImg);

    const frontFace = document.createElement("div");
    frontFace.classList.add("card-front");

    if (global.isAudioMode) {
        frontFace.classList.add("audio-face");
        frontFace.textContent = "🔊";
    } else {
        const frontImg = document.createElement("img");
        frontFace.appendChild(frontImg);
    }

    card.appendChild(backFace);
    card.appendChild(frontFace);
    wrapper.appendChild(card);

    card.addEventListener("click", handleCardClick);
    return wrapper;
};

const handleCardClick = (event) => {
    if (global.isBusy || !global.isGameRunning) return;

    const card = event.currentTarget;
    if (card.classList.contains("flipped") || card.closest(".card-wrapper").classList.contains("removed")) return;
    if (global.flippedCards.length >= global.MATCH_COUNT) return;

    delete card.dataset.clearToken;

    const legendName = cardSecrets.get(card.dataset.id);

    card.classList.add("flipped");
    global.flippedCards.push(card);
    playGameSound("flip");

    if (global.isAudioMode) {
        const mappedSound = audioMapping.get(legendName);
        playCardSound(mappedSound);
    } else {
        const img = card.querySelector(".card-front img");
        if (img && !img.getAttribute("src")) {
            img.src = global.IMAGE_PATH_PREFIX + legendName + global.IMAGE_PATH_SUFFIX;
            img.alt = legendName;
        }
    }

    if (global.flippedCards.length === global.MATCH_COUNT) {
        global.attempts++;
        document.getElementById("attemptsDisplay").textContent = `Attempts: ${global.attempts}`;
        global.isBusy = true;
        document.body.classList.add("busy");

        if (global.isAudioMode && activeSound) {
            const soundToWaitFor = activeSound;
            const onEnd = () => {
                soundToWaitFor.removeEventListener("ended", onEnd);
                processMatchAttempt();
            };
            soundToWaitFor.addEventListener("ended", onEnd);
        } else {
            setTimeout(processMatchAttempt, global.FLIP_SOUND_DURATION);
        }
    }
};

const processMatchAttempt = () => {
    const cards = global.flippedCards;
    const firstLegend = cardSecrets.get(cards[0].dataset.id);
    const isMatch = cards.every((c) => cardSecrets.get(c.dataset.id) === firstLegend);

    cards.forEach((c) => c.classList.add(isMatch ? "match-success" : "match-fail"));
    playGameSound(isMatch ? "match" : "wrong");

    setTimeout(() => {
        if (isMatch) {
            cards.forEach((c) => {
                cardSecrets.delete(c.dataset.id);
                c.closest(".card-wrapper").classList.add("removed");
            });
        } else {
            cards.forEach((c) => {
                c.classList.remove("flipped", "match-success", "match-fail");
                const img = c.querySelector(".card-front img");
                if (img) {
                    const flipToken = Date.now() + Math.random();
                    c.dataset.clearToken = String(flipToken);
                    setTimeout(() => {
                        if (c.dataset.clearToken === String(flipToken)) {
                            img.removeAttribute("src");
                            img.removeAttribute("alt");
                        }
                    }, 400);
                }
            });
        }

        global.flippedCards = [];
        global.isBusy = false;
        document.body.classList.remove("busy");
        checkGameOver();
    }, global.WAIT_TIME);
};

const checkGameOver = () => {
    const remaining = document.querySelectorAll(".card-wrapper:not(.removed)");
    if (remaining.length === 0) showEndScreen();
};

const syncOverlay = () => {
    const field = document.getElementById("playField");
    const overlay = document.getElementById("gameOverOverlay");
    const rect = field.getBoundingClientRect();
    overlay.style.top    = rect.top  + window.scrollY + "px";
    overlay.style.left   = rect.left + window.scrollX + "px";
    overlay.style.width  = rect.width  + "px";
    overlay.style.height = rect.height + "px";
};

const showEndScreen = () => {
    global.isGameRunning = false;
    syncOverlay();
    playGameSound("win");
    document.getElementById("overlayMessage").textContent = "🏆 CHAMPION SQUAD 🏆";
    document.getElementById("finalStats").textContent = `Completed in ${global.attempts} attempts!`;
    document.getElementById("gameOverOverlay").classList.add("visible");
    resetControls();
};

const abortGame = () => {
    global.isGameRunning = false;
    global.isBusy = false;
    document.body.classList.remove("busy");
    syncOverlay();
    playGameSound("abort");
    document.getElementById("overlayMessage").textContent = "❌ Game Aborted";
    document.getElementById("finalStats").textContent = `Stopped after ${global.attempts} attempts.`;
    document.getElementById("gameOverOverlay").classList.add("visible");
    resetControls();
};

const resetControls = () => {
    const startBtn = document.getElementById("startBtn");
    startBtn.disabled = false;
    startBtn.textContent = "Play Again";
    document.getElementById("matchCountSlider").disabled = false;
    document.getElementById("audioModeToggle").disabled = false;
};

const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const pickRandom = (array, n) => shuffle([...array]).slice(0, n);

window.addEventListener("load", setup);