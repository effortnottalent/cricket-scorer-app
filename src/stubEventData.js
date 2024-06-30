import { fieldPositionsList } from './FieldPositionPicker';
import { 
  wicketScoredData,
  extrasScoredData 
} from './eventRefData';
import { faker } from '@faker-js/faker';

export const generateInitialEvents = () => {

  const players = [
    ...[...Array(11)].map((_, i) => ({ 
      id: i, type: 'batter', name: faker.person.fullName()})),
    ...[...Array(2)].map((_, i) => ({ 
      id: i, type: 'bowler', name: faker.person.fullName()}))
  ];

  const PROBABILITIES = {
    runsScored: 0.2,
    wicket: 0.05,
    extra: 0.1,
    swapbowler: 0.04
  };
  const events = [];
  do {
    const event = {
      id: events.length
    };
    event.fieldPositionId = Math.floor(Math.random() * fieldPositionsList.length);
    if(Math.random() < PROBABILITIES.runsScored) {
      event.runs = Math.floor(Math.random() * 4);
      if([4, 6].includes(event.runs)) {
        event.boundary = true;
      }
    }
    if(Math.random() < PROBABILITIES.extra) {
      event.extra = extrasScoredData[
        Math.floor(Math.random() * extrasScoredData.length)].extra;
    }
    if(Math.random() < PROBABILITIES.wicket) {
      event.wicket = wicketScoredData[
        Math.floor(Math.random() * wicketScoredData.length)].type;
    }
    if(Math.random() < PROBABILITIES.swapbowler) {
      const numberBowlers = Math.max([0,1].push.apply(events
        .filter(event => event.newBowlerId)
        .map(event => event.newBowlerId)));
      event.newBowlerId = numberBowlers + 1;
      players.push({ 
        id: players.filter(player => player.type === 'bowler').length, 
        type: 'bowler', 
        name: faker.person.fullName()})
    }
    events.push(event);
  } while (events.filter(event => event.wicket).length < 10);
  return [ events, players ];
}

export const initialEvents = [{
    id: 0,
    runs: 0,
  }, {
    id: 1,
    runs: 2,
    fieldPositionId: 19,
  }, {
    id: 2,
    runs: 4,
    fieldPositionId: 26,
    boundary: true,
    notes: 'outrageous shot'
  }, {
    id: 3,
    runs: 0,
    extra: 'wide',
    notes: 'sunday rules umpire?'
  }, {
    id: 4,
    runs: 1,
    fieldPositionId: 3,
    extra: 'bye'
  }, {
    id: 5,
    wicket: 'caught',
    fieldPositionId: 1,
  }, {
    id: 6,
    runs: 2,
    extra: 'leg bye',
    fieldPositionId: 11,
  }, {
    id: 8,
    runs: 1,
    fieldPositionId: 21
  }, {
    id: 9,
    runs: 4,
    fieldPositionId: 14,
    extra: 'no-ball'
  }, {
    id: 10,
    runs: 3,
    fieldPositionId: 11,
    extra: 'hit no-ball'
  }, {
    id: 11,
    extra: 'wide',
    runs: 3,
    wicket: 'run out',
    batterOutOnStrike: true,
    fieldPositionId: 3
  }, {
    id: 12,
    extra: 'wide',
    wicket: 'stumped'
  }, {
    id: 13,
    runs: 0
  }, {
    id: 14,
    runs: 0
  }, {
    id: 15,
    runs: 1,
    fieldPositionId: 11,
  }, {
    id: 16,
    runs: 0
  }, {
    id: 17,
    runs: 0
  }, {
    id: 19,
    runs: 0
  }, {
    id: 20,
    runs: 0
  }, {
    id: 21,
    runs: 0
  }, {
    id: 22,
    runs: 2,
    fieldPositionId: 10,
  }, {
    id: 23,
    runs: 0
  }, {
    id: 24,
    runs: 0
  }, {
    newBowlerId: 2,
    id: 26,
    runs: 0
  }, {
    id: 27,
    runs: 1
  }, {
    id: 28,
    runs: 0
  }, {
    id: 29,
    runs: 3
  }, {
    id: 30,
    runs: 0
  }, {
    id: 31,
    runs: 0
  }, {
    id: 33,
    runs: 0
  }, {
    id: 34,
    runs: 2
  }, {
    id: 35,
    runs: 0
  }, {
    id: 36,
    runs: 0
  }, {
    id: 37,
    extra: 'no-ball',
    runs: 3,
    wicket: 'run out',
    batterOutOnStrike: false,
    fieldPositionId: 3,
  }, {
    id: 38,
    extra: 'bye',
    runs: 2,
    wicket: 'run out',
    batterOutOnStrike: true,
    fieldPositionId: 4,
  },  {
    id: 39,
    extra: 'leg bye',
    runs: 1,
    wicket: 'run out',
    batterOutOnStrike: false,
    fieldPositionId: 8,
  }];
  