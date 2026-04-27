/* ==============================
   Colorpicker Ultimate – JS
   ============================== */

/* ── State ── */
let H = 0, S = 1, V = 1, A = 100;
let mixAColor = { r: 231, g: 76, b: 60 };
let mixBColor = { r: 52, g: 152, b: 219 };
let activeMixSlot = 'A';
let currentFmt = 'hex';
let dragging = false;

const $ = s => document.querySelector(s);

/* ── Color Math ── */

const hsv2rgb = (h, s, v) => {
    const i = Math.floor(h / 60) % 6;
    const f = h / 60 - Math.floor(h / 60);
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    let r, g, b;
    switch (i) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

const rgb2hsv = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;
    if (d > 0) {
        if (max === r)      h = ((g - b) / d + 6) % 6;
        else if (max === g) h = (b - r) / d + 2;
        else                h = (r - g) / d + 4;
        h *= 60;
    }
    return { h, s, v };
};

const rgb2hsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    const d = max - min;
    if (d === 0) return { h: 0, s: 0, l };
    const s = d / (1 - Math.abs(2 * l - 1));
    let h;
    if (max === r)      h = ((g - b) / d + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else                h = (r - g) / d + 4;
    return { h: h * 60, s, l };
};

const hsl2rgb = (h, s, l) => {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if      (h < 60)  { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else              { r = c; b = x; }
    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
    };
};

const rgb2cmyk = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const k = 1 - Math.max(r, g, b);
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    return {
        c: Math.round((1 - r - k) / (1 - k) * 100),
        m: Math.round((1 - g - k) / (1 - k) * 100),
        y: Math.round((1 - b - k) / (1 - k) * 100),
        k: Math.round(k * 100)
    };
};

const cmyk2rgb = (c, m, y, k) => {
    c /= 100; m /= 100; y /= 100; k /= 100;
    return {
        r: Math.round(255 * (1 - c) * (1 - k)),
        g: Math.round(255 * (1 - m) * (1 - k)),
        b: Math.round(255 * (1 - y) * (1 - k))
    };
};

const rgb2lab = (r, g, b) => {
    let R = r / 255, G = g / 255, B = b / 255;
    R = R > 0.04045 ? Math.pow((R + 0.055) / 1.055, 2.4) : R / 12.92;
    G = G > 0.04045 ? Math.pow((G + 0.055) / 1.055, 2.4) : G / 12.92;
    B = B > 0.04045 ? Math.pow((B + 0.055) / 1.055, 2.4) : B / 12.92;
    let x = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
    let y = (R * 0.2126 + G * 0.7152 + B * 0.0722);
    let z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.0883;
    const f = t => t > 0.008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16 / 116;
    x = f(x); y = f(y); z = f(z);
    return {
        L: Math.round(116 * y - 16),
        a: Math.round(500 * (x - y)),
        b: Math.round(200 * (y - z))
    };
};

const rgb2hex = (r, g, b) =>
    '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');

const hex2rgb = hex => {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16)
    };
};

const rgb2munsell = (r, g, b) => {
    const hsl = rgb2hsl(r, g, b);
    const h = hsl.h, s = hsl.s, l = hsl.l;
    const huenames = ['R', 'YR', 'Y', 'GY', 'G', 'BG', 'B', 'PB', 'P', 'RP'];
    const idx = Math.floor(((h + 18) % 360) / 36) % 10;
    const hname = huenames[idx];
    const hn = Math.round(((h % 36) / 36) * 10) || 5;
    const val = Math.round(l * 10);
    const chroma = Math.round(s * 14);
    return `${hn}${hname} ${val}/${chroma}`;
};

const rgb2ncs = (r, g, b) => {
    const { k } = rgb2cmyk(r, g, b);
    const blackness = k;
    const hsl = rgb2hsl(r, g, b);
    const h = hsl.h;
    const chromaticness = Math.round(hsl.s * 50);
    let hue;
    if      (h < 30)  hue = 'R';
    else if (h < 90)  hue = `Y${Math.round((h - 30) / 60 * 100)}R`;
    else if (h < 150) hue = `G${Math.round((h - 90) / 60 * 100)}Y`;
    else if (h < 210) hue = `B${Math.round((h - 150) / 60 * 100)}G`;
    else if (h < 270) hue = 'B';
    else if (h < 330) hue = `R${Math.round((h - 270) / 60 * 100)}B`;
    else              hue = 'R';
    return `NCS S ${blackness}-${chromaticness}${hue}`;
};

