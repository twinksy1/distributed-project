var socket = io();
var params = jQuery.deparam(window.location.search);

// Host connecting to the server
socket.on('connect', function() {
	document.getElementById('players').value = "";
	
	// State that it is a host connection
	socket.emit('host_join', params);
});

socket.on('show_game_pin', function(data) {
	document.getElementById('gamePinText').innerHTML = data.game_pin;
});

// Adds player names to lobby screen and updates player count
socket.on('update_player_lobby', function(data) {
	document.getElementById('players').value = "";
	for(var i=0; i<data.length; i++) {
		document.getElementById('players').value += data[i].name + "\n";
	}
});

// Starts game when the button is pressed
function startGame() {
	socket.emit('start_game');
}

function endGame() {
	window.location.href = "/";
}

socket.on('game_started', function(id) {
	console.log("Starting game\n");
	window.location.href = "/host/game/" + "?id=" + id;
});

socket.on('no_game_found', function() {
	window.location.href = "../../";
});
