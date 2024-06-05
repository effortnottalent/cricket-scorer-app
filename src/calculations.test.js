import { fieldPositionsList } from './FieldPositions.js';
import {
    RUN_OUT_NO_BATTER_ERROR_MSG,
    RUN_OUT_WRONG_BATTER,
    calculateRunsIncludingExtras,
    calculateExtrasBreakdown,
    enrichEvents,
    getPlayerName,
    calculateExtrasTotal,
    calculateRunsNotIncludingExtras,
    calculateRunsAgainstBowler,
    calculateBatterBallsFaced,
    calculatePartnershipAtWicket,
    groupEventsByOver,
    calculateCumulativeOverSummaries,
    formatSummary,
    formatLongSummary
} from './calculations.js';

describe('enrich events tests', () => {

it('initial setup', () => {
    const events = [{
        id: 0,
        runs: 0
    }];
    const received = enrichEvents(events);
    expect(received.length).toEqual(1);
    expect(received[0].onStrikeBatterId).toEqual(0);
    expect(received[0].offStrikeBatterId).toEqual(1);
    expect(received[0].onBowlBowlerId).toEqual(0);
    expect(received[0].ball).toEqual(0);
    expect(received[0].over).toEqual(0);
    expect(received[0].id).toEqual(0);
    expect(received[0].runs).toEqual(0);
});

it('swaps batter ends upon an odd number of runs', () => {
    const events = [{
        runs: 0,
    }, {
        runs: 1,
    }, {
        runs: 0,
    }];
    const received = enrichEvents(events)[2];
    expect(received.onStrikeBatterId).toEqual(1);
    expect(received.offStrikeBatterId).toEqual(0);
});

it('doesn\'t swap batter ends upon an even number of runs', () => {
    const events = [{
        runs: 0,
    }, {
        runs: 4,
    }, {
        runs: 0,
    }];
    const received = enrichEvents(events)[2];
    expect(received.onStrikeBatterId).toEqual(0);
    expect(received.offStrikeBatterId).toEqual(1);
});

it('calls an over after six balls, but only on ball seven', () => {
    const events = [{
        runs: 0,
    }, {
        runs: 0,
    }, {
        runs: 0,
    }, {
        runs: 0,
    }, {
        runs: 0,
    }, {
        runs: 0,
    }, {
        runs: 0,
    }];
    const [ receivedBeforeOver, receivedAfterOver ] = enrichEvents(events).slice(-2);
    expect(receivedBeforeOver.over).toEqual(0);
    expect(receivedBeforeOver.ball).toEqual(5);
    expect(receivedAfterOver.over).toEqual(1);
    expect(receivedAfterOver.ball).toEqual(0);
});
it('swaps batsmen and bowlers after over', () => {
    const events = [{
        runs: 0,
    }, {
        runs: 0,
    }, {
        runs: 0,
    }, {
        runs: 0,
    }, {
        runs: 0,
    }, {
        runs: 0,
    }, {
        runs: 0,
    }];
    const [ receivedBeforeOver, receivedAfterOver ] = enrichEvents(events).slice(-2);
    expect(receivedBeforeOver.onStrikeBatterId).toEqual(0);
    expect(receivedBeforeOver.offStrikeBatterId).toEqual(1);
    expect(receivedBeforeOver.onBowlBowlerId).toEqual(0);
    expect(receivedAfterOver.onStrikeBatterId).toEqual(1);
    expect(receivedAfterOver.offStrikeBatterId).toEqual(0);
    expect(receivedAfterOver.onBowlBowlerId).toEqual(1);
});

it('counts wides, no-balls as not part of over', () => {
    const events = [{
        runs: 0,
    }, {
        runs: 0,
    }, {
        runs: 0,
    }, {
        runs: 0,
    }, {
        extra: 'wide',
    }, {
        extra: 'no-ball',
    }, {
        extra: 'hit no-ball',
    }, {
        runs: 0,
    }, {
        runs: 0,
    }, {
        runs: 0,
    }];
    const [ receivedBeforeOver, receivedAfterOver ] = enrichEvents(events).slice(-2);
    expect(receivedBeforeOver.over).toEqual(0);
    expect(receivedBeforeOver.ball).toEqual(5);
    expect(receivedAfterOver.over).toEqual(1);
    expect(receivedAfterOver.ball).toEqual(0);
});


it('counts runs, wickets, bytes and leg byes as part of over', () => {
    const events = [{
        runs: 1,
    }, {
        wicket: 'bowled'
    }, {
        runs: 2,
        extra: 'bye'
    }, {
        runs: 1,
        extra: 'leg bye'
    }, {
        runs: 0,
    }, {
        runs: 0,
    }, {
        runs: 0,
    }];
    const [ receivedBeforeOver, receivedAfterOver ] = enrichEvents(events).slice(-2);
    expect(receivedBeforeOver.over).toEqual(0);
    expect(receivedBeforeOver.ball).toEqual(5);
    expect(receivedAfterOver.over).toEqual(1);
    expect(receivedAfterOver.ball).toEqual(0);
});


it('increments on strike batter upon wicket', () => {
    const events = [{
        wicket: 'bowled',
    }, {
        runs: 0
    }];
    const [ receivedBeforeOver, receivedAfterOver ] = enrichEvents(events).slice(-2);
    expect(receivedBeforeOver.onStrikeBatterId).toEqual(0);
    expect(receivedBeforeOver.offStrikeBatterId).toEqual(1);
    expect(receivedAfterOver.onStrikeBatterId).toEqual(2);
    expect(receivedAfterOver.offStrikeBatterId).toEqual(1);
});

it('assigns a correct batter given run out, specifying batter off strike', () => {
    const events = [{
        wicket: 'run out',
        batterOut: 1
    }, {
        runs: 0
    }];
    const [ receivedBeforeOver, receivedAfterOver ] = enrichEvents(events).slice(-2);
    expect(receivedBeforeOver.onStrikeBatterId).toEqual(0);
    expect(receivedBeforeOver.offStrikeBatterId).toEqual(1);
    expect(receivedAfterOver.onStrikeBatterId).toEqual(0);
    expect(receivedAfterOver.offStrikeBatterId).toEqual(2);
});

it('assigns a correct batter given run out and batter crossed', () => {
    const events = [{
        wicket: 'run out',
        batterOut: 1,
        battersCrossed: true
    }, {
        runs: 0
    }];
    const [ receivedBeforeOver, receivedAfterOver ] = enrichEvents(events).slice(-2);
    expect(receivedBeforeOver.onStrikeBatterId).toEqual(0);
    expect(receivedBeforeOver.offStrikeBatterId).toEqual(1);
    expect(receivedAfterOver.onStrikeBatterId).toEqual(2);
    expect(receivedAfterOver.offStrikeBatterId).toEqual(0);
});

it('assigns a correct batter given run out after one run', () => {
    const events = [{
        wicket: 'run out',
        batterOut: 1,
        runs: 1
    }, {
        runs: 0
    }];
    const [ receivedBeforeOver, receivedAfterOver ] = enrichEvents(events).slice(-2);
    expect(receivedBeforeOver.onStrikeBatterId).toEqual(0);
    expect(receivedBeforeOver.offStrikeBatterId).toEqual(1);
    expect(receivedAfterOver.onStrikeBatterId).toEqual(2);
    expect(receivedAfterOver.offStrikeBatterId).toEqual(0);
});

it('assigns a correct batter given run out and crossed after one run', () => {
    const events = [{
        wicket: 'run out',
        batterOut: 1,
        runs: 1,
        battersCrossed: true
    }, {
        runs: 0
    }];
    const [ receivedBeforeOver, receivedAfterOver ] = enrichEvents(events).slice(-2);
    expect(receivedBeforeOver.onStrikeBatterId).toEqual(0);
    expect(receivedBeforeOver.offStrikeBatterId).toEqual(1);
    expect(receivedAfterOver.onStrikeBatterId).toEqual(0);
    expect(receivedAfterOver.offStrikeBatterId).toEqual(2);
});

it('sets the overs and balls correctly given an extra ball bowled', () => {
    const events = [{
        runs: 0,
    }, {
        runs: 0,
    }, {
        runs: 0,
    }, {
        runs: 0,
    }, {
        runs: 0,
    }, {
        runs: 0,
        extraBall: true
    }, {
        runs: 0,
    }, {
        runs: 0,
    }];
    const [ receivedBeforeOver, receivedAfterOver ] = enrichEvents(events).slice(-2);
    expect(receivedBeforeOver.over).toEqual(0);
    expect(receivedBeforeOver.ball).toEqual(6);
    expect(receivedAfterOver.over).toEqual(1);
    expect(receivedAfterOver.ball).toEqual(0);
});

it('correctly sets the new bowler when set on ball 0', () => {
    const events = [{
        runs: 0,
    }, {
        runs: 0,
    }, {
        runs: 0,
    }, {
        runs: 0,
    }, {
        runs: 0,
    }, {
        runs: 0
    }, {
        runs: 0,
        newBowlerId: 2
    }];
    const [ receivedBeforeOver, receivedAfterOver ] = enrichEvents(events).slice(-2);
    expect(receivedBeforeOver.onBowlBowlerId).toEqual(0);
    expect(receivedAfterOver.onBowlBowlerId).toEqual(2);
});

it('correctly sets the new bowler when not set on ball 0', () => {
    const events = [{
        runs: 0,
    }, {
        runs: 0,
    }, {
        runs: 0,
    }, {
        runs: 0,
        newBowlerId: 2
    }, {
        runs: 0,
    }, {
        runs: 0
    }, {
        runs: 0
    }];
    const [ receivedBeforeOver, receivedAfterOver ] = enrichEvents(events).slice(-2);
    expect(receivedBeforeOver.onBowlBowlerId).toEqual(0);
    expect(receivedAfterOver.onBowlBowlerId).toEqual(2);
});

it('throws an error when a run out is called without a batter out', () => {
    const events = [{
        wicket: 'run out',
    }];
    expect(() => enrichEvents(events)).toThrow(RUN_OUT_NO_BATTER_ERROR_MSG);
});

it('throws an error when a run out is called on a batter not at the crease', () => {
    const events = [{
        wicket: 'run out',
        batterOut: 5
    }];
    expect(() => enrichEvents(events)).toThrow(`${RUN_OUT_WRONG_BATTER}: 5 not in 0, 1`);
});

});


