
export function renderEvent(event, overClass, isBatter) {
    if(event.wicket) {
        if(isBatter) {
            return 9;
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
            if(event.wicket.type === 'run out') {
                return 8;
            } else {
                return 7;
            }
        }
    } else if(event.extra) {
        if(isBatter) {
            if(event.extra === 'no-ball hit') {
                return event.runs - 1;
            } else {
                return null;
            }
        } else if(event.extra === 'wide') {
            return 15 + (event.runs ?? 0);
        } else if(event.extra === 'no-ball') {
            return (event.runs === undefined || event.runs === 0) ? 25 : 31 + event.runs;
        } else if(event.extra === 'no-ball hit') {
            return 25 + event.runs;
        } else if(event.extra === 'bye') {
            return 10 + event.runs;
        } else if(event.extra === 'leg bye') {
            return 40 + event.runs;
        }
    } else {
        return ( 
            <div class={'bowler-ball ' + overClass}>
                <span class='run'>
                    {event.runs}
                </span>
            </div>);
    }
}

// https://jsfiddle.net/82et1gf6/809/ for the html and css