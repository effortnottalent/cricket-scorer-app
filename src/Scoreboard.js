import { 
    calculateInnings, 
    calculateScore 
} from './scoreCalculations.js';

export default function Scoreboard({ events }) {
    const innings = calculateInnings(events);
    const score = calculateScore(innings);
    return (
        <div className='scoreboard'>
            <h1>Scoreboard</h1>
            <ul>
                <li>{score.runs} for {score.wickets} in {score.overs} overs</li>
                <li>Extras: {score.extras}</li>
                {score.lastWicket && (<li>Last wicket fell at {score.lastWicket.runs}, with batter {score.lastWicket.batterId} making {score.lastWicket.batterRuns} in a partnership of {score.lastWicket.partnership}</li>)}
                <li>Batter {score.batter1.id} is on {score.batter1.runs}</li>
                <li>Batter {score.batter2.id} is on {score.batter2.runs}</li>
                <li>Current partnership is {score.runs - (score.lastWicket ? score.lastWicket.runs : 0)}</li>
            </ul>
        </div>
    );
}