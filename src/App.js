import {
  useState
} from 'react';

import './App.css';

import Scoreboard from './Scoreboard';
import BallByBall from './BallByBall.js';
import CrupdateEvent from './CrupdateEvent.js';
import Scorebook from './Scorebook.js';

import { Contexts } from './Contexts.js';


function App() {
  const [ eventToEdit, setEventToEdit ] = useState({});

  return (
    <div className="App">
      <header className="App-header">
        Cricket Scorer App
        {Object.keys(eventToEdit).length !== 0 &&
          <button onClick={() => setEventToEdit({})}>Add Ball</button>
        }
      </header>
      <Contexts>
        {Object.keys(eventToEdit).length !== 0 ? 
          <CrupdateEvent 
            key={eventToEdit.id} 
            eventToEdit={eventToEdit}
          />
          :
          <CrupdateEvent eventToEdit={{}} />
        }
        <Scorebook onSelectEventToEdit={(id) => setEventToEdit(id)} />
        <Scoreboard />
        <BallByBall />
      </Contexts>
    </div>
  );

}

export default App;