/* ── Core Helpers ── */

const getRGB = () => hsv2rgb(H, S, V);

const setFromRGB = (r, g, b) => {
    const hsv = rgb2hsv(r, g, b);
    H = hsv.h; S = hsv.s; V = hsv.v;
    updatePreview();
};

/* ── Wheel Drawing ── */

const drawWheel = () => {
    const canvas = $('#wheelCanvas');
    const ctx = canvas.getContext('2d');
    const sz = 200, cx = 100, cy = 100, R = 96;
    const img = ctx.createImageData(sz, sz);
    for (let py = 0; py < sz; py++) {
        for (let px = 0; px < sz; px++) {
            const dx = px - cx, dy = py - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > R) { img.data[(py * sz + px) * 4 + 3] = 0; continue; }
            const angle = ((Math.atan2(dy, dx) * 180 / Math.PI) + 360) % 360;
            const sat = dist / R;
            const { r, g, b } = hsv2rgb(angle, sat, 1);
            const i = (py * sz + px) * 4;
            img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255;
        }
    }
    ctx.putImageData(img, 0, 0);
};

const updateWheelCursor = () => {
    const cx = 100, cy = 100, R = 96;
    const angle = H * Math.PI / 180;
    const dist = S * R;
    const x = Math.round(cx + Math.cos(angle) * dist);
    const y = Math.round(cy + Math.sin(angle) * dist);
    const cur = $('#wheelCursor');
    cur.style.left = x + 'px';
    cur.style.top = y + 'px';
    const { r, g, b } = getRGB();
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    cur.style.borderColor = lum > 128 ? '#333' : '#fff';
};

/* ── Preview & Output ── */

const updatePreview = () => {
    const { r, g, b } = getRGB();
    $('#preview-strip').style.background = `rgba(${r},${g},${b},${A / 100})`;
    $('#alphaSlider').value = String(A);
    $('#alpha-val').textContent = A + '%';
    updateWheelCursor();
    updateFormattedOutput();
    buildInputs();
    updateMixResult();
    saveSliderValues();
};

const updateFormattedOutput = () => {
    const { r, g, b } = getRGB();
    let txt = '';
    switch (currentFmt) {
        case 'hex': {
            txt = rgb2hex(r, g, b);
            if (A < 100) txt += Math.round(A / 100 * 255).toString(16).padStart(2, '0');
            break;
        }
        case 'rgb': {
            txt = A < 100
                ? `rgba(${r}, ${g}, ${b}, ${(A / 100).toFixed(2)})`
                : `rgb(${r}, ${g}, ${b})`;
            break;
        }
        case 'hsl': {
            const hl = rgb2hsl(r, g, b);
            txt = A < 100
                ? `hsla(${Math.round(hl.h)}, ${Math.round(hl.s * 100)}%, ${Math.round(hl.l * 100)}%, ${(A / 100).toFixed(2)})`
                : `hsl(${Math.round(hl.h)}, ${Math.round(hl.s * 100)}%, ${Math.round(hl.l * 100)}%)`;
            break;
        }
        case 'hsv': {
            txt = `hsv(${Math.round(H)}, ${Math.round(S * 100)}%, ${Math.round(V * 100)}%)`;
            break;
        }
        case 'cmyk': {
            const ck = rgb2cmyk(r, g, b);
            txt = `cmyk(${ck.c}%, ${ck.m}%, ${ck.y}%, ${ck.k}%)`;
            break;
        }
        case 'lab': {
            const lb = rgb2lab(r, g, b);
            txt = `Lab(${lb.L}, ${lb.a}, ${lb.b})`;
            break;
        }
        case 'munsell': {
            txt = rgb2munsell(r, g, b);
            break;
        }
        case 'ncs': {
            txt = rgb2ncs(r, g, b);
            break;
        }
    }
    $('#formatted-output').textContent = txt;
};

