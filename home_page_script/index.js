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
            { name: "Kleurenwisselaar", url: "labo_15/kleurenwisselaar.html" }
        ]
    }
];

let courseQuery = "";
let labQuery = "";
let projectQuery = "";

const renderLabs = () => {
    const container = document.getElementById('labo-container');
    const courseInput = document.getElementById('course-filter');
    const labInput = document.getElementById('lab-filter');
    const projectInput = document.getElementById('project-filter');
    const pageTitle = document.querySelector('h1');

    container.innerHTML = '';

    const savedLab = localStorage.getItem('activeLab');
    const trimmedLabQuery = labQuery.trim().toLowerCase();
    const trimmedCourseQuery = courseQuery.trim().toLowerCase();

    const filteredLabs = labs.filter(lab => {
        let matchesCourse = true;
        if (trimmedCourseQuery !== "") {
            const isNumeric = /^\d+$/.test(trimmedCourseQuery);
            const courseParts = lab.course.toLowerCase().split(' ');
            const courseNumStr = courseParts[courseParts.length - 1];
            if (isNumeric) {
                matchesCourse = courseNumStr === trimmedCourseQuery;
            } else {
                matchesCourse = lab.course.toLowerCase().includes(trimmedCourseQuery);
            }
        }

        let matchesLab = true;
        if (trimmedLabQuery !== "") {
            const isNumeric = /^\d+$/.test(trimmedLabQuery);
            const titleParts = lab.title.toLowerCase().split(' ');
            const labNumStr = titleParts[titleParts.length - 1];
            if (isNumeric) {
                matchesLab = labNumStr === trimmedLabQuery;
            } else {
                matchesLab = lab.title.toLowerCase().includes(trimmedLabQuery);
            }
        }
        return matchesCourse && matchesLab;
    });

    if (pageTitle) {
        const isNumeric = /^\d+$/.test(trimmedCourseQuery);
        if (isNumeric) {
            pageTitle.textContent = `Web Development ${trimmedCourseQuery}`;
        } else if (trimmedCourseQuery !== "" && filteredLabs.length > 0) {
            const firstCourseName = filteredLabs[0].course;
            pageTitle.textContent = (trimmedCourseQuery === firstCourseName.toLowerCase()) ? firstCourseName : "Web Development";
        } else {
            pageTitle.textContent = "Web Development";
        }
    }

    if (filteredLabs.length > 0) {
        const firstLab = filteredLabs[0];
        const courseNum = firstLab.course.split(' ').pop();
        const labNum = firstLab.title.split(' ').pop();

        courseInput.placeholder = `Vak (bijv. ${courseNum}) of naam...`;
        labInput.placeholder = `Labo (bijv. ${labNum}) of naam...`;

        courseInput.size = courseInput.placeholder.length;
        labInput.size = labInput.placeholder.length;

        if (filteredLabs.length === 1) {
            projectInput.style.display = 'inline-block';
            projectInput.placeholder = firstLab.projects[0].name;
            projectInput.size = projectInput.placeholder.length;
        } else {
            projectInput.style.display = 'none';
            projectQuery = "";
        }
    }

    filteredLabs.forEach(lab => {
        const labDiv = document.createElement('div');
        labDiv.className = 'labo';

        const isOnlyResult = (trimmedLabQuery !== "" || trimmedCourseQuery !== "") && filteredLabs.length === 1;
        if (lab.title === savedLab || isOnlyResult) {
            labDiv.classList.add('active');
        }

        const title = document.createElement('h2');
        title.innerHTML = `<span>${lab.title}</span><small style="font-size: 0.6em; opacity: 0.7; margin-left: 10px;">${lab.course}</small>`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'labo-content';

        const filteredProjects = lab.projects.filter(proj =>
            proj.name.toLowerCase().includes(projectQuery.toLowerCase())
        );

        filteredProjects.forEach(project => {
            const btn = document.createElement('a');
            btn.href = project.url;
            btn.className = 'project-btn';
            btn.textContent = project.name;
            btn.addEventListener('click', () => localStorage.setItem('activeLab', lab.title));
            contentDiv.appendChild(btn);
        });

        title.addEventListener('click', () => {
            const isActive = labDiv.classList.toggle('active');
            isActive ? localStorage.setItem('activeLab', lab.title) : localStorage.removeItem('activeLab');
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

    courseInput.addEventListener('input', (e) => {
        courseQuery = e.target.value;
        renderLabs();
    });

    labInput.addEventListener('input', (e) => {
        labQuery = e.target.value;
        renderLabs();
    });

    projectInput.addEventListener('input', (e) => {
        projectQuery = e.target.value;
        renderLabs();
    });

    clearBtn.addEventListener('click', () => {
        courseQuery = ""; labQuery = ""; projectQuery = "";
        courseInput.value = ""; labInput.value = ""; projectInput.value = "";
        renderLabs();
    });
};

window.addEventListener('load', () => {
    renderLabs();
    setupControls();
});