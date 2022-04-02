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

import path from 'path';
import express from 'express';
const app = express()
const port = process.env.PORT || 8080
import fs from 'fs';

import fetch from 'node-fetch'
globalThis.fetch = fetch

const startDate = new Date("April 1, 2022 11:00:00").getTime();

const questions = JSON.parse(fs.readFileSync('./questions.json', 'utf8'));
const leaderboard = [
    {
        name: "Dylyifanfe aDragons"
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
    }
];

app.use((req, res, next) => {

    var now = new Date().getTime();
    var distance = startDate - now;

    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (seconds > 0) {

        if (req.path == "/res/fpa.svg") return res.sendFile(path.join(process.cwd(), "./public/res/fpa.svg"));

        if (req.path == "/style.css") return res.sendFile(path.join(process.cwd(), "./public/wait/style.css"));
        if (req.path == "/script.js") return res.sendFile(path.join(process.cwd(), "./public/wait/script.js"));

        if (req.path == "/") return res.sendFile(path.join(process.cwd(), "./public/wait/index.html"));

        return res.writeHead(302, {
            'Location': '/'
        }).send();

    }

    return next();

});

import bodyParser from 'body-parser';
import { start } from 'repl';

app.use(express.static('public'))
app.use(bodyParser.json())

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

app.post('/api/question/:id/test', async (req, res) => {

    if (req.params.id == undefined) return res.status(400).send("Not All Parameters Provided.");

    let item = questions[req.params.id];

    if (item == null || item == undefined) return res.status(404).send("Question Not Found");

    let correct = true;

    if (req.body.language == undefined) return res.status(400).json({ error: "Not All Parameters Provided." });

    let languageParts = req.body.language.split("/");
    let language = languageParts[0] || "bash";
    let version = languageParts[1] || "5.1.0";

    if (req.body.code == undefined) correct = false;

    let testResults = [];

    for (const test in item.tests) {

        const testData = item.tests[test];

        let body = {
            language,
            version,
            files: [
                {
                    // name: "test",
                    content: req.body.code
                }
            ],
            stdin: testData.stdin,
            args: [],
            compile_timeout: 10000,
            run_timeout: 3000,
            compile_memory_limit: -1,
            run_memory_limit: -1
        };
        
        const resultsData = await fetch("https://emkc.org/api/v2/piston/execute", {
            method: "POST",
            body: JSON.stringify(body)
        }).then(response => response.json());

        let cleanExpected = testData.stdout.trim().replace(/\r\n/g, '\n').toUpperCase();
        let cleanStdout = (resultsData.run || { stdout: "" }).stdout.trim().replace(/\r\n/g, '\n').toUpperCase();

        let testCorrect = true;

        if (cleanStdout != cleanExpected) testCorrect = false;
        if ((resultsData.run || { stderr: "" }).stderr != "") testCorrect = false;
        
        if (!testCorrect) correct = false;

        testResults.push({
            description: testData.description,
            stdout: (resultsData.run || { stdout: "" }).stdout,
            stderr: (resultsData.run || { stderr: "" }).stderr,
            expected: testData.stdout,
            correct: testCorrect
        });

    }

    // add the submission to the database
    res.json({
        language,
        version,
        code: req.body.code,
        correct,
        tests: testResults
    });

});

app.get('/api/teams/', (req, res) => {

    let output = [];

    leaderboard.forEach((item, i) => {

        output.push({
            id: i,
            name: item.name
        });

    });

    return res.json(output);

})

app.post('/api/question/:id/submit', async (req, res) => {

    if (req.params.id == undefined) return res.status(400).send("Not All Parameters Provided.");
    if (req.query.team == undefined) return res.status(400).send("Not All Parameters Provided.");

    let item = questions[req.params.id];
    let team = leaderboard[req.query.team];

    if (item == null || item == undefined) return res.status(404).send("Question Not Found");
    if (team == null || team == undefined) return res.status(404).send("Team Not Found");

    // Verify Code
    let correct = true;

    if (req.body.language == undefined) correct = false;
    let languageParts = req.body.language.split("/");
    let language = languageParts[0] || "bash";
    let version = languageParts[1] || "5.1.0";

    if (req.body.code == undefined) correct = false;

    let testResults = [];

    for (const test in item.tests) {

        const testData = item.tests[test];

        let body = {
            language,
            version,
            files: [
                {
                    // name: "test",
                    content: req.body.code
                }
            ],
            stdin: testData.stdin,
            args: [],
            compile_timeout: 10000,
            run_timeout: 3000,
            compile_memory_limit: -1,
            run_memory_limit: -1
        };
        
        const resultsData = await fetch("https://emkc.org/api/v2/piston/execute", {
            method: "POST",
            body: JSON.stringify(body)
        }).then(response => response.json());

        let cleanExpected = testData.stdout.trim().replace(/\r\n/g, '\n').toUpperCase();
        let cleanStdout = (resultsData.run || { stdout: "" }).stdout.trim().replace(/\r\n/g, '\n').toUpperCase();

        let testCorrect = true;

        if (cleanStdout != cleanExpected) testCorrect = false;
        if ((resultsData.run || { stderr: "" }).stderr != "") testCorrect = false;
        
        if (!testCorrect) correct = false;

        testResults.push({
            description: testData.description,
            stdout: (resultsData.run || { stdout: "" }).stdout,
            stderr: (resultsData.run || { stderr: "" }).stderr,
            expected: testData.stdout,
            correct: testCorrect
        });

    }

    submissions.push({
        id: req.params.id,
        teamId: req.query.team,
        correct,
        language,
        version,
        code: req.body.code
    });

    res.json({
        language,
        version,
        code: req.body.code,
        correct,
        tests: testResults
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