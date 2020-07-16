// Quick and dirty on event helper
export const on = (context, eventType, eventCallback, useCapture) => {
    if (context && eventType && eventCallback) {
        var events = String(eventType).split(" ");
        while (events.length) {
            eventType = events.pop();
            if (context.addEventListener) {
                context.addEventListener(eventType, eventCallback, useCapture);
            } else {
                context.attachEvent(
                    "on" + eventType,
                    eventCallback,
                    useCapture
                );
            }
        }
    }
};
