import { 
    calculateScore,
    getOnBowlBowlerId,
    getOnStrikeBatterId
} from './scoreCalculations.js';

export default function Scoreboard({ events, players }) {
    const score = calculateScore(events);
    return (
        <div className='scoreboard'>
            <h1>Scoreboard</h1>
            <ul>
                <li>{score.runs} for {score.wickets} in {score.overs} overs</li>
                <li>Extras: {score.extras}</li>
                {score.lastWicket && (<li>Last wicket fell at&nbsp;
                    {score.lastWicket.runs}, with batter&nbsp;
                    {score.lastWicket.batterId}  - {players.find(player => 
                    player.id === score.lastWicket.batterId && 
                    player.type === 'batter')?.name ?? 'not yet named'} - making&nbsp;
                    {score.lastWicket.batterRuns} in a partnership of&nbsp;
                    {score.lastWicket.partnership}</li>)}
                <li>Batter {score.batter1.id + 1} - {players.find(player => 
                    player.id === score.batter1.id && 
                    player.type === 'batter')?.name ?? 'not yet named'} - is on {score.batter1.runs}</li>
                <li>Batter {score.batter2.id + 1} - {players.find(player => 
                    player.id === score.batter2.id && 
                    player.type === 'batter')?.name ?? 'not yet named'} -  is on {score.batter2.runs}</li>
                <li>Current partnership is {score.runs - (score.lastWicket ? 
                    score.lastWicket.runs : 0)}</li>
                <li>Batter {getOnStrikeBatterId()} - {players.find(player => 
                    player.id === getOnStrikeBatterId() && 
                    player.type === 'batter')?.name ?? 'not yet named'} on strike, facing bowler&nbsp;
                    {getOnBowlBowlerId() + 1} - {players.find(player => 
                    player.id === getOnBowlBowlerId() && 
                    player.type === 'bowler')?.name ?? 'not yet named'}</li>
            </ul>
        </div>
    );
}