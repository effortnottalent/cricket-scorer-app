import {
    useContext
} from 'react';
import { 
    calculateWickets,
    enrichEvents,
    groupEventsByOver,
    calculateRunsIncludingExtras,
    formatSummary,
    getPlayerName
} from './calculations.js';
import { 
    EventsContext, 
    PlayersContext 
} from './Contexts.js';

import './BallByBall.scss';

export default function BallByBall() {
    const events = enrichEvents(useContext(EventsContext));
    const players = useContext(PlayersContext);
    return (
        <div className='ballbyball'>
            <h1>Ball-by-ball</h1>
            <div className="ballbyball__header">
                <div>Over</div>
                <div>Ball</div>
                <div>Bowler</div>
                <div>Batter</div>
                <div>Summary</div>
                <div>Runs</div>
                <div>Wkts</div>
            </div>
            {groupEventsByOver(events).map((overEvents, index) => 
                <div 
                    key={index}
                    className="ballbyball__overrow"
                >
                    <div className='ballbyball__overnumber'>{overEvents[0].over + 1}</div>
                    <div className='ballbyball__overballs'>
                    {overEvents.map((event, ballIndex) => 
                            <div
                                key={ballIndex} 
                                className="ballbyball__ballrow"
                            >
                                <div>{event.ball + 1}</div>
                                <div>
                                    {getPlayerName(players, event.onBowlBowlerId, 'bowler')}
                                </div>
                                <div>
                                    {getPlayerName(players, event.onStrikeBatterId, 'batter')}
                                </div>
                                <div>{formatSummary(event, players)}</div>
                                <div>
                                    {calculateRunsIncludingExtras(events
                                        .filter(event2 => event2.id <= event.id))}
                                </div>
                                <div>
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