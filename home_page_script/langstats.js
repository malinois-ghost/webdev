// ─── Configuratie & Database ─────────────────────────────────────────────────

const IGNORE_LIST = ['min.js', 'min.css', 'analytics', 'font-awesome', 'favicon', 'node_modules'];

const EXT_MAP = {
    '.html':    { name: 'HTML',        color: '#e34c26' },
    '.css':     { name: 'CSS',         color: '#563d7c' },
    '.js':      { name: 'JavaScript',  color: '#f1e05a' },
    '.ts':      { name: 'TypeScript',  color: '#3178c6' },
    '.json':    { name: 'JSON',        color: '#292929' },
    '.md':      { name: 'Markdown',    color: '#083fa1' },
    '.php':     { name: 'PHP',         color: '#4f5d95' },
    '.py':      { name: 'Python',      color: '#3572A5' },
    '.sql':     { name: 'SQL',         color: '#e38c00' },
    '.svg':     { name: 'SVG',         color: '#ff9900' }
};

const MEDIA_EXTS = [
    '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico', // Afbeeldingen
    '.mp4', '.webm', '.ogg',                                   // Video
    '.mp3', '.wav', '.flac'                                    // Audio
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const _extOf = (url) => url.match(/(\.[a-zA-Z0-9]+)(?:\?|#|$)/)?.[1]?.toLowerCase() ?? null;

const _isMedia = (url) => MEDIA_EXTS.includes(_extOf(url));

const _langOf = (url) => {
    const ext = _extOf(url);
    if (!ext) return EXT_MAP['.html']; // Homepage fix
    return EXT_MAP[ext] ?? null;
};

const _fetchAsset = async (url) => {
    try {
        const res = await fetch(url, { cache: 'force-cache' });
        if (!res.ok) return null;
        const blob = await res.blob();
        return {
            size: blob.size,
            text: _isMedia(url) ? null : await blob.text()
        };
    } catch { return null; }
};

const _formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const _formatNumber = (n) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M` :
        n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : `${n}`;

const _extractAssets = (html, baseUrl) => {
    const found = [];
    const patterns = [
        /href=["']([^"'#?]+\.(?:css|html|php))/gi,
        /src=["']([^"'#?]+\.(?:js|png|jpg|jpeg|gif|webp|svg|mp4|webm|mp3|wav))/gi,
        /srcset=["']([^"'#? ]+\.[a-z]{3,4})/gi
    ];
    patterns.forEach(regex => {
        for (const m of html.matchAll(regex)) found.push(m[1]);
    });
    const base = new URL(baseUrl, window.location.href);
    return [...new Set(found)]
        .map(p => { try { return new URL(p, base).href; } catch { return null; } })
        .filter(url => url && !IGNORE_LIST.some(term => url.toLowerCase().includes(term)));
};

const _splitHtml = (html) => {
    const result = {};
    const addTo = (lang, text) => {
        if (!text.trim()) return;
        result[lang] = (result[lang] ?? '') + text;
    };
    let rest = html
        .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, i) => { addTo('CSS', i); return ''; })
        .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (_, i) => { addTo('JavaScript', i); return ''; });
    addTo('HTML', rest);
    return result;
};

// ─── Centrale scan ─────────────────────────────────────────────────────────────

const _scanProjects = async () => {
    // FIX 1: Check of 'labs' bestaat. Zo niet, wacht even of gebruik een lege array.
    const labsData = (typeof labs !== 'undefined') ? labs : [];

    const startUrls = [
        window.location.href,
        ...labsData.flatMap(lab => lab.projects ? lab.projects.map(p => p.url) : [])
    ];

    const rootUrls = new Set(startUrls);
    const langChars = {};
    const stats = { chars: 0, lines: 0, files: 0, bytes: 0 };
    const seen = new Set();

    const processUrl = async (rawUrl) => {
        let urlObj;
        try {
            urlObj = new URL(rawUrl, window.location.href);
        } catch { return; }

        const url = urlObj.href;

        // FIX 2: CORS BEVEILIGING
        // Scan alleen bestanden op hetzelfde domein (bijv. localhost of jouw-site.be)
        if (urlObj.hostname !== window.location.hostname) {
            return;
        }

        if (seen.has(url) || IGNORE_LIST.some(term => url.toLowerCase().includes(term))) return;
        seen.add(url);

        const asset = await _fetchAsset(url);
        if (!asset) return;

        stats.files++;
        stats.bytes += asset.size;

        if (asset.text !== null) {
            const langDef = _langOf(url);
            if (langDef) {
                if (langDef.name === 'HTML') {
                    const parts = _splitHtml(asset.text);
                    Object.entries(parts).forEach(([l, t]) => {
                        langChars[l] = (langChars[l] ?? 0) + t.length;
                        stats.chars += t.length;
                        stats.lines += t.split('\n').filter(line => line.trim()).length;
                    });
                    const deeper = _extractAssets(asset.text, url);
                    await Promise.all(deeper.map(a => processUrl(a)));
                } else {
                    langChars[langDef.name] = (langChars[langDef.name] ?? 0) + asset.text.length;
                    stats.chars += asset.text.length;
                    stats.lines += asset.text.split('\n').filter(line => line.trim()).length;
                }
            }
        }
    };

    await Promise.allSettled([...rootUrls].map(processUrl));
    return { totals: langChars, stats };
};

// ─── UI & Rendering ───────────────────────────────────────────────────────────

const _injectLsStyles = () => {
    if (document.getElementById('ls-style')) return;
    const s = document.createElement('style');
    s.id = 'ls-style';
    s.textContent = `
        .ls-widget { position: fixed; top: 14px; z-index: 999; background: var(--ui-surface, rgba(18,28,36,0.9)); border: 1px solid var(--ui-surface-alt, rgba(255,255,255,0.08)); border-radius: 10px; backdrop-filter: blur(12px); box-shadow: 0 4px 20px rgba(0,0,0,0.4); font-family: 'Courier New', Courier, monospace; opacity: 0; transform: translateY(-6px); transition: opacity 0.5s ease, transform 0.5s ease; pointer-events: none; }
        .ls-widget.ls-ready { opacity: 1; transform: translateY(0); }
        #lang-stats-widget { left: 14px; padding: 9px 13px 11px; min-width: 178px; max-width: 220px; }
        .ls-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 7px; }
        .ls-title { font-size: 0.62rem; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ui-text-muted, #7a9ab0); }
        .ls-subtitle { font-size: 0.58rem; color: var(--ui-text-muted, #7a9ab0); opacity: 0.65; }
        .ls-bar { display: flex; height: 5px; border-radius: 3px; overflow: hidden; gap: 1px; margin-bottom: 9px; }
        .ls-seg { border-radius: 2px; transition: width 0.7s cubic-bezier(.4,0,.2,1); min-width: 2px; }
        .ls-legend { display: flex; flex-direction: column; gap: 4px; }
        .ls-item { display: flex; align-items: center; gap: 6px; font-size: 0.67rem; color: var(--ui-text, #c8d8e8); }
        .ls-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .ls-name { flex: 1; opacity: 0.82; }
        .ls-pct { font-weight: bold; color: var(--ui-text-hero, #ddeeff); min-width: 36px; text-align: right; }
        #code-stats-widget { left: 248px; padding: 9px 13px 11px; min-width: 148px; }
        .cs-title { font-size: 0.62rem; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ui-text-muted, #7a9ab0); margin-bottom: 9px; }
        .cs-rows { display: flex; flex-direction: column; gap: 5px; }
        .cs-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 0.67rem; }
        .cs-label { color: var(--ui-text-muted, #7a9ab0); opacity: 0.85; }
        .cs-value { font-weight: bold; color: var(--ui-text-hero, #ddeeff); text-align: right; }
        .cs-divider { border: none; border-top: 1px solid var(--ui-surface-alt, rgba(255,255,255,0.08)); margin: 3px 0; }
        .ls-scanning { font-size: 0.63rem; color: var(--ui-text-muted, #7a9ab0); animation: ls-pulse 1.3s ease-in-out infinite; }
        @keyframes ls-pulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }
        @media (max-width: 520px) { #code-stats-widget { left: 14px; top: auto; bottom: 70px; } }
    `;
    document.head.appendChild(s);
};

const _colorOf = (name) => Object.values(EXT_MAP).find(d => d.name === name)?.color ?? '#8b8b8b';

const _renderWidgets = (totals, stats) => {
    const lw = document.getElementById('lang-stats-widget');
    const sw = document.getElementById('code-stats-widget');

    // Render Talen
    const grand = Object.values(totals).reduce((a, b) => a + b, 0);
    const sorted = Object.entries(totals).map(([name, chars]) => ({ name, chars, pct: (chars / grand) * 100 })).sort((a, b) => b.chars - a.chars);
    lw.querySelector('.ls-subtitle').textContent = _formatSize(grand);
    const bar = lw.querySelector('.ls-bar'); bar.innerHTML = '';
    const legend = lw.querySelector('.ls-legend'); legend.innerHTML = '';

    sorted.forEach(({ name, pct }) => {
        const seg = document.createElement('div'); seg.className = 'ls-seg'; seg.style.width = `${pct}%`; seg.style.background = _colorOf(name); bar.appendChild(seg);
        const item = document.createElement('div'); item.className = 'ls-item'; item.innerHTML = `<span class="ls-dot" style="background:${_colorOf(name)}"></span><span class="ls-name">${name}</span><span class="ls-pct">${pct.toFixed(1)}%</span>`; legend.appendChild(item);
    });

    // Render Stats
    const rows = sw.querySelector('.cs-rows'); rows.innerHTML = `
        <div class="cs-row"><span class="cs-label">Karakters</span><span class="cs-value">${_formatNumber(stats.chars)}</span></div>
        <div class="cs-row"><span class="cs-label">Lijnen</span><span class="cs-value">${_formatNumber(stats.lines)}</span></div>
        <hr class="cs-divider">
        <div class="cs-row"><span class="cs-label">Bestanden</span><span class="cs-value">${stats.files}</span></div>
        <div class="cs-row"><span class="cs-label">Grootte</span><span class="cs-value">${_formatSize(stats.bytes)}</span></div>
    `;

    lw.classList.add('ls-ready'); sw.classList.add('ls-ready');
};

const initLangStats = async () => {
    _injectLsStyles();

    // Maak widgets als ze niet bestaan
    if (!document.getElementById('lang-stats-widget')) {
        document.body.insertAdjacentHTML('beforeend', `
            <div id="lang-stats-widget" class="ls-widget"><div class="ls-header"><span class="ls-title">Talen</span><span class="ls-subtitle"></span></div><div class="ls-bar"></div><div class="ls-legend"><div class="ls-scanning">Scannen…</div></div></div>
            <div id="code-stats-widget" class="ls-widget"><div class="cs-title">Code stats</div><div class="cs-rows"><div class="ls-scanning">Scannen…</div></div></div>
        `);
    }

    const result = await _scanProjects();
    _renderWidgets(result.totals, result.stats);
};

// Start
initLangStats().catch(console.error);