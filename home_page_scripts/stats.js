// ─── Configuratie & Database ─────────────────────────────────────────────────

const IGNORE_LIST = [
    'min.js', 'min.css', 'analytics', 'font-awesome', 'favicon',
    'node_modules', '.git', '.svn', 'ds_store', '.env'
];

const EXT_MAP = {
    // Web & Styling
    '.html':    { name: 'HTML',        color: '#e34c26' },
    '.css':     { name: 'CSS',         color: '#563d7c' },
    '.scss':    { name: 'Sass',        color: '#c6538c' },
    '.sass':    { name: 'Sass',        color: '#c6538c' },
    '.less':    { name: 'Less',        color: '#1d365d' },

    // Scripts & Logic
    '.js':      { name: 'JavaScript',  color: '#f1e05a' },
    '.mjs':     { name: 'JavaScript',  color: '#f1e05a' },
    '.jsx':     { name: 'React JS',    color: '#61dafb' },
    '.ts':      { name: 'TypeScript',  color: '#3178c6' },
    '.tsx':     { name: 'React TS',    color: '#3178c6' },
    '.vue':     { name: 'Vue',         color: '#41b883' },

    // Backend & Systems
    '.php':     { name: 'PHP',         color: '#4f5d95' },
    '.py':      { name: 'Python',      color: '#3572a5' },
    '.java':    { name: 'Java',        color: '#b07219' },
    '.c':       { name: 'C',           color: '#555555' },
    '.cpp':     { name: 'C++',         color: '#f34b7d' },
    '.cc':      { name: 'C++',         color: '#f34b7d' },
    '.cs':      { name: 'C#',          color: '#178600' },
    '.go':      { name: 'Go',          color: '#00add8' },
    '.rs':      { name: 'Rust',        color: '#dea584' },
    '.rb':      { name: 'Ruby',        color: '#701516' },
    '.swift':   { name: 'Swift',       color: '#f05138' },
    '.kt':      { name: 'Kotlin',      color: '#a97bff' },
    '.dart':    { name: 'Dart',        color: '#00b4ab' },
    '.sql':     { name: 'SQL',         color: '#e38c00' },

    // Data & Config
    '.json':    { name: 'JSON',        color: '#292929' },
    '.xml':     { name: 'XML',         color: '#0060ac' },
    '.yaml':    { name: 'YAML',        color: '#cb171e' },
    '.yml':     { name: 'YAML',        color: '#cb171e' },
    '.md':      { name: 'Markdown',    color: '#083fa1' },
    '.csv':     { name: 'CSV',         color: '#237346' },
    '.toml':    { name: 'TOML',        color: '#9c4221' }
};

