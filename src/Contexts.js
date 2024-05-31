import {
    createContext,
    useReducer
} from 'react';

import { initialEvents } from './stubEventData.js';

const initialPlayers = [
...[...Array(11)].map((_, i) => ({ id: i, type: 'batter'})),
...[...Array(3)].map((_, i) => ({ id: i, type: 'bowler'}))
];

export const EventsContext = createContext(initialEvents);
export const EventsDispatchContext = createContext(null);
export const PlayersContext = createContext(initialPlayers);
export const PlayersDispatchContext = createContext(null);

export function Contexts({ children }) {
    
    const [ events, eventsDispatch ] = useReducer(eventsReducer, initialEvents);
    const [ players, playersDispatch ] = useReducer(playersReducer, initialPlayers);

    return (
        <EventsContext.Provider value={events}>
            <EventsDispatchContext.Provider value={eventsDispatch}>
                <PlayersContext.Provider value={players}>
                    <PlayersDispatchContext.Provider value={playersDispatch}>
                        {children}
                    </PlayersDispatchContext.Provider>
                </PlayersContext.Provider>
            </EventsDispatchContext.Provider>
        </EventsContext.Provider>
    )
}

function eventsReducer(events, action) {
    switch (action.type) {
        case 'add':
            return [
                ...events,
                { 
                    ...action.event,
                    id: events.length
                }
            ];
        case 'edit':
            return [
                ...events.filter(e => e.id !== action.event.id),
                action.event
            ];
        default:
          throw Error('Unknown action: ' + action.type);
    }
}

function playersReducer(players, action) {
    switch (action.type) {
        case 'add':
            return [
                ...players,
                {
                    ...action.player,
                    id: players.length
                }
            ];
        case 'edit': 
            return players.map(player => 
                player.id === action.player.id && 
                    player.type === action.player.type ? action.player : player
                );
        default: 
          throw Error('Unknown action: ' + action.type);
    }
}