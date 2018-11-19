'use strict';
import {observable} from 'mobx';

class SettingsStore {
    // examples
    // https://habrahabr.ru/post/282578/
    // https://mobx.js.org/getting-started.html

    // @observable amountType = 'CONT';

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

export const mobxStore = observable({
    cm: 100,
    isEth: false,
    baseUrl: '',
});

export const placingOrderObj = observable({
    cm: 100,
    isEth: false,
    btm: {
        isUsd: true,
        amount: 0,
        get amountCont() {
            let num = 0;
            if (this.isUsd) {
                num = placingOrderObj.isEth
                        ? (this.amount * placingOrderObj.cm / 10) // 10 / CM USD = 1 cont,
                        : (this.amount); // 1 USD = 1 cont
            } else {
                num = this.amount;
            }
            return Number(num).toFixed(0);
        },
        get amountContLabel() {
            return ' ' + this.amountCont + ' cont';
        }
    },
    btmXBTUSD: {
        isUsd: true,
        amount: 0,
        get amountCont() {
            return this.amount;
        },
        get amountContLabel() {
            return ' ' + this.amountCont + ' cont';
        }
    },
    ok: {
        isUsd: true,
        amount: 0,
        get amountCont() {
            let num = 0;
            if (this.isUsd) {
                num = placingOrderObj.isEth
                        ? (this.amount / 10)
                        : (this.amount / 100);
            } else {
                num = this.amount;
            }
            return Number(num).toFixed(0);
        },
        get amountContLabel() {
            return ' ' + this.amountCont + ' cont';
        }
    },
});


