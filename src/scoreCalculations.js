
let onStrikeBatterId = 0;
let onBowlBowlerId = 0;

export function getOnStrikeBatterId() {
    return onStrikeBatterId;
}

export function getOnBowlBowlerId() {
    return onBowlBowlerId;
}

export function enrichEvents(events) {
    onStrikeBatterId = 0;
    onBowlBowlerId = 0;
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

        if(event.wicket) {
            const nextBatterId = event.wicket.nextBatterId ?? 
                Math.max(onStrikeBatterId, offStrikeBatterId) + 1;
            const remainingBatter = [ onStrikeBatterId, offStrikeBatterId ]
                .filter(batter => batter !== (event.batterOut ?? onStrikeBatterId))[0];
            [ onStrikeBatterId, offStrikeBatterId ] = event.wicket.battersCrossed ? 
                [ remainingBatter, nextBatterId ] : [ nextBatterId, remainingBatter ];
        }
        if((event.runs ?? 0) % 2 !== 0) {
            [onStrikeBatterId, offStrikeBatterId] = [offStrikeBatterId, onStrikeBatterId];
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

export function calculateRunsIncludingExtras(events) {
    return events.reduce((acc, event) => {
        acc += event.runs ?? 0;
        if(event.extra === 'wide' || 
                event.extra === 'no-ball' || 
                event.extra === 'hit no-ball')
            acc++;
        return acc;
    }, 0);
}

export function calculateExtrasBreakdown(events) {
    return ({
        wides: events.filter(event => event.extra === 'wide')
            .reduce((acc, event) => acc += 1 + (event.runs ?? 0), 0),
        byes: events.filter(event => event.extra === 'bye')
            .reduce((acc, event) => acc += event.runs, 0),
        legByes: events.filter(event => event.extra === 'leg bye')
            .reduce((acc, event) => acc += event.runs, 0),
        noBalls: events.filter(event => ['hit no-ball', 'no-ball']
            .includes(event.extra)).reduce((acc, event) =>
                acc += (event.extra === 'no-ball' ? 1 + (event.runs ?? 0) : 1), 0)
    })
}

export function calculateExtrasTotal(events) {
    return Object.entries(calculateExtrasBreakdown(events))
        .reduce((acc, item) => acc += item[1], 0);
}

export function calculateRunsNotIncludingExtras(events) {
    return events.reduce((acc, event) => {
        if(event.extra === 'hit no-ball' || !event.extra) acc += (event.runs ?? 0);
        return acc;
    }, 0);
}

export const calculateBallsFaced = (events) => 
    events.filter(event => 
        !(['wide', 'no-ball'].includes(event.extra))).length;

export const calculateWickets = (events) => 
    events.reduce((acc, event) => acc += 
        (event.wicket && event.wicket.type !== 'retired') ? 
            1 : 0, 0);

export function calculatePartnershipAtWicket(events, wicket) {
    const wicketEvents = events.filter(event => event.wicket);
    return calculateRunsIncludingExtras(events.filter(event =>
        event.id > (wicketEvents[wicket - 1]?.id ?? 0) && 
        event.id <= (wicketEvents[wicket]?.id ?? 
            Number.MAX_SAFE_INTEGER)));
}

export function getOverNumberValue(events) {
    const enrichedEvents = enrichEvents(events);
    const lastEvent = enrichedEvents[enrichedEvents.length - 1];
    return events[events.length -1].overCalled ? 
        (lastEvent.over + 1) + '.0' :
        lastEvent.over + '.' + (lastEvent.ball + 1);
}

export function calculateScore(events) {

    const enrichedEvents = enrichEvents(events);
    const runs = calculateRunsIncludingExtras(enrichedEvents);
    const wickets = enrichedEvents.filter(event => 
        event.wicket && event.wicket.type !== 'retired').length;
    const lastEvent = enrichedEvents[enrichedEvents.length - 1];
    const overs = getOverNumberValue(events);
    const extras = calculateExtrasTotal(events);
    const batter1 = {
        id: lastEvent.onStrikeBatterId,
        runs: calculateRunsNotIncludingExtras(enrichedEvents.filter(event => 
                event.onStrikeBatterId === lastEvent.onStrikeBatterId))
    };
    const batter2 = {
        id: lastEvent.offStrikeBatterId,
        runs: calculateRunsNotIncludingExtras(enrichedEvents.filter(event => 
                event.onStrikeBatterId === lastEvent.offStrikeBatterId))
    };
    const wicketEvents = enrichedEvents.filter(event => 
        event.wicket);
    const lastWicketEvent = wicketEvents[wicketEvents.length - 1];
    const lastWicketBatterId = lastWicketEvent.batterOut ?? 
        lastWicketEvent.onStrikeBatterId;
    const lastWicketRuns = calculateRunsIncludingExtras(enrichedEvents
        .filter(event => event.id <= lastWicketEvent.id));
    const lastWicketBatterRuns = calculateRunsNotIncludingExtras(enrichedEvents
        .filter(event => event.onStrikeBatterId === lastWicketBatterId));
    const partnership = calculatePartnershipAtWicket(events, calculateWickets(events));
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

