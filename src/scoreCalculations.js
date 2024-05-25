export function enrichEvents(events) {
    let onStrikeBatterId = 0;
    let onBowlBowlerId = 0;
    let offStrikeBatterId = 1;
    let offBowlBowlerId = 1;
    let ball = 0;
    let over = 0;
    let id = 0;
    return events.map(event => {

        const enrichedEvent = {
            ...event,
            onStrikeBatterId,
            offStrikeBatterId,
            onBowlBowlerId,
            over,
            ball,
            id: id++,
        };

        if(event.runs % 2 !== 0) {
            [onStrikeBatterId, offStrikeBatterId] = [offStrikeBatterId, onStrikeBatterId];
        } 
        if(event.wicket) {
            const nextBatterId = event.wicket.nextBatterId ?? 
                Math.max(onStrikeBatterId, offStrikeBatterId) + 1;
            const remainingBatter = [ onStrikeBatterId, offStrikeBatterId ]
                .filter(batter => batter != (event.batterOut ?? onStrikeBatterId))[0];
            [ onStrikeBatterId, offStrikeBatterId ] = event.wicket.battersCrossed ? 
                [ remainingBatter, nextBatterId ] : [ nextBatterId, remainingBatter ];
        }
        if(event.newBowler) {
            if(ball === 0) {
                onBowlBowlerId = event.newBowler;
            } else {
                offBowlBowlerId = event.newBowler;
            }
        }
        if(event.overCalled) {
            over++;
            ball = 0;
            [onBowlBowlerId, offBowlBowlerId] = [offBowlBowlerId, onBowlBowlerId];
            [onStrikeBatterId, offStrikeBatterId] = [offStrikeBatterId, onStrikeBatterId];
            return null;
        }
        if(!event.overCalled && (
                !event.extra ||
                event.extra === 'bye' ||
                event.extra === 'leg bye')) {
            ball++;
        }
        return enrichedEvent;
    }).filter(event => event != null);
}

function calculateRuns(events) {
    return events.reduce((acc, event) => {
        acc += event.runs;
        if(event.extra === 'wide' ||
            event.extra === 'no-ball'
        ) {
            acc++;
        }
    },0);
}

export function calculateScore(events) {
    const enrichedEvents = enrichEvents(events);
    const runs = calculateRuns(enrichedEvents);
    const wickets = enrichedEvents.filter(event => 
        event.wicket && event.wicket.type !== 'retired').length;
    const lastEvent = enrichedEvents[enrichedEvents.length - 1];
    const overs = lastEvent.over + lastEvent.ball; 
    const extras = calculateRuns(enrichedEvents.filter(event => event.extra));
    const batter1 = {
        id: lastEvent.onStrikeBatterId,
        runs: enrichedEvents.filter(event => 
                event.onStrikeBatterId === lastEvent.onStrikeBatterId)
            .reduce((acc, event) => acc += event.runs)
    };
    const batter2 = {
        id: lastEvent.offStrikeBatterId,
        runs: enrichedEvents.filter(event => 
                event.onStrikeBatterId === lastEvent.offStrikeBatterId)
            .reduce((acc, event) => acc += event.runs)
    };
    const wicketEvents = enrichedEvents.filter(event => 
        event.wicket);
    const lastWicketEvent = wicketEvents[wicketEvents.length - 1];
    const lastWicketBatterId = lastWicketEvent.batterOut ?? 
        lastWicketEvent.onStrikeBatterId;
    const lastWicketRuns = calculateRuns(enrichedEvents
        .filter(event => event.id <= lastWicketEvent));
    const lastWicketBatterRuns = enrichedEvents
        .filter(event => event.onStrikeBatterId === lastWicketBatterId)
        .reduce((acc, event) => acc += event.runs);
    const secondLastWicketEvent = wicketEvents[wicketEvents.length - 2];
    const partnership = calculateRuns(enrichedEvents.filter(event =>
        event.id > secondLastWicketEvent.id && event.id <= lastWicket.id));
    const lastWicket = {
        runs: lastWicketRuns,
        batterId: lastWicketBatterId,
        batterRuns: lastWicketBatterRuns,
        partnership: partnership
    };
    return {
        runs,
        wickets,
        overs,
        extras,
        batter1,
        batter2,
        lastWicket,
    }
}

