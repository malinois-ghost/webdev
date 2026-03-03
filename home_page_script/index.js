const labs = [
    {
        course: "Web Development 1",
        title: "Labo 2",
        projects: [
            { name: "Opdracht 3", url: "labo_2/opdracht_3.html" },
            { name: "Opdracht 4", url: "labo_2/opdracht_4.html" },
            { name: "Opdracht 5", url: "labo_2/opdracht_5.html" },
            { name: "Opdracht 8", url: "labo_2/opdracht_8.html" },
            { name: "Opdracht 9", url: "labo_2/opdracht_9.html" },
            { name: "Opdracht 10", url: "labo_2/opdracht_10.html" }
        ]
    },
    {
        course: "Web Development 1",
        title: "Labo 3",
        projects: [
            { name: "Personal homepage", url: "labo_3/personal_homepage/personal_homepage.html" },
            { name: "Contact", url: "labo_3/contact/contact.html" },
            { name: "Opleidingsaanbod", url: "labo_3/opleidingsaanbod/opleidingsaanbod.html" },
            { name: "Personal homepage uitbreiding", url: "labo_3/personal_homepage_uitbreiding/personal_homepage_uitbreiding.html" }
        ]
    },
    {
        course: "Web Development 1",
        title: "Labo 4",
        projects: [
            { name: "Personal homepage opsplitsing", url: "labo_4/personal_homepage_opsplitsing.html" }
        ]
    },
    {
        course: "Web Development 1",
        title: "Labo 5",
        projects: [
            { name: "Opdracht 6", url: "labo_5/opdracht_6.html" },
            { name: "Opdracht 7", url: "labo_5/opdracht_7.html" }
        ]
    },
    {
        course: "Web Development 1",
        title: "Labo 6",
        projects: [
            { name: "Opdracht 1", url: "labo_6/opdracht_1.html" },
            { name: "Opdracht 3", url: "labo_6/opdracht_3.html" },
            { name: "Opdracht 4", url: "labo_6/opdracht_4.html" },
            { name: "Opdracht 5", url: "labo_6/opdracht_5.html" },
            { name: "Opdracht 6", url: "labo_6/opdracht_6.html" }
        ]
    },
    {
        course: "Web Development 1",
        title: "Labo 7",
        projects: [
            { name: "Nature blog", url: "labo_7/nature_blog/nature_blog.html" },
            { name: "Personal homepage with CSS", url: "labo_7/personal_homepage_with_css.html" },
            { name: "Personal homepage friends", url: "labo_7/personal_homepage_friends.html" },
            { name: "Calender", url: "labo_7/calender.html" }
        ]
    },
    {
        course: "Web Development 1",
        title: "Labo 8",
        projects: [
            { name: "Lorem Ipsum", url: "labo_8/lorem_ipsum.html" },
            { name: "Lorem Ipsum Extra Space", url: "labo_8/lorem_ipsum_extra_space.html" },
            { name: "Cocktail Bar", url: "labo_8/cocktail_bar.html" }
        ]
    },
    {
        course: "Web Development 1",
        title: "Labo 9",
        projects: [
            { name: "Positioneren van images", url: "labo_9/positioneren_van_images.html" },
            { name: "Airbus", url: "labo_9/airbus.html" }
        ]
    },
    {
        course: "Web Development 1",
        title: "Labo 10",
        projects: [
            { name: "Media queries", url: "labo_10/media_queries.html" },
            { name: "Bootstrap 5 - Opdracht 1", url: "labo_10/boodstrap_opdracht_1.html" },
            { name: "Bootstrap 5 - Opdracht 2", url: "labo_10/boodstrap_opdracht_2.html" },
            { name: "Bootstrap 5 - Composition A", url: "labo_10/boodstrap_composition_a.html" },
            { name: "Bootstrap 5 - Personal HomePage", url: "labo_10/boodstrap_personal_homepage.html" }
        ]
    },
    {
        course: "Web Development 1",
        title: "Labo 11",
        projects: [
            { name: "Grid Oefeningen", url: "labo_11/grid_oefeningen.html" },
            { name: "Extra Oefening", url: "labo_11/extra_oefening.html" }
        ]
    },
    {
        course: "Web Development 1",
        title: "Labo 12",
        projects: [
            { name: "Opdracht 2", url: "labo_12/opdracht_2.html" },
            { name: "Opdracht 3", url: "labo_12/opdracht_3.html" },
            { name: "Opdracht 4", url: "labo_12/opdracht_4.html" }
        ]
    },
    {
        course: "Web Development 1",
        title: "Labo 13",
        projects: [
            { name: "Opdracht 2", url: "labo_13/opdracht_2/index.html" },
            { name: "Opdracht 3", url: "labo_13/opdracht_3/opdracht_3.html" }
        ]
    },
    {
        course: "Web Development 1",
        title: "Labo 14",
        projects: [
            { name: "Arrays", url: "labo_14/arrays.html" },
            { name: "Dialoogvensters", url: "labo_14/dialoogvensters.html" },
            { name: "innerHTML", url: "labo_14/inner_html.html" },
            { name: "innerHTML aanpassing", url: "labo_14/inner_html_aanpassing.html" },
            { name: "kopieer", url: "labo_14/kopieer.html" },
            { name: "substring", url: "labo_14/substring.html" }
        ]
    },
    {
        course: "Web Development 1",
        title: "Labo 15",
        projects: [
            { name: "Paragrafen", url: "labo_15/paragrafen.html" },
            { name: "Colorpicker", url: "labo_15/colorpicker.html" },
            { name: "Kleurenwisselaar", url: "labo_15/kleurenwisselaar.html" },
            { name: "Producten", url: "labo_15/producten.html" },
        ]
    }
];

