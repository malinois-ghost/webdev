let global = {
    IMAGE_COUNT:            5,
    IMAGE_SIZE:             48,
    IMAGE_PATH_PREFIX:      "images/",
    IMAGE_PATH_SUFFIX:      ".png",
    BOMB_INDEX:             0,
    MOVE_DELAY:             1000,

    score:                  0,
    intervalId:             null,
    isGameRunning:          false
};

const dom = {};

const setup = () => {
    dom.playField = document.getElementById("playField");
    dom.startBtn = document.getElementById("startBtn");
    dom.scoreDisplay = document.getElementById("scoreDisplay");

    dom.target = document.createElement("img");
    dom.target.id = "target";
    dom.target.style.display = "none";
    dom.target.style.position = "absolute";
    dom.target.addEventListener("click", handleTargetClick);
    dom.playField.appendChild(dom.target);

    const overlayElement = document.createElement("div");
    overlayElement.id = "gameOverOverlay";
    overlayElement.innerHTML = `<p>💥 GAME OVER 💥</p><div id="finalScore"></div>`;
    dom.playField.appendChild(overlayElement);
    dom.overlay = overlayElement;

    dom.startBtn.addEventListener("click", startGame);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && global.isGameRunning) {
            console.log("Game gestopt via Escape");
            endGame();
        }
    });
};

const setTarget = (allowBomb = true) => {
    let index;
    do {
        index = Math.floor(Math.random() * global.IMAGE_COUNT);
    } while (!allowBomb && index === global.BOMB_INDEX);

    dom.target.src = `${global.IMAGE_PATH_PREFIX}${index}${global.IMAGE_PATH_SUFFIX}`;
    dom.target.dataset.index = index;

    const maxLeft = dom.playField.clientWidth - global.IMAGE_SIZE;
    const maxTop = dom.playField.clientHeight - global.IMAGE_SIZE;
    dom.target.style.left = `${Math.floor(Math.random() * maxLeft)}px`;
    dom.target.style.top = `${Math.floor(Math.random() * maxTop)}px`;

    console.log(`Afbeelding versprongen! Huidige interval: ${global.MOVE_DELAY}ms`);
};

const startGame = () => {
    if (dom.overlay) {
        dom.overlay.classList.remove("visible");
    }

    global.score = 0;
    global.isGameRunning = true;
    dom.scoreDisplay.textContent = `Score: 0`;
    dom.target.style.display = "block";
    dom.startBtn.disabled = true;

    clearInterval(global.intervalId);
    setTarget(false);

    global.intervalId = setInterval(() => {
        setTarget(true);
    }, global.MOVE_DELAY);
};

const endGame = () => {
    global.isGameRunning = false;

    clearInterval(global.intervalId);

    dom.target.style.display = "none";

    const finalScoreElement = document.getElementById("finalScore");
    if (finalScoreElement) {
        finalScoreElement.textContent = `Je score: ${global.score}`;
    }

    dom.overlay.classList.add("visible");

    dom.startBtn.disabled = false;
    dom.startBtn.textContent = "Opnieuw";
};

const handleTargetClick = (event) => {
    event.stopPropagation();
    if (!global.isGameRunning) return;

    const clickedIndex = parseInt(event.target.dataset.index);

    if (clickedIndex === global.BOMB_INDEX) {
        endGame();
    } else {
        global.score++;
        dom.scoreDisplay.textContent = `Score: ${global.score}`;

        clearInterval(global.intervalId);

        setTarget(true);

        global.intervalId = setInterval(() => {
            setTarget(true);
        }, global.MOVE_DELAY);
    }
};

window.addEventListener("load", setup);