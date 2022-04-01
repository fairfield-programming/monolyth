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

const path = require('path');
const express = require('express')
const app = express()
const port = process.env.PORT || 8080
const fs = require('fs');

const startDate = new Date("");

const questions = JSON.parse(fs.readFileSync('./questions.json', 'utf8'));
const leaderboard = [
    {
        name: "Greens Farms Academy"
    },
    {
        name: "Rye Country Day School"
    },
    {
        name: "Fairfield Prep"
    },
    {
        name: "Saint Lukes"
    }
];
const submissions = [
    {
        id: 0,
        teamId: 0,
        correct: true
    },
    {
        id: 1,
        teamId: 1,
        correct: true
    }
];

app.use((req, res, next) => {

    var now = new Date().getTime();
    var distance = startDate - now;

    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (seconds > 0) {

        if (req.path == "/res/fpa.svg") return res.sendFile(path.join(__dirname, "../public/res/fpa.svg"));

        if (req.path == "/style.css") return res.sendFile(path.join(__dirname, "../public/wait/style.css"));
        if (req.path == "/script.js") return res.sendFile(path.join(__dirname, "../public/wait/script.js"));

        return res.sendFile(path.join(__dirname, "../public/wait/index.html"));

    }

    return next();

});
app.use(express.static('public'))
app.use(require('body-parser').json())

app.get('/api/question', (req, res) => {

    let output = [];

    questions.forEach((item, id) => {

        output.push(
            preprocessQuestionResponse(
                {
                    ...item,
                    id
                }
            )
        );

    })

    res.json(output);

});

app.get('/api/question/:id/', (req, res) => {

    if (req.params.id == undefined) return res.status(400).send("Not All Parameters Provided.");

    let item = questions[req.params.id];

    if (item == null || item == undefined) return res.status(404).send("Not Found");

    res.json({
        ...questions[req.params.id],
        id: req.params.id
    });

});

app.get('/api/scores', (req, res) => {

    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    res.writeHead(200, headers);

    var intervalID = null; // has to be any scope
    var changed = submissions.length;

    res.write(`data: ${JSON.stringify(preprocessScores(leaderboard))}\n\n`);

    req.on('close', () => {

        clearInterval(intervalID);

    });

    intervalID = setInterval(() => {

        if (changed != submissions.length) {

            const data = `data: ${JSON.stringify(preprocessScores(leaderboard))}\n\n`;
            res.write(data);

            changed = submissions.length;

        }
        
    }, 10);

});

app.get('/api/question/:id/submit', (req, res) => {

    if (req.params.id == undefined) return res.status(400).send("Not All Parameters Provided.");
    if (req.query.team == undefined) return res.status(400).send("Not All Parameters Provided.");

    let item = questions[req.params.id];
    let team = leaderboard[req.query.team];

    if (item == null || item == undefined) return res.status(404).send("Question Not Found");
    if (team == null || team == undefined) return res.status(404).send("Team Not Found");

    let correct = true;
    
    for (const item in submissions) {
    
        console.log(submissions[item]);

        if (submissions[item].id == req.params.id && submissions[item].teamId == req.query.team && submissions[item].correct) { 
            
            return res.status(409).json({ error: "Already Submitted a Correct Answer to this Problem." });
            
        }
        
    }

    submissions.push({
        id: req.params.id,
        teamId: req.query.team,
        correct
    });

    // add the submission to the database
    res.json({
        correct
    });

});

app.listen(port, () => {
    
    console.log(`Example app listening on port ${port}`)
    
});

function preprocessQuestionResponse(questionData) {

    let difficulty = "EASY";
    let points = questionData.points || 0;
    let title = questionData.title || "Untitled";
    let emoji = questionData.emoji || "";
    let introduction = questionData.introduction;
    let submissionCount = 0;

    submissions.forEach((element) => {

        if (element.id === questionData.id) submissionCount++;

    });

    if (points > 260) difficulty = "NOVICE";
    if (points > 350) difficulty = "MEDIUM";
    if (points > 420) difficulty = "LIL SPICY";
    if (points > 540) difficulty = "DIFFICULT";
    if (points > 640) difficulty = "HARD";
    if (points > 740) difficulty = "EXPERT";
    if (points > 840) difficulty = "GENIUS LEVEL";

    return {
        difficulty,
        points,
        title,
        emoji,
        introduction,
        submissions: submissionCount,
    };

}

function preprocessScores(scores) {

    let scoreData = [...scores];

    scoreData.forEach((element) => {

        element.points = 0;

    });

    submissions.forEach((element) => {

        if (element.correct) {
            
            scoreData[element.teamId].points += questions[element.id].points;

        }

    });

    return scoreData;

}