import { useState } from 'react';
import { 
    getOnBowlBowlerId,
    getOnStrikeBatterId
} from './scoreCalculations.js';
import { enrichEvents } from './scoreCalculations.js';

import Symbol from './Symbol.js';

export default function Scorebook({ players, onChangePlayer, events }) {
    const enrichedEvents = enrichEvents(events);
    return (
        <div className='lineup'>
            <h1>Scorebook</h1>
            <div className='batters'>
                <h2>Batters</h2>
                {players.filter(player => player.type === 'batter').map(player => 
                    <div class='batter-entry'>
                        <PlayerNameEntry
                            player={player}
                            type='batter'
                            index={player.id}
                            onChange={onChangePlayer}
                            isOnStrike={player.id === getOnStrikeBatterId()}
                        />
                        <BatterLog 
                            events={enrichedEvents.filter(event => 
                                event.onStrikeBatterId === player.id)} 
                        />
                    </div>
                )}
            </div>
            <div className='bowlers'>
                <h2>Bowlers</h2>
                {players.filter(player => player.type === 'bowler').map(player => 
                    <div class='bowler-entry'>
                        <PlayerNameEntry
                            player={player}
                            type='bowler'
                            index={player.id}
                            onChange={onChangePlayer}
                            isOnStrike={player.id === getOnBowlBowlerId()}
                        />
                        <BowlerLog 
                            events={enrichedEvents.filter(event => 
                                event.onBowlBowlerId === player.id)} 
                        />
                    </div>
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

function BatterLog({ events }) {
    return (
        <div className='batter-log'>
            {events.map(event => Symbol({event, isBatter: true}))}
        </div>
    );
}

function BowlerLog({ events }) {
    return (
        <div className='bowler-log'>
            {events.map(event => Symbol({event, isBatter: false}))}
        </div>
    );
}

function PlayerNameEntry({ player, type, index, onChange, isOnStrike }) {
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
                {isOnStrike && ' *'}
                &nbsp;
                <button onClick={() => setIsEditing(true)}>Edit</button>
            </>
        );
    }
    return (
        <div className={type + '-name'}>
            {index + 1} &nbsp;
            {playerContent}
        </div>
    );
}