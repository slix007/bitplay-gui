'use strict';
import {observable} from 'mobx';
import utils from '../utils';

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
    corrParams: {},
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
                num = utils.btmUsdToCont(this.amount, placingOrderObj.isEth, placingOrderObj.cm);
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
                num = utils.okUsdToCont(this.amount, placingOrderObj.isEth);
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


