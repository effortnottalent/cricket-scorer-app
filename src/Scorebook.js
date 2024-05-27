import { useState } from 'react';
import { 
    getOnBowlBowlerId,
    getOnStrikeBatterId
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
                <div class='extras-rows'>
                    <ExtrasSummary events={events} />
                </div>
            </div>
            <div className='ticker'>
                <h2>Ticker</h2>
                <ScoreTicker events={events} />
                <OversTicker events={events} />
            </div>
        </div>
    );
}

function ScoreTicker({ events }) {
    const tickerLength = 420;
    let score = 0;
    return (
        <div class='ticker-section'>
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
    return (
        <>
            <div className='wides'>
                <div className='wides-label'>Wides</div>
                <div className='wides-value'>
                    {events.filter(event => event.extra === 'wide').reduce((acc, event) =>
                        acc += 1 + event.runs, 0)}
                </div>
            </div>
            <div className='byes'>
                <div className='byes-label'>Byes</div>
                <div className='byes-value'>
                    {events.filter(event => event.extra === 'bye').reduce((acc, event) =>
                        acc += event.runs, 0)}
                </div>
            </div>
            <div className='leg-byes'>
                <div className='leg-byes-label'>Leg Byes</div>
                <div className='leg byes-value'>
                    {events.filter(event => event.extra === 'leg bye').reduce((acc, event) =>
                        acc += event.runs, 0)}
                </div>
            </div>
            <div className='no-balls'>
                <div className='no-balls-label'>No-Balls</div>
                <div className='no-balls-value'>
                    {events.filter(event => ['hit no-ball', 'no-ball']
                        .includes(event.extra)).reduce((acc, event) =>
                            acc += (event.extra === 'no-ball' ? 1 + event.runs : 1), 0)}
                </div>
            </div>
        </>
    )
}

function BatterSummary({ events }) {
    return (
        <div className='batter-summary'>
            <div className='batter-wicket'>
                <div className='batter-wicket-label'>How out</div>
                <div className='batter-wicket-value'>
                    {events[events.length - 1]?.wicket?.type ?? 'Not out'}
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
                    {events.filter(event => 
                        !(['wide', 'no-ball', 'hit no-ball'].includes(event.extra))).length}
                </div>
            </div>
            <div className='batter-runs'>
                <div className='batter-runs-label'>Runs</div>
                <div className='batter-runs-value'>
                    {events.filter(event => 
                        !(['wide', 'no-ball', 'bye', 'leg-bye'].includes(event.extra)))
                            .reduce((acc, event) => acc += event.runs, 0)}
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

function calculateRunsAgainstBowler(events) {
    return events.reduce((acc, event) => {
        if(!['bye', 'leg bye'].includes(event.extra))
            acc += event.runs ?? 0;
        if(['wide', 'no-ball', 'no-ball hit'].includes(event.extra))
            acc++;
        return acc;
    }, 0);
}

function OversTicker({ events }) {
    
}

function BowlerLog({ events }) {
    const eventsByOver = events.reduce((acc, event) => {
        event.ball === 0 ? acc.push([ event ]) : acc[acc.length - 1].push(event);
        return acc;
    }, []);
    const overSummaries = eventsByOver.map(overEvents => ({
        runs: calculateRunsAgainstBowler(overEvents),
        wickets: overEvents.reduce((acc, event) => acc += event.wicket ? 1 : 0, 0)
    }));
    return (
        <div className='bowler-log'>
            {eventsByOver.map((overEvents, index) => 
                <OverLogEntry
                    overEvents={overEvents}
                    index={index}
                />)}
            {overSummaries.map((_, i) => 
                <OverLogSummary
                    overSummary={
                        overSummaries.slice(0, i+1).reduce((acc, os) => ({
                            runs: acc.runs += os.runs,
                            wickets: acc.wickets += os.wickets 
                        }))
                    }
                />)}
        </div>
    );
}

const OverLogEntry = ({overEvents, index}) => (
    <div key={'over-' + index} className='bowler-over'>
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

const overClass = (overLength) => (overLength > 10 ? ' bowler-twelve-ball-over' : 
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

const WideGlyph = ({runs}) => (
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
                if(event.wicket.type === 'run out') {
                    return 20 + event.runs;
                } else {
                    return 20;
                }
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
            } else if(['bye', 'leg bye'].includes(event.extra)) {
                glyph = <HitRunsSpan 
                    runs={0}
                    bowler={event.onBowlBowlerId}
                />;
            } else {
                return null;
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
