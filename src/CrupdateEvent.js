import { 
    useContext, 
    useState 
} from 'react';
import { 
    runsScoredData,
    extrasScoredData,
    wicketScoredData
} from './eventRefData.js';
import 
    FieldPositionPicker, 
    { fieldPositionsList } 
from './FieldPositionPicker.js';
import { 
    EventsContext,
    EventsDispatchContext,
    PlayersContext 
} from './Contexts.js';
import {
    enrichEvents,
    formatOverBall,
    formatSummary,
    getOffStrikeBatterId,
    getOnBowlBowlerId,
    getOnStrikeBatterId,
    getPlayerName,
    isEmpty
} from './calculations.js';

import './CrupdateEvent.scss';

export default function CrupdateEvent({ eventToEdit }) {
    const [ event, setEvent ] = useState(eventToEdit);
    const players = useContext(PlayersContext);
    const eventsDispatch = useContext(EventsDispatchContext);
    const events = enrichEvents(useContext(EventsContext));

    const onStrikeBatterId = isEmpty(eventToEdit) ? getOnStrikeBatterId() : 
        event.onStrikeBatterId;
    const offStrikeBatterId = isEmpty(eventToEdit) ? getOffStrikeBatterId() : 
        event.onStrikeBatterId;
    const onBowlBowlerId = isEmpty(eventToEdit) ? getOnBowlBowlerId() : 
        event.onBowlBowlerId;

    const handleEvent = (event, type) => eventsDispatch({ type, event });
    const handleAddEvent = (event) => handleEvent(event, 'add');
    const handleEditEvent = (event) => handleEvent(event, 'edit');
    const handleDeleteEvent = (event) => handleEvent(event, 'delete');

    return (
        <div className='addevent'>
            <h1>{ isEmpty(eventToEdit) ? 'Add Ball' : 'Edit Ball ' + 
                formatOverBall(eventToEdit)}</h1>
            <div className='addevent-form'>
                <fieldset className='runs'>
                    <legend>Runs scored</legend>
                    {runsScoredData.map((data, index) => {
                        const selected = data.runs === event.runs && 
                            ((event.boundary ?? false) === (data.boundary ?? false));
                        const disabled = ['bowled', 'caught', 'lbw', 'stumped']
                            .includes(event.wicket);
                        return <button 
                            data-testid='selectable'
                            className={selected ? 'selected' : ''}
                            key={index}
                            disabled={disabled}
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
                            data-testid='selectable'
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
                            data-testid='selectable'
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
                </fieldset>
                {!['bowled', 'lbw'].includes(event.wicket) && 
                    (event.runs !== undefined || 
                    ['run out', 'caught'].includes(event.wicket)) &&
                    <fieldset className='fieldPosition'>
                        <legend>Field position</legend>
                        <FieldPositionPicker
                            event={event}
                            setEvent={setEvent}
                        />
                    </fieldset>
                }
                {(event.wicket === 'run out' &&
                    <fieldset className='batterOut'>
                        <legend>Batter out</legend>
                        <label htmlFor='batterOutId'>Batter out</label>
                        <select 
                            name='batterOutId' 
                            id='batterOutId'
                            onChange={(e) => setEvent({
                                ...event,
                                batterOutId: e.target.value
                            })}
                        >
                            {[onStrikeBatterId, offStrikeBatterId]
                                .map((batterId, index) => 
                                    (<option 
                                        key={index} 
                                        value={batterId}
                                    >
                                        {getPlayerName(players, batterId, 'batter')}
                                    </option>)
                            )}
                        </select>
                    </fieldset>
                )}
            </div>
            <fieldset className='utility'>
                <legend>Other information</legend>
                <label htmlFor='notes'>notes</label>
                <input 
                    type='text' 
                    name='notes' 
                    id='notes' 
                    value={event.notes ?? ''} 
                    onChange={(e) => setEvent({
                        ...event,
                        notes: e.target.value
                    })}
                ></input>
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
                {events[events.length - 1].ball >= 5 && 
                    <button
                        data-testid='selectable'
                        className={event.extraBall ? 'selected' : ''}
                        onClick={(e) => setEvent({
                            ...event,
                            extraBall: !event.extraBall
                        })}
                    >
                        Extra ball
                    </button>
                }
            </fieldset>
            {Object.keys(event).length !== 0 &&
                <fieldset className='confirm-ball'>
                    <p>Batter {onStrikeBatterId + 1} - {getPlayerName(players, 
                            onStrikeBatterId, 'batter')} - on strike, facing 
                        bowler {onBowlBowlerId + 1} - {getPlayerName(players, 
                            onBowlBowlerId, 'bowler')}</p>
                    <p>{formatSummary(event, players)}</p>
                    <legend>Confirm ball</legend>
                    <button onClick={() => {
                        event.id !== undefined ? handleEditEvent(event) : handleAddEvent(event);
                        setEvent(isEmpty(eventToEdit) ? {} : event);
                    } }>Confirm</button>
                    <button onClick={() => {
                        setEvent(isEmpty(eventToEdit) ? {} : eventToEdit);
                    }}
                    >
                        Reset
                    </button>
                    {!isEmpty(eventToEdit) &&
                        <button onClick={() => {
                            handleDeleteEvent(event);
                            setEvent(isEmpty(eventToEdit) ? {} : eventToEdit);
                        }}
                        >
                            Delete ball
                        </button>
                    }

                </fieldset>
            }
        </div>
    );
}