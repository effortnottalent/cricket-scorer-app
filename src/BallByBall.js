import { calculateInnings } from './scoreCalculations.js';
import { fieldPositionsList } from './FieldPositions.js';

export default function BallByBall({ events, players }) {
    const innings = calculateInnings(events);
    return (
        <div className='ball-by-ball'>
            <h1>Ball-by-ball</h1>
            <ul>
                {innings.ballByBall.map((item, index) => (
                    <li key={index}>
                        {players.find(player => player.id === item.onBowlBowlerId &&
                            player.type === 'bowler')?.name ?? 'bowler ' + item.onBowlBowlerId}
                        &nbsp;to&nbsp;
                    {players.find(player => player.id === item.onStrikeBatterId && 
                        player.type === 'batter')?.name ?? 'batter ' + item.onStrikeBatterId}:&nbsp;
                    {formatSummary(item.event)}{item.event.notes && ', ' + item.event.notes}</li>
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
