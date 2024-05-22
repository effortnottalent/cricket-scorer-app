import { useState } from 'react';
import { 
    runsScoredData,
    extrasScoredData,
    wicketScoredData
} from './eventData';

const defaultEvent = {
    runs: -1,
    notes: ''
};

export default function AddEvent({ onAddEvent }) {
    const [ event, setEvent ] = useState({ ...defaultEvent });
    function handleBuildEvent(event) {

    }
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
                    {event.runs !== -1 &&
                        <fieldset className='fieldPosition'>
                            <label htmlFor='fieldPositionId'>Field position</label>
                            <input type='text' name='fieldPositionId' id='fieldPositionId'></input>
                        </fieldset>
                    }
                </fieldset>
                <fieldset className='extras'>
                    <legend>Extras scored</legend>
                    {extrasScoredData.map((data, index) => {
                        return <button 
                            key={index}
                            data-extra={data.extra} 
                        >
                            {data.label}
                        </button>
                    })}
                </fieldset>
                <fieldset className='wicket'>
                    <legend>Wicket!</legend>
                    {wicketScoredData.map((data, index) => {
                        return <button 
                            key={index}
                            data-type={data.type} 
                        >
                            {data.label}
                        </button>
                    })}
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
            <button>Confirm</button>
            <button onClick={() => setEvent({ ...defaultEvent })}>Clear</button>
        </div>
    );
}