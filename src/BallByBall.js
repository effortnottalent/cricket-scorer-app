import {
    useContext
} from 'react';
import { 
    calculateWickets,
    enrichEvents,
    groupEventsByOver,
    calculateRunsIncludingExtras
} from './scoreCalculations.js';
import { fieldPositionsList } from './FieldPositions.js';
import { 
    EventsContext, 
    PlayersContext 
} from './App.js';

export default function BallByBall() {
    const events = enrichEvents(useContext(EventsContext));
    const players = useContext(PlayersContext);
    return (
        <div className='ball-by-ball'>
            <h1>Ball-by-ball</h1>
            <div className="bbb-header">
                <div className='bbb-over'>Over</div>
                <div className='bbb-ball-number'>Ball</div>
                <div className='bbb-bowler'>Bowler</div>
                <div className='bbb-batter'>Batter</div>
                <div className='bbb-summary'>Summary</div>
                <div className='bbb-runs'>Runs</div>
                <div className='bbb-wickets'>Wkts</div>
            </div>
            {groupEventsByOver(events).map((overEvents, index) => 
                <div 
                    key={'bbb-row-' + index}
                    className="bbb-row"
                >
                    <div className='bbb-over'>{overEvents[0].over + 1}</div>
                        <div className='bbb-balls'>
                        {overEvents.map((event, ballIndex) => 
                                <div
                                    key={'bbb-ball-' + ballIndex} 
                                    className="bbb-ball"
                                >
                                    <div className='bbb-ball-number'>{event.ball + 1}</div>
                                    <div className='bbb-bowler'>
                                        {players.filter(player => player.type === 'bowler')
                                            [event.onBowlBowlerId]?.name ??
                                            'Player ' + (event.onBowlBowlerId + 1)}
                                    </div>
                                    <div className='bbb-batter'>
                                        {players.filter(player => player.type === 'batter')
                                            [event.onStrikeBatterId]?.name ??
                                            'Player ' + (event.onStrikeBatterId + 1)}
                                    </div>
                                    <div className='bbb-summary'>{formatSummary(event, players)}</div>
                                    <div className='bbb-runs'>
                                        {calculateRunsIncludingExtras(events
                                            .filter(event2 => event2.id <= event.id))}
                                    </div>
                                    <div className='bbb-wickets'>
                                        {calculateWickets(events
                                            .filter(event2 => event2.id <= event.id))}
                                    </div>
                                </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export function formatLongSummary(event, players) {
    return 'Ball ' + (event.over + 1) + '.' + event.ball + ': ' +
        'Batter ' + (players.filter(player => player.type === 'batter')
            [event.onStrikeBatterId]?.name ??
            'Player ' + (event.onStrikeBatterId + 1)) + ' facing bowler ' + 
        (players.filter(player => player.type === 'bowler')
            [event.onBowlBowlerId]?.name ?? 'Player ' + 
        (event.onBowlBowlerId + 1)) + ', ' + formatSummary(event, players);
}

function formatSummary(event, players) {
    let wicketDetail = event.wicket?.type;
    if(!['bowled', 'stumped', 'lbw', 'retired'].includes(wicketDetail)) {
        if(event.fieldPositionId === 1) {
            wicketDetail += ' & bowled';
        } else if(event.fieldPositionId === 2) {
            wicketDetail += ' behind';
        }
    }
    const batterOut = (event.wicket?.batterOutId ?? event.onStrikeBatterId);
    const wicketSummary = event.wicket ? (batterOut != event.onStrikeBatterId ? 
        'batter ' + (players.filter(
            player => player.type === 'batter')[batterOut]?.name ??
        'Player ' + (batterOut + 1)) + ' ' : '') + wicketDetail : '';
    const runsSummary = event.runs ? 'went to ' + 
        fieldPositionsList[event.fieldPositionId ?? 0].label + ', ran ' 
        + event.runs : '';
    const summary = [ event.extra, runsSummary, wicketSummary, event.notes ]
        .filter(i => (i ?? '') !== '')
        .join(', ');
    if(summary === '') return 'dot ball';
    return summary;
}
