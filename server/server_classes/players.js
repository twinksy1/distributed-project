class Players {
    
    constructor () {
        this.players = [];
    }
    
    add_player(host_id, player_id, name, game_data){
        var player = {host_id, player_id, name, game_data};
        this.players.push(player);
        return player;
    }
    
    remove_player(player_id){
        var player = this.get_player(player_id);
        
        if(player){
            this.players = this.players.filter((player) => player.player_id !== player_id);
        }
        return player;
    }
    
    get_player(player_id){
        return this.players.filter((player) => player.player_id === player_id)[0]
    }
    
    get_players(host_id){
        return this.players.filter((player) => player.host_id === host_id);
    }
}

module.exports = {Players};