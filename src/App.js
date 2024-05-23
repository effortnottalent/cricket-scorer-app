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
    fielderId: 7
  },
  fieldPositionId: 13,
}, {
  runs: 2,
  extra: 'leg bye'
}, {
  runs: 1,
  fieldPositionId: 21,
  howzat: true
}];

const initialPlayers = [{
  id: 3,
  name: 'Steve Stevens',
  type: 'batter'
}];

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
      <AddEvent onAddEvent={handleAddEvent} />
      <Scorebook 
        players={players} 
        onChangePlayer={handleChangePlayer} />
      <Scoreboard events={events} />
      <BallByBall 
        events={events}
        players={players} 
      />
    </div>
  );

}

export default App;
