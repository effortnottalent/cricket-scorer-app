import {
    createContext,
    useReducer
} from 'react';

import { generateInitialEvents } from './stubEventData.js';
const [ initialEvents, initialPlayers ] = generateInitialEvents();

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
                    id: events.reduce((acc, event) => Math.max(event.id, acc), 0) + 1
                }
            ];
        case 'edit':
            return [
                ...events.filter(e => e.id !== action.event.id),
                action.event
            ];
        case 'delete':
            return [
                ...events.filter(e => e.id !== action.event.id)
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
                    id: players.filter(player => 
                        player.type === action.player.type).length
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