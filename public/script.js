const teamSelect = document.getElementById('teamSelect');

fetch('/api/teams/').then(response => response.json()).then((data) => {

    data.forEach(element => {
            
        const option = document.createElement("option");

        option.innerHTML = element.name;
        option.value = element.id;

        teamSelect.append(option);

    });

});

function setTeam() {

    let team = teamSelect.value;

    document.cookie = `team=${team}`;

}