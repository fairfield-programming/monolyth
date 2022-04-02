const icon = document.getElementById('icon');
const title = document.getElementById('title');
const description = document.getElementById('description');
const body = document.getElementById('body');

const languages = document.getElementById('languages');

var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");

languages.onchange = () => {

    let val = languages.value;
    let langName = val.split("/")[0];

    editor.getSession().setMode("ace/mode/" + langName);

};

// STOLEN FROM W3SCHOOLS
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
    }
    return "";
}

fetch('https://emkc.org/api/v2/piston/runtimes').then(response => response.json()).then((data) => {

    data.forEach(element => {
        
        const option = document.createElement('option');

        option.innerHTML = element.language;
        option.value = `${element.language}/${element.version}`;

        languages.append(option);

    });

});

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

if (id == null || id == undefined) window.location.href = "/questions";

fetch(`/api/question/${id}`).then((response) => {

    // check not 404
    if (response.status == 404) window.location.href = "/questions";

    return response.json();
    
}).then((data) => {
    
    console.log(data);

    icon.innerHTML = [...data.emoji][0] || '🗿';
    title.innerHTML = data.title;
    description.innerHTML = `Earn ${data.points} Points By Completing this Problem...`;
    
    if (data.introduction != undefined) addSection('Introduction', data.introduction, body);
    if (data.inputOutput != undefined) addSection('Input and Output', data.inputOutput, body);
    if (data.specialCases != undefined) addSection('Special Cases', data.specialCases, body);

});

function addSection(title, description, parent) {

    const titleDom = document.createElement('h2');
    const descriptionDom = document.createElement('p');

    titleDom.innerHTML = title;
    descriptionDom.innerHTML = description;

    parent.append(titleDom);
    parent.append(descriptionDom);

}

function testAnswer() {

    const codeData = {
        language: languages.value,
        code: editor.getValue()
    };

    fetch(`/api/question/${id}/test`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(codeData)
    }).then(response => response.json()).then((data) => {

        const testResults = document.getElementById("testResults");
        
        testResults.innerHTML = "";

        data.tests.forEach((result) => {

            const container = document.createElement("DETAILS");

            const testDescription = document.createElement("SUMMARY");
            const expected = document.createElement("TD");
            const stdout = document.createElement("TD");

            testDescription.innerHTML = `${(result.correct) ? "✅" : "❌"} ${result.description}`;
            stdout.innerHTML = htmlify(result.stdout);
            expected.innerHTML = htmlify(result.expected);

            container.append(testDescription);
            container.append(expected);
            container.append(stdout);

            testResults.append(container);

        })

    });

}

function submitAnswer() {

    let teamId = getCookie('team');

    const codeData = {
        language: languages.value,
        code: editor.getValue()
    };

    fetch(`/api/question/${id}/submit?team=${teamId}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(codeData)
    }).then(response => response.json()).then((data) => {

        const testResults = document.getElementById("testResults");
        
        testResults.innerHTML = "";

        data.tests.forEach((result) => {

            const container = document.createElement("DETAILS");

            const testDescription = document.createElement("SUMMARY");
            const expected = document.createElement("TD");
            const stdout = document.createElement("TD");

            testDescription.innerHTML = `${(result.correct) ? "✅" : "❌"} ${result.description}`;
            stdout.innerHTML = htmlify(result.stdout);
            expected.innerHTML = htmlify(result.expected);

            container.append(testDescription);
            container.append(expected);
            container.append(stdout);

            testResults.append(container);

        })

        if (data.correct) {

            showSuccessScreen()

        } else {

            showProblemScreen()

        }

    });

}

function htmlify(data) {

    return data.replace(/\n/g, "</br>");

}

function showSuccessScreen() {

    const success = document.getElementById("success");
    
    success.style.top = "0px";
    success.style.opacity = "1";

}

function showProblemScreen() {

    const error = document.getElementById("error");
    
    error.style.top = "0px";
    error.style.opacity = "1";

}

function closeProblemScreen() {

    const error = document.getElementById("error");
    
    error.style.top = "100vh";
    error.style.opacity = "0";

}