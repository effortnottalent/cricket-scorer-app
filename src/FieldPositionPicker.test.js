import FieldPositionPicker, { getClosestFieldPositionToPoint } from "./FieldPositionPicker";
import { fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';

describe('field position calculations', () => {

it('should send back undefined when sent undefined', () => {
    expect(getClosestFieldPositionToPoint(undefined)).toEqual(undefined);
});

it('should find the right fielder when points are the same', () => {
    expect(getClosestFieldPositionToPoint({ x: 50, y: 56 }).label).toEqual('bowler');
});

it('should find the right fielder when near but not the same', () => {
    expect(getClosestFieldPositionToPoint({ x: 51, y: 57 }).label).toEqual('bowler');
});

it('should display no line by default', () => {
    render(<FieldPositionPicker />);
    expect(screen.queryByTestId('ball-hit-line')).not.toBeInTheDocument();
});

it('should display no line by default, and tell user to click', () => {
    render(<FieldPositionPicker />);
    expect(screen.queryByTestId('ball-hit-line')).not.toBeInTheDocument();
    expect(screen.getByText('click on map')).toBeInTheDocument();
});

it('should display line once clicked, and not tell user to click', () => {
    render(<FieldPositionPicker />);
    const container = screen.getByTestId('field-position-container');
    act(() => fireEvent.click(container));
    act(() => fireEvent.mouseMove(container, {clientX: 500, clientY: 500}));
    expect(screen.queryByTestId('ball-hit-line')).toBeInTheDocument();
    expect(screen.queryByText('click on map')).not.toBeInTheDocument();
});

});