let courseQuery = "";
let labQuery = "";
let projectQuery = "";

const getActiveLabs = () => {
    const saved = localStorage.getItem('activeLabs');
    return saved ? JSON.parse(saved) : [];
};

const toggleLabStorage = (labTitle) => {
    let activeLabs = getActiveLabs();
    if (activeLabs.includes(labTitle)) {
        activeLabs = activeLabs.filter(title => title !== labTitle);
    } else {
        activeLabs.push(labTitle);
    }
    localStorage.setItem('activeLabs', JSON.stringify(activeLabs));
};

const renderLabs = () => {
    const container = document.getElementById('labo-container');
    const courseInput = document.getElementById('course-filter');
    const labInput = document.getElementById('lab-filter');
    const projectInput = document.getElementById('project-filter');
    const pageTitle = document.querySelector('h1');

    if (!container) return;
    container.innerHTML = '';

    const activeLabs = getActiveLabs();
    const trimmedLabQuery = labQuery.trim().toLowerCase();
    const trimmedCourseQuery = courseQuery.trim().toLowerCase();
    const trimmedProjectQuery = projectQuery.trim().toLowerCase();

    const filteredLabs = labs.filter(lab => {
        let matchesCourse = true;
        if (trimmedCourseQuery !== "") {
            const isNumeric = /^\d+$/.test(trimmedCourseQuery);
            const courseParts = lab.course.toLowerCase().split(' ');
            const courseNumStr = courseParts[courseParts.length - 1];
            matchesCourse = isNumeric ? courseNumStr === trimmedCourseQuery : lab.course.toLowerCase().includes(trimmedCourseQuery);
        }

        let matchesLab = true;
        if (trimmedLabQuery !== "") {
            const isNumeric = /^\d+$/.test(trimmedLabQuery);
            const titleParts = lab.title.toLowerCase().split(' ');
            const labNumStr = titleParts[titleParts.length - 1];
            matchesLab = isNumeric ? labNumStr === trimmedLabQuery : lab.title.toLowerCase().includes(trimmedLabQuery);
        }

        if (trimmedProjectQuery !== "") {
            const hasMatchingProject = lab.projects.some(p => p.name.toLowerCase().includes(trimmedProjectQuery));
            return matchesCourse && matchesLab && hasMatchingProject;
        }

        return matchesCourse && matchesLab;
    });

    const exampleSource = filteredLabs.length > 0 ? filteredLabs[0] : labs[0];
    const exCourseNum = exampleSource.course.split(' ').pop();
    const exLabNum = exampleSource.title.split(' ').pop();
    const matchingProject = exampleSource.projects.find(p => p.name.toLowerCase().includes(trimmedProjectQuery)) || exampleSource.projects[0];
    const exProjectName = matchingProject.name;

    if (courseInput) courseInput.placeholder = `Vak (bijv. ${exCourseNum}) of naam...`;
    if (labInput) labInput.placeholder = `Labo (bijv. ${exLabNum}) of naam...`;

    if (projectInput) {
        projectInput.style.display = 'inline-block';
        projectInput.placeholder = `bijv. (${exProjectName})`;
    }

    if (pageTitle) {
        const match = trimmedCourseQuery.match(/\d+/);

        if (match) {
            pageTitle.textContent = `Web Development ${match[0]}`;
        } else if (trimmedCourseQuery.length > 0) {
            pageTitle.textContent = "Web Development";
        } else {
            pageTitle.textContent = "Web Development";
        }
    }

    filteredLabs.forEach(lab => {
        const labDiv = document.createElement('div');
        labDiv.className = 'labo';

        const shouldBeOpen = activeLabs.includes(lab.title) ||
            (trimmedProjectQuery !== "") ||
            (filteredLabs.length === 1 && (trimmedLabQuery !== "" || trimmedCourseQuery !== ""));

        if (shouldBeOpen) labDiv.classList.add('active');

        const title = document.createElement('h2');
        title.innerHTML = `<span>${lab.title}</span><small style="font-size: 0.6em; opacity: 0.7; margin-left: 10px;">${lab.course}</small>`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'labo-content';

        const visibleProjects = lab.projects.filter(proj =>
            proj.name.toLowerCase().includes(trimmedProjectQuery)
        );

        visibleProjects.forEach(project => {
            const btn = document.createElement('a');
            btn.href = project.url;
            btn.className = 'project-btn';
            btn.textContent = project.name;
            contentDiv.appendChild(btn);
        });

        title.addEventListener('click', () => {
            labDiv.classList.toggle('active');
            toggleLabStorage(lab.title);
        });

        labDiv.appendChild(title);
        labDiv.appendChild(contentDiv);
        container.appendChild(labDiv);
    });
};

