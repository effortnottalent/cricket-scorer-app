import { enrichEvents } from './scoreCalculations.js';
import { fieldPositionsList } from './FieldPositions.js';

export default function BallByBall({ events, players }) {
    const enrichedEvents = enrichEvents(events);
    return (
        <div className='ball-by-ball'>
            <h1>Ball-by-ball</h1>
            <ul>
                {enrichedEvents.map((event, index) => (
                    <li key={index}>
                        {formatSummary(event)}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function formatSummary(event) {
    return JSON.stringify(event);
}
