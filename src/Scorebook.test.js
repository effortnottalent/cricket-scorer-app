import { fireEvent, render, screen } from '@testing-library/react';
import { 
    BallLogEntry, 
    OverLogEntry,
    BowlerLog,
    bowlerColours, 
    getEventForEdit,
    OverByOverSummary,
    WicketByWicketSummary,
    ScoreTicker,
    PlayerNameEntry
} from './Scorebook.js';
import { enrichEvents } from './calculations.js';
import { act } from 'react';

describe('ball log items', () => {

it('shows dot ball for batter for no runs', () => {
    const event = {
        onStrikeBatterId: 0,
        onBowlBowlerId: 0,
        runs: 0
    };
    render(<BallLogEntry 
        event={event}
        isBatter={true}
        playerId={0} />);
    const received = screen.getByText('•');
    expect(received).toBeInTheDocument();
    expect(received).toHaveStyle(`color: ${bowlerColours[event.onBowlBowlerId]}`);
});

it('shows ball has tooltip set', () => {
    const event = {
        onStrikeBatterId: 0,
        onBowlBowlerId: 0,
        runs: 0
    };
    render(<BallLogEntry 
        event={event}
        isBatter={true}
        playerId={0} />);
    const received = screen.getByTestId('ball-container');
    expect(received).toBeInTheDocument();
    expect(received).toHaveAttribute('title');
});

it('shows dot ball for bowler for no runs', () => {
    const event = {
        onStrikeBatterId: 0,
        onBowlBowlerId: 0,
        runs: 0
    };
    render(<BallLogEntry 
        event={event}
        isBatter={false}
        playerId={0} />);
    const received = screen.getByText('•');
    expect(received).toBeInTheDocument();
});

it('shows dot ball for batter running a bye', () => {
    const event = {
        onStrikeBatterId: 0,
        onBowlBowlerId: 0,
        extra: 'bye',
        runs: 1
    };
    render(<BallLogEntry 
        event={event}
        isBatter={true}
        playerId={0} />);
    const received = screen.getByText('•');
    expect(received).toBeInTheDocument();
});

it('shows number of runs for batter', () => {
    const event = {
        onStrikeBatterId: 0,
        onBowlBowlerId: 0,
        runs: 2
    };
    render(<BallLogEntry 
        event={event}
        isBatter={true}
        playerId={0} />);
        const received = screen.getByText(event.runs);
    expect(received).toBeInTheDocument();
    expect(received).toHaveStyle(`color: ${bowlerColours[event.onBowlBowlerId]}`);
});

it('shows number of runs for batter when hit no ball', () => {
    const event = {
        onStrikeBatterId: 0,
        onBowlBowlerId: 0,
        extra: 'hit no-ball',
        runs: 3
    };
    render(<BallLogEntry 
        event={event}
        isBatter={true}
        playerId={0} />);
    const received = screen.getByText(event.runs);
    expect(received).toBeInTheDocument();
    expect(received).toHaveStyle(`color: ${bowlerColours[event.onBowlBowlerId]}`);
});

it('shows number of runs for bowler', () => {
    const event = {
        onStrikeBatterId: 0,
        onBowlBowlerId: 0,
        runs: 2
    };
    render(<BallLogEntry 
        event={event}
        isBatter={false}
        playerId={0} />);
    const received = screen.getByText('2');
    expect(received).toBeInTheDocument();
});

it('renders simple wicket for batter', () => {
    const event = {
        onStrikeBatterId: 0,
        onBowlBowlerId: 0,
        wicket: 'bowled'
    };
    render(<BallLogEntry 
        event={event}
        isBatter={true}
        playerId={0} />);
    const received = screen.getByTestId('batter-out');
    expect(received).toBeInTheDocument();
});

it('renders runs and wicket when batter on strike run out', () => {
    const event = {
        onStrikeBatterId: 0,
        onBowlBowlerId: 0,
        wicket: 'run out',
        runs: 2,
        batterOutOnStrike: true
    };
    render(<BallLogEntry 
        event={event}
        isBatter={true}
        playerId={0} />);
    const runs = screen.getByText('2');
    const wicket = screen.getByTestId('batter-out');
    expect(runs).toBeInTheDocument();
    expect(wicket).toBeInTheDocument();
});

it('renders simple wicket for bowler', () => {
    const event = {
        onStrikeBatterId: 0,
        onBowlBowlerId: 0,
        wicket: 'bowled'
    };
    render(<BallLogEntry 
        event={event}
        isBatter={false}
        playerId={0} />);
    const received = screen.getByText('W');
    expect(received).toBeInTheDocument();
});

it('renders a wide, no runs', () => {
    const event = {
        onStrikeBatterId: 0,
        onBowlBowlerId: 0,
        extra: 'wide'
    };
    render(<BallLogEntry 
        event={event}
        isBatter={false}
        playerId={0} />);
    const received = screen.getByTestId('wide');
    const runDots = screen.queryAllByTestId('run-dot-glyph');
    const runOutSpan = screen.queryByText('R');
    const stumpedSpan = screen.queryByText('W');
    expect(received).toBeInTheDocument();
    expect(runDots.length).toEqual(0);
    expect(runOutSpan).not.toBeInTheDocument();
    expect(stumpedSpan).not.toBeInTheDocument();
});

it('renders a wide, 3 runs', () => {
    const event = {
        onStrikeBatterId: 0,
        onBowlBowlerId: 0,
        extra: 'wide',
        runs: 3
    };
    render(<BallLogEntry 
        event={event}
        isBatter={false}
        playerId={0} />);
    const received = screen.getByTestId('wide');
    const runDots = screen.queryAllByTestId('run-dot-glyph');
    const runOutSpan = screen.queryByText('R');
    const stumpedSpan = screen.queryByText('W');
    expect(received).toBeInTheDocument();
    expect(runDots.length).toEqual(event.runs);
    expect(runOutSpan).not.toBeInTheDocument();
    expect(stumpedSpan).not.toBeInTheDocument();
});

it('renders a wide, stumping', () => {
    const event = {
        onStrikeBatterId: 0,
        onBowlBowlerId: 0,
        extra: 'wide',
        wicket: 'stumped'
    };
    render(<BallLogEntry 
        event={event}
        isBatter={false}
        playerId={0} />);
    const received = screen.getByTestId('wide');
    const runDots = screen.queryAllByTestId('run-dot-glyph');
    const runOutSpan = screen.queryByText('R');
    const stumpedSpan = screen.queryByText('W');
    expect(received).toBeInTheDocument();
    expect(runDots.length).toEqual(0);
    expect(runOutSpan).not.toBeInTheDocument();
    expect(stumpedSpan).toBeInTheDocument();
});

it('renders a wide, run out on two runs', () => {
    const event = {
        onStrikeBatterId: 0,
        onBowlBowlerId: 0,
        extra: 'wide',
        wicket: 'run out',
        runs: 2,
        batterOutOnStrike: false
    };
    render(<BallLogEntry 
        event={event}
        isBatter={false}
        playerId={0} />);
    const received = screen.getByTestId('wide');
    const runDots = screen.queryAllByTestId('run-dot-glyph');
    const runOutSpan = screen.queryByText('R');
    const stumpedSpan = screen.queryByText('W');
    expect(received).toBeInTheDocument();
    expect(runDots.length).toEqual(event.runs);
    expect(runOutSpan).toBeInTheDocument();
    expect(stumpedSpan).not.toBeInTheDocument();
});

it('renders a no ball', () => {
    const event = {
        onStrikeBatterId: 0,
        onBowlBowlerId: 0,
        extra: 'no-ball',
    };
    render(<BallLogEntry 
        event={event}
        isBatter={false}
        playerId={0} />);
    const received = screen.getByTestId('no-ball');
    const runDots = screen.queryAllByTestId('run-dot-glyph');
    const runOutSpan = screen.queryByText('R');
    expect(received).toBeInTheDocument();
    expect(runDots.length).toEqual(0);
    expect(runOutSpan).not.toBeInTheDocument();
});

it('renders a no ball, two byes', () => {
    const event = {
        onStrikeBatterId: 0,
        onBowlBowlerId: 0,
        extra: 'no-ball',
        runs: 2
    };
    render(<BallLogEntry 
        event={event}
        isBatter={false}
        playerId={0} />);
    const received = screen.getByTestId('no-ball');
    const runDots = screen.queryAllByTestId('run-dot-glyph');
    const runOutSpan = screen.queryByText('R');
    expect(received).toBeInTheDocument();
    expect(runDots.length).toEqual(event.runs);
    expect(runOutSpan).not.toBeInTheDocument();
});

it('renders a no ball, two hit runs', () => {
    const event = {
        onStrikeBatterId: 0,
        onBowlBowlerId: 0,
        extra: 'hit no-ball',
        runs: 2
    };
    render(<BallLogEntry 
        event={event}
        isBatter={false}
        playerId={0} />);
    const received = screen.getByTestId('no-ball');
    const runDots = screen.queryAllByTestId('run-dot-glyph');
    const runOutSpan = screen.queryByText('R');
    const hitRunsSpan = screen.queryByText('2');
    expect(received).toBeInTheDocument();
    expect(runDots.length).toEqual(0);
    expect(runOutSpan).not.toBeInTheDocument();
    expect(hitRunsSpan).toBeInTheDocument();
});

it('renders a no ball, two runs and run out', () => {
    const event = {
        onStrikeBatterId: 0,
        onBowlBowlerId: 0,
        extra: 'no-ball',
        runs: 2,
        wicket: 'run out',
        batterOutOnStrike: false
    };
    render(<BallLogEntry 
        event={event}
        isBatter={false}
        playerId={0} />);
    const received = screen.getByTestId('no-ball');
    const runDots = screen.queryAllByTestId('run-dot-glyph');
    const runOutSpan = screen.queryByText(`${event.runs}R`);
    expect(received).toBeInTheDocument();
    expect(runDots.length).toEqual(0);
    expect(runOutSpan).toBeInTheDocument();
});

it('renders a bye, two runs', () => {
    const event = {
        onStrikeBatterId: 0,
        onBowlBowlerId: 0,
        extra: 'bye',
        runs: 2
    };
    render(<BallLogEntry 
        event={event}
        isBatter={false}
        playerId={0} />);
    const received = screen.getByTestId('bye');
    const runDots = screen.queryAllByTestId('run-dot-glyph');
    const runOutSpan = screen.queryByText('R');
    expect(received).toBeInTheDocument();
    expect(runDots.length).toEqual(2);
    expect(runOutSpan).not.toBeInTheDocument();
});

it('renders a leg bye, three runs', () => {
    const event = {
        onStrikeBatterId: 0,
        onBowlBowlerId: 0,
        extra: 'leg bye',
        runs: 3
    };
    render(<BallLogEntry 
        event={event}
        isBatter={false}
        playerId={0} />);
    const received = screen.getByTestId('leg-bye');
    const runDots = screen.queryAllByTestId('run-dot-glyph');
    const runOutSpan = screen.queryByText('R');
    expect(received).toBeInTheDocument();
    expect(runDots.length).toEqual(3);
    expect(runOutSpan).not.toBeInTheDocument();
});

it('renders a bye, two runs, run out', () => {
    const event = {
        onStrikeBatterId: 0,
        onBowlBowlerId: 0,
        extra: 'bye',
        runs: 2,
        wicket: 'run out',
        batterOutOnStrike: false
    };
    render(<BallLogEntry 
        event={event}
        isBatter={false}
        playerId={0} />);
    const received = screen.getByTestId('bye');
    const runDots = screen.queryAllByTestId('run-dot-glyph');
    const runOutSpan = screen.queryByText('2R');
    expect(received).toBeInTheDocument();
    expect(runDots.length).toEqual(0);
    expect(runOutSpan).toBeInTheDocument();
});

it('renders a leg bye, three runs, run out', () => {
    const event = {
        onStrikeBatterId: 0,
        onBowlBowlerId: 0,
        extra: 'leg bye',
        runs: 3,
        wicket: 'run out',
        batterOutOnStrike: false
    };
    render(<BallLogEntry 
        event={event}
        isBatter={false}
        playerId={0} />);
    const received = screen.getByTestId('leg-bye');
    const runDots = screen.queryAllByTestId('run-dot-glyph');
    const runOutSpan = screen.queryByText('3R');
    expect(received).toBeInTheDocument();
    expect(runDots.length).toEqual(0);
    expect(runOutSpan).toBeInTheDocument();
});

});

