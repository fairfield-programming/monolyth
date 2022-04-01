const time = document.getElementById("time");
const text = document.getElementById("text");
const quotesText = document.getElementById("quotesText");

const quotes = [ `"Sláinte Gaelach" - An Irish Toast`, `"Sláinte!" - An Irish Toast`, `"Céad Míle Fáilte!" - An Irish Toast`, ];
const titles = [ "We're Starting Soon!", "Beginning Shortly!", "Just Wait Up a Sec!" ];

text.innerHTML = titles[Math.floor(Math.random() * titles.length)];
quotesText.innerHTML = `${quotes[Math.floor(Math.random() * quotes.length)]}`;

setInterval(() => {

    const countDownDate = new Date("April 2, 2022 11:30").getTime();
    const current = new Date().getTime();
    const distance = countDownDate - current;

    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;

    time.innerHTML = `${minutes}:${seconds}`;

}, 20);

setInterval(() => {

    window.location.href = "/";

}, 5000);