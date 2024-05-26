import { renderEvent } from "./eventToSymbolCalculations";

export default function BowlerLog({ events }) {
    const eventsByOver = events.reduce((acc, event) => {
        event.ball === 0 ? acc.push([ event ]) : acc[acc.length - 1].push(event);
        return acc;
    }, []);
    return (
        <div className='bowler-row'>
            {eventsByOver.map((over, index) => {
                const overClass = (over.length > 10 ? 'bowler-twelve-ball-over' : 
                    (over.length > 6 ? 'bowler-nine-ball-over' : ''));
                return (<div key={'over-' + index} className='bowler-over'>
                    {over.map((ball) => renderEvent(ball, overClass, false))}
                </div>)})
            })
        </div>
    );
}
