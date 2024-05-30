import { 
  useReducer,
  createContext
} from 'react';
import eventsReducer from './eventsReducer.js';
import playersReducer from './playersReducer.js';

import './App.css';

import Scoreboard from './Scoreboard';
import BallByBall from './BallByBall.js';
import AddOrUpdateEvent from './AddEvent.js';
import Scorebook from './Scorebook.js';

import { initialEvents } from './stubEventData.js';

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

  function handleEditEvent(event) {
    eventDispatch({
      type: 'editevent',
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
        Cricket Scorer App
      </header>
      <AddOrUpdateEvent 
        onAddEvent={handleAddEvent}
        onEditEvent={handleEditEvent}
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
    </div>
  );

}

export default App;
