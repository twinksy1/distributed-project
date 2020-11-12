var socket = io();

// Handles players connecting to current on-going games

socket.on('connect', function() {
    // Gets data from url
    var params = jQuery.deparam(window.location.search);
    
    // Tell server that it is player connection
    socket.emit('player_join', params);
});

// Boot player back to join screen if game pin has no match
socket.on('no_game_found', function() {
    window.location.href = '../';
});

// If the host disconnects, then the player is booted to main screen
socket.on('host_disconnect', function() {
    window.location.href = '../';
});

// When the host clicks start game, the player screen changes
socket.on('game_started_player', function() {
    window.location.href="/player/game/" + "?id=" + socket.id;
});


