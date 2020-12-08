var socket = io();

socket.on('connect', function() {
    // Gets names from the database to display them
    socket.emit('request_db_names');
});

socket.on('game_names_data', function(data) {
    for(var i = 0; i < Object.keys(data).length; i++){
        var div = document.getElementById('game-list');
        var button = document.createElement('button');
        
        button.innerHTML = data[i].name;
        // Calls startGame when the host presses the "create quiz" button
        button.setAttribute('onClick', "startGame('" + data[i].id + "')");
        button.setAttribute('id', 'gameButton');
        
        div.appendChild(button);
        div.appendChild(document.createElement('br'));
        div.appendChild(document.createElement('br'));
    }
});

// Opens the host page for a new host
function startGame(data) {
    window.location.href="/host/" + "?id=" + data;
}
