const valideer = () => {
    valideerVoornaam();
    valideerFamilienaam();
    valideerGeboorteDatum();
    valideerEmail();
    valideerAantalKinderen();
};

const valideerVoornaam = () => {
    let txtVoornaam = document.getElementById("txtVoornaam");
    let voornaam = txtVoornaam.value.trim();
    if (voornaam.length > 30) {
        reportError(txtVoornaam, "max. 30 karakters");
    } else {
        clearError(txtVoornaam);
    }
};

const valideerFamilienaam = () => {
    let txtFamilienaam = document.getElementById("txtFamilienaam");
    let familienaam = txtFamilienaam.value.trim();
    if (familienaam.length === 0) {
        reportError(txtFamilienaam, "verplicht veld");
    } else if (familienaam.length > 50) {
        reportError(txtFamilienaam, "max. 50 karakters");
    } else {
        clearError(txtFamilienaam);
    }
};

const valideerGeboorteDatum = () => {
    let txtGeboorteDatum = document.getElementById("txtGeboorteDatum");
    let geboorteDatum = txtGeboorteDatum.value.trim();
    if (geboorteDatum.length!==10) {
        reportError(txtGeboorteDatum, "verplicht veld");
    } else {
        let formatCorrect=true;
        if (formatCorrect && !(geboorteDatum.charAt(4)==='-' && geboorteDatum.charAt(7)==='-') ) {
            formatCorrect=false;
        }
        if (formatCorrect) {
            let yearText=geboorteDatum.substring(0,4);
            if (!isPositiveNonZeroNumber(yearText)) {
                formatCorrect=false;
            }
        }
        if (formatCorrect) {
            let monthText=geboorteDatum.substring(5,7);
            if (!isPositiveNonZeroNumber(monthText)) {
                formatCorrect=false;
            }
        }
        if (formatCorrect) {
            let dayText=geboorteDatum.substring(8,11);
            if (!isPositiveNonZeroNumber(dayText)) {
                formatCorrect=false;
            }
        }

        if (formatCorrect) {
            clearError(txtGeboorteDatum);
        } else {
            reportError(txtGeboorteDatum, "formaat is niet jjjj-mm-dd");
        }
    }
};

const valideerEmail = () => {
    let txtEmail = document.getElementById("txtEmail");
    let email = txtEmail.value.trim();
    if (email.length===0) {
        reportError(txtEmail, "verplicht veld");
    } else {
        let formatCorrect=true;
        let idx=email.indexOf("@");

        if (idx<1 || idx===email.length-1) {
            formatCorrect=false;
        }
        idx=email.indexOf("@", idx+1);
        if (formatCorrect && idx!==-1) {
            formatCorrect=false;
        }
        if (formatCorrect) {
            clearError(txtEmail);
        } else {
            reportError(txtEmail, "geen geldig email adres");
        }
    }
};

const valideerAantalKinderen = () => {
    let txtAantalKinderen = document.getElementById("txtAantalKinderen");
    let aantalKinderenText = txtAantalKinderen.value.trim();
    if (aantalKinderenText.length===0) {
        reportError(txtAantalKinderen, "verplicht veld");
    } else if (!isPositiveNumber(aantalKinderenText)) {
        reportError(txtAantalKinderen, "is geen positief getal");
    } else {
        let aantal=parseInt(aantalKinderenText);
        if (aantal>=99) {
            reportError(txtAantalKinderen, "te vruchtbaar");
        } else {
            clearError(txtAantalKinderen);
        }
    }
};

const isPositiveNumber = (text) => {
    let number=parseInt(text, 10);
    return !isNaN(number) && number>=0;
};

const isPositiveNonZeroNumber = (text) => {
    let number=parseInt(text, 10);
    return !isNaN(number) && number>0;
};

const reportError = (element, message) => {
    let elementId=element.getAttribute("id");
    let errElementId="err"+elementId.substring(3, elementId.length);
    let errElement=document.getElementById(errElementId);
    element.className="invalid";
    errElement.innerHTML = message;
};

const clearError = (element) => {
    let elementId=element.getAttribute("id");
    let errElementId="err"+elementId.substring(3, elementId.length);
    let errElement=document.getElementById(errElementId);
    element.className="";
    errElement.innerHTML = "";
};

const clearAllErrors = () => {
    let fieldIds=["txtVoornaam", "txtFamilienaam", "txtGeboorteDatum", "txtEmail", "txtAantalKinderen"];
    for (let i=0;i<fieldIds.length;i++) {
        clearError( document.getElementById(fieldIds[i]));
    }
}
