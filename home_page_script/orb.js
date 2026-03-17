const initOrb = () => {
    let orb = document.querySelector('.cursor-orb');
    if (!orb) {
        orb = document.createElement('div');
        orb.className = 'cursor-orb';
        document.body.appendChild(orb);
    }

    let hasMoved   = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let trailTimeout;

    const applyTorchIntensity = (baseLevel) => {
        const intensity = _torchMax * baseLevel;
        document.documentElement.style.setProperty('--torch-intensity', intensity.toFixed(3));
    };

    const updateMouseProps = (e) => {
        if (!hasMoved) {
            hasMoved = true;
            orb.classList.add('visible');
            applyTorchIntensity(0.2);
        }

        const x = e.clientX;
        const y = e.clientY;

        const deltaX   = Math.abs(x - lastMouseX);
        const deltaY   = Math.abs(y - lastMouseY);
        const velocity = deltaX + deltaY;

        if (velocity > 15) {
            orb.classList.add('trailing');
            clearTimeout(trailTimeout);
            trailTimeout = setTimeout(() => orb.classList.remove('trailing'), 100);
        }

        orb.style.left = `${x}px`;
        orb.style.top  = `${y}px`;

        const angle = Math.atan2(y - lastMouseY, x - lastMouseX) * 180 / Math.PI;
        orb.style.transform = velocity > 15
            ? `translate(-50%, -50%) rotate(${angle}deg) scaleX(1.3)`
            : `translate(-50%, -50%)`;

        document.documentElement.style.setProperty('--mouse-x', `${x}px`);
        document.documentElement.style.setProperty('--mouse-y', `${y}px`);

        lastMouseX = x;
        lastMouseY = y;
    };

    window.addEventListener('mousemove', (e) => {
        requestAnimationFrame(() => updateMouseProps(e));
    });

    document.addEventListener('mouseleave', () => {
        orb.classList.remove('visible');
        document.documentElement.style.setProperty('--torch-intensity', '0');
        hasMoved = false;
    });

    window.addEventListener('mousedown', () => {
        orb.classList.add('clicking');
        applyTorchIntensity(0.35);
    });

    window.addEventListener('mouseup', () => {
        orb.classList.remove('clicking');
        applyTorchIntensity(0.2);
    });

    document.addEventListener('mouseover', (e) => {
        const target = e.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            orb.classList.add('text-mode');
        } else if (target.closest('a, button, .labo h2, #clear-search-btn, #close-all-btn')) {
            orb.classList.add('expanding');
        }
    });

    document.addEventListener('mouseout', (e) => {
        const related = e.relatedTarget;
        if (!related || !related.closest('a, button, .labo h2, input, textarea')) {
            orb.classList.remove('text-mode', 'expanding');
        }
    });
};