describe('over log items', () => {

it('renders a normal over as six balls', () => {
    const events = new Array(6).fill().map(() => ({runs: 0}));
    render(<OverLogEntry events={events} />);
    const received = screen.getAllByText('•');
    const ballContainer = screen.getAllByTestId('ball-container');
    expect(received.length).toEqual(6);
    ballContainer.map(e => expect(e).toHaveClass('scorebook__bowlerball'));
});

it('renders an over with a wide as nine balls', () => {
    const events = new Array(7).fill().map(() => ({runs: 0}));
    events[3] = {
        ...events[3],
        extra: 'wide'
    };
    render(<OverLogEntry events={events} />);
    const received = screen.getAllByText('•');
    const ballContainer = screen.getAllByTestId('ball-container');
    expect(received.length).toEqual(6);
    ballContainer.map(e => expect(e).toHaveClass('scorebook__bowlerball--nine'));
});

it('renders an over with two wides and two no-balls as twelve balls', () => {
    const events = new Array(10).fill().map(() => ({runs: 0}));
    events[3] = {
        ...events[3],
        extra: 'wide'
    };
    events[4] = {
        ...events[4],
        extra: 'no-ball'
    };
    events[6] = {
        ...events[6],
        extra: 'wide'
    };
    events[7] = {
        ...events[7],
        extra: 'no-ball'
    };
    render(<OverLogEntry events={events} />);
    const received = screen.getAllByText('•');
    const ballContainer = screen.getAllByTestId('ball-container');
    expect(received.length).toEqual(6);
    ballContainer.map(e => expect(e).toHaveClass('scorebook__bowlerball--twelve'));
});

it('renders the over-by-over summary with three overs', () => {
    const events = new Array(18).fill().map(() => ({runs: 0}));

    render(<OverByOverSummary events={enrichEvents(events)} />);
    const received = screen.getByTestId('over-by-over-summary');
    const overSummaries = screen.queryAllByTestId('overs-summary-entry');
    expect(received).toBeInTheDocument();
    expect(overSummaries.length).toEqual(3);
});

it('renders the wicket-by-wicket summary with two wickets', () => {
    const events = enrichEvents(new Array(18).fill().map(() => ({runs: 0})));
    events[4] = {
        ...events[4],
        wicket: 'bowled'
    };
    events[16] = {
        ...events[16],
        wicket: 'lbw'
    };

    render(<WicketByWicketSummary events={events} />);
    const received = screen.getByTestId('wicket-by-wicket-summary');
    const wicketSummaries = screen.queryAllByTestId('wickets-summary-entry');
    expect(received).toBeInTheDocument();
    expect(wicketSummaries.length).toEqual(2);
});

if('renders the ticket section correctly for the runs scored', () => {
    const events = new Array(18).fill().map(() => ({runs: 0}));
    events[2] = { runs: 1 };
    events[4] = { runs: 2 };
    events[6] = { runs: 3 };
    events[7] = { runs: 1 };
    events[12] = { runs: 6 };
    render(<ScoreTicker events={events} />);
    const tickerItems = screen.queryAllByTestId('ticker-score-item');
    expect(tickerItems.length).toEqual(13);
    expect(tickerItems[0]).toHaveClass('diag');
    expect(tickerItems[1]).toHaveClass('strike-start');
    expect(tickerItems[2]).toHaveClass('strike-end');
    expect(tickerItems[3]).toHaveClass('strike-start');
    expect(tickerItems[4]).toHaveClass('strike');
    expect(tickerItems[5]).toHaveClass('strike-end');
    expect(tickerItems[6]).toHaveClass('diag');
    expect(tickerItems[7]).toHaveClass('strike-start');
    expect(tickerItems[8]).toHaveClass('strike');
    expect(tickerItems[9]).toHaveClass('strike');
    expect(tickerItems[10]).toHaveClass('strike');
    expect(tickerItems[11]).toHaveClass('strike');
    expect(tickerItems[12]).toHaveClass('strike-end');
});

});