/* ── Channel Inputs ── */

const buildInputs = () => {
    const { r, g, b } = getRGB();
    const grid = $('#inputs-grid');
    grid.innerHTML = '';

    const rows = getInputRows(r, g, b);
    rows.forEach(row => {
        const div = document.createElement('div');
        div.className = 'irow';
        div.innerHTML = `
      <label>${row.label}</label>
      <input type="range" min="${row.min}" max="${row.max}" value="${row.val}" step="${row.step || 1}" data-channel="${row.key}">
      <input type="number" min="${row.min}" max="${row.max}" value="${row.val}" step="${row.step || 1}" data-channel="${row.key}">
    `;
        div.querySelectorAll('input').forEach(inp => {
            inp.addEventListener('input', () => {
                const v = parseFloat(inp.value);
                div.querySelectorAll('input').forEach(o => { o.value = String(v); });
                applyChannel(row.key, v, r, g, b);
            });
        });
        grid.appendChild(div);
    });

    // Alpha row
    const arow = document.createElement('div');
    arow.className = 'irow';
    arow.innerHTML = `
    <label>A</label>
    <input type="range" min="0" max="100" value="${A}" step="1">
    <input type="number" min="0" max="100" value="${A}" step="1">
  `;
    arow.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('input', () => {
            A = parseInt(inp.value, 10);
            $('#alphaSlider').value = String(A);
            $('#alpha-val').textContent = A + '%';
            arow.querySelectorAll('input').forEach(o => { o.value = String(A); });
            updatePreview();
        });
    });
    grid.appendChild(arow);
};

const getInputRows = (r, g, b) => {
    switch (currentFmt) {
        case 'hex':
        case 'rgb':
            return [
                { label: 'R', key: 'r', min: 0, max: 255, val: r },
                { label: 'G', key: 'g', min: 0, max: 255, val: g },
                { label: 'B', key: 'b', min: 0, max: 255, val: b }
            ];
        case 'hsl': {
            const hl = rgb2hsl(r, g, b);
            return [
                { label: 'H', key: 'hslH', min: 0, max: 360, val: Math.round(hl.h) },
                { label: 'S', key: 'hslS', min: 0, max: 100, val: Math.round(hl.s * 100) },
                { label: 'L', key: 'hslL', min: 0, max: 100, val: Math.round(hl.l * 100) }
            ];
        }
        case 'hsv':
            return [
                { label: 'H', key: 'hsvH', min: 0, max: 360, val: Math.round(H) },
                { label: 'S', key: 'hsvS', min: 0, max: 100, val: Math.round(S * 100) },
                { label: 'V', key: 'hsvV', min: 0, max: 100, val: Math.round(V * 100) }
            ];
        case 'cmyk': {
            const ck = rgb2cmyk(r, g, b);
            return [
                { label: 'C', key: 'cmykC', min: 0, max: 100, val: ck.c },
                { label: 'M', key: 'cmykM', min: 0, max: 100, val: ck.m },
                { label: 'Y', key: 'cmykY', min: 0, max: 100, val: ck.y },
                { label: 'K', key: 'cmykK', min: 0, max: 100, val: ck.k }
            ];
        }
        case 'lab': {
            const lb = rgb2lab(r, g, b);
            return [
                { label: 'L', key: 'labL', min: 0,    max: 100, val: lb.L },
                { label: 'a', key: 'labA', min: -128, max: 127,  val: lb.a },
                { label: 'b', key: 'labB', min: -128, max: 127,  val: lb.b }
            ];
        }
        default:
            return [
                { label: 'R', key: 'r', min: 0, max: 255, val: r },
                { label: 'G', key: 'g', min: 0, max: 255, val: g },
                { label: 'B', key: 'b', min: 0, max: 255, val: b }
            ];
    }
};

