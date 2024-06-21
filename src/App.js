import {
  useState
} from 'react';

import BallByBall from './BallByBall.js';
import CrupdateEvent from './CrupdateEvent.js';
import Scorebook from './Scorebook.js';

import { Contexts } from './Contexts.js';
import Scoreboard from './Scoreboard.js';

import './App.scss';
import { isEmpty } from './calculations.js';

function App() {
  const [ eventToEdit, setEventToEdit ] = useState({});
  const [ activePane, setActivePane ] = useState('ballbyball');

  return (
    <Contexts>
    <main className="appcontent">
      {activePane === 'addball' && 
        <CrupdateEvent 
        key={isEmpty(eventToEdit) ? null : eventToEdit.id}
          eventToEdit={isEmpty(eventToEdit) ? {} : eventToEdit}
        />
      }
      {activePane === 'scorebook' && 
        <Scorebook onSelectEventToEdit={(id) => { setEventToEdit(id); setActivePane('addball'); } } />
      }
      {activePane === 'ballbyball' && 
        <>
          <div className='appcontent__scoreboard'>
            <Scoreboard />
          </div>
          <div className='appcontent__ballbyball'>
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
          onClick={() => {
            setEventToEdit({});
            setActivePane('addball');
          }}
        >
          Add ball
        </button>
      </footer>
    </Contexts>
  );

}

export default App;
