const setup = () =>{
    let leeftijd = 34;
    let intrest = 0.12;
    let isGevaarlijk=true;
    let vandaag = new Date();
    const print = (message) => {
        console.log(message);
    }

    let leeftijdveld = document.getElementsByClassName("leeftijd")[0];
    let intrestveld = document.getElementsByClassName("intrest")[0];
    let gevaarlijkveld = document.getElementsByClassName("gevaarlijk")[0];
    let vandaagveld = document.getElementsByClassName("vandaag")[0];
    let printveld = document.getElementsByClassName("print")[0];

    leeftijdveld.textContent = typeof(leeftijd);
    intrestveld.textContent = typeof(intrest);
    gevaarlijkveld.textContent = typeof(isGevaarlijk);
    vandaagveld.textContent = typeof(vandaag);
    printveld.textContent = typeof(print);
}

window.addEventListener("load", setup);
