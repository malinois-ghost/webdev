const setup = () => {
    const btnValideer = document.getElementById("btn");
    btnValideer.addEventListener("click", valideerFormulier);
}

const isGetal = (tekst) => {
    return !isNaN(tekst) && tekst.trim() !== "";
}

const valideerFormulier = () => {
    let allesCorrect = true;

    const voornaamInput = document.getElementById('voornaam');
    const errVoornaam = document.getElementById('errVoornaam');
    const voornaam = voornaamInput.value.trim();

    voornaamInput.classList.remove('error-border');
    errVoornaam.textContent = "";

    if (voornaam.length > 30) {
        voornaamInput.classList.add('error-border');
        errVoornaam.textContent = "max. 30 karakters";
        allesCorrect = false;
    }

    const familienaamInput = document.getElementById('familienaam');
    const errFamilienaam = document.getElementById('errFamilienaam');
    const familienaam = familienaamInput.value.trim();

    familienaamInput.classList.remove('error-border');
    errFamilienaam.textContent = "";

    if (familienaam === "") {
        familienaamInput.classList.add('error-border');
        errFamilienaam.textContent = "verplicht veld";
        allesCorrect = false;
    } else if (familienaam.length > 50) {
        familienaamInput.classList.add('error-border');
        errFamilienaam.textContent = "max 50 karakters";
        allesCorrect = false;
    }

    const datumInput = document.getElementById('geboortedatum');
    const errDatum = document.getElementById('errGeboortedatum');
    const datum = datumInput.value.trim();

    datumInput.classList.remove('error-border');
    errDatum.textContent = "";

    const delen = datum.split('-');
    const jaar = delen[0];
    const maand = delen[1];
    const dag = delen[2];

    const isCorrectFormaat =
        datum.length === 10 &&
        delen.length === 3 &&
        jaar.length === 4 && isGetal(jaar) &&
        maand.length === 2 && isGetal(maand) &&
        dag.length === 2 && isGetal(dag);

    if (datum === "") {
        datumInput.classList.add('error-border');
        errDatum.textContent = "verplicht veld";
        allesCorrect = false;
    } else if (!isCorrectFormaat) {
        datumInput.classList.add('error-border');
        errDatum.textContent = "formaat is niet jjjj-mm-dd";
        allesCorrect = false;
    }

    const emailInput = document.getElementById('email');
    const errEmail = document.getElementById('errEmail');
    const email = emailInput.value.trim();

    emailInput.classList.remove('error-border');
    errEmail.textContent = "";

    const atIndex = email.indexOf('@');
    const lastAtIndex = email.lastIndexOf('@');

    if (email === "") {
        emailInput.classList.add('error-border');
        errEmail.textContent = "verplicht veld";
        allesCorrect = false;
    } else if (atIndex === -1 || atIndex !== lastAtIndex || atIndex === 0 || atIndex === email.length - 1) {
        emailInput.classList.add('error-border');
        errEmail.textContent = "geen geldig email adres";
        allesCorrect = false;
    }

    const kinderenInput = document.getElementById('kinderen');
    const errKinderen = document.getElementById('errKinderen');
    const aantal = kinderenInput.value.trim();

    kinderenInput.classList.remove('error-border');
    errKinderen.textContent = "";

    if (!isGetal(aantal) || Number(aantal) < 0) {
        kinderenInput.classList.add('error-border');
        errKinderen.textContent = "is geen positief getal";
        allesCorrect = false;
    } else if (Number(aantal) >= 99) {
        kinderenInput.classList.add('error-border');
        errKinderen.textContent = "is te vruchtbaar";
        allesCorrect = false;
    }

    if (allesCorrect) {
        alert('proficiat!');
    }
}

window.addEventListener("load", setup);