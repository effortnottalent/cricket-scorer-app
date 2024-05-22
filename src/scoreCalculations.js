import { fieldPositionsList } from './FieldPositions.js';

function formatSummary(event) {
    return event.extra ? 
        event.extra + (event.runs ? ', ran ' + event.runs : '') : 
            (event.wicket ? 
                event.wicket.type + (event.wicket.fielderId ? ' by ' + 
                    event.wicket.fielderId + ' at ' + fieldPositionsList[event.fieldPositionId].label : '') : 
                    (event.runs === 0 ? 'no run' : 
                        'hit to ' + fieldPositionsList[event.fieldPositionId].label + ' for ' + event.runs));
}

export function calculateInnings(events) {
    let onStrikeBatterId = 0;
    let onBowlBowlerId = 0;
    let offStrikeBatterId = 1;
    let offBowlBowlerId = 1;
    return events.reduce(
        (accScore, event) => {
            
            const ballByBallItem = {
                onStrikeBatterId,
                onBowlBowlerId,
                summary: formatSummary(event),
                notes: event.notes
            };

            if(event.extra) {

                switch(event.extra) {
                    case 'wide': 
                        accScore.bowlers[onBowlBowlerId].wides += event.runs + 1;
                        break;
                    case 'no ball':
                        accScore.bowlers[onBowlBowlerId].noBalls++;
                        accScore.batters[onStrikeBatterId].runs += event.runs;
                        break;
                    case 'no ball bye':
                        accScore.bowlers[onBowlBowlerId].noBalls++;
                        accScore.extras.byes += event.runs;
                        break;
                    case 'no ball leg bye':
                        accScore.bowlers[onBowlBowlerId].noBalls++;
                        accScore.extras.legByes += event.runs;
                        break;
                    case 'bye':
                        accScore.extras.byes += event.runs;
                        accScore.batters[onStrikeBatterId].balls++;
                        accScore.bowlers[onBowlBowlerId].balls++;
                        ballByBallItem.validBall = true;
                        break;
                    case 'leg bye':
                        accScore.extras.legByes += event.runs;
                        accScore.batters[onStrikeBatterId].balls++;
                        accScore.bowlers[onBowlBowlerId].balls++;
                        ballByBallItem.validBall = true;
                        break;
                    default:
                        console.log('got a weird extra, skipping this ball')
                        return accScore;
                }

            } else if(event.wicket) {

                accScore.batters[onStrikeBatterId].balls++;
                accScore.bowlers[onBowlBowlerId].balls++;
                ballByBallItem.validBall = true;
                const outBatterId = event.outBatterId ?? onStrikeBatterId;
                accScore.batters[outBatterId].out = ({
                    type: event.wicket.type,
                    fielder: event.wicket.type === 'bowled' ? 
                        accScore.bowlers[onBowlBowlerId].id : event.wicket.fielderId
                });
                [onStrikeBatterId, offStrikeBatterId] = event.wicket.battersCrossed ? 
                    [ offStrikeBatterId, accScore.batters.length ] :
                    [ accScore.batters.length, offStrikeBatterId ];
                accScore.batters.push({
                    balls: 0,
                    runs: 0,
                    fours: 0,
                    sixes: 0
                });
                const runs = accScore.bowlers.reduce((score, bowler) => 
                    score + bowler.wides + bowler.noBalls + bowler.runs, 0) + 
                    accScore.extras.legByes + accScore.extras.byes;
                accScore.wickets.push({
                    runs: runs,
                    batterId: outBatterId,
                    batterRuns: accScore.batters[outBatterId].runs,
                    partnership: runs - (accScore.wickets.length !== 0 ? 
                        accScore.wicket[accScore.wickets.length - 1].runs : 0)
                });

            } else {
                
                accScore.batters[onStrikeBatterId].runs += event.runs; 
                accScore.bowlers[onBowlBowlerId].runs += event.runs;
                accScore.batters[onStrikeBatterId].balls++;
                accScore.bowlers[onBowlBowlerId].balls++;
                ballByBallItem.validBall = true;
                if(event.boundary) {
                    event.runs === 4 ? accScore.batters[onStrikeBatterId].fours++ : 
                        accScore.batters[onStrikeBatterId].sixes++;
                }

            }

            if(event.runs % 2 !== 0) {
                [onStrikeBatterId, offStrikeBatterId] = [offStrikeBatterId, onStrikeBatterId];
            }

            if(accScore.bowlers.reduce((balls, bowler) => balls + bowler.balls, 0) % 6 === 0) {
                [onBowlBowlerId, offBowlBowlerId] = [offBowlBowlerId, onBowlBowlerId];
                [onStrikeBatterId, offStrikeBatterId] = [offStrikeBatterId, onStrikeBatterId];
            }

            accScore.ballByBall.push(ballByBallItem);

            return accScore;

        }, {
        batters: [
            {
                balls: 0,
                runs: 0,
                fours: 0,
                sixes: 0,
            },
            {
                balls: 0,
                runs: 0,
                fours: 0,
                sixes: 0,
                position: 2,
            }
        ],
        bowlers: [
            {
                balls: 0,
                runs: 0,
                fours: 0,
                sixes: 0,
                wickets: 0,
                wides: 0,
                noBalls: 0,
                inSpell: true
            },
            {
                balls: 0,
                runs: 0,
                fours: 0,
                sixes: 0,
                wickets: 0,
                wides: 0,
                noBalls: 0,
                inSpell: true
            }
        ],
        wickets: [],
        extras: {
            byes: 0,
            legByes: 0
        },
        ballByBall: []
    });
}

export function calculateScore(innings) {
    const lastWicket = (innings.wickets.length === 0 ? null : 
        innings.wickets[innings.wickets.length - 1]);
    const battersAtCreaseIds = innings.batters
        .map((_, i) => i).filter(i => !innings.batters[i].out);
    return {
        runs: innings.batters.reduce(
            (runs, batter) => runs + batter.runs, 0) 
            + innings.extras.byes + innings.extras.legByes,
        wickets: innings.batters.filter(batter => batter.out && batter.out.type !== 'retired').count,
        overs: innings.bowlers.reduce(
            (balls, bowler) => balls + bowler.balls, 0) / 6,
        extras: innings.bowlers.reduce(
            (balls, bowler) => balls + bowler.wides + bowler.noBalls, 0)
            + innings.extras.byes + innings.extras.legByes,
        batter1: {
            id: battersAtCreaseIds[0],
            runs: innings.batters[battersAtCreaseIds[0]].runs
        },
        batter2: {
            id: battersAtCreaseIds[1],
            runs: innings.batters[battersAtCreaseIds[1]].runs
        },
        lastWicket: lastWicket ? {
            runs: lastWicket.runs,
            batterId: lastWicket.batterId,
            batterRuns: innings.batters[lastWicket.batterId].runs,
            partnership: lastWicket.partnership
        } : null
    }
}
