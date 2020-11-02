var socket = io();

socket.on('connect', function() {
    // Get db names to display to user
    socket.emit('request_db_names');
});

socket.on('game_names_data', function(data) {
    for(var i = 0; i < Object.keys(data).length; i++){
        var div = document.getElementById('game-list');
        var button = document.createElement('button');
        
        button.innerHTML = data[i].name;
        // Call startGame when host clicks create quiz button
        button.setAttribute('onClick', "startGame('" + data[i].id + "')");
        button.setAttribute('id', 'gameButton');
        
        div.appendChild(button);
        div.appendChild(document.createElement('br'));
        div.appendChild(document.createElement('br'));
    }
});

// Open host page for new host
function startGame(data) {
    window.location.href="/host/" + "?id=" + data;
}