const applyChannel = (key, v, r, g, b) => {
    let nr = r, ng = g, nb = b;
    switch (key) {
        case 'r': nr = v; break;
        case 'g': ng = v; break;
        case 'b': nb = v; break;
        case 'hslH': { const hl = rgb2hsl(r, g, b); ({ r: nr, g: ng, b: nb } = hsl2rgb(v,        hl.s,      hl.l));     break; }
        case 'hslS': { const hl = rgb2hsl(r, g, b); ({ r: nr, g: ng, b: nb } = hsl2rgb(hl.h, v / 100,      hl.l));     break; }
        case 'hslL': { const hl = rgb2hsl(r, g, b); ({ r: nr, g: ng, b: nb } = hsl2rgb(hl.h,     hl.s,  v / 100));     break; }
        case 'hsvH': H = v;       updatePreview(); return;
        case 'hsvS': S = v / 100; updatePreview(); return;
        case 'hsvV': V = v / 100; updatePreview(); return;
        case 'cmykC':
        case 'cmykM':
        case 'cmykY':
        case 'cmykK': {
            const ck = rgb2cmyk(r, g, b);
            const map = { cmykC: 'c', cmykM: 'm', cmykY: 'y', cmykK: 'k' };
            ck[map[key]] = v;
            ({ r: nr, g: ng, b: nb } = cmyk2rgb(ck.c, ck.m, ck.y, ck.k));
            break;
        }
        case 'labL':
        case 'labA':
        case 'labB':
            return; // read-only approximation
    }
    const hsv = rgb2hsv(nr, ng, nb);
    H = hsv.h; S = hsv.s; V = hsv.v;
    updatePreview();
};

/* ── Named Colors ── */

const NAMED_COLORS = {
    'red': [255,0,0], 'green': [0,128,0], 'blue': [0,0,255],
    'white': [255,255,255], 'black': [0,0,0], 'yellow': [255,255,0],
    'cyan': [0,255,255], 'magenta': [255,0,255], 'orange': [255,165,0],
    'purple': [128,0,128], 'pink': [255,192,203], 'brown': [165,42,42],
    'gray': [128,128,128], 'grey': [128,128,128],
    'light blue': [173,216,230], 'dark blue': [0,0,139],
    'sky blue': [135,206,235], 'cornflower blue': [100,149,237],
    'light green': [144,238,144], 'dark green': [0,100,0],
    'light red': [255,102,102], 'dark red': [139,0,0],
    'coral': [255,127,80], 'salmon': [250,128,114],
    'lime': [0,255,0], 'navy': [0,0,128], 'teal': [0,128,128],
    'olive': [128,128,0], 'maroon': [128,0,0], 'aqua': [0,255,255],
    'lavender': [230,230,250], 'indigo': [75,0,130],
    'violet': [238,130,238], 'gold': [255,215,0], 'silver': [192,192,192],
    'crimson': [220,20,60], 'turquoise': [64,224,208],
    'beige': [245,245,220], 'ivory': [255,255,240],
    'khaki': [240,230,140], 'mint': [189,252,201],
    'rose': [255,0,127], 'jade': [0,168,107], 'amber': [255,191,0],
    'charcoal': [54,69,79], 'peach': [255,218,185],
    'mustard': [255,219,88], 'mauve': [224,176,255],
    'plum': [142,69,133], 'fuchsia': [255,0,255],
    'tan': [210,180,140], 'wheat': [245,222,179],
    'periwinkle': [204,204,255], 'cerulean': [0,123,167],
    'chartreuse': [127,255,0], 'vermilion': [227,66,52],
    'sienna': [160,82,45], 'umber': [99,81,71],
    'ochre': [204,119,34], 'ecru': [194,178,128],
    'off white': [255,250,240], 'cream': [255,253,208],
    'midnight blue': [25,25,112], 'royal blue': [65,105,225],
    'steel blue': [70,130,180], 'powder blue': [176,224,230],
    'forest green': [34,139,34], 'sea green': [46,139,87],
    'spring green': [0,255,127], 'hot pink': [255,105,180],
    'deep pink': [255,20,147], 'light pink': [255,182,193],
    'tomato': [255,99,71], 'firebrick': [178,34,34],
    'chocolate': [210,105,30], 'saddle brown': [139,69,19],
    'dark orange': [255,140,0], 'dark violet': [148,0,211],
    'medium purple': [147,112,219], 'light purple': [191,128,255]
};

