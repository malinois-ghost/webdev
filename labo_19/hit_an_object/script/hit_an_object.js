let global = {
    IMAGE_COUNT: 5,
    IMAGE_SIZE: 48,
    IMAGE_PATH_PREFIX: "images/",
    IMAGE_PATH_SUFFIX: ".png",
    BOMB_INDEX: 0,
    MOVE_DELAY: 1000,
    score: 0,
    timeoutId: 0,
    gameRunning: false
};

const setup = () => {
    const playField = document.getElementById("playField");

    const target = document.createElement("img");
    target.id  = "target";
    target.alt = "object";
    target.src = global.IMAGE_PATH_PREFIX + "0" + global.IMAGE_PATH_SUFFIX;
    target.style.display = "none";
    target.addEventListener("click", handleTargetClick);
    playField.appendChild(target);

    const overlay = document.createElement("div");
    overlay.id = "gameOverOverlay";
    overlay.innerHTML = `
        <p>💥 GAME OVER 💥</p>
        <div id="finalScore"></div>
    `;
    playField.appendChild(overlay);

    document.getElementById("startBtn").addEventListener("click", startGame);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") gameOver();
    });
};

const tick = () => {
    if (!global.gameRunning) return;
    moveTarget();
    changeImage();
    global.timeoutId = setTimeout(tick, global.MOVE_DELAY);
};

const randomInt = (max) => Math.floor(Math.random() * max);

const moveTarget = () => {
    const playField = document.getElementById("playField");
    const target = document.getElementById("target");

    const maxLeft = playField.clientWidth  - global.IMAGE_SIZE;
    const maxTop  = playField.clientHeight - global.IMAGE_SIZE;

    target.style.left = randomInt(maxLeft) + "px";
    target.style.top  = randomInt(maxTop)  + "px";
};

const changeImage = () => {
    const target = document.getElementById("target");
    const index  = randomInt(global.IMAGE_COUNT);
    target.src   = global.IMAGE_PATH_PREFIX + index + global.IMAGE_PATH_SUFFIX;
    target.dataset.index = String(index);
    return index;
};

const changeImageNoBomb = () => {
    const target = document.getElementById("target");
    let index;
    do { index = randomInt(global.IMAGE_COUNT); }
    while (index === global.BOMB_INDEX);
    target.src   = global.IMAGE_PATH_PREFIX + index + global.IMAGE_PATH_SUFFIX;
    target.dataset.index = String(index);
};

const updateScoreDisplay = () => {
    document.getElementById("scoreDisplay").textContent = "Score: " + global.score;
};

const handleTargetClick = (event) => {
    event.stopPropagation();

    if (!global.gameRunning) return;

    clearTimeout(global.timeoutId);

    const clickedIndex = parseInt(event.target.dataset.index);

    if (clickedIndex === global.BOMB_INDEX) {
        gameOver();
    } else {
        global.score++;
        updateScoreDisplay();

        moveTarget();
        changeImageNoBomb();
        global.timeoutId = setTimeout(tick, global.MOVE_DELAY);
    }
};

const gameOver = () => {
    global.gameRunning = false;
    clearTimeout(global.timeoutId);

    document.getElementById("target").style.display = "none";

    const overlay = document.getElementById("gameOverOverlay");
    document.getElementById("finalScore").textContent =
        "Jouw score: " + global.score;
    overlay.classList.add("visible");

    document.getElementById("startBtn").textContent = "Opnieuw";
    document.getElementById("startBtn").disabled = false;
};

const startGame = () => {
    global.score       = 0;
    global.gameRunning = true;
    clearTimeout(global.timeoutId);
    updateScoreDisplay();

    document.getElementById("gameOverOverlay").classList.remove("visible");

    const target = document.getElementById("target");
    target.style.display = "block";

    moveTarget();
    changeImageNoBomb();
    global.timeoutId = setTimeout(tick, global.MOVE_DELAY);

    document.getElementById("startBtn").textContent = "Bezig...";
    document.getElementById("startBtn").disabled = true;
};

window.addEventListener("load", setup);