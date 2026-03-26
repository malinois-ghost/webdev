let _canvas = null;
let _ctx    = null;

const initCanvas = () => {
    _canvas = document.getElementById('sky-canvas');
    _ctx    = _canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
};

const resizeCanvas = () => {
    if (!_canvas) return;
    _canvas.width  = window.innerWidth;
    _canvas.height = window.innerHeight;
};

const getCanvas = () => _canvas;
const getCtx    = () => _ctx;