// ─── Weather state (set by weather.js) ───────────────────────────────────────

let _weatherCondition = 'clear';
let _cloudCover       = 0.1;

const setWeatherCondition = (condition, cloudCover) => {
    _weatherCondition = condition;
    _cloudCover       = Math.max(0, Math.min(1, cloudCover));
};

// ─── Cloud PNG layer ──────────────────────────────────────────────────────────
//
// Each cloud is a positioned <img> element.  We keep a parallel JS array that
// tracks the same properties the old canvas version used (x, y, width, speed…)
// and apply them as CSS left/top/width each frame.
//
// Cloud "bounding box" is exposed via _getCloudBoxes() so rain/snow can use it.
//
// Replace CLOUD_PNG_SRCS with your own paths.  Multiple variants let us pick
// randomly for visual variety.

const CLOUD_PNG_SRCS = [
    'assets/clouds/cloud1.png',
    'assets/clouds/cloud2.png',
    'assets/clouds/cloud3.png',
];

const MAX_CLOUDS  = 12;
const _clouds     = [];      // data objects
const _cloudImgs  = [];      // matching <img> DOM elements

let _cloudLayer = null;

const _ensureCloudLayer = () => {
    if (_cloudLayer) return _cloudLayer;
    _cloudLayer = document.createElement('div');
    _cloudLayer.id = 'cloud-layer';
    _cloudLayer.style.cssText = [
        'position:fixed',
        'top:0','left:0',
        'width:100%','height:100%',
        'pointer-events:none',
        'z-index:2',          // above celestial-layer and horizon div
        'overflow:hidden',
    ].join(';');
    // Insert after #horizon or after body open — we want it above horizon gradient
    const horizon = document.getElementById('horizon');
    if (horizon && horizon.nextSibling) {
        horizon.parentNode.insertBefore(_cloudLayer, horizon.nextSibling);
    } else {
        document.body.prepend(_cloudLayer);
    }
    return _cloudLayer;
};

const _makeCloudImg = () => {
    const src = CLOUD_PNG_SRCS[Math.floor(Math.random() * CLOUD_PNG_SRCS.length)];
    const img = document.createElement('img');
    img.src           = src;
    img.draggable     = false;
    img.style.cssText = [
        'position:absolute',
        'pointer-events:none',
        'will-change:transform',
        'transition:opacity 2s ease',
        'opacity:0',
    ].join(';');
    img.onerror = () => {
        // Fallback: draw a soft white ellipse as background
        img.style.background    = 'radial-gradient(ellipse 60% 45% at 50% 55%, rgba(255,255,255,0.9), rgba(255,255,255,0))';
        img.style.borderRadius  = '50%';
        img.removeAttribute('src');
    };
    return img;
};

const _makeCloudData = (w, h, startOffscreen = false) => ({
    x:      startOffscreen ? w + Math.random() * 400 : Math.random() * (w + 400) - 200,
    y:      h * (0.02 + Math.random() * 0.35),
    width:  160 + Math.random() * 220,
    height: 70  + Math.random() * 80,
    speed:  0.15 + Math.random() * 0.25,
    alpha:  0.55 + Math.random() * 0.35,
});

const initClouds = () => {
    // Remove old images
    _cloudImgs.forEach(img => img.remove());
    _cloudImgs.length = 0;
    _clouds.length    = 0;

    const layer = _ensureCloudLayer();
    const w     = window.innerWidth  || 800;
    const h     = window.innerHeight || 600;

    for (let i = 0; i < MAX_CLOUDS; i++) {
        const data = _makeCloudData(w, h, false);
        const img  = _makeCloudImg();
        _clouds.push(data);
        _cloudImgs.push(img);
        layer.appendChild(img);
    }
};

// Returns array of { left, right, bottom } screen coordinates for active clouds.
// Used by rain/snow to know where to spawn particles.
const _getCloudBoxes = () => {
    const targetCount = Math.round(_cloudCover * MAX_CLOUDS);
    return _clouds.slice(0, targetCount).map(c => ({
        left:    c.x,
        right:   c.x + c.width,
        centerX: c.x + c.width / 2,
        bottom:  c.y + c.height,
        width:   c.width,
        height:  c.height,
    }));
};

