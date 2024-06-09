import { 
    useEffect,
    useState,
    useRef 
} from "react";

const batterPoint = { x: 48, y: 44 };

export default function FieldPositionPicker({event, setEvent}) {
    const [ editing, isEditing ] = useState(false);
    const handleClick = (point) => {
        if(editing) {
            setEvent({
                ...event,
                fieldPositionId: getClosestFieldPositionToPoint(point)?.id ?? undefined,
                hitToPoint: point
            });
            isEditing(false);
        } else {
            isEditing(true);
        }
    };
    return (
        <FieldPositionGlyph 
            initialPoint={event.hitToPoint ?? fieldPositionsList[event.fieldPositionId]}
            editing={editing}
            handleClick={handleClick}
            />
    );
}

export const FieldPositionGlyph = ({ initialPoint, handleClick, editing }) => {
    const [ hitBallToPoint, setHitBallToPoint ] = useState(initialPoint);
    const fieldPositionGlyph = useRef(null);

    useEffect(() => {
        const getPickCoords = (e) => {
            const rect = e.target.getBoundingClientRect();
            return {
                x: (e.clientX - rect.left) / rect.width * 96,
                y: (e.clientY - rect.top) / rect.height * 96
            };
        }
        const currentRef = fieldPositionGlyph.current;
        const handleClickInternal = (e) => handleClick(getPickCoords(e));
        currentRef.addEventListener('click', handleClickInternal);
        const handleMouseMoveInternal = (e) => {
            if(editing) {
                const newPoint = getPickCoords(e);
                setHitBallToPoint(newPoint);
            }
        };
        currentRef.addEventListener('mousemove', handleMouseMoveInternal);
        return () => {
            currentRef.removeEventListener('click', handleClickInternal);
            currentRef.removeEventListener('mousemove', handleMouseMoveInternal);
        };
    });

    return (<div 
        ref={fieldPositionGlyph}
        data-testid='field-position-container'
        className='field-position-container'>
        <svg 
            data-testid='field-position-glyph' 
            className='field-position-glyph'
            viewBox="0 0 96 96">
            <ellipse 
                rx="35" ry="40" 
                transform="translate(48 48)" 
                fill="lightgreen" />
            <ellipse 
                rx="17" ry="22" 
                transform="translate(48 48)" 
                fill="lightgreen" 
                stroke="white" 
                strokeWidth="1"/>
            {fieldPositionsList.map((fp, index) => 
                <ellipse 
                    index={index}
                    rx="1" ry="1" 
                    transform={`translate(${fp.x} ${fp.y})`} 
                    fill="grey" />
            )}
            <rect 
                height="12"
                width="4"
                x="46"
                y="42"
                fill="yellow" />
            {hitBallToPoint &&
                <line
                    x1={batterPoint.x} 
                    y1={batterPoint.y}
                    x2={hitBallToPoint.x} 
                    y2={hitBallToPoint.y}
                    stroke="red"
                    strokeWidth="2"/>
            }
            <ellipse 
                rx="1" ry="1" 
                transform="translate(50 56)" 
                fill="black" />
            <ellipse 
                rx="1" ry="1" 
                transform={`translate(${batterPoint.x} ${batterPoint.y})`} 
                fill="black" />
            <text 
                x="48"
                y="42"
                fill="black"
                fontSize="4">Batter</text>
            <text 
                x="50" 
                y="61" 
                fill="black"
                fontSize="4">Bowler</text>
        </svg>
        <div className="currentFieldPosition" data-testid='field-position-label'>
            {getClosestFieldPositionToPoint(hitBallToPoint)?.label ?? 'click on map'}
        </div>
    </div>);
}

export function getClosestFieldPositionToPoint(point) {
    return point ? fieldPositionsList
        .map(fp => ({
            ...fp,
            distance: Math.pow((fp.x ?? Number.MAX_SAFE_INTEGER) - point.x, 2) + 
                Math.pow((fp.y ?? Number.MAX_SAFE_INTEGER) - point.y, 2)
        }))
        .sort((a,b) => a.distance - b.distance)
        [0] : undefined;
}

export const fieldPositionsList = [
    // based on a 96 by 96 glyph, bowler at top, batter at bottom
    { id: 0, label: '<field position not recorded>' },
    { id: 1, label: 'bowler', x: 50, y: 56 }, 
    { id: 2, label: 'wicket keeper', x: 48, y: 40 }, 
    { id: 3, label: 'first slip', x: 44, y: 39 }, 
    { id: 4, label: 'second slip', x: 43, y: 40 }, 
    { id: 5, label: 'third slip', x: 42, y: 41 }, 
    { id: 6, label: 'fly slip', x: 43, y: 37 }, 
    { id: 7, label: 'long stop', x: 48, y: 11 }, 
    { id: 8, label: 'third man', x: 36, y: 20 }, 
    { id: 9, label: 'gully', x: 38, y: 40 }, 
    { id: 10, label: 'deep gully', x: 25, y: 38 }, 
    { id: 11, label: 'silly point', x: 42, y: 44 }, 
    { id: 12, label: 'point', x: 32, y: 44 }, 
    { id: 13, label: 'deep point', x: 16, y: 44 }, 
    { id: 14, label: 'cover point', x: 32, y: 50 }, 
    { id: 15, label: 'cover', x: 32.5, y: 54 }, 
    { id: 16, label: 'extra cover', x: 34, y: 58 }, 
    { id: 17, label: 'deep extra cover', x: 19, y: 63 }, 
    { id: 18, label: 'silly mid off', x: 44, y: 48 }, 
    { id: 19, label: 'mid off', x: 42, y: 62 }, 
    { id: 20, label: 'long off', x: 33, y: 80 }, 
    { id: 21, label: 'straight hit', x: 48, y: 84 }, 
    { id: 22, label: 'silly mid on', x: 52, y: 48 }, 
    { id: 23, label: 'mid on', x: 54, y: 62 }, 
    { id: 24, label: 'long on', x: 63, y: 80 }, 
    { id: 25, label: 'fine leg', x: 64, y: 24 }, 
    { id: 26, label: 'short mid wicket', x: 56, y: 50 }, 
    { id: 27, label: 'mid wicket', x: 63, y: 55 }, 
    { id: 28, label: 'deep mid wicket', x: 77, y: 63 }, 
    { id: 29, label: 'short square leg', x: 54, y: 44 }, 
    { id: 30, label: 'square leg', x: 64, y: 44 }, 
    { id: 31, label: 'deep square leg', x: 80, y: 44 }, 
    { id: 32, label: 'leg gully', x: 56, y: 40 }, 
    { id: 33, label: 'long leg', x: 61, y: 15 }, 
    { id: 34, label: 'leg slip', x: 53, y: 40 }, 
    { id: 35, label: 'short fine leg', x: 60, y: 29 }, 
    { id: 36, label: 'deep fine leg', x: 0, y: 0 }, 
];