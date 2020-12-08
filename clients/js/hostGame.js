var socket = io();

// Gets the id from url
var params = jQuery.deparam(window.location.search); 

var timer;
var time = 20;

// When the host connects to server
socket.on('connect', function() {

    // Tells server that the host is connecting from the game view
    socket.emit('host_join_game', params);
});

socket.on('no_game_found', function(){
   // Redirects users to main page
   window.location.href = '../../';
});

socket.on('game_questions', function(data){
    document.getElementById('question').innerHTML = data.q1;
    document.getElementById('answer1').innerHTML = data.a1;
    document.getElementById('answer2').innerHTML = data.a2;
    document.getElementById('answer3').innerHTML = data.a3;
    document.getElementById('answer4').innerHTML = data.a4;
    document.getElementById('questionNum').innerHTML = "Question " + data.current_question + " / " + data.total_questions;
    var correctAnswer = data.correct;
    document.getElementById('playersAnswered').innerHTML = "Players Answered 0 / " + data.players_in_game;
    updateTimer();
});

socket.on('update_players_answered', function(data){
   document.getElementById('playersAnswered').innerHTML = "Players Answered " + data.players_answered + " / " + data.players_in_game;
});

socket.on('question_over', function(player_data, correct){
    clearInterval(timer);
    var answer1 = 0;
    var answer2 = 0;
    var answer3 = 0;
    var answer4 = 0;
    var total = 0;
    // Makes elements on the page invisible
    document.getElementById('playersAnswered').style.display = "none";
    document.getElementById('timerText').style.display = "none";

    // Shows users the correct answer by changing the elements
    if(correct == 1){
        document.getElementById('answer2').style.filter = "grayscale(50%)";
        document.getElementById('answer3').style.filter = "grayscale(50%)";
        document.getElementById('answer4').style.filter = "grayscale(50%)";
        var current = document.getElementById('answer1').innerHTML;
        document.getElementById('answer1').innerHTML = "&#10004" + " " + current;
    }else if(correct == 2){
        document.getElementById('answer1').style.filter = "grayscale(50%)";
        document.getElementById('answer3').style.filter = "grayscale(50%)";
        document.getElementById('answer4').style.filter = "grayscale(50%)";
        var current = document.getElementById('answer2').innerHTML;
        document.getElementById('answer2').innerHTML = "&#10004" + " " + current;
    }else if(correct == 3){ 
        document.getElementById('answer1').style.filter = "grayscale(50%)";
        document.getElementById('answer2').style.filter = "grayscale(50%)";
        document.getElementById('answer4').style.filter = "grayscale(50%)";
        var current = document.getElementById('answer3').innerHTML;
        document.getElementById('answer3').innerHTML = "&#10004" + " " + current;
    }else if(correct == 4){ 
        document.getElementById('answer1').style.filter = "grayscale(50%)";
        document.getElementById('answer2').style.filter = "grayscale(50%)";
        document.getElementById('answer3').style.filter = "grayscale(50%)";
        var current = document.getElementById('answer4').innerHTML;
        document.getElementById('answer4').innerHTML = "&#10004" + " " + current;
    }   
    
    for(var i = 0; i < player_data.length; i++){
        if(player_data[i].game_data.answer == 1){ 
            answer1 += 1;
        }else if(player_data[i].game_data.answer == 2){ 
            answer2 += 1;
        }else if(player_data[i].game_data.answer == 3){ 
            answer3 += 1;
        }else if(player_data[i].game_data.answer == 4){ 
            answer4 += 1;
        }
        total += 1;
    }   
    
    // Gets the values for the bar graph
    answer1 = answer1 / total * 100;
    answer2 = answer2 / total * 100;
    answer3 = answer3 / total * 100;
    answer4 = answer4 / total * 100;
    
    document.getElementById('square1').style.display = "inline-block";
    document.getElementById('square2').style.display = "inline-block";
    document.getElementById('square3').style.display = "inline-block";
    document.getElementById('square4').style.display = "inline-block";
    
    document.getElementById('square1').style.height = answer1 + "px";
    document.getElementById('square2').style.height = answer2 + "px";
    document.getElementById('square3').style.height = answer3 + "px";
    document.getElementById('square4').style.height = answer4 + "px";
    
    document.getElementById('nextQButton').style.display = "block";
    
});

function nextQuestion(){
    document.getElementById('nextQButton').style.display = "none";
    document.getElementById('square1').style.display = "none";
    document.getElementById('square2').style.display = "none";
    document.getElementById('square3').style.display = "none";
    document.getElementById('square4').style.display = "none";

    document.getElementById('answer1').style.filter = "none";
    document.getElementById('answer2').style.filter = "none";
    document.getElementById('answer3').style.filter = "none";
    document.getElementById('answer4').style.filter = "none";

    document.getElementById('playersAnswered').style.display = "block";
    document.getElementById('timerText').style.display = "block";
    document.getElementById('num').innerHTML = " 20";
    // Tells server to start the next question
    socket.emit('next_question'); 
}

function updateTimer(){
    time = 20;
    timer = setInterval(function(){
        time -= 1;
        document.getElementById('num').textContent = " " + time;
        if(time == 0){
            socket.emit('time_up');
        }
    }, 1000);
}
socket.on('game_over', function(data){
    document.getElementById('nextQButton').style.display = "none";
    document.getElementById('square1').style.display = "none";
    document.getElementById('square2').style.display = "none";
    document.getElementById('square3').style.display = "none";
    document.getElementById('square4').style.display = "none";

    document.getElementById('answer1').style.display = "none";
    document.getElementById('answer2').style.display = "none";
    document.getElementById('answer3').style.display = "none";
    document.getElementById('answer4').style.display = "none";
    document.getElementById('timerText').innerHTML = "";
    document.getElementById('question').innerHTML = "GAME OVER";
    document.getElementById('playersAnswered').innerHTML = "";

    document.getElementById('winner1').style.display = "block";
    document.getElementById('winner2').style.display = "block";
    document.getElementById('winner3').style.display = "block";
    document.getElementById('winner4').style.display = "block";
    document.getElementById('winner5').style.display = "block";
    document.getElementById('winnerTitle').style.display = "block";

    document.getElementById('winner1').innerHTML = "1. " + data.num1;
    document.getElementById('winner2').innerHTML = "2. " + data.num2;
    document.getElementById('winner3').innerHTML = "3. " + data.num3;
    document.getElementById('winner4').innerHTML = "4. " + data.num4;
    document.getElementById('winner5').innerHTML = "5. " + data.num5;
});

socket.on('get_time', function(player){
    socket.emit('time', {
        player: player,
        time: time
    });
});

