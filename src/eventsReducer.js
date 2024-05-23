export default function eventsReducer(events, action) {
    switch (action.type) {
        case 'addevent': {
            return [
                ...events,
                action.event
            ]
        }
        default: {
          throw Error('Unknown action: ' + action.type);
        }
    }
}