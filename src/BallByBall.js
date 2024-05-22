import { 
    calculateInnings
} from './scoreCalculations.js';

export default function BallByBall({ events }) {
    const innings = calculateInnings(events);
    return (
        <div className='ball-by-ball'>
            <h1>Ball-by-ball</h1>
            <ul>
                {innings.ballByBall.map((item, index) => (
                    <li key={index}>Bowler {item.onBowlBowlerId} to batter {item.onStrikeBatterId}: {item.summary}{item.notes && ', ' + item.notes}</li>
                ))}
            </ul>
        </div>
    );
}