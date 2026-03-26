// ─── Configuratie & Database ─────────────────────────────────────────────────

const IGNORE_LIST = [
    'min.js', 'min.css', 'analytics', 'font-awesome', 'favicon',
    'node_modules', '.git', '.svn', 'ds_store', '.env', 'node_modules'
];

const EXT_MAP = {
    '.html':    { name: 'HTML',        color: '#e34c26' },
    '.css':     { name: 'CSS',         color: '#563d7c' },
    '.scss':    { name: 'Sass',        color: '#c6538c' },
    '.sass':    { name: 'Sass',        color: '#c6538c' },
    '.less':    { name: 'Less',        color: '#1d365d' },
    '.js':      { name: 'JavaScript',  color: '#f1e05a' },
    '.mjs':     { name: 'JavaScript',  color: '#f1e05a' },
    '.jsx':     { name: 'React JS',    color: '#61dafb' },
    '.ts':      { name: 'TypeScript',  color: '#3178c6' },
    '.tsx':     { name: 'React TS',    color: '#3178c6' },
    '.vue':     { name: 'Vue',         color: '#41b883' },
    '.php':     { name: 'PHP',         color: '#4f5d95' },
    '.py':      { name: 'Python',      color: '#3572a5' },
    '.java':    { name: 'Java',        color: '#b07219' },
    '.c':       { name: 'C',           color: '#555555' },
    '.cpp':     { name: 'C++',         color: '#f34b7d' },
    '.cs':      { name: 'C#',          color: '#178600' },
    '.go':      { name: 'Go',          color: '#00add8' },
    '.rs':      { name: 'Rust',        color: '#dea584' },
    '.dart':    { name: 'Dart',        color: '#00b4ab' },
    '.sql':     { name: 'SQL',         color: '#e38c00' },
    '.json':    { name: 'JSON',        color: '#292929' },
    '.xml':     { name: 'XML',         color: '#0060ac' },
    '.yaml':    { name: 'YAML',        color: '#cb171e' },
    '.yml':     { name: 'YAML',        color: '#cb171e' },
    '.md':      { name: 'Markdown',    color: '#083fa1' },
    '.toml':    { name: 'TOML',        color: '#9c4221' }
};

const MEDIA_EXTS = [
    '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico', '.svg', '.bmp',
    '.mp4', '.webm', '.mp3', '.wav', '.woff', '.woff2', '.ttf', '.pdf', '.zip'
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const _extOf = (url) => url.match(/(\.[a-zA-Z0-9]+)(?:\?|#|$)/)?.[1]?.toLowerCase() ?? null;

const _isMedia = (url, ct = '') => {
    const ext = _extOf(url);
    if (MEDIA_EXTS.includes(ext)) return true;
    const type = ct.toLowerCase();
    return type.startsWith('image/') || type.startsWith('video/') || type.includes('font') || type.includes('octet-stream');
};

const _langOf = (url) => {
    const ext = _extOf(url);
    return ext ? (EXT_MAP[ext] ?? null) : EXT_MAP['.html'];
};

const _fetchAsset = async (url) => {
    try {
        const res = await fetch(url, { cache: 'force-cache' });
        if (!res.ok) return null;
        const ct = res.headers.get('Content-Type') || '';
        const isBin = _isMedia(url, ct);
        const blob = await res.blob();
        return { size: blob.size, text: isBin ? null : await blob.text() };
    } catch { return null; }
};

const _splitHtml = (html) => {
    const res = {};
    const add = (l, t) => { if (t.trim()) res[l] = (res[l] ?? '') + t; };
    const rest = html
        .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, i) => { add('CSS', i); return ''; })
        .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (_, i) => { add('JavaScript', i); return ''; });
    add('HTML', rest);
    return res;
};

const _formatSize = (b) => b < 1048576 ? `${(b / 1024).toFixed(2)} KB` : `${(b / 1048576).toFixed(2)} MB`;
const _formatNumber = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n;