const setupControls = () => {
    const courseInput = document.getElementById('course-filter');
    const labInput = document.getElementById('lab-filter');
    const projectInput = document.getElementById('project-filter');
    const clearBtn = document.getElementById('clear-search-btn');
    const closeAllBtn = document.getElementById('close-all-btn');

    if (courseInput) courseInput.addEventListener('input', (e) => { courseQuery = e.target.value; renderLabs(); });
    if (labInput) labInput.addEventListener('input', (e) => { labQuery = e.target.value; renderLabs(); });
    if (projectInput) projectInput.addEventListener('input', (e) => { projectQuery = e.target.value; renderLabs(); });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            courseQuery = ""; labQuery = ""; projectQuery = "";
            courseInput.value = ""; labInput.value = ""; projectInput.value = "";
            renderLabs();
        });
    }

    if (closeAllBtn) {
        closeAllBtn.addEventListener('click', () => {
            courseQuery = ""; labQuery = ""; projectQuery = "";
            courseInput.value = ""; labInput.value = ""; projectInput.value = "";
            localStorage.removeItem('activeLabs');
            renderLabs();
        });
    }
};

const initOrb = () => {
    let orb = document.querySelector('.cursor-orb');
    if (!orb) {
        orb = document.createElement('div');
        orb.className = 'cursor-orb';
        document.body.appendChild(orb);
    }

    let hasMoved = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let trailTimeout;

    const updateMouseProps = (e) => {
        if (!hasMoved) {
            hasMoved = true;
            orb.classList.add('visible');
            document.documentElement.style.setProperty('--torch-intensity', '0.2');
        }

        const x = e.clientX;
        const y = e.clientY;

        const deltaX = Math.abs(x - lastMouseX);
        const deltaY = Math.abs(y - lastMouseY);
        const velocity = deltaX + deltaY;

        if (velocity > 15) {
            orb.classList.add('trailing');
            clearTimeout(trailTimeout);
            trailTimeout = setTimeout(() => {
                orb.classList.remove('trailing');
            }, 100);
        }

        orb.style.left = `${x}px`;
        orb.style.top = `${y}px`;

        const angle = Math.atan2(y - lastMouseY, x - lastMouseX) * 180 / Math.PI;
        if (velocity > 15) {
            orb.style.transform = `translate(-50%, -50%) rotate(${angle}deg) scaleX(1.3)`;
        } else {
            orb.style.transform = `translate(-50%, -50%)`;
        }

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
        document.documentElement.style.setProperty('--torch-intensity', '0.3');
    });

    window.addEventListener('mouseup', () => {
        orb.classList.remove('clicking');
        document.documentElement.style.setProperty('--torch-intensity', '0.2');
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

window.addEventListener('load', () => {
    renderLabs();
    setupControls();
    initOrb();
});