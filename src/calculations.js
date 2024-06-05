import { fieldPositionsList } from './FieldPositions.js';

let onStrikeBatterId = 0;
let offStrikeBatterId = 1;
let onBowlBowlerId = 0;

export const RUN_OUT_NO_BATTER_ERROR_MSG = 'On a run-out, the batter out needs to be specified';
export const RUN_OUT_WRONG_BATTER = 'On a run-out, the batter out needs to be one of the two at the crease';

export function enrichEvents(events) {
    onStrikeBatterId = 0;
    onBowlBowlerId = 0;
    offStrikeBatterId = 1;
    let offBowlBowlerId = 1;
    let ball = 0;
    let over = 0;

    return events.slice().sort((a, b) => a.id - b.id).map(event => {

        if(event.newBowlerId) {
            if(ball === 0) {
                onBowlBowlerId = event.newBowlerId;
            } else {
                offBowlBowlerId = event.newBowlerId;
            }
        }

        const enrichedEvent = {
            ...event,
            onStrikeBatterId,
            offStrikeBatterId,
            onBowlBowlerId,
            over,
            ball
        };

        if(event.wicket) {
            if(event.wicket === 'run out' && event.batterOut === undefined)
                throw Error(RUN_OUT_NO_BATTER_ERROR_MSG);
            if(event.wicket === 'run out' && 
                    ![ onStrikeBatterId, offStrikeBatterId ]
                        .includes(event.batterOut))
                throw Error(`${RUN_OUT_WRONG_BATTER}: ${event.batterOut} not in ${onStrikeBatterId}, ${offStrikeBatterId}`);
            const nextBatterId = event.nextBatterId ?? 
                Math.max(onStrikeBatterId, offStrikeBatterId) + 1;
            const remainingBatter = [ onStrikeBatterId, offStrikeBatterId ]
                .filter(batter => batter !== (event.batterOut ?? 
                    onStrikeBatterId))[0];
            [ onStrikeBatterId, offStrikeBatterId ] = (event.batterOut === offStrikeBatterId) ? 
                [ remainingBatter, nextBatterId ] : [ nextBatterId, remainingBatter ];
            if(event.battersCrossed) 
                [ onStrikeBatterId, offStrikeBatterId ] = [ offStrikeBatterId, onStrikeBatterId ];
        }
        if((event.runs ?? 0) % 2 !== 0) {
            [onStrikeBatterId, offStrikeBatterId] = [offStrikeBatterId, onStrikeBatterId];
        } 
        if(!event.extra ||
                event.extra === 'bye' ||
                event.extra === 'leg bye') {
            ball++;
        }
        if(ball >= 6 && !event.extraBall) {
            over++;
            ball = 0;
            [onBowlBowlerId, offBowlBowlerId] = [offBowlBowlerId, onBowlBowlerId];
            [onStrikeBatterId, offStrikeBatterId] = [offStrikeBatterId, onStrikeBatterId];
        }
        return enrichedEvent;
    });
}

export function getOnStrikeBatterId() {
    return onStrikeBatterId;
}

export function getOffStrikeBatterId(event) {
    return offStrikeBatterId;
}

export function getOnBowlBowlerId() {
    return onBowlBowlerId;
}

export function isEmpty(object) {
    return Object.keys(object).length === 0;
}

export const getPlayerName = (players, id, type) => 
    players.filter(player => player.type === type)
        [id]?.name ?? 'Player ' + (id + 1);


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
export const calculateRunsAgainstBowler = (events) => events.reduce((acc, event) => {
    if(!['bye', 'leg bye'].includes(event.extra))
        acc += event.runs ?? 0;
    if(['wide', 'no-ball', 'no-ball hit'].includes(event.extra))
        acc++;
    return acc;
}, 0);

export const calculateBatterBallsFaced = (events) => 
    events.filter(event => 
        !(['wide', 'no-ball'].includes(event.extra))).length;

export const calculateWickets = (events) => 
    events.reduce((acc, event) => acc += 
        (event.wicket && event.wicket !== 'retired') ? 
            1 : 0, 0);

export const calculateBowlerWickets = (events) => 
    events.reduce((acc, event) => acc += 
        (event.wicket && [ 'bowled', 'caught', 'stumped', 'lbw']
            .includes(event.wicket) ? 1 : 0), 0);
            
export function calculatePartnershipAtWicket(events, wicket) {
    const wicketEvents = events.filter(event => event.wicket);
    return calculateRunsIncludingExtras(events.filter(event =>
        event.id > (wicketEvents[wicket - 1]?.id ?? 0) && 
        event.id <= (wicketEvents[wicket]?.id ?? 
            Number.MAX_SAFE_INTEGER)));
}

export const groupEventsByOver = (events) => events.reduce((acc, event) => {
    if(!acc[event.over]) acc[event.over] = [];
    acc[event.over].push(event);
    return acc;
}, []);

export function calculateCumulativeOverSummaries(events) {
    const eventsByOver = groupEventsByOver(events);
    const overSummaries = eventsByOver.map(overEvents => ({
        runs: calculateRunsAgainstBowler(overEvents),
        wickets: calculateBowlerWickets(overEvents)
    }));
    return overSummaries.map((_, index) => 
        overSummaries.slice(0, index + 1).reduce((acc, os) => ({
            runs: acc.runs += os.runs,
            wickets: acc.wickets += os.wickets 
        }), { runs: 0, wickets: 0 })
    );
}

export const getBatterEvents = (events, id) => events.filter(event => 
    (event.onStrikeBatterId === id || event.batterOut === id));

export function formatLongSummary(event, players) {
    return 'Ball ' + (event.over + 1) + '.' + event.ball + ': ' +
        'batter ' + getPlayerName(players, event.onStrikeBatterId, 'batter') + 
        ' facing bowler ' + getPlayerName(players, event.onStrikeBatterId, 'bowler') + 
        ', ' + formatSummary(event, players);
}

export function formatSummary(event, players) {
    let wicketDetail = event.wicket;
    if(!['bowled', 'stumped', 'lbw', 'retired'].includes(wicketDetail)) {
        if(event.fieldPositionId === 1) {
            wicketDetail += ' & bowled';
        } else if(event.fieldPositionId === 2) {
            wicketDetail += ' behind';
        }
    }
    const batterOut = Number(event.batterOut ?? event.onStrikeBatterId);
    const wicketSummary = event.wicket ? (!isNaN(batterOut) && batterOut !== event.onStrikeBatterId ? 
        'batter ' + getPlayerName(players, batterOut, 'batter')
        + ' ' : '') + wicketDetail : '';
    const runsSummary = 'went to ' + 
        fieldPositionsList[event.fieldPositionId ?? 0].label + (event.runs ? 
            ', ' + (event.boundary ? ' hit a ' : ' ran ') + event.runs : ', dot ball');
    return [ event.extra, runsSummary, wicketSummary, event.notes ]
        .filter(i => (i ?? '') !== '')
        .join(', ');
}
