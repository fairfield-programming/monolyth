const icon = document.getElementById('icon');
const title = document.getElementById('title');
const description = document.getElementById('description');
const body = document.getElementById('body');

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
    
    addSection('Introduction', data.introduction, body);

});

function addSection(title, description, parent) {

    const titleDom = document.createElement('h2');
    const descriptionDom = document.createElement('p');

    titleDom.innerHTML = title;
    descriptionDom.innerHTML = description;

    parent.append(titleDom);
    parent.append(descriptionDom);

}