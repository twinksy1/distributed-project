//Dependencies
const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

//Classes
const { Games } = require('./classes/games');
const { Players } = require('./classes/players');

const public_path = path.join(__dirname, './clients');
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var games = new Games();
var players = new Players();

//Mongodb setup
var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var url = "mongodb://localhost:27017/";

app.use(express.static(public_path));

//Starting server on port 4200
server.listen(4200, () => {
    console.log("Server started on port 4200");
});

//When connection to server is made
io.on('connection', (socket) => {
    
    //When host first connects
    socket.on('host_join', (data) =>{
        
        //Check if id passed matches id of game in database
        MongoClient.connect(url, { useNewUrlParser: true, 
            useUnifiedTopology: true }, function(err, db) 
        {
            if (err) throw err;

            var dbo = db.db("finalGameDB");
            var query = { id:  parseInt(data.id)};
            dbo.collection('finalProjectGames').find(query).toArray(
                function(err, result){
                if(err) throw err;
                
                //A game with the id passed was found
                if(result[0] !== undefined){
                    //new game_pin for game
                    var game_pin = Math.floor(Math.random()*90000) + 10000; 
                    
                    //Creates a game with game_pin and host id
                    games.add_game(game_pin, socket.id, false, 
                        {players_answered: 0, live_question: false, 
                        game_id: data.id, question: 1}); 

                        //Gets game data
                        var game = games.get_game(socket.id); 

                    //Host joins a room using game_pin
                    socket.join(game.game_pin);
                    //console.log('Game Created with pin:', game.game_pin); 

                    //Sends game_pin so it can be shown for players to join
                    socket.emit('show_game_pin', {
                        game_pin: game.game_pin
                    });
                }else{
                    socket.emit('no_game_found');
                }
                db.close();
            });
        });
        
    });
    
    //When the host connects from the game view
    socket.on('host_join_game', (data) => {
        var old_host_id = data.id;
        //Gets game with old host id
        var game = games.get_game(old_host_id);
        if(game){
            //Changes the game host id to new host id
            game.host_id = socket.id;
            socket.join(game.game_pin);
            //Gets player in game
            var player_data = players.get_players(old_host_id);
            for(var i = 0; i < Object.keys(players.players).length; i++){
                if(players.players[i].host_id == old_host_id){
                    players.players[i].host_id = socket.id;
                }
            }
            var game_id = game.game_data['game_id'];
            MongoClient.connect(url, { useNewUrlParser: true, 
                useUnifiedTopology: true }, async (err, db) =>
            {
                if (err) throw err;
    
                var dbo = db.db('finalGameDB');
                var query = { id:  parseInt(game_id)};

		// Awaiting toArray

                var toArray = await dbo.collection("finalProjectGames").find(query).toArray(
                    function(err, res) {
                    if (err) throw err;
                    
                    var question = res[0].questions[0].question;
                    var answer1 = res[0].questions[0].answers[0];
                    var answer2 = res[0].questions[0].answers[1];
                    var answer3 = res[0].questions[0].answers[2];
                    var answer4 = res[0].questions[0].answers[3];
                    var correct_answer = res[0].questions[0].correct;
                    
                    socket.emit('game_questions', {
                        q1: question,
                        a1: answer1,
                        a2: answer2,
                        a3: answer3,
                        a4: answer4,
                        correct: correct_answer,
                        total_questions: res[0].questions.length,
                        current_question: game.game_data.question,
                        players_in_game: player_data.length
                    });
                    db.close();
                });
            });
            io.to(game.game_pin).emit('game_started_player');
            game.game_data.live_question = true;
        }else{
            //No game was found, redirect user
            socket.emit('no_game_found');
        }
    });
    
    //When player connects for the first time
    socket.on('player_join', (params) => {        
        var game_found = false; //If a game is found with game_pin provided by player
        
        //For each game in the Games class
        for(var i = 0; i < games.games.length; i++){
            //If the game_pin is equal to one of the game's game_pin
            if(params.pin == games.games[i].game_pin){
                console.log('Player connected to game'); 
                var host_id = games.games[i].host_id; //Get the id of host of game                
                players.add_player(host_id, socket.id, params.name, {score: 0, answer: 0}); //add player to game                
                socket.join(params.pin); //Player is joining room based on game_pin                
                var players_in_game = players.get_players(host_id); //Getting all players in game                
                io.to(params.pin).emit('update_player_lobby', players_in_game);//Sending host player data to display
                game_found = true; //Game has been found
            }
        }        
        //If the game has not been found
        if(game_found == false){
            socket.emit('no_game_found'); //Player is sent back to 'join' page because game was not found with game_pin
        }        
    });
    
    //When the player connects from game view
    socket.on('player_join_game', (data) => {
        var player = players.get_player(data.id);
        if(player){
            var game = games.get_game(player.host_id);
            socket.join(game.game_pin);
            player.player_id = socket.id;//Update player id with socket id
            
            var player_data = players.get_players(game.host_id);
            socket.emit('player_game_data', player_data);
        }else{
            socket.emit('no_game_found');//No player found
        }
        
    });
    
    //When host or player leaves the site
    socket.on('disconnect', () => {
        var game = games.get_game(socket.id); //Finding game with socket.id
        //If a game hosted by that id is found, the socket disconnected is a host
        if(game){
            //Checking to see if host was disconnected or was sent to game view
            if(game.live_game == false){
                games.remove_game(socket.id);//Remove the game from games class
                console.log('Game ended with pin:', game.game_pin);

                var players_to_remove = players.get_players(game.host_id); //Getting all players in the game
                //For each player in the game
                for(var i = 0; i < players_to_remove.length; i++){
                    players.remove_player(_t[_r].player_id); //Removing each player from player class
                }
                io.to(game.game_pin).emit('host_disconnect'); //Send player back to 'join' screen
                socket.leave(game.game_pin); //Socket is leaving room
            }
        }else{
            //No game has been found, so it is a player socket that has disconnected
            var player = players.get_player(socket.id); //Getting player with socket.id
            //If a player has been found with that id
            if(player){
                var host_id = player.host_id;//Gets id of host of the game
                var game = games.get_game(host_id);//Gets game data with host_id
                var game_pin = game.game_pin;//Gets the game_pin of the game
                
                if(game.live_game == false){
                    players.remove_player(socket.id);//Removes player from players class
                    var players_in_game = players.get_players(host_id);//Gets remaining players in game

                    io.to(game_pin).emit('update_player_lobby', players_in_game);//Sends data to host to update screen
                    socket.leave(game_pin); //Player is leaving the room
            
                }
            }
        }
        
    });
    
    //Sets data in player class to answer from player
    socket.on('player_answer', function(num){
        var player = players.get_player(socket.id);
        var host_id = player.host_id;
        var player_num = players.get_players(host_id);
        var game = games.get_game(host_id);
        if(game.game_data.live_question == true){//if the question is still live
            player.game_data.answer = num;
            game.game_data.players_answered += 1;
            
            var game_question = game.game_data.question;
            var game_id = game.game_data.game_id;
            
            MongoClient.connect(url, { useNewUrlParser: true, 
                useUnifiedTopology: true }, function(err, db)
            {
                if (err) throw err;
    
                var dbo = db.db('finalGameDB');
                var query = { id:  parseInt(game_id)};
                dbo.collection("finalProjectGames").find(query).toArray(function(err, res) {
                    if (err) throw err;
                    var correct_answer = res[0].questions[game_question - 1].correct;
                    //Checks player answer with correct answer
                    if(num == correct_answer){
                        player.game_data.score += 100;
                        io.to(game.game_pin).emit('get_time', socket.id);
                        socket.emit('answer_result', true);
                    }

                    //Checks if all players answered
                    if(game.game_data.players_answered == player_num.length){
                        game.game_data.live_question = false; //Question has been ended bc players all answered under time
                        var player_data = players.get_players(game.host_id);
                        io.to(game.game_pin).emit('question_over', player_data, correct_answer);//Tell everyone that question is over
                    }else{
                        //update host screen of num players answered
                        io.to(game.game_pin).emit('update_players_answered', {
                            players_in_game: player_num.length,
                            players_answered: game.game_data.players_answered
                        });
                    }
                    
                    db.close();
                });
            });
        }
    });
    
    socket.on('get_score', function(){
        var player = players.get_player(socket.id);
        socket.emit('new_score', player.game_data.score); 
    });
    
    socket.on('time', function(data){
        var time = data.time / 20;
        time = time * 100;
        var player_id = data.player;
        var player = players.get_player(player_id);
        player.game_data.score += time;
    });
    
    socket.on('time_up', function(){
        var game = games.get_game(socket.id);
        game.game_data.live_question = false;
        var player_data = players.get_players(game.host_id);
        
        var game_question = game.game_data.question;
        var game_id = game.game_data.game_id;
            
        MongoClient.connect(url, { useNewUrlParser: true, 
            useUnifiedTopology: true }, function(err, db)
        {
            if (err) throw err;

            var dbo = db.db('finalGameDB');
            var query = { id:  parseInt(game_id)};
            dbo.collection("finalProjectGames").find(query).toArray(function(err, res) {
                if (err) throw err;
                var correct_answer = res[0].questions[game_question - 1].correct;
                io.to(game.game_pin).emit('question_over', player_data, correct_answer);
                
                db.close();
            });
        });
    });
    
    socket.on('next_question', function(){
        var player_data = players.get_players(socket.id);
        //Reset players current answer to 0
        for(var i = 0; i < Object.keys(players.players).length; i++){
            if(players.players[i].host_id == socket.id){
                players.players[i].game_data.answer = 0;
            }
        }
        var game = games.get_game(socket.id);
        game.game_data.players_answered = 0;
        game.game_data.live_question = true;
        game.game_data.question += 1;
        var game_id = game.game_data.game_id;
                
        MongoClient.connect(url, { useNewUrlParser: true, 
            useUnifiedTopology: true }, function(err, db)
        {
            if (err) throw err;

            var dbo = db.db('finalGameDB');
            var query = { id:  parseInt(game_id)};
            dbo.collection("finalProjectGames").find(query).toArray(function(err, res) {
                if (err) throw err;
                
                if(res[0].questions.length >= game.game_data.question){
                    var questionNum = game.game_data.question;
                    questionNum = questionNum - 1;
                    var question = res[0].questions[questionNum].question;
                    var answer1 = res[0].questions[questionNum].answers[0];
                    var answer2 = res[0].questions[questionNum].answers[1];
                    var answer3 = res[0].questions[questionNum].answers[2];
                    var answer4 = res[0].questions[questionNum].answers[3];
                    var correct_answer = res[0].questions[questionNum].correct;

                    socket.emit('game_questions', {
                        q1: question,
                        a1: answer1,
                        a2: answer2,
                        a3: answer3,
                        a4: answer4,
                        correct: correct_answer,
                        total_questions: res[0].questions.length,
                        current_question: game.game_data.question,
                        players_in_game: player_data.length
                    });
                    db.close();
                }else{
                    var players_in_game = players.get_players(game.host_id);
                    var first = {name: "", score: 0};
                    var second = {name: "", score: 0};
                    var third = {name: "", score: 0};
                    var fourth = {name: "", score: 0};
                    var fifth = {name: "", score: 0};
                        
                    for(var i = 0; i < players_in_game.length; i++){
                        console.log(players_in_game[i].game_data.score);
                        if(players_in_game[i].game_data.score > fifth.score){
                            if(players_in_game[i].game_data.score > fourth.score){
                                if(players_in_game[i].game_data.score > third.score){
                                    if(players_in_game[i].game_data.score > second.score){
                                        if(players_in_game[i].game_data.score > first.score){
                                            //First Place
                                            fifth.name = fourth.name;
                                            fifth.score = fourth.score;
                                            
                                            fourth.name = third.name;
                                            fourth.score = third.score;
                                            
                                            third.name = second.name;
                                            third.score = second.score;
                                            
                                            second.name = first.name;
                                            second.score = first.score;
                                            
                                            first.name = players_in_game[i].name;
                                            first.score = players_in_game[i].game_data.score;
                                        }else{
                                            //Second Place
                                            fifth.name = fourth.name;
                                            fifth.score = fourth.score;
                                            
                                            fourth.name = third.name;
                                            fourth.score = third.score;
                                            
                                            third.name = second.name;
                                            third.score = second.score;
                                            
                                            second.name = players_in_game[i].name;
                                            second.score = players_in_game[i].game_data.score;
                                        }
                                    }else{
                                        //Third Place
                                        fifth.name = fourth.name;
                                        fifth.score = fourth.score;
                                            
                                        fourth.name = third.name;
                                        fourth.score = third.score;
                                        
                                        third.name = players_in_game[i].name;
                                        third.score = players_in_game[i].game_data.score;
                                    }
                                }else{
                                    //Fourth Place
                                    fifth.name = fourth.name;
                                    fifth.score = fourth.score;
                                    
                                    fourth.name = players_in_game[i].name;
                                    fourth.score = players_in_game[i].game_data.score;
                                }
                            }else{
                                //Fifth Place
                                fifth.name = players_in_game[i].name;
                                fifth.score = players_in_game[i].game_data.score;
                            }
                        }
                    }
                    
                    io.to(game.game_pin).emit('game_over', {
                        num1: first.name,
                        num2: second.name,
                        num3: third.name,
                        num4: fourth.name,
                        num5: fifth.name
                    });
                }
            });
        });

        io.to(game.game_pin).emit('next_question_player');
    });
    
    //When the host starts the game
    socket.on('start_game', () => {
        var game = games.get_game(socket.id);//Get the game based on socket.id
        game.live_game = true;
        socket.emit('game_started', game.host_id);//Tell player and host that game has started
    });
    
    //Give user game names data
    socket.on('request_db_names', function(){
        
        MongoClient.connect(url, { useNewUrlParser: true, 
            useUnifiedTopology: true }, function(err, db)
        {
            if (err) throw err;
    
            var dbo = db.db('finalGameDB');
            dbo.collection("finalProjectGames").find().toArray(function(err, res) {
                if (err) throw err;
                socket.emit('game_names_data', res);
                db.close();
            });
        });
    });
    
    socket.on('new_quiz', async (data) => {
        
        var connection = await MongoClient.connect(url, { useNewUrlParser: true, 
            useUnifiedTopology: true }, async (err, db) =>
        {
            if (err) throw err;
            
            var dbo = db.db('finalGameDB');

	    // Awaiting toArray

            var toArray = await dbo.collection('finalProjectGames').find({}).toArray(async (err, result) => {
                if(err) throw err;
                
                var num = Object.keys(result).length;
                if(num == 0){
                	data.id = 1
                	num = 1
                }else{
                	data.id = result[num-1].id + 1;
                }
                var game = data;

		// Awaiting insert function
		    
                var insert = await dbo.collection("finalProjectGames").insertOne(game, function (err, res) {
                    if (err) throw err;
                    db.close();
                });
                db.close();
                socket.emit('start_game_from_creator', num+1);
            });
        });
    });
});
