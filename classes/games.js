class Games {
    
    constructor () {
        this.games = [];
    }

    add_game(game_pin, host_id, live_game, game_data){
        var game = {game_pin, host_id, live_game, game_data};
        this.games.push(game);
        return game;
    }

    remove_game(host_id){
        var game = this.get_game(host_id);
        
        if(game){
            this.games = this.games.filter((game) => game.host_id !== host_id);
        }
        return game;
    }

    get_game(host_id){
        return this.games.filter((game) => game.host_id === host_id)[0]
    }

}

module.exports = {Games};