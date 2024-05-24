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
                        {players.find(player => player.id === event.onBowlBowlerId &&
                            player.type === 'bowler')?.name ?? 'bowler ' + event.onBowlBowlerId}
                        &nbsp;to&nbsp;
                    {players.find(player => player.id === event.onStrikeBatterId && 
                        player.type === 'batter')?.name ?? 'batter ' + event.onStrikeBatterId}:&nbsp;
                    {formatSummary(event)}{event.notes && ', ' + event.notes}</li>
                ))}
            </ul>
        </div>
    );
}

function formatSummary(event) {
    return event.extra ? 
        event.extra + (event.runs > 0 ? ', ran ' + event.runs : '') : 
            (event.wicket ? 
                event.wicket.type + (event.wicket.fielderId ? ' by ' + 
                    event.wicket.fielderId + ' at ' + fieldPositionsList[event.fieldPositionId].label : '') : 
                    (event.runs === 0 ? 'no run' : 
                        'hit to ' + fieldPositionsList[event.fieldPositionId].label + ' for ' + event.runs));
}