/* ── Natural Language Parser ── */

const parseNL = str => {
    str = str.trim();

    // Hex
    if (/^#?[0-9a-fA-F]{3,8}$/.test(str)) {
        try {
            const c = hex2rgb(str.startsWith('#') ? str : '#' + str);
            if (!isNaN(c.r)) { setFromRGB(c.r, c.g, c.b); return true; }
        } catch (e) {}
    }

    // rgb / rgba
    const rgbM = str.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i);
    if (rgbM) {
        setFromRGB(parseInt(rgbM[1], 10), parseInt(rgbM[2], 10), parseInt(rgbM[3], 10));
        if (rgbM[4] !== undefined) A = Math.round(parseFloat(rgbM[4]) * 100);
        updatePreview();
        return true;
    }

    // hsl / hsla
    const hslM = str.match(/hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?(?:\s*,\s*([\d.]+))?\s*\)/i);
    if (hslM) {
        const { r, g, b } = hsl2rgb(parseFloat(hslM[1]), parseFloat(hslM[2]) / 100, parseFloat(hslM[3]) / 100);
        setFromRGB(r, g, b);
        if (hslM[4] !== undefined) A = Math.round(parseFloat(hslM[4]) * 100);
        updatePreview();
        return true;
    }

    // hsv
    const hsvM = str.match(/hsv\(\s*([\d.]+)\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*\)/i);
    if (hsvM) {
        H = parseFloat(hsvM[1]);
        S = parseFloat(hsvM[2]) / 100;
        V = parseFloat(hsvM[3]) / 100;
        updatePreview();
        return true;
    }

    // cmyk
    const cmykM = str.match(/cmyk\(\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*\)/i);
    if (cmykM) {
        const { r, g, b } = cmyk2rgb(parseFloat(cmykM[1]), parseFloat(cmykM[2]), parseFloat(cmykM[3]), parseFloat(cmykM[4]));
        setFromRGB(r, g, b);
        return true;
    }

    // Lab
    const labM = str.match(/lab\(\s*([\d.-]+)\s*,\s*([\d.-]+)\s*,\s*([\d.-]+)\s*\)/i);
    if (labM) {
        const L = parseFloat(labM[1]), a = parseFloat(labM[2]), bv = parseFloat(labM[3]);
        const fy = (L + 16) / 116, fx = a / 500 + fy, fz = fy - bv / 200;
        const d = 6 / 29;
        const cube = t => t > d ? t * t * t : 3 * d * d * (t - 4 / 29);
        let X = 0.95047 * cube(fx), Y = 1.00000 * cube(fy), Z = 1.08883 * cube(fz);
        let R = X *  3.2406 + Y * -1.5372 + Z * -0.4986;
        let G = X * -0.9689 + Y *  1.8758 + Z *  0.0415;
        let B = X *  0.0557 + Y * -0.2040 + Z *  1.0570;
        const lin = v => v > 0.0031308 ? 1.055 * Math.pow(v, 1 / 2.4) - 0.055 : 12.92 * v;
        setFromRGB(
            Math.min(255, Math.max(0, Math.round(lin(R) * 255))),
            Math.min(255, Math.max(0, Math.round(lin(G) * 255))),
            Math.min(255, Math.max(0, Math.round(lin(B) * 255)))
        );
        return true;
    }

    // Named — longest match wins
    const lo = str.toLowerCase();
    let best = null, bestLen = 0;
    for (const [name, rgb] of Object.entries(NAMED_COLORS)) {
        if (lo.includes(name) && name.length > bestLen) {
            best = rgb; bestLen = name.length;
        }
    }
    if (best) { setFromRGB(best[0], best[1], best[2]); return true; }

    return false;
};

/* ── Status Helper ── */

const showStatus = (msg, ok = true) => {
    const el = $('#nl-status');
    el.textContent = msg;
    el.className = msg ? (ok ? 'ok' : 'err') : '';
};

/* ── Wheel Interaction ── */

