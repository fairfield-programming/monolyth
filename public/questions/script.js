const countDownDate = new Date("Jan 5, 2024 15:37:25").getTime();
const description = document.getElementById('description');
const questions = document.getElementById('questions');
var count = 0;

function updateDescription (questionCount) {

    var now = new Date().getTime();
    var distance = countDownDate - now;

    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (seconds < 10) seconds = "0" + seconds;
    if (minutes < 10) minutes = "0" + minutes;

    description.innerHTML = `You have ${hours}:${minutes}:${seconds} to answer ${questionCount} questions. Each question is worth a number of points. If you answer the question correctly, in a language of your choice, you earn them for your team.`;

}

fetch('/api/question').then(response => response.json()).then((data) => {
    
    count = data.length;

    updateDescription(count);

    data.forEach((item) => {

        addQuestion(item, questions);

    });

});

function addQuestion(data, parent) {

    const container = document.createElement("div");
    const emoji = document.createElement("p");
    const title = document.createElement("h2");
    const description = document.createElement("p");
    
    const hidden = document.createElement("div");
    const childA = document.createElement("div");
    const childB = document.createElement("div");
    const childC = document.createElement("div");
    
    container.classList.add('question');
    emoji.classList.add('rating');
    hidden.classList.add('hidden');

    childA.classList.add('section');
    childB.classList.add('section');
    childC.classList.add('section');

    emoji.innerHTML = data.emoji || "";
    title.innerHTML = data.title || "Untitled";
    description.innerHTML = data.introduction || "";

    childA.innerHTML = `${data.points || 0} Points`;
    childB.innerHTML = `${data.difficulty || "Easy"}`;
    childC.innerHTML = `~${data.time || 2} Minutes`;

    hidden.append(childA);
    hidden.append(childB);
    hidden.append(childC);

    container.append(emoji);
    container.append(title);
    container.append(description);
    container.append(hidden);

    parent.append(container);

}

setInterval(() => {

    updateDescription(count);

}, 1000);