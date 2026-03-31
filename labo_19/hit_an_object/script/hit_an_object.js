// Global configuration and state object.
// Contains constants (image settings, bomb index, move delay)
// and runtime state (score, interval ID, whether the game is active).
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

// Empty object used to store references to DOM elements,
// populated during setup so they don't need to be queried repeatedly.
const dom = {};

// Initialization function that runs once the page loads.
// Grabs existing DOM elements, creates the target image and game-over overlay
// dynamically, and attaches event listeners for the start button and Escape key.
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

// Picks a random image and moves the target to a random position inside the play field.
// If allowBomb is false (used at game start), the bomb image is excluded from the selection.
// The chosen index is stored in the element's dataset so click handlers can identify it.
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

// Resets and starts a new game.
// Hides the game-over overlay, resets the score, shows the target,
// disables the start button, and begins the interval that moves the target
// every MOVE_DELAY milliseconds. The first target is always a non-bomb.
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

// Stops the game.
// Clears the movement interval, hides the target, displays the final score
// inside the game-over overlay, and re-enables the start button.
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

// Handles a click on the target image.
// If the bomb was clicked, the game ends immediately.
// Otherwise, the score is incremented, the target moves to a new position right away,
// and the movement interval is restarted so the timer resets after each successful click.
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

// Waits for the page to fully load before running setup,
// ensuring all HTML elements exist before the script tries to access them.
window.addEventListener("load", setup);