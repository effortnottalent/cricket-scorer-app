import { 
    calculateInnings
} from './scoreCalculations.js';

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
                    {item.summary}{item.notes && ', ' + item.notes}</li>
                ))}
            </ul>
        </div>
    );
}