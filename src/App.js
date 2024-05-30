import { 
  useReducer,
  createContext
} from 'react';
import eventsReducer from './eventsReducer.js';
import playersReducer from './playersReducer.js';

import './App.css';

import Scoreboard from './Scoreboard';
import BallByBall from './BallByBall.js';
import AddEvent from './AddEvent.js';
import Scorebook from './Scorebook.js';

const initialEvents = [{
  runs: 0,
}, {
  runs: 2,
  fieldPositionId: 19,
}, {
  runs: 4,
  fieldPositionId: 26,
  boundary: true,
  notes: 'outrageous shot'
}, {
  runs: 0,
  extra: 'wide',
  notes: 'sunday rules umpire?'
}, {
  runs: 1,
  fieldPositionId: 3,
  extra: 'bye'
}, {
  wicket: 'caught',
  fieldPositionId: 1,
}, {
  runs: 2,
  extra: 'leg bye',
  fieldPositionId: 11,
}, {
  overCalled: true
}, {
  runs: 1,
  fieldPositionId: 21
}, {
  runs: 4,
  fieldPositionId: 14,
  extra: 'no-ball'
}, {
  runs: 3,
  fieldPositionId: 11,
  extra: 'hit no-ball'
}, {
  extra: 'wide',
  runs: 3,
  wicket: 'run out',
  fieldPositionId: 3
}, {
  extra: 'wide',
  wicket: 'stumped'
}, {
  runs: 0
}, {
  runs: 0
}, {
  runs: 1,
  fieldPositionId: 11,
}, {
  runs: 0
}, {
  runs: 0
}, {
  overCalled: true
}, {
  runs: 0
}, {
  runs: 0
}, {
  runs: 0
}, {
  runs: 2,
  fieldPositionId: 10,
}, {
  runs: 0
}, {
  runs: 0
}, {
  overCalled: true,
  newBowlerId: 2
}, {
  runs: 0
}, {
  runs: 1
}, {
  runs: 0
}, {
  runs: 3
}, {
  runs: 0
}, {
  runs: 0
}, {
  overCalled: true
}, {
  runs: 0
}, {
  runs: 2
}, {
  runs: 0
}, {
  runs: 0
}, {
  extra: 'no-ball',
  runs: 3,
  wicket: 'run out',
  fieldPositionId: 3,
}, {
  extra: 'bye',
  runs: 2,
  wicket: 'run out',
  fieldPositionId: 4,
},  {
  extra: 'leg bye',
  runs: 1,
  wicket: 'run out',
  fieldPositionId: 8,
}, {
  overCalled: true
}];

const initialPlayers = [
  ...[...Array(11)].map((_, i) => ({ id: i, type: 'batter'})),
  ...[...Array(3)].map((_, i) => ({ id: i, type: 'bowler'}))
];

export const EventsContext = createContext(initialEvents);
export const PlayersContext = createContext(initialPlayers);

function App() {
  const [ events, eventDispatch ] = useReducer(eventsReducer, initialEvents);
  const [ players, playerDispatch ] = useReducer(playersReducer, initialPlayers);

  function handleAddEvent(event) {
    eventDispatch({
      type: 'addevent',
      event: event
    })
  }

  function handleChangePlayer(player) {
    playerDispatch({
      type: 'editplayer',
      player: player
    })
  }

  return (
    <div className="App">
      <header className="App-header">
        Cricket App
      </header>
      <EventsContext.Provider value={events}>
        <PlayersContext.Provider value={players}>
          <AddEvent 
            onAddEvent={handleAddEvent}
            players={players}
          />
          <Scorebook 
            players={players} 
            onChangePlayer={handleChangePlayer} 
          />
          <Scoreboard 
            events={events}
            players={players} 
          />
          <BallByBall 
            events={events}
            players={players} 
          />
        </PlayersContext.Provider>
      </EventsContext.Provider>
    </div>
  );

}

export default App;