const pickFromWheel = e => {
    const canvas = $('#wheelCanvas');
    const rect = canvas.getBoundingClientRect();
    const scaleX = 200 / rect.width;
    const scaleY = 200 / rect.height;
    const cx = 100, cy = 100, R = 96;
    const x = (e.clientX - rect.left) * scaleX - cx;
    const y = (e.clientY - rect.top)  * scaleY - cy;
    const dist = Math.min(Math.sqrt(x * x + y * y), R);
    H = ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360; S = dist / R;
    updatePreview();
};

/* ── UI Controls ── */

$('#alphaSlider').addEventListener('input', () => {
    A = parseInt($('#alphaSlider').value, 10);
    $('#alpha-val').textContent = A + '%';
    updatePreview();
});

$('#btnInvert').addEventListener('click', () => {
    const { r, g, b } = getRGB();
    setFromRGB(255 - r, 255 - g, 255 - b);
});

$('#nlInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        const ok = parseNL($('#nlInput').value);
        showStatus(
            ok ? 'Color applied!' : 'Not recognized — try hex, rgb(), hsl(), hsv(), cmyk(), Lab(), or a color name',
            ok
        );
        if (ok) setTimeout(() => showStatus(''), 1500);
    }
});

$('#nlInput').addEventListener('input', () => {
    if (parseNL($('#nlInput').value)) showStatus('');
});

document.querySelectorAll('.ftab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.ftab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFmt = btn.dataset.fmt;
        updatePreview();
    });
});

$('#formatted-output').addEventListener('click', () => {
    navigator.clipboard.writeText($('#formatted-output').textContent).then(() => {
        $('#copy-flash').textContent = 'Copied!';
        setTimeout(() => { $('#copy-flash').textContent = ''; }, 1500);
    });
});

/* ── Swatch Management ── */

const addSwatchToDOM = (r, g, b, a = 100) => {
    const color = `rgba(${r},${g},${b},${a / 100})`;
    const wrap = document.createElement('div');
    wrap.className = 'swatch-wrap';
    wrap.dataset.r = String(r);
    wrap.dataset.g = String(g);
    wrap.dataset.b = String(b);
    wrap.dataset.a = String(a);

    const sw = document.createElement('div');
    sw.className = 'swatch';
    sw.style.background = color;
    sw.addEventListener('click', () => {
        setFromRGB(r, g, b);
        A = a;
        $('#alphaSlider').value = String(A);
        $('#alpha-val').textContent = A + '%';
        updatePreview();
    });

    const del = document.createElement('button');
    del.className = 'del-swatch';
    del.textContent = '×';
    del.addEventListener('click', () => { wrap.remove(); saveSwatches(); });

    wrap.appendChild(sw);
    wrap.appendChild(del);
    $('#saved-swatches').appendChild(wrap);
};

$('#btnSave').addEventListener('click', () => {
    const { r, g, b } = getRGB();
    const isDuplicate = [...document.querySelectorAll('.swatch-wrap')].some(wrap => {
        return (
            parseInt(wrap.dataset.r, 10) === r &&
            parseInt(wrap.dataset.g, 10) === g &&
            parseInt(wrap.dataset.b, 10) === b &&
            parseInt(wrap.dataset.a, 10) === A
        );
    });
    if (!isDuplicate) {
        addSwatchToDOM(r, g, b, A);
        saveSwatches();
    }
});

/* ── Mixer ── */

$('#mixA').addEventListener('click', () => {
    activeMixSlot = 'A';
    $('#mixA').classList.add('active-mix');
    $('#mixB').classList.remove('active-mix');
});

$('#mixB').addEventListener('click', () => {
    activeMixSlot = 'B';
    $('#mixB').classList.add('active-mix');
    $('#mixA').classList.remove('active-mix');
});

$('#btnAddMix').addEventListener('click', () => {
    const { r, g, b } = getRGB();
    if (activeMixSlot === 'A') {
        mixAColor = { r, g, b };
        $('#mixA').style.background = `rgb(${r},${g},${b})`;
    } else {
        mixBColor = { r, g, b };
        $('#mixB').style.background = `rgb(${r},${g},${b})`;
    }
    updateMixResult();
});

