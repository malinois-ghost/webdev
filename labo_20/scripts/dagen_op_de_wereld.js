const setup = () => {
    let today = new Date();
    let birthday = new Date("2007-8-23")

    today.setHours(0, 0, 0, 0);
    birthday.setHours(0, 0, 0, 0);

    calculateDayDifference(today, birthday)
}

const calculateDayDifference = (today, birthday) => {
    let difference = today - birthday
    let differenceDays = difference/1000/60/60/24
    console.log(differenceDays)
}

window.addEventListener("load", setup)