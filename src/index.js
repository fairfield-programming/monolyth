// START TIME: 2:46PM - Added Leaderboard Backend
// END TIME: 3:12PM

// START TIME: 5:22PM - Added Leaderboard Frontend
// END TIME: 6:17PM

// START TIME: 8:26AM - Added Countdown
// END TIME: 8:36AM 

// 8:38 - Made fun of Dr. Kuhn

// START TIME: 9:56AM - Added Question Backend
// END TIME: 10:03AM

// START TIME: 10:05 - Added Question Frontend


const express = require('express')
const app = express()
const port = process.env.PORT || 8080
const fs = require('fs');

const questions = JSON.parse(fs.readFileSync('./questions.json', 'utf8'));
const leaderboard = [
    {
        name: "Greens Farms Academy",
        points: 200
    },
    {
        name: "Rye Country Day School",
        points: 100
    },
    {
        name: "Fairfield Prep",
        points: 300
    },
    {
        name: "Saint Lukes",
        points: 240
    }
];

app.use(express.static('public'))

app.get('/api/question', (req, res) => {

    res.json(questions);

});

app.get('/api/question/:id/', (req, res) => {

    if (req.params.id == undefined) return res.status(400).send("Not All Parameters Provided.");

    let item = questions[req.params.id];

    if (item == null || item == undefined) return res.status(404).send("Not Found");

    res.json(questions[req.params.id]);

});

app.get('/api/scores', (req, res) => {

    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    res.writeHead(200, headers);

    var intervalID = null; // has to be any scope

    res.write(`data: ${JSON.stringify(leaderboard)}\n\n`);

    req.on('close', () => {

        clearInterval(intervalID);

    });

    intervalID = setInterval(() => {

        const data = `data: ${JSON.stringify(leaderboard)}\n\n`;
        res.write(data);

    }, 1000);

});

app.listen(port, () => {
    
    console.log(`Example app listening on port ${port}`)
    
});