const updateClock = () => {
    const clockEl = document.getElementById('digital-clock');
    const solarEl = document.getElementById('solar-clock');
    if (!clockEl) return;

    const now     = new Date();
    const dayName = new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(now);
    const hours   = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    clockEl.textContent = `${dayName} ${hours}:${minutes}:${seconds}`;

    if (solarEl) {
        solarEl.textContent = `☀ ${getTrueSolarTime()}`;
    }
};

setInterval(updateClock, 1000);