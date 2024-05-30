import { useContext, useState } from 'react';
import { 
    runsScoredData,
    extrasScoredData,
    wicketScoredData
} from './eventData';
import { fieldPositionsList } from './FieldPositions';
import { PlayersContext } from './App';
import {
    formatSummary,
    getOffStrikeBatterId,
    getOnBowlBowlerId,
    getOnStrikeBatterId,
    getPlayerName
} from './calculations.js';

const defaultEvent = {
    notes: ''
};

export default function AddEvent({ onAddEvent }) {
    const [ event, setEvent ] = useState({ ...defaultEvent });
    const players = useContext(PlayersContext);

    return (
        <div className='addevent'>
            <h1>Add event</h1>
            <div className='addevent-form'>
                <fieldset className='runs'>
                    <legend>Runs scored</legend>
                    {runsScoredData.map((data, index) => {
                        const selected = data.runs === event.runs && 
                            (event.boundary === (data.boundary ?? false));
                        return <button 
                            className={selected ? 'selected' : ''}
                            key={index}
                            onClick={(e) => setEvent({
                                ...event,
                                runs: selected ? undefined : data.runs,
                                boundary: selected ? false : data.boundary ?? false
                            })}
                        >
                            {data.label}
                        </button>
                    })}
                </fieldset>
                <fieldset className='extras'>
                    <legend>Extras scored</legend>
                    {extrasScoredData.map((data, index) => {
                        const selected = data.extra === event.extra;
                        return <button 
                            className={selected ? 'selected' : ''}
                            key={index}
                            onClick={(e) => setEvent({
                                ...event,
                                extra: selected ? undefined : data.extra
                            })}
                        >
                            {data.label}
                        </button>
                    })}
                </fieldset>
                <fieldset className='wicket'>
                    <legend>Wicket!</legend>
                    {wicketScoredData.map((data, index) => {
                        const selected = data.type === event.wicket;
                        return <button 
                            className={selected ? 'selected' : ''}
                            key={index}
                            onClick={(e) => setEvent({
                                ...event,
                                wicket: selected ? undefined : data.type
                            })}
                        >
                            {data.label}
                        </button>
                    })}
                    {event.wicket !== 'bowled' && 
                        (event.runs !== undefined || 
                        event.wicket === 'run out' ||
                        event.wicket === 'caught') &&
                        <>
                            <label htmlFor='fieldPositionId'>Field position</label>
                            <select 
                                name='fieldPositionId' 
                                id='fieldPositionId'
                                onChange={(e) => setEvent({
                                    ...event,
                                    fieldPositionId: e.target.value
                                })}
                            >
                                {fieldPositionsList.map((fp, index) => 
                                    (<option 
                                        key={index} 
                                        value={index}
                                    >{fp.label}</option>)
                                )}
                            </select>
                        </>
                    }
                    {(event.wicket === 'run out' &&
                        <>
                            <label htmlFor='batterOutId'>Batter Out</label>
                            <select 
                                name='batterOutId' 
                                id='batterOutId'
                                onChange={(e) => setEvent({
                                    ...event,
                                    batterOutId: e.target.value
                                })}
                            >
                                {[getOnStrikeBatterId(), getOffStrikeBatterId()]
                                    .map((batterId, index) => 
                                        (<option 
                                            key={index} 
                                            value={batterId}
                                        >
                                            {getPlayerName(players, batterId, 'batter')}
                                        </option>)
                                )}
                            </select>
                        </>

                    )}
                </fieldset>
            </div>
            <fieldset className='notes'>
                <label htmlFor='notes'>notes</label>
                <input 
                    type='text' 
                    name='notes' 
                    id='notes' 
                    value={event.notes} 
                    onChange={(e) => setEvent({
                        ...event,
                        notes: e.target.value
                    })}
                ></input>
            </fieldset>
            <fieldset className='over'>
                <legend>Over called</legend>
                <button 
                    className={event.overCalled ? 'selected' : ''}
                    onClick={(e) => setEvent({
                        ...event,
                        overCalled: true
                    })}
                >
                    Over called
                </button>
                {event.overCalled && (
                    <>
                        <label htmlFor='newBowlerId'>Change of bowler</label>
                        <select
                            name='newBowlerId'
                            id='newBowlerId'
                            onChange={(e) => setEvent({
                                ...event,
                                newBowlerId: e.target.value
                            })}
                        >
                            {players.filter(player => player.type === 'bowler')
                                .map((player, index) => (
                                    <option 
                                        key={index} 
                                        value={index}
                                    >{player.name ?? 'Player ' + (index + 1) }</option>
                            ))}
                        </select>
                    </>
                )}
            </fieldset>
            {  !(event.runs === undefined &&
                event.wicket === undefined &&
                event.notes === '' &&
                event.extras === undefined) &&
                
                <fieldset className='confirm-ball'>
                    <p>Batter {getOnStrikeBatterId() + 1} - {getPlayerName(players, 
                            getOnStrikeBatterId(), 'batter')} - on strike, facing 
                        bowler {getOnBowlBowlerId() + 1} - {getPlayerName(players, 
                            getOnBowlBowlerId(), 'bowler')}</p>
                    <p>{formatSummary(event)}</p>
                    <legend>Confirm ball</legend>
                    <button onClick={() => {
                        onAddEvent(event); 
                        setEvent({ ...defaultEvent });
                    } }>Confirm</button>
                    <button onClick={() => setEvent({ ...defaultEvent })}>Clear</button>
                </fieldset>
            }
        </div>
    );
}