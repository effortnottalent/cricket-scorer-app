import { fireEvent, render, screen } from '@testing-library/react';
import CrupdateEvent from "./CrupdateEvent";
import { act } from 'react';
import { extrasScoredData, runsScoredData, wicketScoredData } from './eventRefData';
import { getOffStrikeBatterId, getOnBowlBowlerId, getOnStrikeBatterId } from './calculations';

describe('general event tests', () => {

it('should allow buttons to toggle', () => {

    render(<CrupdateEvent eventToEdit={{}} />);
    const buttons = screen.getAllByTestId('selectable');
    buttons.map(button => {
        expect(button).not.toHaveClass('selected');
        act(() => fireEvent.click(button));
        expect(button).toHaveClass('selected');
        act(() => fireEvent.click(button));
        expect(button).not.toHaveClass('selected');
    });

});

it('should show fielder list if runs are selected', () => {

    render(<CrupdateEvent eventToEdit={{}} />);
    runsScoredData.map(label => {
        const received = screen.getByText(label.label);
        expect(screen.queryByLabelText('Field position')).not.toBeInTheDocument();
        act(() => fireEvent.click(received));
        expect(screen.queryByLabelText('Field position')).toBeInTheDocument();
        act(() => fireEvent.click(received));
        expect(screen.queryByLabelText('Field position')).not.toBeInTheDocument();
    });
});

it('should show fielder list if run out or caught', () => {

    render(<CrupdateEvent eventToEdit={{}} />);
    ['Caught', 'Run out'].map(label => {
        const received = screen.getByText(label);
        expect(screen.queryByLabelText('Field position')).not.toBeInTheDocument();
        act(() => fireEvent.click(received));
        expect(screen.queryByLabelText('Field position')).toBeInTheDocument();
        act(() => fireEvent.click(received));
        expect(screen.queryByLabelText('Field position')).not.toBeInTheDocument();
    });
});

it('should show batter list if run out', () => {

    render(<CrupdateEvent eventToEdit={{}} />);
    const received = screen.getByText('Run out');
    expect(screen.queryByLabelText('Batter out')).not.toBeInTheDocument();
    act(() => fireEvent.click(received));
    expect(screen.queryByLabelText('Batter out')).toBeInTheDocument();
    act(() => fireEvent.click(received));
    expect(screen.queryByLabelText('Batter out')).not.toBeInTheDocument();
});

it('should reset all selecteds when reset is selected', () => {

    render(<CrupdateEvent eventToEdit={{}} />);
    const buttons = ['Dot ball', 'Wide', 'Run out'].map(label =>
        screen.getByText(label));
        buttons.map(button => {
            act(() => fireEvent.click(button));
    });
    act(() => fireEvent.click(screen.getByText('Reset')));
    buttons.map(button => expect(button).not.toHaveClass('selected'));

});

it('should disable and clear runs when certain wicket types are selected', () => {

    render(<CrupdateEvent eventToEdit={{}} />);
    ['Bowled', 'Caught', 'LBW'].map(label => {
        const received = screen.getByText(label);
        runsScoredData.map(runsLabel => 
            expect(screen.getByText(runsLabel.label)).not.toHaveAttribute('disabled'));
        act(() => fireEvent.click(received));
        runsScoredData.map(runsLabel => 
            expect(screen.getByText(runsLabel.label)).toHaveAttribute('disabled'));
        act(() => fireEvent.click(received));
        runsScoredData.map(runsLabel => 
            expect(screen.getByText(runsLabel.label)).not.toHaveAttribute('disabled'));
    });
});

it('should render the event being edited', () => {

    const event = {
        runs: 2,
        extra: 'hit no-ball',
        wicket: 'run out',
        fieldPositionId: 6,
        notes: 'test notes for edit',
        batterOut: 1,
        getOnStrikeBatterId: 0,
        getOffStrikeBatterId: 1,
        getOnBowlBowlerId: 0,
        extraBall: true
    }
    render(<CrupdateEvent eventToEdit={event} />);
    runsScoredData.map(runs => {
        const element = screen.getByText(runs.label);
        ((runs.runs === event.runs) && 
            ((runs.boundary ?? false) === (event.boundary ?? false))) ?
            expect(element).toHaveClass('selected') : expect(element).not.toHaveClass('selected');
    });
    extrasScoredData.map(extra => {
        const element = screen.getByText(extra.label);
        (extra.extra === event.extra) ?
            expect(element).toHaveClass('selected') : expect(element).not.toHaveClass('selected');
    });
    wicketScoredData.map(wicket => {
        const element = screen.getByText(wicket.label);
        (wicket.type === event.wicket) ?
            expect(element).toHaveClass('selected') : expect(element).not.toHaveClass('selected');
    });
    expect(screen.getByLabelText('Field position'))
        .toHaveValue('' + event.fieldPositionId);
    // no players in context, need to fix
    // expect(screen.getByLabelText('Batter out')).toHaveValue('' + event.batterOut);
    expect(screen.getByLabelText('notes'))
        .toHaveValue(event.notes);
    expect(screen.getByText('Extra ball')).toHaveClass('selected');
})

});