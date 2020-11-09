var socket = io();
var params = jQuery.deparam(window.location.search);

// Host connecting to the server
socket.on('connect', function() {
	document.getElementById('players').value = "";
	// Specify that it is a host connection
	socket.emit('host-join', params);
});

socket.on('showGamePin', function(data) {
	document.getElementById('gamePinText').innerHTML = data.pin;
});

// Adding player names to screen & updating player count
socket.on('updatePlayerLobby', function(data) {
	document.getElementById('players').value = "";
	for(var i=0; i<data.length; i++) {
		document.getElementById('players'j).value += data[i].name + "\n";
	}
});

// Start game when button is clicked
function startGame() {
	socket.emit('startGame');
}

function endGame() {
	window.location.href = "/";
}

socket.on('gameStarted', function(id) {
	console.log("Starting game\n");
	window.location.href = "/host/game/" + "?id=" + id;
});

socket.on('noGameFound', function() {
	window.location.href = "../../";
});