describe('bowler log items', () => {

it('should render bowler summary correctly', () => {

    const events = new Array(6).fill().map(() => ({
        runs: 0,
        onStrikeBatterId: 0,
        onBowlBowlerId: 0,
        over: 0
    }));
    events[3] = {
        ...events[3],
        runs: 2
    };
    events[4] = {
        ...events[4],
        wicket: 'bowled'
    };
    render(<BowlerLog events={events} />);
    expect(screen.getByTestId('over-summary')).toHaveTextContent('2 - 1');
});

it('should render bowler over log entry correctly', () => {

    const events = new Array(6).fill().map(() => ({
        runs: 0,
        onStrikeBatterId: 0,
        onBowlBowlerId: 0,
        over: 0
    }));
    events[3] = {
        ...events[3],
        runs: 2
    };
    events[4] = {
        ...events[4],
        wicket: 'bowled'
    };
    render(<BowlerLog events={events} />);
    const received = screen.getAllByTestId('over-log-entry');
    expect(received.length).toEqual(1);
});

it('should properly pick out the event id from the batter/bowler log', () => {
    const events = new Array(9).fill().map((_, id) => ({ id }));
    render(
        <div id={1} data-eventid={7}>
            <div id={2}>
                <div id={3} data-testid='top-level'/></div></div>
    );
    const received = screen.getByTestId('top-level');
    expect(getEventForEdit(events, received).id).toEqual(7);
})

});

