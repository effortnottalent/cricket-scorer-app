export default function playersReducer(players, action) {
    switch (action.type) {
        case 'editplayer': {
            if(players.find(player => player.id === action.player.id && 
                player.type === action.player.type)) {
                return players.map(player => 
                    player.id === action.player.id && 
                        player.type === action.player.type ? action.player : player
                );
            } else {
                return [
                    ...players,
                    action.player
                ]
            }
        }
        default: {
          throw Error('Unknown action: ' + action.type);
        }
    }
}