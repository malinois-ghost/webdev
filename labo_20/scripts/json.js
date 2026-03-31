let student1 = {
    voornaam : "Jan",
    familienaam : "Janssens",
    geboorteDatum : new Date("1993-12-31"),
    adres : {
        straat : "Kerkstraat 13",
        postcode : "8500",
        gemeente : "Duitsland"
    },
    isIngeschreven : true,
    namenVanExen :
        ["Sofie", "Berta", "Philip", "Albertoooo"],
    aantalAutos : 2
}

const setup = () => {
    let stringStudent1 = JSON.stringify(student1);
    console.log(stringStudent1);

    let jsonStudent1 = JSON.parse(stringStudent1);
    console.log(jsonStudent1);
}

window.addEventListener('load', setup);