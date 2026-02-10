const setup = () => {
    const familieleden = ["a","b","c","d","e"];

    console.log(familieleden.length);
    console.log(familieleden[0]);
    console.log(familieleden[2]);
    console.log(familieleden[4]);

    const voegNaamToe = (naam) => {
        familieleden.push(naam);
    }

    voegNaamToe(prompt("Geef een naam op: "))
    console.log(familieleden);

    console.log(familieleden.join(" "))
}

window.addEventListener("load", setup);