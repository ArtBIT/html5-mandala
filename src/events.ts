class Events {
    constructor() {
        this.listeners = {};
    }
    addEventListener(eventName, eventCallback) {
        this.listeners[eventName] = this.listeners[eventName] || [];
        this.listeners[eventName].push(eventCallback);
    }
    removeEventListener(eventName, eventCallback) {
        this.listeners[eventName] = this.listeners[eventName] || [];
        this.listeners[eventName] = this.listeners[eventName].filter(
            callback => callback !== eventCallback
        );
    }
    trigger(type, name, value) {
        this.listeners[type] &&
            this.listeners[type].forEach(callback =>
                callback({ type, name, value })
            );
    }
}

export default Events;
