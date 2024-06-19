import {
    useContext
} from 'react';
import { 
    enrichEvents,
    getOnBowlBowlerId,
    getOnStrikeBatterId,
    calculateRunsIncludingExtras,
    calculateExtrasTotal,
    calculateWickets,
    calculateRunsNotIncludingExtras,
    calculatePartnershipAtWicket,
    getPlayerName
} from './calculations.js';
import { 
    EventsContext, 
    PlayersContext 
} from './Contexts.js';

import './Scoreboard.scss';

export default function Scoreboard() {
    const events = enrichEvents(useContext(EventsContext));
    const players = useContext(PlayersContext);

    const runs = calculateRunsIncludingExtras(events);
    const wickets = calculateWickets(events);
    const lastEvent = events[events.length - 1];
    const overs = lastEvent.over + '.' + lastEvent.ball;
    const extras = calculateExtrasTotal(events);
    const batter1 = {
        id: lastEvent.onStrikeBatterId,
        runs: calculateRunsNotIncludingExtras(events.filter(event => 
                event.onStrikeBatterId === lastEvent.onStrikeBatterId))
    };
    const batter2 = {
        id: lastEvent.offStrikeBatterId,
        runs: calculateRunsNotIncludingExtras(events.filter(event => 
                event.onStrikeBatterId === lastEvent.offStrikeBatterId))
    };
    const wicketEvents = events.filter(event => 
        event.wicket);
    const lastWicketEvent = wicketEvents[wicketEvents.length - 1];
    const lastWicketBatterId = lastWicketEvent?.batterOut ?? 
        lastWicketEvent?.onStrikeBatterId;
    const lastWicketRuns = calculateRunsIncludingExtras(events
        .filter(event => event.id <= (lastWicketEvent?.id ?? Number.MAX_SAFE_INTEGER)));
    const lastWicketBatterRuns = calculateRunsNotIncludingExtras(events
        .filter(event => event.onStrikeBatterId === lastWicketBatterId));
    const partnership = calculatePartnershipAtWicket(events, calculateWickets(events));
    const lastWicket = {
        runs: lastWicketRuns,
        batterId: lastWicketBatterId,
        batterRuns: lastWicketBatterRuns,
        partnership: partnership
    };

    return (
        <div className='scoreboard'>
            <h1 className='scoreboard__header'>Scoreboard</h1>
            <div className='scoreboard__container'>
                <div className='scoreboard__item'>
                    <div className='scoreboard__label'>
                        Bat {batter1.id + 1}: {getPlayerName(players, batter1.id, 'batter')}
                    </div>
                    <div className='scoreboard__value'>
                        {batter1.runs}
                    </div>
                </div>
                <div className='scoreboard__item'>
                    <div className='scoreboard__label'>Runs</div>
                    <div className='scoreboard__value'>{runs}</div>
                </div>
                <div className='scoreboard__item'>
                    <div className='scoreboard__label'>
                        Bat {batter2.id + 1}: {getPlayerName(players, batter2.id, 'batter')}
                    </div>
                    <div className='scoreboard__value'>{batter2.runs}</div>
                </div>
                <div className='scoreboard__item'>
                    <div className='scoreboard__label'>Last wicket</div>
                    <div className='scoreboard__value'>{lastWicket.runs}</div>
                </div>
                <div className='scoreboard__item'>
                    <div className='scoreboard__label'>Wickets</div>
                    <div className='scoreboard__value'>{wickets}</div>
                </div>
                <div className='scoreboard__item'>
                    <div className='scoreboard__label'>Last man</div>
                    <div className='scoreboard__value'>{lastWicket.batterRuns}</div>
                </div>
                <div className='scoreboard__item'>
                    <div className='scoreboard__label'>First innings</div>
                    <div className='scoreboard__value'>-</div>
                </div>
                <div className='scoreboard__item'>
                    <div className='scoreboard__label'>Overs</div>
                    <div className='scoreboard__value'>{overs}</div>
                </div>
                <div className='scoreboard__item'>
                    <div className='scoreboard__label'>Runs required</div>
                    <div className='scoreboard__value'>-</div>
                </div>
            </div>
        </div>
    );
}