let _userLat = 51.5;
let _longitudeCorrection = 0;
let _torchMax = 0;

// ─── Solar Elevation ──────────────────────────────────────────────────────────

const getSolarElevation = () => {
    const now = new Date();
    const hours = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600 + _longitudeCorrection;

    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now - startOfYear) / 86400000);

    const declination = 23.45 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81));
    const hourAngle = (hours - 12) * 15;

    const latRad  = _userLat * Math.PI / 180;
    const declRad = declination * Math.PI / 180;
    const haRad   = hourAngle * Math.PI / 180;

    return Math.asin(
        Math.sin(latRad) * Math.sin(declRad) +
        Math.cos(latRad) * Math.cos(declRad) * Math.cos(haRad)
    ) * 180 / Math.PI;
};

// ─── Sky Colour ───────────────────────────────────────────────────────────────

const lerpColor = (a, b, t) => [
    Math.round(a[0] + t * (b[0] - a[0])),
    Math.round(a[1] + t * (b[1] - a[1])),
    Math.round(a[2] + t * (b[2] - a[2])),
];

const SKY_STOPS = [
    { elev: -18, color: [4,   6,  18] },
    { elev:  -8, color: [8,  10,  35] },
    { elev:  -4, color: [22,  18,  65] },
    { elev:  -1, color: [70,  40, 100] },
    { elev:   0, color: [190,  85,  40] },
    { elev:   2, color: [215, 120,  55] },
    { elev:   5, color: [230, 160,  80] },
    { elev:  10, color: [115, 170, 215] },
    { elev:  20, color: [70,  135, 205] },
    { elev:  35, color: [48,  110, 190] },
    { elev:  55, color: [32,   90, 175] },
    { elev:  90, color: [20,   70, 155] },
];

const getSkyColorRgb = (elevation) => {
    if (elevation <= SKY_STOPS[0].elev) return SKY_STOPS[0].color;
    if (elevation >= SKY_STOPS[SKY_STOPS.length - 1].elev) return SKY_STOPS[SKY_STOPS.length - 1].color;

    for (let i = 0; i < SKY_STOPS.length - 1; i++) {
        const a = SKY_STOPS[i], b = SKY_STOPS[i + 1];
        if (elevation >= a.elev && elevation <= b.elev) {
            const t = (elevation - a.elev) / (b.elev - a.elev);
            return lerpColor(a.color, b.color, t);
        }
    }
};

// ─── UI Theming ───────────────────────────────────────────────────────────────

const updateUITheme = (rgb) => {
    const brightness = 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
    const t = brightness / 255;

    document.documentElement.style.setProperty('--sky-brightness', t.toFixed(3));

    const darken  = (c, amt) => Math.max(0,   Math.min(255, c - amt));
    const lighten = (c, amt) => Math.max(0,   Math.min(255, c + amt));

    const setUIVars = (s, s2, tx, tm) => {
        const f = c => `rgb(${c[0]},${c[1]},${c[2]})`;
        document.documentElement.style.setProperty('--ui-surface',     f(s));
        document.documentElement.style.setProperty('--ui-surface-alt', f(s2));
        document.documentElement.style.setProperty('--ui-text',        f(tx));
        document.documentElement.style.setProperty('--ui-text-muted',  f(tm));
    };

    const f2 = (name, c) => document.documentElement.style.setProperty(name, `rgb(${c[0]},${c[1]},${c[2]})`);

    if (t > 0.45) {
        setUIVars(
            rgb.map(c => lighten(c, 140)),
            rgb.map(c => lighten(c, 90)),
            rgb.map(c => darken(c, 30)),
            rgb.map(c => darken(c, 50))
        );
        f2('--ui-text-hero', rgb.map(c => lighten(c, 140)));
    } else {
        setUIVars(
            rgb.map(c => darken(c, 140)),
            rgb.map(c => darken(c, 90)),
            rgb.map(c => lighten(c, 20)),
            rgb.map(c => lighten(c, 35))
        );
        f2('--ui-text-hero', rgb.map(c => darken(c, 140)));
    }
};

// ─── Sky Update ───────────────────────────────────────────────────────────────

const updateSky = () => {
    const elevation = getSolarElevation();
    const rgb = getSkyColorRgb(elevation);

    document.body.style.backgroundColor = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;

    updateUITheme(rgb);

    const torchMax = elevation < 8
        ? Math.min(1, Math.max(0, (8 - elevation) / 13))
        : 0;

    _torchMax = torchMax;
    document.documentElement.style.setProperty('--torch-max', torchMax.toFixed(3));

    const currentIntensity = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--torch-intensity') || '0'
    );
    if (currentIntensity > torchMax) {
        document.documentElement.style.setProperty('--torch-intensity', '0');
    }
};

// ─── Geolocation ─────────────────────────────────────────────────────────────

const initGeolocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            _userLat = pos.coords.latitude;

            const tzOffsetHours    = -new Date().getTimezoneOffset() / 60;
            const solarOffsetHours = pos.coords.longitude / 15;
            _longitudeCorrection   = solarOffsetHours - tzOffsetHours;

            updateSky();
        },
        () => {
            _userLat = 51.5;
            _longitudeCorrection = 0;
        },
        { timeout: 8000 }
    );
};

setInterval(updateSky, 60000);