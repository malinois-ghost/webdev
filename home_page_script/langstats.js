// ─── Language Stats + Code Stats ──────────────────────────────────────────────
//
// Widget 1 (links): GitHub-stijl taalbalk met percentages per taal
// Widget 2 (ernaast): Totaal karakters / lijnen / bestanden / grootte
//
// Beide widgets worden gevoed door één centrale scan.

// ─── Extensie → taal database ─────────────────────────────────────────────────

const EXT_MAP = {
    // Web
    '.html':    { name: 'HTML',        color: '#e34c26' },
    '.htm':     { name: 'HTML',        color: '#e34c26' },
    '.css':     { name: 'CSS',         color: '#563d7c' },
    '.js':      { name: 'JavaScript',  color: '#f1e05a' },
    '.mjs':     { name: 'JavaScript',  color: '#f1e05a' },
    '.cjs':     { name: 'JavaScript',  color: '#f1e05a' },
    '.ts':      { name: 'TypeScript',  color: '#3178c6' },
    '.tsx':     { name: 'TypeScript',  color: '#3178c6' },
    '.jsx':     { name: 'JavaScript',  color: '#f1e05a' },
    '.vue':     { name: 'Vue',         color: '#41b883' },
    '.svelte':  { name: 'Svelte',      color: '#ff3e00' },
    // Data
    '.json':    { name: 'JSON',        color: '#292929' },
    '.xml':     { name: 'XML',         color: '#0060ac' },
    '.yaml':    { name: 'YAML',        color: '#cb171e' },
    '.yml':     { name: 'YAML',        color: '#cb171e' },
    '.toml':    { name: 'TOML',        color: '#9c4221' },
    '.csv':     { name: 'CSV',         color: '#237a22' },
    // Backend
    '.php':     { name: 'PHP',         color: '#4f5d95' },
    '.py':      { name: 'Python',      color: '#3572A5' },
    '.rb':      { name: 'Ruby',        color: '#701516' },
    '.java':    { name: 'Java',        color: '#b07219' },
    '.kt':      { name: 'Kotlin',      color: '#A97BFF' },
    '.cs':      { name: 'C#',          color: '#178600' },
    '.go':      { name: 'Go',          color: '#00ADD8' },
    '.rs':      { name: 'Rust',        color: '#dea584' },
    '.c':       { name: 'C',           color: '#555555' },
    '.cpp':     { name: 'C++',         color: '#f34b7d' },
    '.h':       { name: 'C',           color: '#555555' },
    '.swift':   { name: 'Swift',       color: '#F05138' },
    // Markup & docs
    '.md':      { name: 'Markdown',    color: '#083fa1' },
    '.markdown':{ name: 'Markdown',    color: '#083fa1' },
    '.svg':     { name: 'SVG',         color: '#ff9900' },
    '.sql':     { name: 'SQL',         color: '#e38c00' },
    // Shell
    '.sh':      { name: 'Shell',       color: '#89e051' },
    '.bash':    { name: 'Shell',       color: '#89e051' },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const _extOf = (url) =>
    url.match(/(\.[a-zA-Z0-9]+)(?:\?|#|$)/)?.[1]?.toLowerCase() ?? null;

const _langOf = (url) => {
    const ext = _extOf(url);
    return ext ? (EXT_MAP[ext] ?? { name: 'Overig', color: '#8b8b8b' }) : null;
};

const _fetchText = async (url) => {
    try {
        const res = await fetch(url, { cache: 'force-cache' });
        return res.ok ? await res.text() : null;
    } catch { return null; }
};

const _nonEmptyLines = (text) =>
    text.split('\n').filter(l => l.trim().length > 0).length;

// Dynamische grootte formatting: B / KB / MB / GB
const _formatSize = (bytes) => {
    if (bytes < 1024)                return `${bytes} B`;
    if (bytes < 1024 * 1024)        return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 ** 3)          return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
    return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
};

// Grote getallen verkorten: 1500 → 1.5K, 1200000 → 1.2M
const _formatNumber = (n) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M`
        : n >= 1_000   ? `${(n / 1_000).toFixed(1)}K`
            : `${n}`;

const _extractLinkedAssets = (html, baseUrl) => {
    const found = [];
    for (const m of html.matchAll(/href=["']([^"'#?]+\.css)/gi)) found.push(m[1]);
    for (const m of html.matchAll(/src=["']([^"'#?]+\.js)/gi))   found.push(m[1]);
    const base = new URL(baseUrl, window.location.href);
    return found.map(p => { try { return new URL(p, base).href; } catch { return null; } })
        .filter(Boolean);
};

const _splitHtml = (html) => {
    const result = {};
    const addTo  = (lang, text) => {
        if (!text.trim()) return;
        result[lang] = (result[lang] ?? '') + text;
    };
    let rest = html
        .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi,   (_, i) => { addTo('CSS', i);        return ''; })
        .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (_, i) => { addTo('JavaScript', i); return ''; });
    addTo('HTML', rest);
    return result;
};

// ─── Centrale scan ─────────────────────────────────────────────────────────────

const _scanProjects = async () => {
    const rootUrls = new Set(labs.flatMap(lab => lab.projects.map(p => p.url)));

    const langChars = {};   // { langName: charCount }
    const stats = { chars: 0, lines: 0, files: 0, bytes: 0 };
    const seen  = new Set();

    const addText = (langName, text) => {
        if (!langName || !text) return;
        langChars[langName] = (langChars[langName] ?? 0) + text.length;
        stats.chars += text.length;
        stats.lines += _nonEmptyLines(text);
    };

    const processUrl = async (rawUrl) => {
        const url = new URL(rawUrl, window.location.href).href;
        if (seen.has(url)) return;
        seen.add(url);

        const langDef = _langOf(rawUrl);
        if (!langDef) return;

        const text = await _fetchText(url);
        if (text === null) return;

        stats.files++;
        stats.bytes += new TextEncoder().encode(text).length;

        if (langDef.name === 'HTML') {
            const parts = _splitHtml(text);
            Object.entries(parts).forEach(([l, t]) => addText(l, t));
            const assets = _extractLinkedAssets(text, url);
            await Promise.all(assets.map(a => processUrl(a)));
        } else {
            addText(langDef.name, text);
        }
    };

    await Promise.allSettled([...rootUrls].map(processUrl));
    Object.keys(langChars).forEach(k => { if (!langChars[k]) delete langChars[k]; });

    return { totals: langChars, stats };
};

// ─── Kleur opzoeken ────────────────────────────────────────────────────────────

const _colorOf = (langName) =>
    Object.values(EXT_MAP).find(d => d.name === langName)?.color ?? '#8b8b8b';

// ─── Gedeelde stijlen ──────────────────────────────────────────────────────────

const _injectLsStyles = () => {
    if (document.getElementById('ls-style')) return;
    const s = document.createElement('style');
    s.id = 'ls-style';
    s.textContent = `
        /* ── Gedeelde widget basis ── */
        .ls-widget {
            position: fixed;
            top: 14px;
            z-index: 999;
            background: var(--ui-surface, rgba(18,28,36,0.9));
            border: 1px solid var(--ui-surface-alt, rgba(255,255,255,0.08));
            border-radius: 10px;
            backdrop-filter: blur(12px);
            box-shadow: 0 4px 20px rgba(0,0,0,0.4),
                        0 0 15px 2px var(--ui-glow, rgba(0,0,0,0));
            font-family: 'Courier New', Courier, monospace;
            opacity: 0;
            transform: translateY(-6px);
            transition: opacity 0.5s ease, transform 0.5s ease,
                        background-color 1s ease, box-shadow 1s ease;
            pointer-events: none;
        }
        .ls-widget.ls-ready {
            opacity: 1;
            transform: translateY(0);
        }

        /* ── Talen widget ── */
        #lang-stats-widget {
            left: 14px;
            padding: 9px 13px 11px;
            min-width: 178px;
            max-width: 220px;
        }
        .ls-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 7px;
        }
        .ls-title {
            font-size: 0.62rem;
            font-weight: bold;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--ui-text-muted, #7a9ab0);
        }
        .ls-subtitle {
            font-size: 0.58rem;
            color: var(--ui-text-muted, #7a9ab0);
            opacity: 0.65;
        }
        .ls-bar {
            display: flex;
            height: 5px;
            border-radius: 3px;
            overflow: hidden;
            gap: 1px;
            margin-bottom: 9px;
        }
        .ls-seg {
            border-radius: 2px;
            transition: width 0.7s cubic-bezier(.4,0,.2,1);
            min-width: 2px;
        }
        .ls-legend {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .ls-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.67rem;
            color: var(--ui-text, #c8d8e8);
            transition: color 1s ease;
        }
        .ls-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            flex-shrink: 0;
        }
        .ls-name { flex: 1; opacity: 0.82; }
        .ls-pct {
            font-weight: bold;
            color: var(--ui-text-hero, #ddeeff);
            transition: color 1s ease;
            min-width: 36px;
            text-align: right;
        }

        /* ── Stats widget ── */
        #code-stats-widget {
            left: 248px;
            padding: 9px 13px 11px;
            min-width: 148px;
        }
        .cs-title {
            font-size: 0.62rem;
            font-weight: bold;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--ui-text-muted, #7a9ab0);
            margin-bottom: 9px;
        }
        .cs-rows {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        .cs-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            font-size: 0.67rem;
        }
        .cs-label {
            color: var(--ui-text-muted, #7a9ab0);
            opacity: 0.85;
        }
        .cs-value {
            font-weight: bold;
            color: var(--ui-text-hero, #ddeeff);
            transition: color 1s ease;
            text-align: right;
        }
        .cs-divider {
            border: none;
            border-top: 1px solid var(--ui-surface-alt, rgba(255,255,255,0.08));
            margin: 3px 0;
        }

        /* ── Scannen animatie ── */
        .ls-scanning {
            font-size: 0.63rem;
            color: var(--ui-text-muted, #7a9ab0);
            animation: ls-pulse 1.3s ease-in-out infinite;
        }
        @keyframes ls-pulse {
            0%, 100% { opacity: 0.35; }
            50%       { opacity: 1;   }
        }

        /* ── Mobiel: stats widget onder talenwidget ── */
        @media (max-width: 520px) {
            #code-stats-widget {
                left: 14px;
                top: auto;
                bottom: 70px;
            }
        }
    `;
    document.head.appendChild(s);
};

// ─── Talen widget ──────────────────────────────────────────────────────────────

const _createLangWidget = () => {
    let w = document.getElementById('lang-stats-widget');
    if (w) return w;
    w = document.createElement('div');
    w.id        = 'lang-stats-widget';
    w.className = 'ls-widget';
    w.innerHTML = `
        <div class="ls-header">
            <span class="ls-title">Talen</span>
            <span class="ls-subtitle"></span>
        </div>
        <div class="ls-bar"></div>
        <div class="ls-legend"><div class="ls-scanning">Scannen…</div></div>
    `;
    document.body.appendChild(w);
    return w;
};

const _renderLangWidget = (totals, widget) => {
    const grand = Object.values(totals).reduce((a, b) => a + b, 0);
    if (!grand) return;

    const sorted = Object.entries(totals)
        .map(([name, chars]) => ({ name, chars, pct: (chars / grand) * 100 }))
        .sort((a, b) => b.chars - a.chars);

    widget.querySelector('.ls-subtitle').textContent = _formatSize(grand);

    const bar = widget.querySelector('.ls-bar');
    bar.innerHTML = '';
    sorted.forEach(({ name, pct }) => {
        const seg = document.createElement('div');
        seg.className        = 'ls-seg';
        seg.style.width      = `${Math.max(pct, 0.5).toFixed(2)}%`;
        seg.style.background = _colorOf(name);
        seg.title            = `${name}: ${pct.toFixed(2)}%`;
        bar.appendChild(seg);
    });

    const legend = widget.querySelector('.ls-legend');
    legend.innerHTML = '';
    sorted.forEach(({ name, pct }) => {
        const item = document.createElement('div');
        item.className = 'ls-item';
        item.innerHTML = `
            <span class="ls-dot" style="background:${_colorOf(name)}"></span>
            <span class="ls-name">${name}</span>
            <span class="ls-pct">${pct.toFixed(2)}%</span>
        `;
        legend.appendChild(item);
    });

    widget.classList.add('ls-ready');
};

// ─── Stats widget ───────────────────────────────────────────────────────────────

const _createStatsWidget = () => {
    let w = document.getElementById('code-stats-widget');
    if (w) return w;
    w = document.createElement('div');
    w.id        = 'code-stats-widget';
    w.className = 'ls-widget';
    w.innerHTML = `
        <div class="cs-title">Code stats</div>
        <div class="cs-rows"><div class="ls-scanning">Scannen…</div></div>
    `;
    document.body.appendChild(w);
    return w;
};

const _renderStatsWidget = (stats, widget) => {
    const rows = widget.querySelector('.cs-rows');
    rows.innerHTML = '';

    const addRow = (label, value) => {
        const row = document.createElement('div');
        row.className = 'cs-row';
        row.innerHTML = `<span class="cs-label">${label}</span><span class="cs-value">${value}</span>`;
        rows.appendChild(row);
    };

    const addDivider = () => {
        const hr = document.createElement('hr');
        hr.className = 'cs-divider';
        rows.appendChild(hr);
    };

    addRow('Karakters', _formatNumber(stats.chars));
    addRow('Lijnen',    _formatNumber(stats.lines));
    addDivider();
    addRow('Bestanden', `${stats.files}`);
    addRow('Grootte',   _formatSize(stats.bytes));

    widget.classList.add('ls-ready');
};

// ─── Init ──────────────────────────────────────────────────────────────────────

const initLangStats = async () => {
    _injectLsStyles();

    const langWidget  = _createLangWidget();
    const statsWidget = _createStatsWidget();

    const { totals, stats } = await _scanProjects();

    _renderLangWidget(totals, langWidget);
    _renderStatsWidget(stats, statsWidget);
};