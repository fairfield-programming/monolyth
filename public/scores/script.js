const scoresEvent = new EventSource("/api/scores");

const leaderboardScore = document.getElementById("leaderboardScore");
const leaderboard = document.getElementById("leaderboard");

const countDownDate = new Date("Jan 5, 2024 15:37:25").getTime();

var myCanvas = document.createElement('canvas');
document.body.appendChild(myCanvas);

// var myConfetti = confetti.create(myCanvas, {
//   resize: true,
//   useWorker: true
// });
// myConfetti({
//   particleCount: 100,
//   spread: 160
//   // any other options from the global
//   // confetti function
// });

function updateDescription () {

    var now = new Date().getTime();
    var distance = countDownDate - now;

    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (seconds < 10) seconds = "0" + seconds;
    if (minutes < 10) minutes = "0" + minutes; 

    leaderboardScore.innerHTML = `Only ${hours}:${minutes}:${seconds} Left...`;

}

updateDescription();
setInterval(updateDescription, 1000)

scoresEvent.onopen = (data) => {

    console.log(data);

}

scoresEvent.onerror = (error) => {

    console.log(error);

}


scoresEvent.onmessage = (data) => {

    var list = JSON.parse(data.data);

    list.sort((a, b) => (a.points < b.points) ? 1 : -1);

    leaderboard.innerHTML = '';

    list.forEach((element, i) => {

        let place = "";

        if (i == 0) place = "first"
        if (i == 1) place = "second"
        if (i == 2) place = "third"

        addLeaderboardItem({
            name: element.name,
            points: element.points,
            place,
        }, leaderboard);
        
    });

};

function addLeaderboardItem(data, leaderboard) {

    const container = document.createElement("DIV");
    container.classList.add("leaderboardItem");

    const icon = document.createElement("IMG");
    icon.setAttribute('src', `/res/${data.place}.svg`);
    icon.classList.add("leaderboardIcon");

    const label = document.createElement("H2");
    label.innerHTML = data.name;

    const points = document.createElement("H3");
    points.innerHTML = `has earned ${data.points} points`;

    container.append(label);
    container.append(points);
    if (data.place != "") container.append(icon);

    leaderboard.append(container);

}