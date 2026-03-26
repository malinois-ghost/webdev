// ─── Shared helpers ───────────────────────────────────────────────────────────

const azimuthToX = (azimuth, w) => {
    const clamped = Math.max(60, Math.min(300, azimuth));
    return ((clamped - 60) / 240) * w;
};

const elevationToY = (elevation, h) => {
    const frac = 1 - (elevation + 10) / 100;
    return Math.min(h * 0.92, Math.max(h * 0.02, frac * h));
};

// ─── Stars ────────────────────────────────────────────────────────────────────

const STAR_COUNT = 220;
const _stars     = [];

const initStars = () => {
    _stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
        _stars.push({
            x:             Math.random(),
            y:             Math.random() * 0.78,
            radius:        Math.random() * 1.3 + 0.2,
            baseOpacity:   Math.random() * 0.6 + 0.4,
            twinkleSpeed:  Math.random() * 0.03 + 0.005,
            twinkleOffset: Math.random() * Math.PI * 2,
        });
    }
};

const drawStars = (ctx, w, h, elevation, time) => {
    const alpha = Math.min(1, Math.max(0, (-elevation) / 6));
    if (alpha <= 0) return;
    _stars.forEach(s => {
        const twinkle    = 0.55 + 0.45 * Math.sin(time * s.twinkleSpeed + s.twinkleOffset);
        const finalAlpha = alpha * twinkle * s.baseOpacity;
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${finalAlpha.toFixed(3)})`;
        ctx.fill();
    });
};

// ─── Lunar Phase ─────────────────────────────────────────────────────────────

const getLunarPhase = () => {
    const knownNewMoon = new Date('2026-02-20T07:32:00Z').getTime();
    const cycleMs      = 29.53058867 * 24 * 60 * 60 * 1000;
    return ((Date.now() - knownNewMoon) % cycleMs + cycleMs) % cycleMs / cycleMs;
};

// ─── Moon phase image map ─────────────────────────────────────────────────────
//
// Two options — pick whichever matches the images you have:
//
// OPTION A — 8 images (one per named phase):
//   moon_0.png = new moon
//   moon_1.png = waxing crescent
//   moon_2.png = first quarter
//   moon_3.png = waxing gibbous
//   moon_4.png = full moon
//   moon_5.png = waning gibbous
//   moon_6.png = third quarter
//   moon_7.png = waning crescent
//
// OPTION B — 30 images (one per day of the lunar cycle):
//   moon_00.png … moon_29.png
//
// Set MOON_PHASE_COUNT to 8 or 30 and adjust MOON_PHASE_SRC if needed.

const MOON_PHASE_COUNT = 8;   // ← change to 30 if you have 30 images

const MOON_PHASE_SRC = (index) => {
    if (MOON_PHASE_COUNT === 30) {
        return `./assets/moon/moon_${String(index).padStart(2, '0')}.png`;
    }
    return `./assets/moon/moon_${index}.png`;
};

// Preload all phase images so there is no flicker on first show
const _moonPhaseImgs = [];

const _preloadMoonPhases = () => {
    for (let i = 0; i < MOON_PHASE_COUNT; i++) {
        const img = new Image();
        img.src = MOON_PHASE_SRC(i);
        _moonPhaseImgs.push(img);
    }
};

const _getMoonPhaseIndex = (phase) => {
    // Offset by half a slice so each image is centred on its phase range.
    // Without this, e.g. phase 0.87 (waning crescent) maps to index 6 (last quarter).
    const offset = 0.5 / MOON_PHASE_COUNT;
    return Math.floor(((phase + offset) % 1) * MOON_PHASE_COUNT) % MOON_PHASE_COUNT;
};

// ─── PNG element helpers ──────────────────────────────────────────────────────

let _sunEl  = null;
let _moonEl = null;

const _ensureCelestialLayer = () => {
    let layer = document.getElementById('celestial-layer');
    if (!layer) {
        layer = document.createElement('div');
        layer.id = 'celestial-layer';
        layer.style.cssText = [
            'position:fixed',
            'top:0', 'left:0',
            'width:100%', 'height:100%',
            'pointer-events:none',
            'z-index:1',
        ].join(';');
        const canvas = document.getElementById('sky-canvas');
        if (canvas && canvas.nextSibling) {
            canvas.parentNode.insertBefore(layer, canvas.nextSibling);
        } else {
            document.body.prepend(layer);
        }
    }
    return layer;
};

const _makeImgEl = (src, size, id) => {
    const img = document.createElement('img');
    img.id    = id;
    img.src   = src;
    img.style.cssText = [
        'position:absolute',
        `width:${size}px`,
        `height:${size}px`,
        'transform:translate(-50%,-50%)',
        'pointer-events:none',
        'transition:opacity 1.5s ease',
        'will-change:transform,opacity',
        'opacity:0',
    ].join(';');
    img.draggable = false;
    return img;
};

const SUN_PNG_SRC = './assets/sun/sun.png';

const initCelestialElements = () => {
    _preloadMoonPhases();

    const layer = _ensureCelestialLayer();

    _sunEl = _makeImgEl(SUN_PNG_SRC, 72, 'sun-img');
    _sunEl.onerror = () => {
        _sunEl.style.background   = 'radial-gradient(circle, #fff9e0 20%, #ffe066 45%, #ff9900 70%, transparent 100%)';
        _sunEl.style.borderRadius = '50%';
        _sunEl.removeAttribute('src');
    };
    layer.appendChild(_sunEl);

    _moonEl = _makeImgEl(MOON_PHASE_SRC(0), 52, 'moon-img');
    layer.appendChild(_moonEl);
};

// ─── Update Sun element ───────────────────────────────────────────────────────

const updateSunElement = (w, h, elevation, azimuth) => {
    if (!_sunEl) return;
    if (elevation < -6) { _sunEl.style.opacity = '0'; return; }

    const x           = azimuthToX(azimuth, w);
    const y           = elevationToY(elevation, h);
    const alpha       = Math.min(1, Math.max(0, (elevation + 6) / 8));
    const horizonFrac = Math.max(0, Math.min(1, 1 - elevation / 60));
    const size        = Math.round(52 + horizonFrac * 28);

    _sunEl.style.opacity = alpha.toFixed(3);
    _sunEl.style.width   = `${size}px`;
    _sunEl.style.height  = `${size}px`;
    _sunEl.style.left    = `${x}px`;
    _sunEl.style.top     = `${y}px`;

    const sepia  = Math.round(horizonFrac * 60);
    const sat    = Math.round(100 + horizonFrac * 80);
    const bright = Math.round(100 + horizonFrac * 30);
    _sunEl.style.filter = `sepia(${sepia}%) saturate(${sat}%) brightness(${bright}%)`;
};

// ─── Update Moon element ──────────────────────────────────────────────────────

let _lastMoonPhaseIndex = -1;

const updateMoonElement = (w, h, sunElevation, sunAzimuth) => {
    if (!_moonEl) return;

    const moonAzimuthRaw = (sunAzimuth + 180) % 360;
    const moonAzimuth    = moonAzimuthRaw < 60
        ? moonAzimuthRaw + 120
        : moonAzimuthRaw > 300
            ? moonAzimuthRaw - 120
            : moonAzimuthRaw;

    const moonElevation = -sunElevation * 0.7;
    const elevAlpha     = Math.min(1, Math.max(0, (moonElevation + 10) / 15));
    const nightAlpha    = Math.min(1, Math.max(0, (-sunElevation + 3) / 15));
    const alpha         = elevAlpha * nightAlpha;

    if (alpha <= 0) { _moonEl.style.opacity = '0'; return; }

    const x     = azimuthToX(moonAzimuth, w);
    const y     = elevationToY(moonElevation, h);
    const phase = getLunarPhase();
    const idx   = _getMoonPhaseIndex(phase);
    const radius = Math.max(14, Math.min(26, 18 + (1 - moonElevation / 60) * 6));
    const size   = radius * 2 + 4;

    // Only swap src when the phase image actually changes
    if (idx !== _lastMoonPhaseIndex) {
        _lastMoonPhaseIndex = idx;
        _moonEl.src = _moonPhaseImgs[idx]?.src ?? MOON_PHASE_SRC(idx);
    }

    _moonEl.style.opacity = alpha.toFixed(3);
    _moonEl.style.width   = `${size}px`;
    _moonEl.style.height  = `${size}px`;
    _moonEl.style.left    = `${x}px`;
    _moonEl.style.top     = `${y}px`;

    // Expose for canvas glow pass
    _moonState = { x, y, radius, phase, alpha };
};

// ─── Moon glow (canvas) ───────────────────────────────────────────────────────
//
// Drawn on the sky canvas so it blends into the background.
// Intensity scales with how much of the moon is lit (full = bright cool silver,
// crescent = faint warm gold, new = nothing).

let _moonState = null;

const drawMoonGlow = (ctx) => {
    if (!_moonState) return;
    const { x, y, radius, phase, alpha } = _moonState;

    // 0 at new moon (phase=0), 1 at full (phase=0.5), 0 at new again (phase=1)
    const lit = (1 - Math.abs((phase * 2) - 1)); // 0→1→0

    if (lit < 0.04) return;

    // Colour: warm gold for crescent, cool silver-white for gibbous/full
    // lit=0.25 (quarter) → mix 50/50, lit=1 (full) → pure silver
    const warmth  = Math.max(0, 1 - lit * 2);       // 1 at crescent, 0 at full
    const r = Math.round(220 + warmth * 30);         // 220→250
    const g = Math.round(220 + warmth * 10);         // 220→230
    const b = Math.round(200 - warmth * 40);         // 200→160  (gold = less blue)

    // Glow radius scales with lit fraction — full moon has a huge halo
    const glowR = radius * (2.5 + lit * 4.5);
    const grd   = ctx.createRadialGradient(x, y, radius * 0.9, x, y, glowR);
    const peakA = (alpha * lit * 0.35).toFixed(3);
    const midA  = (alpha * lit * 0.12).toFixed(3);
    grd.addColorStop(0,   `rgba(${r},${g},${b},${peakA})`);
    grd.addColorStop(0.4, `rgba(${r},${g},${b},${midA})`);
    grd.addColorStop(1,   `rgba(${r},${g},${b},0)`);

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, glowR, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.restore();
};

// ─── God Rays (canvas) ────────────────────────────────────────────────────────

const drawGodRays = (ctx, w, h, elevation, azimuth) => {
    if (elevation < -2 || elevation > 8) return;
    const intensity = Math.max(0, 1 - Math.abs(elevation - 3) / 5);
    if (intensity <= 0) return;
    const x = azimuthToX(azimuth, w);
    const y = elevationToY(elevation, h);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = intensity * 0.12;
    for (let i = 0; i < 9; i++) {
        const spread = (i / 9) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
        const length = h * (0.6 + Math.random() * 0.3);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(spread) * length, y + Math.sin(spread) * length);
        ctx.lineWidth   = 20 + Math.random() * 30;
        ctx.strokeStyle = 'rgba(255,220,100,1)';
        ctx.stroke();
    }
    ctx.restore();
};

// ─── Per-frame update ─────────────────────────────────────────────────────────

const updateCelestialElements = (w, h, elevation, azimuth) => {
    updateSunElement(w, h, elevation, azimuth);
    updateMoonElement(w, h, elevation, azimuth);
};