const updateClouds = (elevation) => {
    const w = window.innerWidth  || 800;
    const h = window.innerHeight || 600;

    const targetCount = Math.round(_cloudCover * MAX_CLOUDS);
    const nightFade   = Math.min(1, Math.max(0, (elevation + 6) / 10));
    const baseAlpha   = _cloudCover > 0.3
        ? Math.max(nightFade * 0.4, _cloudCover * 0.85)
        : nightFade * 0.55;

    // Ensure we always have MAX_CLOUDS data + img slots
    while (_clouds.length < MAX_CLOUDS) {
        const layer = _ensureCloudLayer();
        const data  = _makeCloudData(w, h, true);
        const img   = _makeCloudImg();
        _clouds.push(data);
        _cloudImgs.push(img);
        layer.appendChild(img);
    }

    _clouds.forEach((c, i) => {
        const img    = _cloudImgs[i];
        if (!img) return;

        const active = i < targetCount;

        // Move the cloud leftward
        if (active) {
            c.x -= c.speed;
            // Recycle off-screen clouds
            if (c.x + c.width + 50 < 0) {
                Object.assign(c, _makeCloudData(w, h, true));
            }
        }

        // Apply position & size
        img.style.left   = `${c.x}px`;
        img.style.top    = `${c.y}px`;
        img.style.width  = `${c.width}px`;
        img.style.height = `${c.height}px`;
        img.style.opacity = active ? (c.alpha * baseAlpha).toFixed(3) : '0';
    });
};

// ─── Rain ─────────────────────────────────────────────────────────────────────

const RAIN_COUNT  = 180;
const _raindrops  = [];

const initRain = () => {
    _raindrops.length = 0;
    const w = window.innerWidth  || 800;
    const h = window.innerHeight || 600;
    for (let i = 0; i < RAIN_COUNT; i++) {
        _raindrops.push({
            x:   Math.random() * w,
            y:   Math.random() * h,
            spd: 8 + Math.random() * 6,
            len: 12 + Math.random() * 10,
            // index into cloud that spawned this drop (-1 = not yet assigned)
            cloudIdx: -1,
        });
    }
};

const _spawnFromCloud = (drop, w) => {
    const boxes = _getCloudBoxes();
    if (boxes.length === 0) {
        // No clouds visible — fall from top
        drop.x    = Math.random() * w;
        drop.y    = -drop.len;
    } else {
        const box = boxes[Math.floor(Math.random() * boxes.length)];
        drop.x    = box.left + Math.random() * box.width;
        drop.y    = box.bottom;
    }
};

const updateRain = (ctx, w, h) => {
    if (_weatherCondition !== 'rain' && _weatherCondition !== 'storm') return;
    ctx.save();
    ctx.strokeStyle = 'rgba(174,214,241,0.5)';
    ctx.lineWidth   = 1;
    _raindrops.forEach(d => {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 2, d.y + d.len);
        ctx.stroke();
        d.y += d.spd;
        if (d.y - d.len > h) {
            _spawnFromCloud(d, w, h);
        }
    });
    ctx.restore();
};

// ─── Snow ─────────────────────────────────────────────────────────────────────

const SNOW_COUNT  = 120;
const _snowflakes = [];

const initSnow = () => {
    _snowflakes.length = 0;
    const w = window.innerWidth  || 800;
    const h = window.innerHeight || 600;
    for (let i = 0; i < SNOW_COUNT; i++) {
        _snowflakes.push({
            x:   Math.random() * w,
            y:   Math.random() * h,
            r:   1.5 + Math.random() * 3,
            spd: 0.8 + Math.random() * 1.5,
            dr:  (Math.random() - 0.5) * 0.5,
            wo:  Math.random() * Math.PI * 2,
        });
    }
};

const _spawnSnowFromCloud = (flake, w) => {
    const boxes = _getCloudBoxes();
    if (boxes.length === 0) {
        flake.x = Math.random() * w;
        flake.y = -flake.r * 2;
    } else {
        const box = boxes[Math.floor(Math.random() * boxes.length)];
        flake.x   = box.left + Math.random() * box.width;
        flake.y   = box.bottom;
    }
};

