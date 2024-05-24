export function enrichEvents(events) {
    let onStrikeBatterId = 0;
    let onBowlBowlerId = 0;
    let offStrikeBatterId = 1;
    let offBowlBowlerId = 1;
    let ball = 0;
    let over = 0;
    return events.map(event => {

        const enrichedEvent = {
            ...event,
            onStrikeBatterId,
            offStrikeBatterId,
            onBowlBowlerId,
            over,
            ball,
        };

        if(event.runs % 2 !== 0) {
            [onStrikeBatterId, offStrikeBatterId] = [offStrikeBatterId, onStrikeBatterId];
        } 
        if(event.wicket) {
            const nextBatterId = event.wicket.nextBatterId ?? 
                Math.max(onStrikeBatterId, offStrikeBatterId);
            [onStrikeBatterId, offStrikeBatterId] = event.wicket.battersCrossed ? 
                [ offStrikeBatterId, nextBatterId ] : [ nextBatterId, offStrikeBatterId ];
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

export function calculateScore(events) {
    const enrichedEvents = enrichEvents(events);
    const runs = enrichedEvents.reduce((acc, event) => {
        acc += event.runs;
        if(event.extra === 'wide' ||
            event.extra === 'no-ball'
        ) {
            acc++;
        }
    });
    const wickets = enrichedEvents.filter(event => 
        event.wicket && event.wicket.type !== 'retired').length;
    const lastEvent = enrichedEvents[enrichedEvents.length - 1];
    const overs = lastEvent.over + lastEvent.ball; 
    const extras = enrichedEvents.filter(event => event.extra)
            .reduce((acc, event) => {
        acc += event.runs;
        if(event.extra === 'wide' ||
            event.extra === 'no-ball'
        ) {
            acc++;
        }
    });
    const batter1 = {
        id: lastEvent.onStrikeBatterId,
        runs: enrichEvents.filter(event => 
                event.onStrikeBatterId === lastEvent.onStrikeBatterId)
            .reduce((acc, event) => acc += event.runs)
    };
    const batter2 = {
        id: lastEvent.offStrikeBatterId,
        runs: enrichEvents.filter(event => 
                event.onStrikeBatterId === lastEvent.offStrikeBatterId)
            .reduce((acc, event) => acc += event.runs)
    };
    const lastWicketEvent = enrichedEvents.filter(event => 
        event.wicket && event.wicket.type !== 'retired');
    const lastWicket = {

    };

    return {
        runs,
        wickets,
        overs,
        extras,
        batter1,
        batter2,
        lastWicket: lastWicket ? {
            runs: lastWicket.runs,
            batterId: lastWicket.batterId,
            batterRuns: innings.batters[lastWicket.batterId].runs,
            partnership: lastWicket.partnership
        } : null,
    }
}

