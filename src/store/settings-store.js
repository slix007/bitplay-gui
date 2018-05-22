'use strict';

class SettingsStore {
    // examples
    // https://habrahabr.ru/post/282578/
    // https://mobx.js.org/getting-started.html

    constructor() {
        // this.restartEnabled;
    }

    setRestartEnabled(restartEnabled) {
        if (restartEnabled === undefined) restartEnabled = true;
        this.restartEnabled = restartEnabled;
    }
    setRestartSettings(restartSettings) {
        if (restartSettings === undefined) restartSettings = {};
        this.restartSettings = restartSettings;
    }

    report() {
        return `restartEnabled=` + this.restartEnabled;
    }
}

export const allSettings = new SettingsStore();