import {
  useState
} from 'react';

import './App.scss';

import BallByBall from './BallByBall.js';
import CrupdateEvent from './CrupdateEvent.js';
import Scorebook from './Scorebook.js';

import { Contexts } from './Contexts.js';
import Scoreboard from './Scoreboard.js';


function App() {
  const [ eventToEdit, setEventToEdit ] = useState({});
  const [ activePane, setActivePane ] = useState('ballbyball');

  return (
    <Contexts>
    <main className="appcontent">
      {activePane === 'addball' && 
        <CrupdateEvent 
          eventToEdit={Object.keys(eventToEdit).length !== 0 ? 
            eventToEdit : {}}
        />
      }
      {activePane === 'scorebook' && 
        <Scorebook onSelectEventToEdit={(id) => setEventToEdit(id)} />
      }
      {activePane === 'ballbyball' && 
        <>
          <div class='appcontent__scoreboard'>
            <Scoreboard />
          </div>
          <div class='appcontent__ballbyball'>
            <BallByBall />
          </div>
        </>
      }
      </main>
      <footer className="menufooter">
        <button 
          className="menufooter__node"
          onClick={() => setActivePane('ballbyball')}
        >
          Ball-by-ball
        </button>
        <button 
          className="menufooter__node"
          onClick={() => setActivePane('scorebook')}
        >
          Scorebook
        </button>
        <button 
          className="menufooter__node"
          onClick={() => setActivePane('addball')}
        >
          Add ball
        </button>
      </footer>
    </Contexts>
  );

}

export default App;
