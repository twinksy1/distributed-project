var socket = io();
var playerAnswered = false;
var correct = false;
var name;
var score = 0;

// Gets the id from url
var params = jQuery.deparam(window.location.search); 

socket.on('connect', function() {
    // Tells server that the player is connecting from the game view
    socket.emit('player_join_game', params);
    
    document.getElementById('answer1').style.visibility = "visible";
    document.getElementById('answer2').style.visibility = "visible";
    document.getElementById('answer3').style.visibility = "visible";
    document.getElementById('answer4').style.visibility = "visible";
});

socket.on('no_game_found', function(){
    // Redirects user to main page
    window.location.href = '../../'; 
});

function answerSubmitted(num){
    if(playerAnswered == false){
        playerAnswered = true;
        
        // Sends player's answer to the server
        socket.emit('player_answer', num);
        
        // Hide buttons from the users
        document.getElementById('answer1').style.visibility = "hidden";
        document.getElementById('answer2').style.visibility = "hidden";
        document.getElementById('answer3').style.visibility = "hidden";
        document.getElementById('answer4').style.visibility = "hidden";
        document.getElementById('message').style.display = "block";
        document.getElementById('message').innerHTML = "Answer Submitted! Waiting on other players...";
        
    }
}

// Get the results on the last question
socket.on('answer_result', function(data){
    if(data == true){
        correct = true;
    }
});

socket.on('question_over', function(data){
    if(correct == true){
        document.body.style.backgroundColor = "#4CAF50";
        document.getElementById('message').style.display = "block";
        document.getElementById('message').innerHTML = "Correct!";
    }else{
        document.body.style.backgroundColor = "#f94a1e";
        document.getElementById('message').style.display = "block";
        document.getElementById('message').innerHTML = "Incorrect!";
    }
    document.getElementById('answer1').style.visibility = "hidden";
    document.getElementById('answer2').style.visibility = "hidden";
    document.getElementById('answer3').style.visibility = "hidden";
    document.getElementById('answer4').style.visibility = "hidden";
    socket.emit('get_score');
});

socket.on('new_score', function(data){
    document.getElementById('scoreText').innerHTML = "Score: " + data;
});

socket.on('next_question_player', function(){
    correct = false;
    playerAnswered = false;
    
    document.getElementById('answer1').style.visibility = "visible";
    document.getElementById('answer2').style.visibility = "visible";
    document.getElementById('answer3').style.visibility = "visible";
    document.getElementById('answer4').style.visibility = "visible";
    document.getElementById('message').style.display = "none";
    document.body.style.backgroundColor = "white";
    
});

socket.on('host_disconnect', function(){
    window.location.href = "../../";
});

socket.on('player_game_data', function(data){
   for(var i = 0; i < data.length; i++){
       if(data[i].player_id == socket.id){
           document.getElementById('nameText').innerHTML = "Name: " + data[i].name;
           document.getElementById('scoreText').innerHTML = "Score: " + data[i].game_data.score;
       }
   }
});

socket.on('game_over', function(data){
    document.body.style.backgroundColor = "#FFFFFF";
    document.getElementById('answer1').style.visibility = "hidden";
    document.getElementById('answer2').style.visibility = "hidden";
    document.getElementById('answer3').style.visibility = "hidden";
    document.getElementById('answer4').style.visibility = "hidden";
    document.getElementById('message').style.display = "block";
    document.getElementById('message').innerHTML = "GAME OVER";
    var player_name = document.getElementById('nameText').innerHTML;
    var name_match = "Name: " + data.num1;
    if(name_match == player_name){
        //document.getElementById('nameText').innerHTML = "Name: WINNER";
        setTimeout(function(){ 
            //alert("Hello"); 
            var ask = confirm("As the winner, do you want to host a quiz?");
            if (ask) {
                window.location.href = "../../quizzes";
            }
        }, 5000);
    }
});