describe('get player name tests', () => {

it('returns player name when set', () => {
    const players = [{
        name: 'Simon Player',
        type: 'batter',
        id: 0
    }];
    expect(getPlayerName(players, 0, 'batter')).toEqual('Simon Player');
});

it('returns default name when not set', () => {
    const players = [{
        name: 'Simon Player',
        type: 'batter',
        id: 0
    }];
    expect(getPlayerName(players, 1, 'batter')).toEqual('Player 2');
});

});

describe('calculate runs tests', () => {

const fixture = [{
    id: 0,
    runs: 1,
}, {
    id: 1,
    runs: 2,
    extra: 'wide'
}, {
    id: 2,
    runs: 3,
    extra: 'hit no-ball'
}, {
    id: 3,
    runs: 0,
    extra: 'no-ball'
}, {
    id: 4,
    wicket: 'run out',
    batterOut: 1
}, {
    id: 5,
    extra: 'wide'
}, {
    id: 6,
    runs: 1,
    extra: 'bye'
}, {
    id: 7,
    wicket: 'bowled'
}, {
    id: 8,
    wicket: 'retired'
}];

it('calculates runs including extras', () => {
    expect(calculateRunsIncludingExtras(fixture)).toEqual(11);
});

it('calculates extras', () => {
    const received = calculateExtrasBreakdown(fixture)
    expect(received.wides).toEqual(4);
    expect(received.byes).toEqual(1);
    expect(received.legByes).toEqual(0);
    expect(received.noBalls).toEqual(2);
});

it('calculates total extras', () => {
    expect(calculateExtrasTotal(fixture)).toEqual(7);
});

it('calculates runs not including extras', () => {
    expect(calculateRunsNotIncludingExtras(fixture)).toEqual(4);
});

it('calculates runs against bowler', () => {
    expect(calculateRunsAgainstBowler(fixture)).toEqual(9);
});

it('calculates balls in play faced', () => {
    expect(calculateBatterBallsFaced(fixture)).toEqual(6);
})

if('calculates wickets', () => {
    expect(calculateWickets(fixture)).toEqual(2);
});

if('calculates bowler wickets', () => {
    expect(calculateWickets(fixture)).toEqual(1);
});

it('calculates partership for first wicket', () => {
    expect(calculatePartnershipAtWicket(fixture, 0)).toEqual(8);
});

});

