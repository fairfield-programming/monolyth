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