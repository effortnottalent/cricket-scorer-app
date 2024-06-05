import { 
    useState,
    useContext,
    useRef,
    useEffect
} from 'react';
import { 
    getOnBowlBowlerId,
    getOnStrikeBatterId,
    calculateRunsIncludingExtras,
    calculateWickets,
    calculatePartnershipAtWicket,
    calculateExtrasBreakdown,
    calculateRunsNotIncludingExtras,
    calculateBatterBallsFaced,
    groupEventsByOver,
    calculateCumulativeOverSummaries,
    formatLongSummary,
    getBatterEvents
} from './calculations.js';
import { enrichEvents } from './calculations.js';
import { 
    EventsContext, 
    PlayersContext,
    PlayersDispatchContext
} from './Contexts.js';

export const bowlerColours = [
    'darkblue',
    'green',
    'red',
    'purple',
    'brown',
    'orange'
];

export default function Scorebook({ onSelectEventToEdit }) {

    const events = enrichEvents(useContext(EventsContext));
    const players = useContext(PlayersContext);
    const playersDispatch = useContext(PlayersDispatchContext);

    const handleEditPlayer = (player) => {
        playersDispatch({
            type: 'edit',
            player
        });
    }
    const handleAddPlayer = (player) => {
        playersDispatch({
            type: 'add',
            player
        });
    }

    return (
        <div className='scorebook'>
            <h1>Scorebook</h1>
            <div className='batters'>
                <h2>Batters</h2>
                <div className='batter-rows'>
                    {players.filter(player => player.type === 'batter').map(player => 
                        <div 
                            key={player.id} 
                            className='batter-row'
                        >
                            <PlayerNameEntry
                                player={player}
                                type='batter'
                                index={player.id}
                                onEditPlayer={handleEditPlayer}
                                isOnStrike={player.id === getOnStrikeBatterId()}
                            />
                            <BatterLog 
                                onSelectEventToEdit={onSelectEventToEdit}
                                playerId={player.id}
                                events={getBatterEvents(events, player.id)} 
                            />
                            <BatterSummary
                                events={getBatterEvents(events, player.id)} 
                            />
                        </div>
                    )}
                </div>
            </div>
            <div className='bowlers'>
                <h2>Bowlers</h2>
                <div className='bowler-rows'>
                    {players.filter(player => player.type === 'bowler').map(player => 
                        <div 
                            key={player.id} 
                            className='bowler-row'
                        >
                            <PlayerNameEntry
                                player={player}
                                type='bowler'
                                index={player.id}
                                onEditPlayer={handleEditPlayer}
                                isOnStrike={player.id === getOnBowlBowlerId()}
                            />
                            <BowlerLog 
                                onSelectEventToEdit={onSelectEventToEdit}
                                events={events.filter(event => 
                                    event.onBowlBowlerId === player.id)} 
                            />
                        </div>
                    )}
                </div>
                <button onClick={() => handleAddPlayer({ type: 'bowler' })}
                >Add bowler</button>
            </div>
            <div className='extras'>
                <h2>Extras</h2>
                <ExtrasSummary />
            </div>
            <div className='score-ticker'>
                <h2>Score Ticker</h2>
                <ScoreTicker />
            </div>
            <div className='overs-summary'>
                <h2>Over-by-over Summary</h2>
                <OverByOverSummary />
            </div>
            <div className='wickets-summary'>
                <h2>Wicket-by-wicket Summary</h2>
                <WicketByWicketSummary />
            </div>
        </div>
    );
}

