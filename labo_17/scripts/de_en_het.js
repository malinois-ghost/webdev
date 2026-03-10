const setup = () =>{
    let button = document.getElementsByClassName("button")[0];

    button.addEventListener("click", de_en_het)
}

const de_en_het = () =>{
    let output = document.getElementsByClassName("output")[0];
    let input = document.getElementsByClassName("text")[0].value.trim().toLowerCase();

    let gewisseld = "";

    for(let i = 0; i < input.length; i++){
        if (input[i] === 'd' && input[i + 1] === 'e' && (i === 0 || input[i - 1] === ' ') && (i + 2 === input.length || input[i + 2] === ' ')) {
            gewisseld += "het";
            i++;
        } else {
            gewisseld += input[i];
        }
    }

    output.textContent = gewisseld;
}

window.addEventListener('load', setup)