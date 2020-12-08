var socket = io();

// Handles players that try connecting to on-going games
socket.on('connect', function() {
    // Grabs data from the url
    var params = jQuery.deparam(window.location.search);
    
    // Tells server that it is a player connection
    socket.emit('player_join', params);
});

// Takes player back to main screen if game pin has no match
socket.on('no_game_found', function() {
    window.location.href = '../';
});

// Player is taken to main screen if the host disconnects
socket.on('host_disconnect', function() {
    window.location.href = '../';
});

// When the host starts the game the player screen updates
socket.on('game_started_player', function() {
    window.location.href="/player/game/" + "?id=" + socket.id;
});


