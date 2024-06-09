import { getClosestFieldPositionToPoint } from "./FieldPositionPicker";

describe('field position calculations', () => {

it('should send back undefined when sent undefined', () =>
{
    expect(getClosestFieldPositionToPoint(undefined)).toEqual(undefined);
});

it('should find the right fielder when points are the same', () =>
    {
        expect(getClosestFieldPositionToPoint({ x: 50, y: 56 }).label).toEqual('bowler');
    });

it('should find the right fielder when near but not the same', () =>
    {
        expect(getClosestFieldPositionToPoint({ x: 51, y: 57 }).label).toEqual('bowler');
    });
    

})