describe('group events by over tests', () => {

it('groups normal overs together correctly', () => {
    const events = Array(18).fill({runs: 0});
    const received = groupEventsByOver(enrichEvents(events));
    expect(received.length).toEqual(3);
});

it('groups overs together correctly on partial over', () => {
    const events = Array(20).fill({runs: 0});
    const received = groupEventsByOver(enrichEvents(events));
    expect(received.length).toEqual(4);
});

it('groups overs together correctly where there\'s extras', () => {
    const events = new Array(20).fill().map(() => ({runs: 0}));
    events[2].extra = 'wide';
    events[9].extra = 'no-ball';
    const received = groupEventsByOver(enrichEvents(events));
    expect(received.length).toEqual(3);
});

it('calculates over summaries correctly', () => {
    const events = new Array(20).fill().map(() => ({runs: 0}));
    events[2].extra = 'wide';
    events[9].extra = 'no-ball';
    events[15].runs = 2;
    events[14].wicket = 'bowled';
    events[17].runs = 2;
    const received = calculateCumulativeOverSummaries(enrichEvents(events));
    expect(received.length).toEqual(3);
    expect(received[0].runs).toEqual(1);
    expect(received[0].wickets).toEqual(0);
    expect(received[1].runs).toEqual(2);
    expect(received[1].wickets).toEqual(0);
    expect(received[2].runs).toEqual(6);
    expect(received[2].wickets).toEqual(1);
    expect
});

});

