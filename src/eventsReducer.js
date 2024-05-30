export default function eventsReducer(events, action) {
    switch (action.type) {
        case 'addevent':
            return [
                ...events,
                action.event
            ];
        case 'editevent':
            return [
                ...events.filter(e => e.id !== action.event.id),
                action.event
            ];
        default:
          throw Error('Unknown action: ' + action.type);
    }
}