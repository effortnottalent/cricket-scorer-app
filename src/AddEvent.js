import { useState } from 'react';
import { 
    runsScoredData,
    extrasScoredData,
    wicketScoredData
} from './eventData';
import { fieldPositionsList } from './FieldPositions';

const defaultEvent = {
    runs: -1,
    notes: ''
};

export default function AddEvent({ onAddEvent }) {
    const [ event, setEvent ] = useState({ ...defaultEvent });

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
                                runs: data.runs,
                                boundary: data.boundary ?? false
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
                                extra: data.extra
                            })}
                        >
                            {data.label}
                        </button>
                    })}
                </fieldset>
                <fieldset className='wicket'>
                    <legend>Wicket!</legend>
                    {wicketScoredData.map((data, index) => {
                        const selected = data.type === event.wicket?.type;
                        return <button 
                            className={selected ? 'selected' : ''}
                            key={index}
                            onClick={(e) => setEvent({
                                ...event,
                                wicket: {
                                    type: data.type
                                }
                            })}
                        >
                            {data.label}
                        </button>
                    })}
                </fieldset>

                {(event.runs !== -1 || 
                    event.wicket?.type === 'run out' ||
                    event.wicket?.type === 'caught') &&
                    <fieldset className='fieldPosition'>
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
                    </fieldset>
                    }
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
            <button onClick={() => {
                onAddEvent(event); 
                setEvent({ ...defaultEvent });
            } }>Confirm</button>
            <button onClick={() => setEvent({ ...defaultEvent })}>Clear</button>
        </div>
    );
}