describe('build event summaries', () => {

it('summarises dot balls', () => {
    const event = {
        runs: 0,
        fieldPositionId: 7
    };
    const expected = `went to ${fieldPositionsList[event.fieldPositionId].label}, dot ball`;
    expect(formatSummary(event)).toEqual(expected);
});

it('summarises runs', () => {
    const event = {
        runs: 2,
        fieldPositionId: 4
    };
    const expected = `went to ${fieldPositionsList[event.fieldPositionId].label}, ran ${event.runs}`;
    expect(formatSummary(event)).toEqual(expected);
});


it('summarises boundaries', () => {
    const event = {
        runs: 6,
        fieldPositionId: 4,
        boundary: true
    };
    const expected = `went to ${fieldPositionsList[event.fieldPositionId].label}, hit a ${event.runs}`;
    expect(formatSummary(event)).toEqual(expected);
});

it('summarises bowled', () => {
    const event = {
        wicket: 'bowled',
    };
    const expected = `bowled!`;
    expect(formatSummary(event)).toEqual(expected);
});

it('summarises caught & bowled', () => {
    const event = {
        wicket: 'caught',
        fieldPositionId: 1
    };
    const expected = `caught & bowled!`;
    expect(formatSummary(event)).toEqual(expected);
});

it('summarises lbw', () => {
    const event = {
        wicket: 'lbw'
    };
    const expected = `lbw!`;
    expect(formatSummary(event)).toEqual(expected);
});

it('summarises caught', () => {
    const event = {
        wicket: 'caught',
        fieldPositionId: 9
    };
    const expected = `caught at ${fieldPositionsList[event.fieldPositionId].label}`;
    expect(formatSummary(event)).toEqual(expected);
});

it('summarises stumped', () => {
    const event = {
        wicket: 'stumped',
    };
    const expected = `stumped!`;
    expect(formatSummary(event)).toEqual(expected);
});
it('summarises stumped on a wide (that\'s allowed!)', () => {
    const event = {
        wicket: 'stumped',
        extra: 'wide',
        runs: 0
    };
    const expected = `wide, stumped!`;
    expect(formatSummary(event)).toEqual(expected);
});

it('summarises wide no run', () => {
    const event = {
        extra: 'wide',
        fieldPositionId: 9,
    }; 
    const expected = `wide, went to ${fieldPositionsList[event.fieldPositionId].label}`;
    expect(formatSummary(event)).toEqual(expected);
});

it('summarises no ball bye', () => {
    const event = {
        extra: 'no-ball',
        fieldPositionId: 4,
        runs: 2
    }; 
    const expected = `no-ball, went to ${fieldPositionsList[event.fieldPositionId].label}, ran 2`;
    expect(formatSummary(event)).toEqual(expected);
});

it('summarises hit no ball', () => {
    const event = {
        extra: 'hit no-ball',
        fieldPositionId: 12,
        runs: 3
    }; 
    const expected = `hit no-ball, went to ${fieldPositionsList[event.fieldPositionId].label}, ran 3`;
    expect(formatSummary(event)).toEqual(expected);
});

it('generates a long summary', () => {
    const event = {
        extra: 'hit no-ball',
        fieldPositionId: 12,
        runs: 3
    }; 
    const players = [{
        name: 'Simon Batto',
        type: 'batter',
        id: 0
    },{
        name: 'Clive Bowley',
        type: 'bowler',
        id: 0
    }];
    const expected = `Ball 1.1: batter ${players[0].name} facing bowler ${players[1].name}, hit no-ball, went to ${fieldPositionsList[event.fieldPositionId].label}, ran 3`;
    expect(formatLongSummary(enrichEvents([event])[0], players)).toEqual(expected);
})

})