function OverByOverSummary() {
    const events = enrichEvents(useContext(EventsContext));
    const eventsByOver = groupEventsByOver(events);
    return (
        <div className='overs-summary-row'>
            <div className='overs-summary-entry'>
                <div className='over-summary-over-label'>Over</div>
                <div className='over-summary-runs-label'>Runs</div>
                <div className='over-summary-wickets-label'>Wickets</div>
                <div className='over-summary-bowler-label'>Bowler</div>
            </div>
            {eventsByOver.map((over, index) => {
                const ballsUpToOver = eventsByOver.slice(0, index + 1).flat();
                return (
                    <div 
                        key={index}
                        className='overs-summary-entry'
                    >
                        <div className='over-summary-over-value'>
                            {over[0].over + 1}
                        </div>
                        <div className='over-summary-runs-value'>
                            {calculateRunsIncludingExtras(ballsUpToOver)}
                        </div>
                        <div className='over-summary-wickets-value'>
                            {calculateWickets(ballsUpToOver)}
                        </div>
                        <div className='over-summary-bowler-value'>
                            {over[0].onBowlBowlerId}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function WicketByWicketSummary() {
    const events = enrichEvents(useContext(EventsContext));
    const wicketEvents = events.filter(event => event.wicket);
    return (
        <div className='wickets-summary-row'>
            <div className='wickets-summary-entry'>
                <div className='wickets-summary-wicket-label'>Wicket</div>
                <div className='wickets-summary-batterout-label'>Batter out</div>
                <div className='wickets-summary-runs-label'>Runs</div>
                <div className='wickets-summary-partnership-label'>Partnership</div>
                <div className='wickets-summary-bowler-label'>Bowler</div>
            </div>
            {[...Array(calculateWickets(events))].map((_, index) => {
                return (
                    <div 
                        key={index}
                        className='wickets-summary-entry'
                    >
                        <div className='wicket-summary-wicket-value'>
                            {index + 1}
                        </div>
                        <div className='wickets-summary-batterout-value'>
                            {(wicketEvents[index].batterOut ?? 
                                wicketEvents[index].onStrikeBatterId) + 1}
                        </div>
                        <div className='wicket-summary-runs-value'>
                            {calculateRunsIncludingExtras(events
                                .filter(event => event.id <= wicketEvents[index]?.id ?? 
                                    Number.MAX_SAFE_INTEGER))}
                        </div>
                        <div className='wicket-summary-partnership-value'>
                            {calculatePartnershipAtWicket(events, index)}
                        </div>
                        <div className='wicket-summary-bowler-value'>
                            {wicketEvents[index].onBowlBowlerId + 1}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function ScoreTicker() {
    const events = enrichEvents(useContext(EventsContext));
    const players = useContext(PlayersContext);
    const tickerLength = 420;
    let score = 0;
    return (
        <div className='ticker-score-section'>
            {events.map(event => {
                const oldScore = score;
                score += event.runs ?? 0;
                if(event.extra === 'wide' || 
                        event.extra === 'no-ball' || 
                        event.extra === 'hit no-ball')
                    score++;
                return [...Array(score - oldScore).keys()].map(index => {
                    const cumulScore = score - oldScore;
                    let divClassName;
                    if(cumulScore === 1) divClassName = 'diag';
                    else if(index === 0) divClassName = 'strike-start';
                    else if(index === cumulScore - 1) divClassName = 'strike-end';
                    else divClassName = 'strike';
                    return (<div 
                        key={index}
                        className={divClassName}
                        style={{color: bowlerColours[event.onBowlBowlerId]}}
                        title={formatLongSummary(event, players)}
                    >
                        {index + oldScore + 1}
                    </div>)
                })
            })}
            {[...Array(tickerLength - score).keys()].map(index =>
                <div key={index}>{index + score + 1}</div>
             )}
        </div>
    )
}

function ExtrasSummary() {
    const events = enrichEvents(useContext(EventsContext));
    const extrasBreakdown = calculateExtrasBreakdown(events);
    return (
        <div className='extras-rows'>
            <div className='wides'>
                <div className='wides-label'>Wides</div>
                <div className='wides-value'>{extrasBreakdown.wides}</div>
            </div>
            <div className='byes'>
                <div className='byes-label'>Byes</div>
                <div className='byes-value'>{extrasBreakdown.byes}</div>
            </div>
            <div className='leg-byes'>
                <div className='leg-byes-label'>Leg Byes</div>
                <div className='leg byes-value'>{extrasBreakdown.legByes}</div>
            </div>
            <div className='no-balls'>
                <div className='no-balls-label'>No-Balls</div>
                <div className='no-balls-value'>{extrasBreakdown.noBalls}</div>
            </div>
        </div>
    )
}

function BatterSummary({events}) {
    return (
        <div className='batter-summary'>
            <div className='batter-wicket'>
                <div className='batter-wicket-label'>How out</div>
                <div className='batter-wicket-value'>
                    {events[events.length - 1]?.wicket ?? ''}
                </div>
            </div>
            <div className='batter-fielder'>
                <div className='batter-fielder-label'>Fielder</div>
                <div className='batter-fielder-value'>
                    {events[events.length - 1]?.wicket?.playerId ?? ''}
                </div>
            </div>
            <div className='batter-balls'>
                <div className='batter-balls-label'>Balls</div>
                <div className='batter-balls-value'>
                    {calculateBatterBallsFaced(events)}
                </div>
            </div>
            <div className='batter-runs'>
                <div className='batter-runs-label'>Runs</div>
                <div className='batter-runs-value'>
                    {calculateRunsNotIncludingExtras(events)}
                </div>
            </div>
        </div>
    )
}

function PlayerNameEntry({ player, type, index, onEditPlayer, isOnStrike }) {
    const [isEditing, setIsEditing] = useState(false);
    let playerContent;
    if(isEditing) {
        playerContent = (
            <input
                className={type + '-name-edit'}
                value={player?.name ?? ''}
                onChange={(e) => 
                    onEditPlayer({
                        ...player,
                        name: e.target.value,
                        type: type,
                        id: index
                    })
                }
                onBlur={(e) => {
                    setIsEditing(false);
                }}
            />
        );
    } else {
        playerContent = (
            <div 
                className={type + '-name-label'}
                onClick={() => setIsEditing(true)}>
                {type === 'bowler' ? '█ ' : ''}{player?.name ?? 'Player ' + (index + 1)}
                {isOnStrike && ' *'}
            </div>
        );
    }
    return (
        <div 
            className={type + '-name'} 
            {...(type === 'bowler' ? {style: {color: bowlerColours[index]}} : '')}>
            {index + 1} &nbsp;
            {playerContent}
        </div>
    );
}

function BatterLog({ events, onSelectEventToEdit, playerId }) {
    const clickToEditBallRef = useRef(null);

    useEffect(() => {
        const currentRef = clickToEditBallRef.current;
        const handleClick = (event) => {
            let dataElement = event.target;
            while(!dataElement.dataset.eventId) dataElement = dataElement.parentElement;
            onSelectEventToEdit(events.find(e => e.id === Number(dataElement.dataset.eventId)));
        }
        currentRef.addEventListener('click', handleClick);
        return () => {
            currentRef.removeEventListener('click', handleClick);
        };
    }, [onSelectEventToEdit, events]);

    return (
        <div 
            ref={clickToEditBallRef} 
            className='batter-log'
        >
            {events.map((event, index) => 
                <BallLogEntry
                    key={index}
                    event={event}
                    isBatter={true}
                    playerId={playerId}
                />)}
        </div>
    );
}

function BowlerLog({ events, onSelectEventToEdit }) {
    const eventsByOver = groupEventsByOver(events);
    const cumulativeOverSummaries = calculateCumulativeOverSummaries(events);
    const clickToEditBallRef = useRef(null);

    useEffect(() => {
        const currentRef = clickToEditBallRef.current;
        const handleClick = (event) => {
            let dataElement = event.target;
            while(!dataElement.dataset.eventId) dataElement = dataElement.parentElement;
            onSelectEventToEdit(events.find(e => e.id === Number(dataElement.dataset.eventId)));
        }
        currentRef.addEventListener('click', handleClick);
        return () => {
            currentRef.removeEventListener('click', handleClick);
        };
    }, [onSelectEventToEdit, events]);

    return (
        <div
            ref={clickToEditBallRef} 
            className='bowler-log'
        >
            {eventsByOver.map((overEvents, index) => 
                <div
                    key={index} 
                    className='bowler-over'
                >
                    <OverLogEntry
                        events={overEvents}
                        index={index}
                    />
                    <div 
                        data-testid='over-summary' 
                        key={index} 
                        className='bowler-over-summary'
                    >
                        {cumulativeOverSummaries[index].runs} - {cumulativeOverSummaries[index].wickets}
                    </div>
                </div>
            )}
        </div>
    );
}

export const OverLogEntry = ({events, index}) => (
    <div key={index} className='bowler-over-detail'>
        {events.map((ballEvents, ballIndex) => 
            <BallLogEntry
                key={ballIndex}
                event={ballEvents}
                overLength={events.length}
                isBatter={false}
            />
        )}
    </div>);

const overClass = (overLength) => (overLength > 9 ? ' bowler-twelve-ball-over' : 
    (overLength > 6 ? ' bowler-nine-ball-over' : ' bowler-six-ball-over'));

const GlyphContainer = ({children}) => (<span className='glyph-container'>{children}</span>);

const BallContainer = ({overLength, isBatter, children, event}) => (
    <div 
        data-event-id={event.id}
        data-testid='ball-container'
        title={formatLongSummary(event, useContext(PlayersContext))}
        className={(isBatter ? 'batter' : 'bowler') + '-ball' + overClass(overLength)}>
        {children}
    </div>);

const HitRunsSpan = ({runs, bowler}) => (
    <span 
        className={runs === 0 ? 'run run-dot' : 'run'}
        {...(bowler !== undefined ? {style: {color: bowlerColours[bowler]}} : '')}
    >
        {runs === 0 ? '•' : runs}
    </span>);

const WicketSpan = () => (
    <span 
        className='run'
    >
        W
    </span>
);
    
const BatterOutGlyph = () => (
    <GlyphContainer>
        <svg data-testid='batter-out' viewBox="0 0 96 96">
            <path d="M12,12L48,48L12,84" fill="none" stroke="#000" strokeWidth="6"/>
            <path d="M48,12L84,48L48,84" fill="none" stroke="#000" strokeWidth="6"/>
        </svg>
    </GlyphContainer>
);

const RunDotGlyph = ({radius, point}) => (
    <ellipse data-testid='run-dot-glyph' rx={radius} ry={radius}
        transform={'translate(' + point.x + ' ' + point.y + ')'} strokeWidth="0"
    />
);

const runDotWidePoints = [
    { x: 20, y: 20 },
    { x: 76, y: 20 },
    { x: 20, y: 76 },
    { x: 76, y: 76 },
];

const WideGlyph = ({runs, wicket}) => (
    <GlyphContainer>
        <svg data-testid='wide' className={'wide-' + runs} viewBox="0 0 96 96">
            <path d="M10,48h80" transform="translate(-2 0)" fill="none" stroke="#000" strokeWidth="6"/>
            <path d="M48,9v80" transform="translate(0-1)" fill="none" stroke="#000" strokeWidth="6"/>
            {[...Array(runs)].map((_, index) => 
                <RunDotGlyph
                    key={index}
                    radius={8}
                    point={runDotWidePoints[index]}
                />
            )}
        </svg>
        {wicket === 'run out' &&
            <span className={'run bowler-wide-runout-' + runs ?? 0}>
                R
            </span>
        }
        {wicket === 'stumped' &&
            <span className={'run bowler-wide-stumped'}>
                W
            </span>
        }
    </GlyphContainer>
);

const runDotByePoints = [
    { x: 48, y: 36 },
    { x: 30, y: 74 },
    { x: 66, y: 74 },
    { x: 48, y: 58 },
];

const runDotNoBallPoints = [
    { x: 48, y: 24 },
    { x: 28, y: 66 },
    { x: 66, y: 66 },
    { x: 48, y: 48 },
];

const runDotByeSetPoints = [
    [ 0 ],
    [ 0, 3 ],
    [ 0, 1, 2 ],
    [ 0, 1, 2, 3 ]
];

const ByeGlyph = ({runs, isLeg, isRunOut}) => (
    <GlyphContainer>
        <svg
            data-testid={(isLeg ? 'leg-' : '') + 'bye'}   
            className={(isLeg ? 'leg-' : '') + 'bye-' + runs} 
            viewBox="0 0 96 96">
            <g {...(isLeg ? {transform: 'rotate(180 48 48)'} : {})}>
                <path d="M8,88l40-80l40,80h-80Z" fill="none" stroke="#000" strokeWidth="6"/>
                {!isRunOut && [...Array(runs)].map((_, index) => 
                    <RunDotGlyph
                        key={index}
                        radius={6}
                        point={runDotByePoints[runDotByeSetPoints[runs - 1][index]]}
                    />
                )}
            </g>
        </svg>
        {isRunOut &&
        <span className={'run ' + (isLeg ? 'leg-' : '') + 'bye-run-out'}>
            {runs !== 1 ? runs : ''}R
        </span>
        }
    </GlyphContainer>
);

const NoBallGlyph = ({runs, isHit, isRunOut}) => (
    <GlyphContainer>
        <svg 
            data-testid='no-ball' 
            className={(isHit ? 'hit-' : '') + 'no-ball-' + runs} 
            viewBox="0 0 96 96">
            <ellipse rx="40" ry="40" transform="translate(48 48)" fill="none" stroke="#000" strokeWidth="6"/>
            {!isHit && !isRunOut && [...Array(runs)].map((_, index) => 
                    <RunDotGlyph
                        key={index}
                        radius={6}
                        point={runDotNoBallPoints[runDotByeSetPoints[runs - 1][index]]}
                    />
                )}
        </svg>
        {isHit && !isRunOut &&
        <span className='run hit-no-ball'>
            {runs}
        </span>
        }
        {isRunOut &&
        <span className='run no-ball no-ball-run-out'>
            {runs !== 1 ? runs : ''}R
        </span>
        }
    </GlyphContainer>
);

export function BallLogEntry({event, overLength, isBatter, playerId}) {
    let glyph = null;
    if(overLength === undefined) overLength = 6;
    const batterOut = (event.batterOut ?? event.onStrikeBatterId);
    if(event.wicket) {
        if(isBatter) {
            if(batterOut === playerId) {
                if(event.runs !== 0 && batterOut === event.onStrikeBatterId) {
                    glyph = <><HitRunsSpan runs={event.runs} /><BatterOutGlyph /></>;
                } else {
                    glyph = <BatterOutGlyph />;
                }
            }
        } else if(event.extra) {
            if(event.extra === 'wide') {
                glyph = <WideGlyph 
                    runs={event.runs ?? 0} 
                    wicket={event.wicket}
                />
            } else if(event.extra === 'no-ball' && 
                    event.wicket === 'run out') {
                glyph = <NoBallGlyph 
                    runs={event.runs ?? 0} 
                    isRunOut={true} 
                    isHit={false} 
                />;
            } else if(event.extra === 'hit no-ball' && 
                    event.wicket === 'run out') {
                glyph = <NoBallGlyph 
                    runs={event.runs ?? 0} 
                    isRunOut={true} 
                    isHit={true} 
                />;
            } else if(event.extra === 'bye' && 
                    event.wicket === 'run out') {
                glyph = <ByeGlyph 
                    runs={event.runs ?? 0} 
                    isRunOut={true} 
                    isLeg={false} 
                />;
            } else if(event.extra === 'leg bye' && 
                    event.wicket === 'run out') {
                glyph = <ByeGlyph 
                    runs={event.runs ?? 0} 
                    isRunOut={true} 
                    isLeg={true} 
                />;
            }
        } else {
             glyph = <WicketSpan />;
        }
    } else if(event.extra) {
        if(isBatter) {
            if(event.extra === 'hit no-ball') {
                glyph = <HitRunsSpan 
                    runs={event.runs ?? 0}
                    bowler={event.onBowlBowlerId}
                />;
            }
        } else if(event.extra === 'wide') {
            glyph = <WideGlyph runs={event.runs ?? 0} />
        } else if(event.extra === 'no-ball') {
            glyph = <NoBallGlyph runs={event.runs ?? 0} isHit={false} />;
        } else if(event.extra === 'hit no-ball') {
            glyph = <NoBallGlyph runs={event.runs ?? 0} isHit={true} />;
        } else if(event.extra === 'bye') {
            glyph = <ByeGlyph runs={event.runs ?? 0} isLeg={false} />;
        } else if(event.extra === 'leg bye') {
            glyph = <ByeGlyph runs={event.runs ?? 0} isLeg={true} />;
        }
    } else {
        glyph = <HitRunsSpan 
            runs={event.runs ?? 0} 
            {...(isBatter ? {bowler: event.onBowlBowlerId} : '')}
        />;
    }
    return <BallContainer
        event={event}
        overLength={overLength}
        isBatter={isBatter}
        >
            {glyph}
        </BallContainer>;
}
