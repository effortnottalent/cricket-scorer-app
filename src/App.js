import { useReducer } from 'react';
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
  extra: 'bye'
}, {
  runs: 0,
  wicket: {
    type: 'caught',
    playerId: 7
  },
  fieldPositionId: 13,
}, {
  runs: 2,
  extra: 'leg bye'
}, {
  overCalled: true
}, {
  runs: 1,
  fieldPositionId: 21,
  howzat: true
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
  wicket: {
    type: 'run out',
    fieldPositionId: 1
  }
}, {
  extra: 'wide',
  wicket: {
    type: 'stumped',
    fieldPositionId: 1
  }
}, {
  runs: 0
}, {
  runs: 0
}, {
  runs: 1
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
  runs: 2
}, {
  runs: 0
}, {
  runs: 0
}];

const initialPlayers = [
  ...[...Array(11)].map((_, i) => ({ id: i, type: 'batter'})),
  ...[...Array(3)].map((_, i) => ({ id: i, type: 'bowler'}))
];

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
      <AddEvent 
        onAddEvent={handleAddEvent}
        players={players}
      />
      <Scorebook 
        players={players} 
        events={events}
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
    </div>
  );

}

export default App;