const updateSnow = (ctx, w, h, time) => {
    if (_weatherCondition !== 'snow') return;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    _snowflakes.forEach(f => {
        f.y += f.spd;
        f.x += f.dr + Math.sin(time * 0.5 + f.wo) * 0.3;
        if (f.y - f.r * 2 > h) {
            _spawnSnowFromCloud(f, w, h);
        }
        if (f.x > w) f.x = 0;
        if (f.x < 0) f.x = w;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.restore();
};

// ─── Lightning ────────────────────────────────────────────────────────────────
//
// Architecture:
//   - One dominant trunk with sharp irregular jags (not a smooth tree)
//   - A few thin offshoots that split off the trunk at shallow angles
//   - A hard bright FLASH that peaks instantly and decays over ~400ms
//   - Bolt itself lingers slightly after the flash, fading independently
//   - Origin is inside the cloud body, not at its bottom edge

let _lightningTimer   = 3 + Math.random() * 5;
let _lightningStrikes = [];

// Build one trunk: a series of points that zigzag mostly downward.
// Each step can deviate sideways but is biased back toward a target x
// so the bolt doesn't wander too far off-screen.
const _buildTrunk = (startX, startY, targetX, targetY) => {
    const points  = [{ x: startX, y: startY }];
    let cx = startX, cy = startY;
    const totalDy = targetY - startY;
    const steps   = Math.floor(8 + Math.random() * 6);

    for (let i = 0; i < steps; i++) {
        const progress = (i + 1) / steps;
        // Mostly downward step
        cy += totalDy / steps * (0.7 + Math.random() * 0.6);
        // Horizontal jag — stronger in the middle, less at top/bottom
        const jagStrength = 28 + Math.sin(progress * Math.PI) * 40;
        cx += (Math.random() - 0.5) * jagStrength * 2;
        // Gentle pull back toward targetX so it doesn't fly off-screen
        cx += (targetX - cx) * 0.08;
        points.push({ x: cx, y: cy });
    }
    return points;
};

// Build a thin offshoot branching from a trunk point.
// Goes diagonally downward at a shallow angle, gets shorter with each sub-branch.
const _buildOffshoot = (startX, startY, dir, length) => {
    const points = [{ x: startX, y: startY }];
    let cx = startX, cy = startY;
    const steps = Math.floor(3 + Math.random() * 4);
    for (let i = 0; i < steps; i++) {
        cx += dir * (length / steps) * (0.5 + Math.random() * 0.8);
        cy += (length / steps) * (0.6 + Math.random() * 0.7);
        points.push({ x: cx, y: cy });
    }
    return points;
};

const triggerLightning = (w, h) => {
    // Origin: inside the cloud, roughly in the lower third of its body
    const boxes = _getCloudBoxes();
    let originX, originY;
    if (boxes.length > 0) {
        const box  = boxes[Math.floor(Math.random() * boxes.length)];
        originX    = box.left + box.width * (0.2 + Math.random() * 0.6);
        // Start partway into the cloud, not at the very bottom
        originY    = box.bottom - box.height * (0.1 + Math.random() * 0.25);
        // Clamp — clouds can have height:0 edge cases
        originY    = Math.max(originY, box.bottom - 60);
    } else {
        originX    = w * (0.15 + Math.random() * 0.7);
        originY    = h * 0.08;
    }

    // Target: somewhere on the ground level, slightly offset from origin
    const targetX  = originX + (Math.random() - 0.5) * w * 0.3;
    const targetY  = h * (0.72 + Math.random() * 0.2);

    const trunk    = _buildTrunk(originX, originY, targetX, targetY);

    // 2–4 offshoots attached to random trunk points (skip first and last few)
    const offshoots = [];
    const shootCount = 2 + Math.floor(Math.random() * 3);
    for (let s = 0; s < shootCount; s++) {
        const idx    = Math.floor(trunk.length * (0.2 + Math.random() * 0.6));
        const pt     = trunk[idx];
        const dir    = Math.random() < 0.5 ? -1 : 1;
        const length = (targetY - originY) * (0.15 + Math.random() * 0.2);
        offshoots.push({ points: _buildOffshoot(pt.x, pt.y, dir, length) });
    }

    // Flash state: instant peak, then two-stage decay
    _lightningStrikes.push({
        trunk,
        offshoots,
        // Flash: peaks at 1.0 immediately, hard decay
        flashAlpha:  1.0,
        // Bolt: stays bright while flash is up, then fades slower
        boltAlpha:   1.0,
        // Track frames so we can do the re-strike flicker (1–2 rapid repeats)
        age:         0,
        reStruck:    false,
    });
};

const updateLightning = (ctx, w, h) => {
    if (_weatherCondition !== 'storm') {
        _lightningStrikes = [];
        return;
    }

    _lightningTimer -= 0.016;
    if (_lightningTimer <= 0) {
        _lightningTimer = 2 + Math.random() * 7;
        triggerLightning(w, h);
    }

    // Hard cap — never more than 2 simultaneous strikes
    if (_lightningStrikes.length > 2) _lightningStrikes.length = 2;
    if (_lightningStrikes.length === 0) return;

    ctx.save();
    ctx.shadowBlur = 0;

    _lightningStrikes.forEach(s => {
        s.age++;

        if (!s.reStruck && s.age === 3 && Math.random() < 0.6) {
            s.reStruck   = true;
            s.flashAlpha = 0.85;
            s.boltAlpha  = 1.0;
        }

        // Flash — cheap flat rect, no gradient
        if (s.flashAlpha > 0) {
            ctx.fillStyle = `rgba(210,225,255,${(s.flashAlpha * 0.55).toFixed(3)})`;
            ctx.fillRect(0, 0, w, h);
            s.flashAlpha = Math.max(0, s.flashAlpha - 0.18);
        }

        if (s.boltAlpha <= 0) return;

        // ── Draw bolt ──────────────────────────────────────────────────────
        // No shadowBlur — it costs as much as drawing the whole scene again.
        // Glow is faked with 4 concentric strokes at decreasing width + opacity.
        const tracePath = (points) => {
            if (points.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
        };

        const strokeLayer = (points, lineW, color) => {
            tracePath(points);
            ctx.lineWidth   = lineW;
            ctx.strokeStyle = color;
            ctx.lineCap     = 'round';
            ctx.lineJoin    = 'round';
            ctx.stroke();
        };

        ctx.shadowBlur = 0; // ensure off

        const ba = s.boltAlpha;

        // Trunk — 4 passes wide→thin, dim→bright (no shadowBlur)
        strokeLayer(s.trunk, 28, `rgba(120,150,255,${(ba * 0.08).toFixed(3)})`);
        strokeLayer(s.trunk, 16, `rgba(150,175,255,${(ba * 0.15).toFixed(3)})`);
        strokeLayer(s.trunk,  6, `rgba(200,220,255,${(ba * 0.55).toFixed(3)})`);
        strokeLayer(s.trunk,  1.5, `rgba(255,255,255,${(ba * 0.98).toFixed(3)})`);

        // Offshoots — same approach, narrower
        s.offshoots.forEach(o => {
            strokeLayer(o.points, 12, `rgba(120,150,255,${(ba * 0.06).toFixed(3)})`);
            strokeLayer(o.points,  5, `rgba(180,205,255,${(ba * 0.35).toFixed(3)})`);
            strokeLayer(o.points,  0.8, `rgba(255,255,255,${(ba * 0.80).toFixed(3)})`);
        });

        // Bolt fades slower than the flash — lingers as a dim trace
        s.boltAlpha = Math.max(0, s.boltAlpha - (s.boltAlpha > 0.4 ? 0.055 : 0.03));
    });

    ctx.restore();

    _lightningStrikes = _lightningStrikes.filter(s => s.boltAlpha > 0 || s.flashAlpha > 0);
};

// ─── Birds ────────────────────────────────────────────────────────────────────

const BIRD_COUNT = 8;
const _birds     = [];

const makeBird = (w, h, startOffscreen = false) => ({
    x:          startOffscreen ? -80 : Math.random() * w,
    y:          h * (0.08 + Math.random() * 0.3),
    speed:      0.6 + Math.random() * 0.8,
    flapSpeed:  0.08 + Math.random() * 0.06,
    flapOffset: Math.random() * Math.PI * 2,
    size:       3 + Math.random() * 3,
    groupOff:   (Math.random() - 0.5) * 40,
});

const initBirds = () => {
    _birds.length = 0;
    const w = window.innerWidth  || 800;
    const h = window.innerHeight || 600;
    for (let i = 0; i < BIRD_COUNT; i++) _birds.push(makeBird(w, h, false));
};

const updateBirds = (ctx, w, h, elevation, time) => {
    const alpha = Math.min(1, Math.max(0, (elevation - 5) / 8));
    if (alpha <= 0) return;
    _birds.forEach(b => {
        b.x += b.speed;
        if (b.x > w + 100) Object.assign(b, makeBird(w, h, true));
        const bx  = b.x + b.groupOff;
        const by  = b.y + Math.sin(time * 0.3 + b.flapOffset) * 8;
        const ws  = b.size * 3;
        const dip = Math.sin(time * b.flapSpeed * 10 + b.flapOffset) * b.size * 1.2;
        ctx.save();
        ctx.globalAlpha  = alpha * 0.85;
        ctx.strokeStyle  = 'rgba(30,30,30,0.75)';
        ctx.lineWidth    = b.size * 0.6;
        ctx.lineCap      = 'round';
        ctx.beginPath();
        ctx.moveTo(bx - ws, by + dip);
        ctx.quadraticCurveTo(bx - ws * 0.4, by - dip * 0.5, bx, by);
        ctx.quadraticCurveTo(bx + ws * 0.4, by - dip * 0.5, bx + ws, by + dip);
        ctx.stroke();
        ctx.restore();
    });
};

// ─── Bats ─────────────────────────────────────────────────────────────────────

const BAT_COUNT = 5;
const _bats     = [];

const makeBat = (w, h, startOffscreen = false) => ({
    x:          startOffscreen ? w + 60 : Math.random() * w,
    y:          h * (0.05 + Math.random() * 0.35),
    speed:      0.5 + Math.random() * 0.7,
    flapSpeed:  0.15 + Math.random() * 0.1,
    flapOffset: Math.random() * Math.PI * 2,
    size:       2.5 + Math.random() * 2,
    wobble:     Math.random() * Math.PI * 2,
});

const initBats = () => {
    _bats.length = 0;
    const w = window.innerWidth  || 800;
    const h = window.innerHeight || 600;
    for (let i = 0; i < BAT_COUNT; i++) _bats.push(makeBat(w, h, false));
};

const updateBats = (ctx, w, h, elevation, time) => {
    const alpha = Math.min(1, Math.max(0, (5 - elevation) / 8)) *
        Math.min(1, Math.max(0, (elevation + 10) / 8));
    if (alpha <= 0) return;
    _bats.forEach(b => {
        b.x -= b.speed;
        if (b.x < -80) Object.assign(b, makeBat(w, h, true));
        const bx  = b.x;
        const by  = b.y + Math.sin(time * 0.8 + b.wobble) * 12;
        const ws  = b.size * 2.8;
        const dip = Math.sin(time * b.flapSpeed * 10 + b.flapOffset) * b.size * 1.5;
        ctx.save();
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillStyle   = 'rgba(20,15,30,0.8)';
        ctx.beginPath();
        ctx.ellipse(bx, by, b.size * 0.6, b.size * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.bezierCurveTo(bx - ws * 0.4, by - dip, bx - ws * 0.8, by + dip * 0.5, bx - ws, by + dip * 0.3);
        ctx.bezierCurveTo(bx - ws * 0.6, by + dip, bx - ws * 0.2, by + dip * 0.8, bx, by + b.size * 0.5);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.bezierCurveTo(bx + ws * 0.4, by - dip, bx + ws * 0.8, by + dip * 0.5, bx + ws, by + dip * 0.3);
        ctx.bezierCurveTo(bx + ws * 0.6, by + dip, bx + ws * 0.2, by + dip * 0.8, bx, by + b.size * 0.5);
        ctx.fill();
        ctx.restore();
    });
};

// ─── Init & render ────────────────────────────────────────────────────────────

let _atmosphereTime = 0;

const updateAtmosphere = (time) => { _atmosphereTime = time; };

const renderAtmosphere = (ctx, w, h, elevation) => {
    // Note: clouds are DOM elements updated separately in updateClouds()
    // Canvas layer: rain, snow, lightning, birds, bats
    updateRain(ctx, w, h);
    updateSnow(ctx, w, h, _atmosphereTime);
    updateLightning(ctx, w, h);
    updateBirds(ctx, w, h, elevation, _atmosphereTime);
    updateBats(ctx, w, h, elevation, _atmosphereTime);
};

const initAtmosphere = () => {
    initClouds();   // creates DOM elements
    initRain();
    initSnow();
    initBirds();
    initBats();
};