$('#mixRatio').addEventListener('input', () => {
    const v = parseInt($('#mixRatio').value, 10);
    $('#ratioLabelA').textContent = v + '%';
    $('#ratioLabelB').textContent = (100 - v) + '%';
    updateMixResult();
});

const updateMixResult = () => {
    const t = parseInt($('#mixRatio').value, 10) / 100;
    const r = Math.round(mixAColor.r * t + mixBColor.r * (1 - t));
    const g = Math.round(mixAColor.g * t + mixBColor.g * (1 - t));
    const b = Math.round(mixAColor.b * t + mixBColor.b * (1 - t));
    const el = $('#mix-result');
    el.style.background = `rgb(${r},${g},${b})`;
    el.dataset.r = String(r);
    el.dataset.g = String(g);
    el.dataset.b = String(b);
};

$('#use-mix-btn').addEventListener('click', () => {
    const el = $('#mix-result');
    setFromRGB(
        parseInt(el.dataset.r || '0', 10),
        parseInt(el.dataset.g || '0', 10),
        parseInt(el.dataset.b || '0', 10)
    );
});

$('#add-mix-btn').addEventListener('click', () => {
    const el = $('#mix-result');
    const r = parseInt(el.dataset.r || '0', 10);
    const g = parseInt(el.dataset.g || '0', 10);
    const b = parseInt(el.dataset.b || '0', 10);
    const a = 100;
    const isDuplicate = [...document.querySelectorAll('.swatch-wrap')].some(wrap => {
        return (
            parseInt(wrap.dataset.r, 10) === r &&
            parseInt(wrap.dataset.g, 10) === g &&
            parseInt(wrap.dataset.b, 10) === b &&
            parseInt(wrap.dataset.a, 10) === a
        );
    });
    if (!isDuplicate) {
        addSwatchToDOM(r, g, b, a);
        saveSwatches();
    }
});

/* ── LocalStorage ── */

const saveSwatches = () => {
    try {
        const swatches = [...document.querySelectorAll('.swatch')].map(s => s.style.background);
        localStorage.setItem('savedColors_home_page', JSON.stringify(swatches));
    } catch (e) {}
};

const saveSliderValues = () => {
    try {
        const { r, g, b } = getRGB();
        localStorage.setItem('r_home_page', String(r));
        localStorage.setItem('g_home_page', String(g));
        localStorage.setItem('b_home_page', String(b));
        localStorage.setItem('a_home_page', String(A));
    } catch (e) {}
};

const loadData = () => {
    try {
        const rStr = localStorage.getItem('r_home_page');
        const gStr = localStorage.getItem('g_home_page');
        const bStr = localStorage.getItem('b_home_page');
        const aStr = localStorage.getItem('a_home_page');

        if (rStr !== null && gStr !== null && bStr !== null) {
            setFromRGB(parseInt(rStr, 10), parseInt(gStr, 10), parseInt(bStr, 10));
        }
        if (aStr !== null) {
            A = parseInt(aStr, 10);
        }

        const savedRaw = localStorage.getItem('savedColors_home_page');
        const saved = savedRaw ? JSON.parse(savedRaw) : [];
        saved.forEach(color => {
            const m = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/);
            if (!m) return;
            const alpha = m[4] !== undefined ? Math.round(parseFloat(m[4]) * 100) : 100;
            addSwatchToDOM(parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10), alpha);
        });
    } catch (e) {}
};

/* ── Init ── */

window.addEventListener('load', () => {
    const canvas = $('#wheelCanvas');
    canvas.addEventListener('mousedown', e => { dragging = true; pickFromWheel(e); });
    canvas.addEventListener('touchstart', e => { e.preventDefault(); pickFromWheel(e.touches[0]); }, { passive: false });
    canvas.addEventListener('touchmove',  e => { e.preventDefault(); pickFromWheel(e.touches[0]); }, { passive: false });

    drawWheel();
    loadData();
    updatePreview();
});

document.addEventListener('mousemove', e => { if (dragging) pickFromWheel(e); });
document.addEventListener('mouseup', () => { dragging = false; });