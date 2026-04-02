/* game.js — Arena Mode engine
   Must be loaded LAST in index.html                                          */

(() => {

// ─── State machine ────────────────────────────────────────────────────────────
// 'off' | 'menu' | 'playing' | 'paused' | 'dead'

    let _state = 'off';

// ─── Keybinds ─────────────────────────────────────────────────────────────────

    let _keys = { left: 'ArrowLeft', right: 'ArrowRight', jump: 'ArrowUp' };

    const _loadKeys = () => {
        try {
            const s = JSON.parse(localStorage.getItem('arenaKeys') || 'null');
            if (s && s.left && s.right && s.jump) _keys = s;
        } catch (_) {}
    };
    const _saveKeys = () => localStorage.setItem('arenaKeys', JSON.stringify(_keys));
    _loadKeys();

// ─── Leaderboard — localStorage ───────────────────────────────────────────────

    let _lbCache = [];

    const _fetchLB = async () => {
        try {
            _lbCache = JSON.parse(localStorage.getItem('arenaLeaderboard') || '[]');
        } catch (_) {
            _lbCache = [];
        }
        return _lbCache;
    };

    const _postScore = async (name, score, mode) => {
        try {
            await _fetchLB();
            let entries = [..._lbCache];
            if (mode === 'override') {
                entries = entries.filter(e => e.name.toLowerCase() !== name.toLowerCase());
            }
            entries.push({ name, score });
            entries.sort((a, b) => b.score - a.score);
            entries = entries.slice(0, 50);
            localStorage.setItem('arenaLeaderboard', JSON.stringify(entries));
            _lbCache = entries;
        } catch (_) {}
    };

// ─── DOM helpers ──────────────────────────────────────────────────────────────

    const $  = (id)  => /** @type {HTMLElement|null} */ (document.getElementById(id));
    const $q = (sel) => /** @type {HTMLElement|null} */ (document.querySelector(sel));

// ─── Static shell elements ────────────────────────────────────────────────────

    const _gc      = /** @type {HTMLCanvasElement|null} */ ($('game-canvas'));
    const _menuEl  = $('game-menu');
    const _lbPanel = $('leaderboard-panel');
    const _kbPanel = $('keybind-panel');
    const _ssPanel = $('save-score-panel');
    const _hudEl   = $('game-hud');
    const _flashEl = $('death-flash');

// ─── Canvas ───────────────────────────────────────────────────────────────────

    let _gctx = null;

    const _getCtx = () => {
        if (!_gctx && _gc) _gctx = _gc.getContext('2d');
        return _gctx;
    };

    const _resizeCanvas = () => {
        if (!_gc) return;
        _gc.width  = window.innerWidth;
        _gc.height = window.innerHeight;
    };

    window.addEventListener('resize', _resizeCanvas);
    _resizeCanvas();

// ─── Class / style helpers ────────────────────────────────────────────────────

    const _cls = (el, cls, force) => { if (el) el.classList.toggle(cls, force); };
    const _add = (el, cls)        => { if (el) el.classList.add(cls); };
    const _rem = (el, cls)        => { if (el) el.classList.remove(cls); };
    const _css = (el, prop, val)  => { if (el) el.style.setProperty(prop, val); };

// ─── Physics constants ────────────────────────────────────────────────────────

    const GRAVITY          = 0.38;
    const JUMP_FORCE       = -15.5;
    const MOVE_SPEED       = 5.5;
    const PLAT_H           = 38;
    const SCROLL_FRAC      = 0.35;
    const DEATH_FRAC       = 1.35;
    const JUMP_COOLDOWN_MS = 250;

    let _lastJumpTime = 0;

    const PLAT_COLORS = [
        { bg: '#1a3a55', border: '#2a6080', text: '#7ab8d8' },
        { bg: '#1a2a40', border: '#2a4060', text: '#6090b0' },
        { bg: '#251a3a', border: '#402a60', text: '#9070c0' },
        { bg: '#1a3530', border: '#2a5548', text: '#60b898' },
        { bg: '#35251a', border: '#604535', text: '#c09070' },
    ];

// ─── World state ──────────────────────────────────────────────────────────────

    let _platforms    = [];
    let _worldOffsetY = 0;
    let _maxHeight    = 0;
    let _score        = 0;
    let _labPool      = [];
    let _platSeed     = 0;

    const _player = {
        x: 0, y: 0, vx: 0, vy: 0,
        w: 36, h: 36,
        onGround: false,
        jumpsLeft: 2,
        _coyote: 0
    };
    const _held      = { left: false, right: false, jump: false };
    let _jumpWasHeld = false;

// ─── Platform generation ──────────────────────────────────────────────────────

    const _makePlat = (prevPlat) => {
        const w    = _gc ? _gc.width : window.innerWidth;
        const pw   = 120 + Math.random() * 160;

        const gap     = 55 + Math.random() * 40;
        const py      = prevPlat.y - gap - PLAT_H;

        const maxReach = 450;
        let minX = Math.max(20, prevPlat.x - maxReach);
        let maxX = Math.min(w - pw - 20, prevPlat.x + maxReach);

        if (minX > maxX) {
            minX = 20;
            maxX = Math.max(20, w - pw - 20);
        }

        const px = minX + Math.random() * (maxX - minX);

        const label    = _labPool.length ? _labPool[_platSeed % _labPool.length] : 'Labo';
        const colorIdx = _platSeed % PLAT_COLORS.length;
        _platSeed++;
        return { x: px, y: py, w: pw, h: PLAT_H, label, colorIdx };
    };

    const _ensurePlatsAbove = (topY) => {
        if (!_platforms.length) return;
        let topPlat = _platforms.reduce((prev, curr) => curr.y < prev.y ? curr : prev);
        while (topPlat.y > topY - 300) {
            const p = _makePlat(topPlat);
            _platforms.push(p);
            topPlat = p;
        }
    };

    const _prunePlats = () => {
        const cutoff = _worldOffsetY + (_gc ? _gc.height : 600) + 300;
        _platforms = _platforms.filter(p => p.y < cutoff);
    };

// ─── World init ───────────────────────────────────────────────────────────────

    const _initWorld = () => {
        const w = _gc ? _gc.width  : window.innerWidth;
        const h = _gc ? _gc.height : window.innerHeight;

        const spans = document.querySelectorAll('.labo h2 span');
        _labPool = spans.length
            ? Array.from(spans).map(el => el.textContent.trim())
            : ['Labo 1','Labo 2','Labo 3','Labo 4','Labo 5'];

        _platSeed = 0; _platforms = []; _worldOffsetY = 0; _maxHeight = 0; _score = 0;

        const floorY = h * 0.72;
        const floorPlat = { x: w * 0.1, y: floorY, w: w * 0.8, h: PLAT_H, label: 'Start', colorIdx: 0 };
        _platforms.push(floorPlat);

        let lastPlat = floorPlat;
        for (let i = 0; i < 30; i++) {
            const p = _makePlat(lastPlat);
            _platforms.push(p);
            lastPlat = p;
        }

        const floor       = _platforms[0];
        _player.x         = floor.x + floor.w / 2 - _player.w / 2;
        _player.y         = floor.y - _player.h;
        _player.vx        = 0;
        _player.vy        = 0;
        _player.onGround  = false;
        _player.jumpsLeft = 2;
        _player._coyote   = 0;
        _jumpWasHeld      = false;
        _lastJumpTime     = 0;
        _held.left = false; _held.right = false; _held.jump = false;
    };

// ─── Physics tick ─────────────────────────────────────────────────────────────

    const _tick = () => {
        if (_state !== 'playing') return;

        const w = _gc ? _gc.width  : window.innerWidth;
        const h = _gc ? _gc.height : window.innerHeight;

        _player.vx = 0;
        if (_held.left)  _player.vx = -MOVE_SPEED;
        if (_held.right) _player.vx =  MOVE_SPEED;

        if (_player.onGround) {
            _player._coyote = 10;
        } else if (_player._coyote > 0) {
            _player._coyote--;
        }

        const now = performance.now();
        if (_held.jump && !_jumpWasHeld) {
            const cooldownOk = (now - _lastJumpTime) >= JUMP_COOLDOWN_MS;
            if (cooldownOk && (_player._coyote > 0 || _player.jumpsLeft > 0)) {
                _player.vy       = JUMP_FORCE;
                _player._coyote  = 0;
                _lastJumpTime    = now;
                if (!_player.onGround) _player.jumpsLeft = Math.max(0, _player.jumpsLeft - 1);
                _player.onGround = false;
            }
        }

        if (!_held.jump && _player.vy < -5) _player.vy *= 0.84;

        _jumpWasHeld = _held.jump;
        _player.vy += GRAVITY;
        if (_player.vy > 20) _player.vy = 20;

        _player.x += _player.vx;
        _player.y += _player.vy;

        if (_player.x + _player.w < 0) _player.x = w;
        if (_player.x > w)             _player.x = -_player.w;

        _player.onGround = false;
        for (const p of _platforms) {
            const pTop       = p.y - _worldOffsetY;
            const overlapX   = _player.x + _player.w > p.x && _player.x < p.x + p.w;
            const prevBottom = _player.y + _player.h - _player.vy;
            const currBottom = _player.y + _player.h;

            if (_player.vy >= 0 && overlapX && prevBottom <= pTop + 2 && currBottom >= pTop) {
                _player.y         = pTop - _player.h;
                _player.vy        = 0;
                _player.onGround  = true;
                _player.jumpsLeft = 2;
                _player._coyote   = 10;
            }
        }

        const scrollY = h * SCROLL_FRAC;
        if (_player.y < scrollY) {
            const delta   = scrollY - _player.y;
            _worldOffsetY -= delta;
            _player.y      = scrollY;
            const climbed  = -_worldOffsetY;
            if (climbed > _maxHeight) {
                _maxHeight = climbed;
                _score     = Math.round(_maxHeight / 10);
            }
        }

        _ensurePlatsAbove(_worldOffsetY);
        _prunePlats();

        const waterSurface = h * 1.08;
        if (_player.y + _player.h > h * DEATH_FRAC || _player.y > waterSurface) {
            _triggerDeath();
        }
    };

// ─── Rendering ────────────────────────────────────────────────────────────────

    const _draw = () => {
        const ctx = _getCtx();
        if (!ctx || !_gc) return;
        const w = _gc.width, h = _gc.height;
        ctx.clearRect(0, 0, w, h);
        if (_state !== 'playing' && _state !== 'paused' && _state !== 'dead') return;

        const waterY   = h * 1.08;
        const waveTime = Date.now() / 600;
        const wg = ctx.createLinearGradient(0, waterY - 30, 0, h);
        wg.addColorStop(0,   'rgba(0,80,160,0)');
        wg.addColorStop(0.3, 'rgba(0,60,140,0.55)');
        wg.addColorStop(1,   'rgba(0,20,80,0.9)');
        ctx.save();
        ctx.fillStyle = wg;
        ctx.fillRect(0, waterY - 30, w, h - waterY + 30);

        ctx.beginPath();
        ctx.moveTo(0, waterY);
        for (let x = 0; x <= w; x += 8) {
            ctx.lineTo(x, waterY + Math.sin(x / 40 + waveTime) * 5 + Math.sin(x / 18 + waveTime * 1.7) * 2.5);
        }
        ctx.strokeStyle = 'rgba(100,180,255,0.45)';
        ctx.lineWidth   = 2;
        ctx.stroke();

        ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
        ctx.fillStyle = 'rgba(0,100,200,0.18)';
        ctx.fill();
        ctx.restore();

        for (const p of _platforms) {
            const sy = p.y - _worldOffsetY;
            if (sy > h + 60 || sy + p.h < -60) continue;
            const col = PLAT_COLORS[p.colorIdx];
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath(); ctx.roundRect(p.x + 4, sy + 5, p.w, p.h, 5); ctx.fill();
            ctx.fillStyle = col.bg; ctx.strokeStyle = col.border; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.roundRect(p.x, sy, p.w, p.h, 5); ctx.fill(); ctx.stroke();
            ctx.globalAlpha = 0.35; ctx.strokeStyle = col.text; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x + 8, sy + 2); ctx.lineTo(p.x + p.w - 8, sy + 2); ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.fillStyle = col.text;
            ctx.font = `bold ${Math.max(9, Math.min(12, p.w * 0.09))}px Courier New`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(p.label, p.x + p.w / 2, sy + p.h / 2);
        }

        const pgx = _player.x + _player.w / 2;
        const pgy = _player.y + _player.h / 2;
        const grd = ctx.createRadialGradient(pgx, pgy, 2, pgx, pgy, _player.w * 1.4);
        grd.addColorStop(0, 'rgba(96,184,224,0.22)');
        grd.addColorStop(1, 'rgba(96,184,224,0)');
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(pgx, pgy, _player.w * 1.4, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#1a3a55'; ctx.strokeStyle = '#60b8e0'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(_player.x, _player.y, _player.w, _player.h, 6); ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#60b8e0'; ctx.beginPath();
        ctx.arc(_player.x + _player.w * 0.3, _player.y + _player.h * 0.38, 3.5, 0, Math.PI * 2);
        ctx.arc(_player.x + _player.w * 0.7, _player.y + _player.h * 0.38, 3.5, 0, Math.PI * 2);
        ctx.fill();

        if (_player.onGround) {
            ctx.strokeStyle = 'rgba(96,184,224,0.4)'; ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(_player.x + 4,             _player.y + _player.h);
            ctx.lineTo(_player.x + _player.w - 4, _player.y + _player.h);
            ctx.stroke();
        }

        const barH = h * 0.5, barX = 14, barY = (h - barH) / 2;
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.beginPath(); ctx.roundRect(barX, barY, 6, barH, 3); ctx.fill();
        const fillH = barH * Math.min(1, _score / 500);
        if (fillH > 0) {
            const bg = ctx.createLinearGradient(0, barY + barH, 0, barY);
            bg.addColorStop(0, '#2a6080'); bg.addColorStop(0.6, '#60b8e0'); bg.addColorStop(1, '#90d8f8');
            ctx.fillStyle = bg;
            ctx.beginPath(); ctx.roundRect(barX, barY + barH - fillH, 6, fillH, 3); ctx.fill();
        }

        if (_state === 'paused') {
            ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#ddeeff'; ctx.font = 'bold 16px Courier New';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('PAUSED  —  ESC to resume', w / 2, h / 2);
        }
    };

// ─── HUD ──────────────────────────────────────────────────────────────────────

    const _updateHUD = () => {
        const el = $('hud-height');
        if (el) el.textContent = `${_score} m`;
    };

// ─── Game loop ────────────────────────────────────────────────────────────────

    let _raf = null;
    const _loop      = () => { _tick(); _draw(); _updateHUD(); _raf = requestAnimationFrame(_loop); };
    const _startLoop = () => { if (_raf) cancelAnimationFrame(_raf); _raf = requestAnimationFrame(_loop); };
    const _stopLoop  = () => { if (_raf) { cancelAnimationFrame(_raf); _raf = null; } };

// ─── Keyboard ─────────────────────────────────────────────────────────────────

    window.addEventListener('keydown', (e) => {
        if (_state === 'off') return;

        // Enter Key Logic (Quick Replay)
        if (e.key === 'Enter') {
            if (_state === 'menu') {
                _startGame();
                e.preventDefault();
            } else if (_state === 'paused') {
                _resumeGame();
                e.preventDefault();
            } else if (_state === 'dead') {
                const inp = /** @type {HTMLInputElement|null} */ ($('ss-name-input'));
                // If name input is empty or not focused, restart immediately
                if (!inp || inp.value.trim() === '') {
                    _hideSaveScore();
                    _startGame();
                    e.preventDefault();
                }
            }
        }

        if (_state !== 'playing' && _state !== 'paused') return;
        if (e.key === _keys.left)  _held.left  = true;
        if (e.key === _keys.right) _held.right = true;
        if (e.key === _keys.jump)  _held.jump  = true;
        if (e.key === 'Escape') { _state === 'playing' ? _pauseGame() : _resumeGame(); }
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
    }, { passive: false });

    window.addEventListener('keyup', (e) => {
        if (e.key === _keys.left)  _held.left  = false;
        if (e.key === _keys.right) _held.right = false;
        if (e.key === _keys.jump)  _held.jump  = false;
    });

// ─── Shared cleanup ───────────────────────────────────────────────────────────

    const _clearOverlays = () => {
        _rem(_lbPanel, 'active');
        _rem(_kbPanel, 'active');
        _rem(_ssPanel, 'active');
        const ctx = _getCtx();
        if (ctx && _gc) ctx.clearRect(0, 0, _gc.width, _gc.height);
    };

// ─── Actions ──────────────────────────────────────────────────────────────────

    const _startGame  = () => { _resizeCanvas(); _initWorld(); _setState('playing'); _startLoop(); };
    const _pauseGame  = () => { if (_state !== 'playing') return; _setState('paused'); _stopLoop(); _draw(); };
    const _resumeGame = () => { if (_state !== 'paused')  return; _setState('playing'); _startLoop(); };

    const _stopGame = () => {
        if (_state === 'playing') { _setState('paused'); _stopLoop(); _draw(); }
        setTimeout(() => _showSaveScore(), 80);
    };

    const _backToMenu = () => {
        _stopLoop();
        _clearOverlays();
        _setState('menu');
    };

    const _hardExit = () => {
        _stopLoop();
        _clearOverlays();
        _setState('off');
        const sw = /** @type {HTMLInputElement|null} */ ($('game-switch'));
        if (sw) sw.checked = false;
    };

// ─── Death ────────────────────────────────────────────────────────────────────

    const _triggerDeath = () => {
        if (_state === 'dead') return;
        _setState('dead');
        _stopLoop();
        _draw();
        if (_flashEl) {
            _rem(_flashEl, 'active');
            void _flashEl.offsetWidth;
            _add(_flashEl, 'active');
            setTimeout(() => _rem(_flashEl, 'active'), 600);
        }
        setTimeout(() => _showSaveScore(), 650);
    };

// ─── Save score panel ─────────────────────────────────────────────────────────

    const _showSaveScore = () => {
        const scoreEl = $('ss-score');
        if (scoreEl) scoreEl.textContent = `${_score} m`;
        _fetchLB().then(() => _updateSaveModeUI()).catch(() => {});
        _add(_ssPanel, 'active');
        const inp = /** @type {HTMLInputElement|null} */ ($('ss-name-input'));
        if (inp) {
            inp.value = '';
            inp.addEventListener('input', _updateSaveModeUI);
            setTimeout(() => inp.focus(), 60);
        }
    };

    const _updateSaveModeUI = () => {
        const inp     = /** @type {HTMLInputElement|null} */ ($('ss-name-input'));
        const modeRow = $('ss-mode-row');
        const nameVal = inp ? inp.value.trim().toLowerCase() : '';
        const exists  = _lbCache.some(e => e.name.toLowerCase() === nameVal);
        if (modeRow) modeRow.style.display = (exists && nameVal) ? 'flex' : 'none';
    };

    const _hideSaveScore = () => {
        _rem(_ssPanel, 'active');
        const inp = /** @type {HTMLInputElement|null} */ ($('ss-name-input'));
        if (inp) inp.replaceWith(inp.cloneNode(true));
    };

    const _submitScore = (mode) => {
        const inp  = /** @type {HTMLInputElement|null} */ ($('ss-name-input'));
        const name = inp ? inp.value.trim() : '';
        _postScore(name || 'Anonymous', _score, mode)
            .then(() => { _hideSaveScore(); _setState('menu'); })
            .catch(() => { _hideSaveScore(); _setState('menu'); });
    };

// ─── Leaderboard render ───────────────────────────────────────────────────────

    const _renderLB = () => {
        const list = $('lb-list');
        if (!list) return;
        list.innerHTML = '<div class="lb-empty">Loading…</div>';
        _fetchLB().then((entries) => {
            if (!entries.length) {
                list.innerHTML = '<div class="lb-empty">No scores yet.</div>';
                return;
            }
            const rank = (i) => i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
            list.innerHTML = entries.map((e, i) => `
            <div class="lb-row">
              <span class="lb-rank ${rank(i)}">${i + 1}</span>
              <span class="lb-name">${e.name.slice(0, 20)}</span>
              <span class="lb-score">${e.score} m</span>
            </div>`).join('');
        }).catch(() => {
            list.innerHTML = '<div class="lb-empty">Could not load scores.</div>';
        });
    };

// ─── Keybind listening ────────────────────────────────────────────────────────

    let _listeningFor = null;
    const _fmtKey = (k) => ({
        ArrowLeft: '← Left', ArrowRight: '→ Right',
        ArrowUp:   '↑ Up',   ArrowDown:  '↓ Down', ' ': 'Space'
    }[k] || k);

    const _listenForKey = (action, btn) => {
        if (_listeningFor) return;
        _listeningFor = action;
        _add(btn, 'listening');
        btn.textContent = '...';
        const handler = (e) => {
            e.preventDefault(); e.stopPropagation();
            _keys[action] = e.key;
            _rem(btn, 'listening');
            btn.textContent = _fmtKey(e.key);
            _listeningFor   = null;
            window.removeEventListener('keydown', handler, true);
        };
        window.addEventListener('keydown', handler, true);
    };

// ─── setState + syncUI ────────────────────────────────────────────────────────

    const _setState = (next) => { _state = next; _syncUI(); };

    const _syncUI = () => {
        const on = _state !== 'off';

        _cls(_gc,     'active', on);
        _cls(_hudEl,  'active', _state === 'playing' || _state === 'paused');
        _cls(_menuEl, 'active', _state === 'menu'    || _state === 'paused');

        const titleEl    = $('game-menu-title');
        const subtitleEl = $('game-menu-subtitle');
        if (titleEl && subtitleEl) {
            if (_state === 'menu')   { titleEl.textContent = 'ARENA MODE'; subtitleEl.textContent = 'Jump on labs. Reach for the top.'; }
            if (_state === 'paused') { titleEl.textContent = 'PAUSED';     subtitleEl.textContent = `Height: ${_score} m`; }
        }

        const resumeBtn = $('menu-resume-btn');
        const stopBtn   = $('menu-stop-btn');
        const playBtn   = $('menu-play-btn');
        if (resumeBtn) resumeBtn.style.display = _state === 'paused' ? 'block' : 'none';
        if (stopBtn)   stopBtn.style.display   = _state === 'paused' ? 'block' : 'none';
        if (playBtn)   playBtn.style.display   = _state === 'menu'   ? 'block' : 'none';

        window._gameModeActive = on;

        const laboEl   = $('labo-container');
        const searchEl = $q('.search-container');
        const closeEl  = $('close-all-btn');
        const h1El     = $q('h1');

        _css(laboEl,   'pointer-events', on ? 'none' : '');
        _css(searchEl, 'pointer-events', on ? 'none' : '');
        _css(closeEl,  'pointer-events', on ? 'none' : '');
        _css(laboEl,   'opacity', on ? '0.18' : '');
        _css(h1El,     'opacity', on ? '0.1'  : '');
        _css(searchEl, 'opacity', on ? '0.1'  : '');
    };

// ─── Build overlay HTML ───────────────────────────────────────────────────────

    const _buildUI = () => {
        if (_menuEl) {
            _menuEl.innerHTML = `
          <div class="game-menu-box">
            <div class="game-menu-title" id="game-menu-title">ARENA MODE</div>
            <div class="game-menu-subtitle" id="game-menu-subtitle">Jump on labs. Reach for the top.</div>
            <button class="menu-btn primary" id="menu-play-btn">&#9654; Play <small>(Enter)</small></button>
            <button class="menu-btn primary" id="menu-resume-btn" style="display:none">&#9654; Resume <small>(Enter)</small></button>
            <button class="menu-btn" id="menu-lb-btn">&#127942; Leaderboard</button>
            <button class="menu-btn" id="menu-kb-btn">&#9000; Keybinds</button>
            <button class="menu-btn danger" id="menu-stop-btn" style="display:none">&#9632; End &amp; Save</button>
            <button class="menu-btn danger" id="menu-exit-btn">&#10005; Exit Arena</button>
          </div>`;
            $('menu-play-btn')  ?.addEventListener('click', _startGame);
            $('menu-resume-btn')?.addEventListener('click', _resumeGame);
            $('menu-lb-btn')    ?.addEventListener('click', () => { _renderLB(); _add(_lbPanel, 'active'); });
            $('menu-kb-btn')    ?.addEventListener('click', () => _add(_kbPanel, 'active'));
            $('menu-stop-btn')  ?.addEventListener('click', _stopGame);
            $('menu-exit-btn')  ?.addEventListener('click', _hardExit);
        }

        if (_lbPanel) {
            _lbPanel.innerHTML = `
          <div class="leaderboard-box">
            <div class="lb-title">Leaderboard</div>
            <div id="lb-list"><div class="lb-empty">Loading…</div></div>
            <button class="lb-close-btn" id="lb-close-btn">&#8592; Back</button>
          </div>`;
            $('lb-close-btn')?.addEventListener('click', () => _rem(_lbPanel, 'active'));
        }

        if (_kbPanel) {
            _kbPanel.innerHTML = `
          <div class="keybind-box">
            <div class="kb-title">Keybinds</div>
            <div class="kb-row">
              <span class="kb-action">Move Left</span>
              <button class="kb-key-btn" id="kb-left">${_fmtKey(_keys.left)}</button>
            </div>
            <div class="kb-row">
              <span class="kb-action">Move Right</span>
              <button class="kb-key-btn" id="kb-right">${_fmtKey(_keys.right)}</button>
            </div>
            <div class="kb-row">
              <span class="kb-action">Jump</span>
              <button class="kb-key-btn" id="kb-jump">${_fmtKey(_keys.jump)}</button>
            </div>
            <button class="kb-save-btn" id="kb-save-btn">Save &amp; Close</button>
          </div>`;
            $('kb-left') ?.addEventListener('click', (e) => _listenForKey('left',  /** @type {HTMLElement} */ (e.currentTarget)));
            $('kb-right')?.addEventListener('click', (e) => _listenForKey('right', /** @type {HTMLElement} */ (e.currentTarget)));
            $('kb-jump') ?.addEventListener('click', (e) => _listenForKey('jump',  /** @type {HTMLElement} */ (e.currentTarget)));
            $('kb-save-btn')?.addEventListener('click', () => { _saveKeys(); _rem(_kbPanel, 'active'); });
        }

        if (_ssPanel) {
            _ssPanel.innerHTML = `
          <div class="save-score-box">
            <div class="ss-title">GAME OVER</div>
            <div class="ss-score" id="ss-score">0 m</div>
            <div class="ss-score-label">HEIGHT REACHED</div>
            <input class="ss-input" id="ss-name-input" type="text"
                   placeholder="Enter your name..." maxlength="24"
                   autocomplete="off" spellcheck="false">
            <div class="ss-btn-row" id="ss-mode-row" style="display:none">
              <button class="ss-btn" id="ss-override-btn" title="Replace your previous score">&#8593; Override</button>
              <button class="ss-btn confirm" id="ss-new-btn" title="Add as a separate entry">+ Save New</button>
            </div>
            <div class="ss-btn-row">
              <button class="ss-btn" id="ss-skip-btn">Skip</button>
              <button class="ss-btn confirm" id="ss-save-btn">Save Score</button>
            </div>
            <div style="font-size: 10px; margin-top: 10px; opacity: 0.5;">Press Enter (with empty name) to play again</div>
          </div>`;
            $('ss-save-btn')    ?.addEventListener('click', () => _submitScore('new'));
            $('ss-override-btn')?.addEventListener('click', () => _submitScore('override'));
            $('ss-new-btn')     ?.addEventListener('click', () => _submitScore('new'));
            $('ss-skip-btn')    ?.addEventListener('click', () => { _hideSaveScore(); _backToMenu(); });
            $('ss-name-input')  ?.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const val = /** @type {HTMLInputElement} */ (e.currentTarget).value.trim();
                    if (val) _submitScore('new');
                }
            });
        }

        if (_hudEl) {
            _hudEl.innerHTML = `<div id="hud-height">0 m</div><div id="hud-label">Height</div>`;
        }
    };

    const _wireSwitch = () => {
        const sw = /** @type {HTMLInputElement|null} */ ($('game-switch'));
        if (!sw) return;
        sw.addEventListener('change', () => {
            if (sw.checked) _setState('menu');
            else _hardExit();
        });
    };

    _buildUI();
    _wireSwitch();
    _syncUI();

})();