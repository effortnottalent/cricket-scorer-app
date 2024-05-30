import {
    useContext
} from 'react';
import { 
    enrichEvents,
    getOnBowlBowlerId,
    getOnStrikeBatterId,
    calculateRunsIncludingExtras,
    getOverNumberValue,
    calculateExtrasTotal,
    calculateWickets,
    calculateRunsNotIncludingExtras,
    calculatePartnershipAtWicket,
    getPlayerName
} from './calculations.js';
import { 
    EventsContext, 
    PlayersContext 
} from './App.js';

export default function Scoreboard() {
    const events = enrichEvents(useContext(EventsContext));
    const players = useContext(PlayersContext);

    const runs = calculateRunsIncludingExtras(events);
    const wickets = calculateWickets(events);
    const lastEvent = events[events.length - 1];
    const overs = getOverNumberValue(events);
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
    const lastWicketBatterId = lastWicketEvent.batterOut ?? 
        lastWicketEvent.onStrikeBatterId;
    const lastWicketRuns = calculateRunsIncludingExtras(events
        .filter(event => event.id <= lastWicketEvent.id));
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
            <h1>Scoreboard</h1>
            <ul>
                <li>{runs} for {wickets} in {overs} overs</li>
                <li>Extras: {extras}</li>
                {lastWicket && (<li>Last wicket fell at&nbsp;
                    {lastWicket.runs}, with batter {lastWicket.batterId + 1}
                    &nbsp;- {getPlayerName(players, lastWicket.batterId, 'batter')} 
                    &nbsp;- making {lastWicket.batterRuns} in a partnership of&nbsp;
                    {lastWicket.partnership}</li>)}
                <li>Batter {batter1.id + 1} - {getPlayerName(players, 
                        batter1.id, 'batter')} - is on {batter1.runs}</li>
                <li>Batter {batter2.id + 1} - {getPlayerName(players, 
                        batter2.id, 'batter')} -  is on {batter2.runs}</li>
                <li>Current partnership is {runs - (lastWicket ? 
                    lastWicket.runs : 0)}</li>
                <li>Batter {getOnStrikeBatterId() + 1} - {getPlayerName(players, 
                        getOnStrikeBatterId(), 'batter')} - on strike, facing 
                    bowler {getOnBowlBowlerId() + 1} - {getPlayerName(players, 
                        getOnBowlBowlerId(), 'bowler')}</li>
            </ul>
        </div>
    );
}