describe('player name tests', () => {

it('has an asterisk when on strike/bowl', () => {
    render(
        <PlayerNameEntry
            player={[{}]}
            type={'batter'}
            index={0}
            isOnStrike={true}
        />);
    const received = screen.getByTestId('player-name');
    expect(received).toHaveTextContent('*');
});

it('has no asterisk when on strike/bowl', () => {
    render(
        <PlayerNameEntry
            player={[{}]}
            type={'batter'}
            index={0}
            isOnStrike={false}
        />);
    const received = screen.getByTestId('player-name');
    expect(received).not.toHaveTextContent('*');
});

it('fires update when clicked and text entered', () => {
    const mockOnEditPlayer = jest.fn();
    render(
        <PlayerNameEntry
            type={'batter'}
            index={0}
            isOnStrike={false}
            onEditPlayer={mockOnEditPlayer}
        />);
    const playerName = 'John Muffins';
    const label = screen.queryByTestId('player-name-label');
    expect(label).toBeInTheDocument();
    act(() => fireEvent.click(label));
    const editBox = screen.queryByTestId('player-name-edit');
    expect(editBox).toBeInTheDocument();
    act(() => fireEvent.change(editBox, { target: { value: playerName }}));
    act(() => fireEvent.blur(editBox));
    const label2 = screen.queryByTestId('player-name-label');
    expect(label2).toBeInTheDocument();
    expect(mockOnEditPlayer).toHaveBeenLastCalledWith({
        id: 0, 
        name: playerName, 
        type: 'batter'
    });
});

});

describe('batter log items', () => {

it('dot ball should not be fullheight', () => {
    const event = {
        onStrikeBatterId: 0,
        onBowlBowlerId: 0,
        runs: 0
    };
    render(<BallLogEntry 
        event={event}
        isBatter={true}
        playerId={0} />);
    expect(screen.getByTestId('ball-container')).toBeInTheDocument()
});

it('runs should be fullheight', () => {
    const event = {
        onStrikeBatterId: 0,
        onBowlBowlerId: 0,
        runs: 1
    };
    render(<BallLogEntry 
        event={event}
        isBatter={true}
        playerId={0} />);
    expect(screen.getByTestId('ball-container-fullheight')).toBeInTheDocument()
});

it('wicket should be fullheight', () => {
    const event = {
        onStrikeBatterId: 0,
        onBowlBowlerId: 0,
        wicket: 'bowled'
    };
    render(<BallLogEntry 
        event={event}
        isBatter={true}
        playerId={0} />);
    expect(screen.getByTestId('ball-container-fullheight')).toBeInTheDocument()
});


});