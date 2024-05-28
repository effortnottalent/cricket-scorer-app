import { useState } from 'react';
import { 
    getOnBowlBowlerId,
    getOnStrikeBatterId,
    calculateRunsIncludingExtras,
    calculateWickets,
    calculatePartnershipAtWicket,
    calculateExtrasBreakdown,
    calculateRunsNotIncludingExtras,
    calculateBallsFaced,
    calculateRunsAgainstBowler
} from './scoreCalculations.js';
import { enrichEvents } from './scoreCalculations.js';

const bowlerColours = [
    '#22228a',
    '#215854',
    '#5b661f',
    '#581d12',
    '#44606b',
    '#3a3a3b'
];

export default function Scorebook({ players, onChangePlayer, events }) {
    const enrichedEvents = enrichEvents(events);
    return (
        <div className='scorebook'>
            <h1>Scorebook</h1>
            <div className='batters'>
                <h2>Batters</h2>
                <div class='batter-rows'>
                    {players.filter(player => player.type === 'batter').map(player => 
                        <div className='batter-row'>
                            <PlayerNameEntry
                                player={player}
                                type='batter'
                                index={player.id}
                                onChange={onChangePlayer}
                                isOnStrike={player.id === getOnStrikeBatterId()}
                            />
                            <BatterLog 
                                events={enrichedEvents.filter(event => 
                                    event.onStrikeBatterId === player.id)} 
                            />
                            <BatterSummary
                                events={enrichedEvents.filter(event => 
                                    event.onStrikeBatterId === player.id)} 
                            />
                        </div>
                    )}
                </div>
            </div>
            <div className='bowlers'>
                <h2>Bowlers</h2>
                <div class='bowler-rows'>
                    {players.filter(player => player.type === 'bowler').map(player => 
                        <div className='bowler-row'>
                            <PlayerNameEntry
                                player={player}
                                type='bowler'
                                index={player.id}
                                onChange={onChangePlayer}
                                isOnStrike={player.id === getOnBowlBowlerId()}
                            />
                            <BowlerLog 
                                events={enrichedEvents.filter(event => 
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
                <ExtrasSummary events={events} />
            </div>
            <div className='score-ticker'>
                <h2>Score Ticker</h2>
                <ScoreTicker events={enrichedEvents} />
            </div>
            <div className='overs-summary'>
                <h2>Over-by-over Summary</h2>
                <OverByOverSummary events={enrichedEvents} />
            </div>
            <div className='wickets-summary'>
                <h2>Wicket-by-wicket Summary</h2>
                <WicketByWicketSummary events={enrichedEvents} />
            </div>
        </div>
    );
}

const groupEventsByOver = (events) => events.reduce((acc, event) => {
    event.ball === 0 ? acc.push([ event ]) : acc[acc.length - 1].push(event);
    return acc;
}, []);

function OverByOverSummary({ events }) {
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
                    <div className='overs-summary-entry'>
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

function WicketByWicketSummary({ events }) {
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
                    <div className='wickets-summary-entry'>
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

function ScoreTicker({ events }) {
    const tickerLength = 420;
    let score = 0;
    return (
        <div class='ticker-score-section'>
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
                    return (<div className={divClassName}>{i + oldScore + 1}</div>)
                })
            })}
            {[...Array(tickerLength - score).keys()].map(i =>
                <div>{i + score + 1}</div>
             )}
        </div>
    )
}

function ExtrasSummary({ events }) {
    const extrasBreakdown = calculateExtrasBreakdown(events);
    return (
        <div class='extras-rows'>
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

function BatterSummary({ events }) {
    return (
        <div className='batter-summary'>
            <div className='batter-wicket'>
                <div className='batter-wicket-label'>How out</div>
                <div className='batter-wicket-value'>
                    {events[events.length - 1]?.wicket?.type ?? ''}
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
                class={type + '-name-edit'}
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
                class={type + '-name-label'}
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
            {events.map(event => 
                <BallLogEntry
                    event={event}
                    isBatter={true}
                />)}
        </div>
    );
}

function BowlerLog({ events }) {
    const eventsByOver = groupEventsByOver(events);
    const overSummaries = eventsByOver.map(overEvents => ({
        runs: calculateRunsAgainstBowler(overEvents),
        wickets: overEvents.reduce((acc, event) => acc += event.wicket ? 1 : 0, 0)
    }));
    const cumulativeOverSummaries = overSummaries.map((_, index) => {
        overSummaries.slice(0, index + 1).reduce((acc, os) => ({
            runs: acc.runs += os.runs,
            wickets: acc.wickets += os.wickets 
        }), [])
    });
    return (
        <div className='bowler-log'>
            {eventsByOver.map((overEvents, index) => 
                <div className='bowler-over'>
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
        {overEvents.map((ballEvents) => 
            <BallLogEntry
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

const BallContainer = ({overLength, isBatter, children}) => (
    <div className={(isBatter ? 'batter' : 'bowler') + '-ball' + overClass(overLength)}>
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
            <path d="M12,12L48,48L12,84" fill="none" stroke="#000" stroke-width="6"/>
            <path d="M48,12L84,48L48,84" fill="none" stroke="#000" stroke-width="6"/>
        </svg>
    </GlyphContainer>
);

const RunDotGlyph = ({radius, point}) => (
    <ellipse rx={radius} ry={radius}
        transform={'translate(' + point.x + ' ' + point.y + ')'} stroke-width="0"
    />
);

const runDotWidePoints = [
    { x: 20, y: 20 },
    { x: 76, y: 20 },
    { x: 20, y: 76 },
    { x: 76, y: 76 },
];

const WideGlyph = ({runs, wicketType}) => (
    <GlyphContainer>
        <svg className={'wide-' + runs} viewBox="0 0 96 96">
            <path d="M10,48h80" transform="translate(-2 0)" fill="none" stroke="#000" strokeWidth="6"/>
            <path d="M48,9v80" transform="translate(0-1)" fill="none" stroke="#000" strokeWidth="6"/>
            {[...Array(runs)].map((_, i) => 
                <RunDotGlyph
                    radius={8}
                    point={runDotWidePoints[i]}
                />
            )}
        </svg>
        {wicketType === 'run out' &&
            <span className={'run bowler-wide-runout-' + runs ?? 0}>
                R
            </span>
        }
        {wicketType === 'stumped' &&
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

const ByeGlyph = ({runs, isLeg}) => (
    <GlyphContainer>
        <svg className={(isLeg ? 'leg-' : '') + 'bye-' + runs} viewBox="0 0 96 96">
            <g {...(isLeg ? {transform: 'rotate(180 48 48)'} : {})}>
                <path d="M8,88l40-80l40,80h-80Z" fill="none" stroke="#000" strokeWidth="6"/>
                {[...Array(runs)].map((_, i) => 
                    <RunDotGlyph
                        radius={6}
                        point={runDotByePoints[runDotByeSetPoints[runs - 1][i]]}
                    />
                )}
            </g>
        </svg>
    </GlyphContainer>
);

const NoBallGlyph = ({runs, isHit}) => (
    <GlyphContainer>
        <svg className={(isHit ? 'hit-' : '') + 'no-ball-' + runs} viewBox="0 0 96 96">
            <ellipse rx="40" ry="40" transform="translate(48 48)" fill="none" stroke="#000" strokeWidth="6"/>
            {!isHit && [...Array(runs)].map((_, i) => 
                    <RunDotGlyph
                        radius={6}
                        point={runDotNoBallPoints[runDotByeSetPoints[runs - 1][i]]}
                    />
                )}
        </svg>
        {isHit &&
        <span className='run hit-no-ball'>
            {runs}
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
                    wicketType={event.wicket.type}
                />
            } else if(event.extra === 'no-ball' && 
                    event.wicket.type === 'run out') {
                return 36 + event.runs;
            } else if(event.extra === 'bye' && 
                    event.wicket.type === 'run out') {
                return 45 + event.runs;
            } else if(event.extra === 'leg bye' && 
                    event.wicket.type === 'run out') {
                return 48 + event.runs;
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
        overLength={overLength}
        isBatter={isBatter}>
            {glyph}
        </BallContainer>;
}
