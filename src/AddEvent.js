import { useState } from 'react';
import { runsScoredData } from './eventData';

export default function AddEvent({ onAddEvent }) {
    const [ event, setEvent ] = useState(null);
    return (
        <div className='addevent'>
            <h1>Add event</h1>
            <div className='addevent-form'>
                <fieldset className='runs'>
                    <legend>Runs scored</legend>
                    {runsScoredData.map((data, index) => {
                        return <button 
                            key={index}
                            data-runs={data.runs} 
                            data-boundary={data.boundary}
                        >
                            {data.label}
                        </button>
                    })}
                </fieldset>
                <fieldset className='extras'>
                    <legend>Extras scored</legend>
                    <button>Wide</button>
                    <button>No-ball</button>
                    <button>Bye</button>
                    <button>Leg Bye</button>
                </fieldset>
                <fieldset className='wicket'>
                    <legend>Wicket!</legend>
                    <button>Bowled</button>
                    <button>Caught</button>
                    <button>Run out</button>
                    <button>LBW</button>
                    <button>Retired</button>
                </fieldset>
            </div>
            <button>Confirm</button>
        </div>
    );
}