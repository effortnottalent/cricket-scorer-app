import { useReducer } from 'react';
import eventsReducer from './eventsReducer.js';

import './App.css';

import Scoreboard from './Scoreboard';
import BallByBall from './BallByBall.js';
import AddEvent from './AddEvent.js';

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

function App() {
  const [ events, dispatch ] = useReducer(eventsReducer, initialEvents);

  function handleAddEvent(event) {
    dispatch({
      type: 'addevent',
      event: event
    })
  }

  return (
    <div className="App">
      <header className="App-header">
        Cricket App
      </header>
      <AddEvent onAddEvent={handleAddEvent} />
      <Scoreboard events={events} />
      <BallByBall events={events} />
    </div>
  );

}

export default App;
