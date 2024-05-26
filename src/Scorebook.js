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
        <div className='lineup'>
            <h1>Scorebook</h1>
            <div className='batters'>
                <h2>Batters</h2>
                {players.filter(player => player.type === 'batter').map(player => 
                    <div className='batter-entry'>
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
                    </div>
                )}
            </div>
            <div className='bowlers'>
                <h2>Bowlers</h2>
                {players.filter(player => player.type === 'bowler').map(player => 
                    <div className='bowler-entry'>
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
                <button onClick={() => onChangePlayer({
                        type: 'bowler',
                        id: players.filter(player => player.type === 'bowler').length
                    })}
                >Add bowler</button>
            </div>
        </div>
    );
}

function PlayerNameEntry({ player, type, index, onChange, isOnStrike }) {
    const [isEditing, setIsEditing] = useState(false);
    let playerContent;
    if(isEditing) {
        playerContent = (
            <>
                <input
                    value={player?.name}
                    onChange={(e) => {
                        onChange({
                            ...player,
                            name: e.target.value,
                            type: type,
                            id: index
                        });
                    }}
                />
                &nbsp;
                <button onClick={() => setIsEditing(false)}>Save</button>
            </>
        );
    } else {
        playerContent = (
            <>
                {type === 'bowler' ? '█ ' : ''}{player?.name ?? 'Player ' + (index + 1)}
                &nbsp;
                {isOnStrike && ' *'}
                &nbsp;
                <button onClick={() => setIsEditing(true)}>Edit</button>
            </>
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
        <div className='batter-row'>
            {events.map(event => 
                <BallLogEntry
                    event={event}
                    isBatter={true}
                />)}
        </div>
    );
}

function BowlerLog({ events }) {
    const eventsByOver = events.reduce((acc, event) => {
        event.ball === 0 ? acc.push([ event ]) : acc[acc.length - 1].push(event);
        return acc;
    }, []);
    return (
        <div className='bowler-row'>
            {eventsByOver.map((overEvents, index) => 
                <OverLogEntry
                    overEvents={overEvents}
                    index={index}
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
