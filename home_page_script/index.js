const labs = [
    {
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
        title: "Labo 3",
        projects: [
            { name: "Personal homepage", url: "labo_3/personal_homepage/personal_homepage.html" },
            { name: "Contact", url: "labo_3/contact/contact.html" },
            { name: "Opleidingsaanbod", url: "labo_3/opleidingsaanbod/opleidingsaanbod.html" },
            { name: "Personal homepage uitbreiding", url: "labo_3/personal_homepage_uitbreiding/personal_homepage_uitbreiding.html" }
        ]
    },
    {
        title: "Labo 4",
        projects: [
            { name: "Personal homepage opsplitsing", url: "labo_4/personal_homepage_opsplitsing.html" }
        ]
    },
    {
        title: "Labo 5",
        projects: [
            { name: "Opdracht 6", url: "labo_5/opdracht_6.html" },
            { name: "Opdracht 7", url: "labo_5/opdracht_7.html" }
        ]
    },
    {
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
        title: "Labo 7",
        projects: [
            { name: "Nature blog", url: "labo_7/nature_blog/nature_blog.html" },
            { name: "Personal homepage with CSS", url: "labo_7/personal_homepage_with_css.html" },
            { name: "Personal homepage friends", url: "labo_7/personal_homepage_friends.html" },
            { name: "Calender", url: "labo_7/calender.html" }
        ]
    },
    {
        title: "Labo 8",
        projects: [
            { name: "Lorem Ipsum", url: "labo_8/lorem_ipsum.html" },
            { name: "Lorem Ipsum Extra Space", url: "labo_8/lorem_ipsum_extra_space.html" },
            { name: "Cocktail Bar", url: "labo_8/cocktail_bar.html" }
        ]
    },
    {
        title: "Labo 9",
        projects: [
            { name: "Positioneren van images", url: "labo_9/positioneren_van_images.html" },
            { name: "Airbus", url: "labo_9/airbus.html" }
        ]
    },
    {
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
        title: "Labo 11",
        projects: [
            { name: "Grid Oefeningen", url: "labo_11/grid_oefeningen.html" },
            { name: "Extra Oefening", url: "labo_11/extra_oefening.html" }
        ]
    },
    {
        title: "Labo 12",
        projects: [
            { name: "Opdracht 2", url: "labo_12/opdracht_2.html" },
            { name: "Opdracht 3", url: "labo_12/opdracht_3.html" },
            { name: "Opdracht 4", url: "labo_12/opdracht_4.html" }
        ]
    },
    {
        title: "Labo 13",
        projects: [
            { name: "Opdracht 2", url: "labo_13/opdracht_2/index.html" }
        ]
    }
];

const renderLabs = () => {
    const container = document.getElementById('labo-container');
    container.innerHTML = '';

    const savedLab = localStorage.getItem('activeLab');

    labs.forEach(lab => {
        const labDiv = document.createElement('div');
        labDiv.className = 'labo';

        if (lab.title === savedLab) {
            labDiv.classList.add('active');
        }

        const title = document.createElement('h2');
        title.textContent = lab.title;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'labo-content';

        lab.projects.forEach(project => {
            const btn = document.createElement('a');
            btn.href = project.url;
            btn.className = 'project-btn';
            btn.textContent = project.name;

            btn.addEventListener('click', () => {
                localStorage.setItem('activeLab', lab.title);
            });

            contentDiv.appendChild(btn);
        });

        title.addEventListener('click', () => {
            const isActive = labDiv.classList.toggle('active');
            
            if (isActive) {
                localStorage.setItem('activeLab', lab.title);
            } else {
                localStorage.removeItem('activeLab');
            }
        });

        labDiv.appendChild(title);
        labDiv.appendChild(contentDiv);
        container.appendChild(labDiv);
    });
};

window.addEventListener('load', renderLabs);