const MEDIA_EXTS = [
    // Images
    '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico', '.svg', '.bmp', '.tiff',
    // Video
    '.mp4', '.webm', '.ogv', '.mov',
    // Audio
    '.mp3', '.wav', '.flac', '.aac', '.m4a',
    // Fonts
    '.woff', '.woff2', '.ttf', '.otf', '.eot',
    // Binary/Archives
    '.pdf', '.zip', '.rar', '.7z', '.tar', '.gz', '.exe', '.dll', '.so', '.iso'
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const _extOf = (url) => url.match(/(\.[a-zA-Z0-9]+)(?:\?|#|$)/)?.[1]?.toLowerCase() ?? null;

const _isMedia = (url, contentType = '') => {
    const ext = _extOf(url);
    if (MEDIA_EXTS.includes(ext)) return true;
    const ct = contentType.toLowerCase();
    return ct.startsWith('image/') || ct.startsWith('video/') || ct.startsWith('audio/') || ct.includes('font') || ct.includes('octet-stream') || ct.includes('zip') || ct.includes('pdf');
};

const _langOf = (url) => {
    const ext = _extOf(url);
    if (!ext) return EXT_MAP['.html'];
    return EXT_MAP[ext] ?? { name: 'Other', color: '#888' };
};

const _fetchAsset = async (url) => {
    try {
        const res = await fetch(url, { cache: 'force-cache' });
        if (!res.ok) {
            console.warn('Fetch failed:', url, res.status);
            return null;
        }

        const contentType = res.headers.get('Content-Type') || '';
        const isBinary = _isMedia(url, contentType);
        const blob = await res.blob();

        return {
            size: blob.size,
            text: isBinary ? null : await blob.text()
        };
    } catch { return null; }
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

const _formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const _formatNumber = (n) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(3)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(3)}K`;
    return `${n}`;
};

const _extractAssets = (html, baseUrl) => {
    const found = [];
    const patterns = [
        /href=["']([^"'#?]+\.(?:css|html|php|svg|bits|scss|ts|js|py|c|cpp|cs|java))/gi,
        /src=["']([^"'#?]+\.(?:js|png|jpg|jpeg|gif|webp|svg|mp4|webm|mp3|wav|ts|jsx|tsx))/gi,
        /srcset=["']([^"'#? ]+\.[a-z]{3,4})/gi
    ];

    patterns.forEach(regex => {
        for (const m of html.matchAll(regex)) found.push(m[1]);
    });

    return [...new Set(found)]
        .map(p => {
            try {
                let base = baseUrl;
                if (base.includes('/scripts/')) base = base.replace(/\/scripts\/[^/]*$/, '/');
                return new URL(p, base).href;
            } catch { return null; }
        })
        .filter(url => {
            if (!url) return false;
            const isSameDomain = new URL(url).hostname === window.location.hostname;
            const isNotIgnored = !IGNORE_LIST.some(term => url.toLowerCase().includes(term));
            return isSameDomain && isNotIgnored;
        });
};

const _scanDeepContent = (text, baseUrl) => {
    const found = [];
    const cssUrlPattern = /url\(['"]?([^'利益")#?]+\.(?:png|jpg|jpeg|gif|webp|svg|avif|mp4|mp3|woff2?|ttf))['"]?\)/gi;
    const jsStringPattern = /['"]([^'利益"#? ]+\.(?:png|jpg|jpeg|gif|webp|svg|avif|mp4|ts|js|css|tsx|jsx|php|py|java|cpp|cs))['"]/gi;

    for (const m of text.matchAll(cssUrlPattern)) found.push(m[1]);
    for (const m of text.matchAll(jsStringPattern)) found.push(m[1]);

    return [...new Set(found)]
        .map(p => {
            try {
                let base = baseUrl;
                if (base.includes('/scripts/')) base = base.replace(/\/scripts\/[^/]*$/, '/');
                return new URL(p, base).href;
            } catch { return null; }
        })
        .filter(url => url && !IGNORE_LIST.some(term => url.toLowerCase().includes(term)));
};

// ─── Centrale scan ─────────────────────────────────────────────────────────────

const _scanProjects = async () => {
    const labsData = (typeof labs !== 'undefined') ? labs : [];
    const startUrls = [
        window.location.href,
        ...labsData.flatMap(lab => lab.projects ? lab.projects.map(p => p.url) : [])
    ];

    const initialQueue = [...new Set(startUrls)];
    const langChars = {};
    const stats = { chars: 0, lines: 0, files: 0, bytes: 0 };
    const seen = new Set();

    // Gebruik een dynamische lijst die we parallel kunnen afwerken
    const queueToProcess = [...initialQueue];

    const processUrl = async (rawUrl) => {
        if (!rawUrl) return;

        let urlObj;
        try {
            urlObj = new URL(rawUrl, window.location.href);
            urlObj.search = '';
            urlObj.hash = '';
        } catch { return; }

        let url = urlObj.href;

        // --- ASSET FOLDER FIXES ---
        if (url.includes('home_page_scripts/assets/')) url = url.replace('home_page_scripts/assets/', 'assets/');
        if (url.includes('home_page_scripts/images/')) url = url.replace('home_page_scripts/images/', 'images/');
        if (url.includes('home_page_scripts/home_page_scripts/')) url = url.replace(/home_page_scripts\/home_page_scripts\//g, 'home_page_scripts/');

        const finalUrlObj = new URL(url);
        if (finalUrlObj.hostname !== window.location.hostname) return;
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
                    for (const a of deeper) if (!seen.has(a)) queueToProcess.push(a);
                } else {
                    langChars[langDef.name] = (langChars[langDef.name] ?? 0) + asset.text.length;
                    stats.chars += asset.text.length;
                    stats.lines += asset.text.split('\n').filter(line => line.trim()).length;

                    if (['CSS', 'JavaScript', 'TypeScript', 'PHP', 'Python', 'Sass'].includes(langDef.name)) {
                        const deepAssets = _scanDeepContent(asset.text, url);
                        for (const a of deepAssets) if (!seen.has(a)) queueToProcess.push(a);
                    }
                }
            }
        }
    };

    // --- PARALLEL WORKER POOL ---
    const CONCURRENCY_LIMIT = 8;
    const worker = async () => {
        while (true) {
            const url = queueToProcess.shift();
            if (!url) {
                // wacht even om te zien of er nieuwe items bijkomen
                await new Promise(r => setTimeout(r, 50));
                if (queueToProcess.length === 0) break;
                continue;
            }
            await processUrl(url);
        }
    };

    // Start 8 workers tegelijk
    await Promise.all(Array(CONCURRENCY_LIMIT).fill(null).map(() => worker()));

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

const _colorOf = (name) => Object.values(EXT_MAP).find(d => d.name === name)?.color ?? '#8b8b8b';

const _renderWidgets = (totals, stats) => {
    const lw = document.getElementById('lang-stats-widget');
    const sw = document.getElementById('code-stats-widget');

    const grand = Object.values(totals).reduce((a, b) => a + b, 0);
    const sorted = Object.entries(totals)
        .map(([name, chars]) => ({ name, chars, pct: (chars / (grand || 1)) * 100 }))
        .sort((a, b) => b.chars - a.chars);

    lw.querySelector('.ls-subtitle').textContent = _formatSize(grand);
    const bar = lw.querySelector('.ls-bar'); bar.innerHTML = '';
    const legend = lw.querySelector('.ls-legend'); legend.innerHTML = '';

    sorted.forEach(({ name, pct }) => {
        const seg = document.createElement('div');
        seg.className = 'ls-seg';
        seg.style.width = `${pct}%`;
        seg.style.background = _colorOf(name);
        bar.appendChild(seg);

        const item = document.createElement('div');
        item.className = 'ls-item';
        item.innerHTML = `<span class="ls-dot" style="background:${_colorOf(name)}"></span><span class="ls-name">${name}</span><span class="ls-pct">${pct.toFixed(2)}%</span>`;
        legend.appendChild(item);
    });

    const rows = sw.querySelector('.cs-rows');
    rows.innerHTML = `
        <div class="cs-row"><span class="cs-label">Karakters</span><span class="cs-value">${_formatNumber(stats.chars)}</span></div>
        <div class="cs-row"><span class="cs-label">Lijnen</span><span class="cs-value">${_formatNumber(stats.lines)}</span></div>
        <hr class="cs-divider">
        <div class="cs-row"><span class="cs-label">Bestanden</span><span class="cs-value">${stats.files}</span></div>
        <div class="cs-row"><span class="cs-label">Grootte</span><span class="cs-value">${_formatSize(stats.bytes)}</span></div>
    `;

    lw.classList.add('ls-ready');
    sw.classList.add('ls-ready');
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