const _extractAssets = (html, base) => {
    const found = [];
    const patterns = [
        /href=["']([^"'#?]+\.[a-z0-9]+)/gi,
        /src=["']([^"'#?]+\.[a-z0-9]+)/gi
    ];
    patterns.forEach(r => { for (const m of html.matchAll(r)) found.push(m[1]); });

    return [...new Set(found)].map(p => {
        try {
            let b = base;
            if (b.includes('/scripts/')) b = b.replace(/\/scripts\/[^/]*$/, '/');
            return new URL(p, b).href;
        } catch { return null; }
    }).filter(u => u && new URL(u).hostname === window.location.hostname && !IGNORE_LIST.some(t => u.toLowerCase().includes(t)));
};

// ─── Centrale scan ─────────────────────────────────────────────────────────────

const _scanProjects = async () => {
    const labsData = (typeof labs !== 'undefined') ? labs : [];
    const queue = [...new Set([window.location.href, ...labsData.flatMap(l => l.projects?.map(p => p.url) || [])])];

    const langChars = {};
    const stats = { chars: 0, lines: 0, files: 0, bytes: 0 };
    const seen = new Set();

    const processUrl = async (url) => {
        // Normaliseer URL
        try {
            const uo = new URL(url); uo.hash = ''; uo.search = ''; url = uo.href;
        } catch { return; }

        if (seen.has(url) || IGNORE_LIST.some(t => url.toLowerCase().includes(t))) return;
        seen.add(url);

        // Folder fixes
        if (url.includes('home_page_scripts/assets/')) url = url.replace('home_page_scripts/assets/', 'assets/');
        if (url.includes('home_page_scripts/images/')) url = url.replace('home_page_scripts/images/', 'images/');

        const asset = await _fetchAsset(url);
        if (!asset) return;

        stats.files++;
        stats.bytes += asset.size;

        if (asset.text) {
            const lang = _langOf(url);
            if (lang) {
                if (lang.name === 'HTML') {
                    const parts = _splitHtml(asset.text);
                    Object.entries(parts).forEach(([l, t]) => {
                        langChars[l] = (langChars[l] ?? 0) + t.length;
                        stats.chars += t.length;
                        stats.lines += t.split('\n').length;
                    });
                    const deeper = _extractAssets(asset.text, url);
                    for (const d of deeper) await processUrl(d);
                } else {
                    langChars[lang.name] = (langChars[lang.name] ?? 0) + asset.text.length;
                    stats.chars += asset.text.length;
                    stats.lines += asset.text.split('\n').length;
                }
            }
        }
    };

    // Parallelle verwerking van de START urls
    const CONCURRENCY = 8;
    const workers = [];
    for (let i = 0; i < CONCURRENCY; i++) {
        workers.push((async () => {
            while (queue.length > 0) {
                await processUrl(queue.shift());
            }
        })());
    }
    await Promise.all(workers);

    return { totals: langChars, stats };
};

// ─── UI & Rendering ───────────────────────────────────────────────────────────

const _injectLsStyles = () => {
    if (document.getElementById('ls-style')) return;
    const s = document.createElement('style');
    s.id = 'ls-style';
    s.textContent = `
        .ls-widget { position: fixed; top: 14px; z-index: 999; background: rgba(18,28,36,0.9); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; backdrop-filter: blur(12px); box-shadow: 0 4px 20px rgba(0,0,0,0.4); font-family: 'Courier New', Courier, monospace; opacity: 0; transform: translateY(-6px); transition: opacity 0.5s ease, transform 0.5s ease; pointer-events: none; }
        .ls-widget.ls-ready { opacity: 1; transform: translateY(0); pointer-events: auto; }
        #lang-stats-widget { left: 14px; padding: 9px 13px 11px; min-width: 178px; max-width: 220px; }
        .ls-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 7px; }
        .ls-title { font-size: 0.62rem; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; color: #7a9ab0; }
        .ls-subtitle { font-size: 0.58rem; color: #7a9ab0; opacity: 0.65; }
        .ls-bar { display: flex; height: 5px; border-radius: 3px; overflow: hidden; gap: 1px; margin-bottom: 9px; }
        .ls-seg { border-radius: 2px; transition: width 0.7s ease; min-width: 2px; }
        .ls-legend { display: flex; flex-direction: column; gap: 4px; }
        .ls-item { display: flex; align-items: center; gap: 6px; font-size: 0.67rem; color: #c8d8e8; }
        .ls-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .ls-pct { font-weight: bold; color: #ddeeff; min-width: 36px; text-align: right; margin-left: auto; }
        #code-stats-widget { left: 248px; padding: 9px 13px 11px; min-width: 148px; }
        .cs-title { font-size: 0.62rem; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; color: #7a9ab0; margin-bottom: 9px; }
        .cs-rows { display: flex; flex-direction: column; gap: 5px; }
        .cs-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 0.67rem; }
        .cs-label { color: #7a9ab0; opacity: 0.85; }
        .cs-value { font-weight: bold; color: #ddeeff; text-align: right; }
        .cs-divider { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 3px 0; }
        .ls-scanning { font-size: 0.63rem; color: #7a9ab0; animation: ls-pulse 1.3s ease-in-out infinite; }
        @keyframes ls-pulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }
    `;
    document.head.appendChild(s);
};

const _renderWidgets = (totals, stats) => {
    const lw = document.getElementById('lang-stats-widget');
    const sw = document.getElementById('code-stats-widget');
    const grand = Object.values(totals).reduce((a, b) => a + b, 0);
    const sorted = Object.entries(totals).map(([n, c]) => ({ n, c, p: (c / (grand || 1)) * 100 })).sort((a, b) => b.c - a.c);

    lw.querySelector('.ls-subtitle').textContent = _formatSize(grand);
    const bar = lw.querySelector('.ls-bar'); bar.innerHTML = '';
    const legend = lw.querySelector('.ls-legend'); legend.innerHTML = '';

    sorted.forEach(({ n, p }) => {
        const color = Object.values(EXT_MAP).find(d => d.name === n)?.color ?? '#8b8b8b';
        bar.insertAdjacentHTML('beforeend', `<div class="ls-seg" style="width:${p}%;background:${color}"></div>`);
        legend.insertAdjacentHTML('beforeend', `<div class="ls-item"><span class="ls-dot" style="background:${color}"></span>${n}<span class="ls-pct">${p.toFixed(1)}%</span></div>`);
    });

    sw.querySelector('.cs-rows').innerHTML = `
        <div class="cs-row"><span class="cs-label">Karakters</span><span class="cs-value">${_formatNumber(stats.chars)}</span></div>
        <div class="cs-row"><span class="cs-label">Lijnen</span><span class="cs-value">${_formatNumber(stats.lines)}</span></div>
        <hr class="cs-divider"><div class="cs-row"><span class="cs-label">Bestanden</span><span class="cs-value">${stats.files}</span></div>
        <div class="cs-row"><span class="cs-label">Grootte</span><span class="cs-value">${_formatSize(stats.bytes)}</span></div>
    `;
    lw.classList.add('ls-ready'); sw.classList.add('ls-ready');
};

const initStats = async () => {
    _injectLsStyles();
    if (!document.getElementById('lang-stats-widget')) {
        document.body.insertAdjacentHTML('beforeend', `
            <div id="lang-stats-widget" class="ls-widget"><div class="ls-header"><span class="ls-title">Talen</span><span class="ls-subtitle"></span></div><div class="ls-bar"></div><div class="ls-legend"><div class="ls-scanning">Scannen…</div></div></div>
            <div id="code-stats-widget" class="ls-widget"><div class="cs-title">Code stats</div><div class="cs-rows"><div class="ls-scanning">Scannen…</div></div></div>
        `);
    }
    const result = await _scanProjects();
    _renderWidgets(result.totals, result.stats);
};

initStats().catch(console.error);