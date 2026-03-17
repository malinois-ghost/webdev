const updateClock = () => {
    const clockElement = document.getElementById('digital-clock');
    if (!clockElement) return;

    const now     = new Date();
    const dayName = new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(now);
    const hours   = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    clockElement.textContent = `${dayName} ${hours}:${minutes}:${seconds}`;
};

setInterval(updateClock, 1000);