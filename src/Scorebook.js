import { useState } from 'react';

export default function Scorebook({ players, onChangePlayer }) {
    return (
        <div className='lineup'>
            <h1>Scorebook</h1>
            <div className='batters'>
                <h2>Batters</h2>
                {[...Array(11)].map((_, i) =>
                    <PlayerNameEntry
                        player={players.find(player => player.type === 'batter' && player.id === i)}
                        type='batter'
                        index={i}
                        onChange={onChangePlayer}
                    />
                )}
            </div>
            <div className='bowlers'>
                <h2>Bowlers</h2>
                {players.filter(player => player.type === 'bowler').length === 0 && 
                    <p>No bowlers yet defined.</p>
                }
                {players.filter(player => player.type === 'bowler').map(player => 
                    <PlayerNameEntry
                        player={player}
                        type='bowler'
                        index={player.id}
                        onChange={onChangePlayer}
                    />
                )}
                <button onClick={() => onChangePlayer({
                        type: 'bowler',
                        id: players.filter(player => player.type === 'bowler').length
                    })}
                >Add bowler</button>
            </div>
        </div>
    );
}

function PlayerNameEntry({ player, type, index, onChange }) {
    const [isEditing, setIsEditing] = useState(false);
    let playerContent;
    if(isEditing) {
        playerContent = (
            <>
                <input
                    value={player?.name}
                    onChange={(e) => {
                        onChange({
                            ...player,
                            name: e.target.value,
                            type: type,
                            id: index
                        });
                    }}
                />
                &nbsp;
                <button onClick={() => setIsEditing(false)}>Save</button>
            </>
        );
    } else {
        playerContent = (
            <>
                {player?.name ?? 'Player ' + (index + 1)}
                &nbsp;
                <button onClick={() => setIsEditing(true)}>Edit</button>
            </>
        );
    }
    return (
        <div className={type}>
            {index + 1} &nbsp;
            {playerContent}
        </div>
    );
}