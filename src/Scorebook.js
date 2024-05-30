import { 
    useState,
    useContext
} from 'react';
import { 
    getOnBowlBowlerId,
    getOnStrikeBatterId,
    calculateRunsIncludingExtras,
    calculateWickets,
    calculatePartnershipAtWicket,
    calculateExtrasBreakdown,
    calculateRunsNotIncludingExtras,
    calculateBallsFaced,
    groupEventsByOver,
    calculateCumulativeOverSummaries,
    formatLongSummary
} from './calculations.js';
import { enrichEvents } from './calculations.js';
import { 
    EventsContext, 
    PlayersContext 
} from './App.js';

const bowlerColours = [
    'darkblue',
    'darkgreen',
    'darkred',
    'darkpurple',
    'darkbrown',
    'green'
];

export default function Scorebook({ onChangePlayer }) {
    const events = enrichEvents(useContext(EventsContext));
    const players = useContext(PlayersContext);
    return (
        <div className='scorebook'>
            <h1>Scorebook</h1>
            <div className='batters'>
                <h2>Batters</h2>
                <div className='batter-rows'>
                    {players.filter(player => player.type === 'batter').map(player => 
                        <div 
                            key={'batter' + player.id} 
                            className='batter-row'
                        >
                            <PlayerNameEntry
                                player={player}
                                type='batter'
                                index={player.id}
                                onChange={onChangePlayer}
                                isOnStrike={player.id === getOnStrikeBatterId()}
                            />
                            <BatterLog 
                                events={events.filter(event => 
                                    event.onStrikeBatterId === player.id)} 
                            />
                            <BatterSummary
                                events={events.filter(event => 
                                    event.onStrikeBatterId === player.id)} 
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
                            key={'bowler' + player.id} 
                            className='bowler-row'
                        >
                            <PlayerNameEntry
                                player={player}
                                type='bowler'
                                index={player.id}
                                onChange={onChangePlayer}
                                isOnStrike={player.id === getOnBowlBowlerId()}
                            />
                            <BowlerLog 
                                events={events.filter(event => 
                                    event.onBowlBowlerId === player.id)} 
                            />
                        </div>
                    )}
                </div>
                <button onClick={() => onChangePlayer({
                        type: 'bowler',
                        id: players.filter(player => player.type === 'bowler').length
                    })}
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
            {eventsByOver.map((over, i) => {
                const ballsUpToOver = eventsByOver.slice(0, i + 1).flat();
                return (
                    <div 
                        key={'overs-summary-' + i}
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
            {[...Array(calculateWickets(events))].map((_, i) => {
                return (
                    <div 
                        key={'overs-summary-' + i}
                        className='wickets-summary-entry'
                    >
                        <div className='wicket-summary-wicket-value'>
                            {i + 1}
                        </div>
                        <div className='wickets-summary-batterout-value'>
                            {(wicketEvents[i].batterOut ?? 
                                wicketEvents[i].onStrikeBatterId) + 1}
                        </div>
                        <div className='wicket-summary-runs-value'>
                            {calculateRunsIncludingExtras(events
                                .filter(event => event.id <= wicketEvents[i]?.id ?? 
                                    Number.MAX_SAFE_INTEGER))}
                        </div>
                        <div className='wicket-summary-partnership-value'>
                            {calculatePartnershipAtWicket(events, i)}
                        </div>
                        <div className='wicket-summary-bowler-value'>
                            {wicketEvents[i].onBowlBowlerId + 1}
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
                return [...Array(score - oldScore).keys()].map(i => {
                    const cumulScore = score - oldScore;
                    let divClassName;
                    if(cumulScore === 1) divClassName = 'diag';
                    else if(i === 0) divClassName = 'strike-start';
                    else if(i === cumulScore - 1) divClassName = 'strike-end';
                    else divClassName = 'strike';
                    return (<div 
                        key={'ticker-' + i}
                        className={divClassName}
                        style={{color: bowlerColours[event.onBowlBowlerId]}}
                        title={formatLongSummary(event, players)}
                    >
                        {i + oldScore + 1}
                    </div>)
                })
            })}
            {[...Array(tickerLength - score).keys()].map(i =>
                <div key={'ticker-' + i}>{i + score + 1}</div>
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

function BatterSummary() {
    const events = enrichEvents(useContext(EventsContext));
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
                    {calculateBallsFaced(events)}
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

function PlayerNameEntry({ player, type, index, onChange, isOnStrike }) {
    const [isEditing, setIsEditing] = useState(false);
    let playerContent;
    if(isEditing) {
        playerContent = (
            <input
                className={type + '-name-edit'}
                value={player?.name}
                onChange={(e) => {
                    onChange({
                        ...player,
                        name: e.target.value,
                        type: type,
                        id: index
                    });
                }}
                onBlur={() => setIsEditing(false)}
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

function BatterLog({ events }) {
    return (
        <div className='batter-log'>
            {events.map((event, index) => 
                <BallLogEntry
                    key={'ball-log-' + index}
                    event={event}
                    isBatter={true}
                />)}
        </div>
    );
}

function BowlerLog({ events }) {
    const eventsByOver = groupEventsByOver(events);
    const cumulativeOverSummaries = calculateCumulativeOverSummaries(events);
    return (
        <div className='bowler-log'>
            {eventsByOver.map((overEvents, index) => 
                <div
                    key={'bowler-' + index} 
                    className='bowler-over'
                >
                    <OverLogEntry
                        overEvents={overEvents}
                        index={index}
                    />
                    <OverLogSummary
                        overSummary={cumulativeOverSummaries[index]}
                        index={index}
                    />
                </div>
            )}
        </div>
    );
}

const OverLogEntry = ({overEvents, index}) => (
    <div key={'over-' + index} className='bowler-over-detail'>
        {overEvents.map((ballEvents, ballIndex) => 
            <BallLogEntry
                key={'ball-log-' + index + '-' + ballIndex}
                event={ballEvents}
                overLength={overEvents.length}
                isBatter={false}
            />
        )}
    </div>);

const OverLogSummary = ({overSummary, index}) => (
    <div key={`over-summary-` + index} className='bowler-over-summary'>
        {overSummary.runs} - {overSummary.wickets}
    </div>);

const overClass = (overLength) => (overLength > 9 ? ' bowler-twelve-ball-over' : 
    (overLength > 6 ? ' bowler-nine-ball-over' : ''));

const GlyphContainer = ({children}) => (<span className='bowler-glyph'>{children}</span>);

const BallContainer = ({overLength, isBatter, children, event}) => (
    <div 
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

const WicketSpan = ({runs, bowler}) => (
    <span 
        className='run'
        {...(bowler !== undefined ? {style: {color: bowlerColours[bowler]}} : '')}
    >
        W
    </span>
);
    
const BatterOutGlyph = () => (
    <GlyphContainer>
        <svg viewBox="0 0 96 96">
            <path d="M12,12L48,48L12,84" fill="none" stroke="#000" strokeWidth="6"/>
            <path d="M48,12L84,48L48,84" fill="none" stroke="#000" strokeWidth="6"/>
        </svg>
    </GlyphContainer>
);

const RunDotGlyph = ({radius, point}) => (
    <ellipse rx={radius} ry={radius}
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
        <svg className={'wide-' + runs} viewBox="0 0 96 96">
            <path d="M10,48h80" transform="translate(-2 0)" fill="none" stroke="#000" strokeWidth="6"/>
            <path d="M48,9v80" transform="translate(0-1)" fill="none" stroke="#000" strokeWidth="6"/>
            {[...Array(runs)].map((_, i) => 
                <RunDotGlyph
                    key={'run-dot-' + i}
                    radius={8}
                    point={runDotWidePoints[i]}
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
        <svg className={(isLeg ? 'leg-' : '') + 'bye-' + runs} viewBox="0 0 96 96">
            <g {...(isLeg ? {transform: 'rotate(180 48 48)'} : {})}>
                <path d="M8,88l40-80l40,80h-80Z" fill="none" stroke="#000" strokeWidth="6"/>
                {!isRunOut && [...Array(runs)].map((_, i) => 
                    <RunDotGlyph
                        key={'run-dot-' + i}
                        radius={6}
                        point={runDotByePoints[runDotByeSetPoints[runs - 1][i]]}
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
        <svg className={(isHit ? 'hit-' : '') + 'no-ball-' + runs} viewBox="0 0 96 96">
            <ellipse rx="40" ry="40" transform="translate(48 48)" fill="none" stroke="#000" strokeWidth="6"/>
            {!isHit && !isRunOut && [...Array(runs)].map((_, i) => 
                    <RunDotGlyph
                        key={'run-dot-' + i}
                        radius={6}
                        point={runDotNoBallPoints[runDotByeSetPoints[runs - 1][i]]}
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

export function BallLogEntry({event, overLength, isBatter}) {
    let glyph = null;
    if(event.wicket) {
        if(isBatter) {
            glyph = <BatterOutGlyph />;
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
