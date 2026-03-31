const global = {
    personen: [],
    huidigIndex: -1
};

const leesFormulier = () => {
    return {
        voornaam: document.getElementById("txtVoornaam").value.trim(),
        familienaam: document.getElementById("txtFamilienaam").value.trim(),
        geboorteDatum: document.getElementById("txtGeboorteDatum").value.trim(),
        email: document.getElementById("txtEmail").value.trim(),
        aantalKinderen: document.getElementById("txtAantalKinderen").value.trim()
    };
};

const vulFormulierIn = (persoon) => {
    document.getElementById("txtVoornaam").value = persoon.voornaam;
    document.getElementById("txtFamilienaam").value = persoon.familienaam;
    document.getElementById("txtGeboorteDatum").value = persoon.geboorteDatum;
    document.getElementById("txtEmail").value = persoon.email;
    document.getElementById("txtAantalKinderen").value = persoon.aantalKinderen;
};

const leegFormulier = () => {
    vulFormulierIn({ voornaam: "", familienaam: "", geboorteDatum: "", email: "", aantalKinderen: "" });
};

const maakWeergaveNaam = (persoon) => {
    let naam = persoon.familienaam;
    if (persoon.voornaam.length > 0) {
        naam += ", " + persoon.voornaam;
    }
    return naam;
};

const heeftErrors = () => {
    let errorSpans = document.querySelectorAll(".errorMessage");
    for (let span of errorSpans) {
        if (span.innerHTML.trim().length > 0) {
            return true;
        }
    }
    return false;
};

const herlaadLijst = () => {
    let lstPersonen = document.getElementById("lstPersonen");
    lstPersonen.innerHTML = "";
    for (let i = 0; i < global.personen.length; i++) {
        let option = document.createElement("option");
        option.value = String(i);
        option.text = maakWeergaveNaam(global.personen[i]);
        lstPersonen.appendChild(option);
    }
};

const selecteerInLijst = (index) => {
    let lstPersonen = document.getElementById("lstPersonen");
    lstPersonen.value = index;
};

const bewaarBewerktePersoon = () => {
    console.log("Klik op de knop bewaar");

    valideer();

    if (heeftErrors()) {
        return;
    }

    let persoon = leesFormulier();

    if (global.huidigIndex === -1) {
        global.personen.push(persoon);
        global.huidigIndex = global.personen.length - 1;
    } else {
        global.personen[global.huidigIndex] = persoon;
    }

    herlaadLijst();
    selecteerInLijst(global.huidigIndex);
};

const bewerkNieuwePersoon = () => {
    console.log("Klik op de knop nieuw");

    global.huidigIndex = -1;
    leegFormulier();
    clearAllErrors();
    document.getElementById("lstPersonen").value = -1;
};

const toonGeselecteerdePersoon = () => {
    let lstPersonen = document.getElementById("lstPersonen");
    let geselecteerdeIndex = parseInt(lstPersonen.value);

    if (!isNaN(geselecteerdeIndex) && geselecteerdeIndex >= 0 && geselecteerdeIndex < global.personen.length) {
        global.huidigIndex = geselecteerdeIndex;
        vulFormulierIn(global.personen[global.huidigIndex]);
        clearAllErrors();
    }
};

const setup = () => {
    let btnBewaar = document.getElementById("btnBewaar");
    btnBewaar.addEventListener("click", bewaarBewerktePersoon);

    let btnNieuw = document.getElementById("btnNieuw");
    btnNieuw.addEventListener("click", bewerkNieuwePersoon);

    let lstPersonen = document.getElementById("lstPersonen");
    lstPersonen.addEventListener("change", toonGeselecteerdePersoon);
};

window.addEventListener("load", setup);