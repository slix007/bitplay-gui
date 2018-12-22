'use strict';
import {observable, toJS} from 'mobx';
import utils from '../utils';

export const setAllSettings = function (settingsData, SETTINGS_URL) {
    if (SETTINGS_URL) {
        allSettings.SETTINGS_URL = SETTINGS_URL;
    }

    for (let k in settingsData) {
        // if (null == k || "object" != typeof k) continue;
        if (settingsData.hasOwnProperty(k)) {
            allSettings[k] = settingsData[k];
            if ("object" == typeof k) {

            }
        }
    }

    console.log('allSettings:');
    console.log(toJS(allSettings));

    updateCorrParams(allSettings.corrParams);
};

export const setAllSettingsRaw = function (result) {
    let settingsData = JSON.parse(result);
    setAllSettings(settingsData);
    return settingsData;
};

export const allSettings = observable({
    // restartEnabled: false,
    tradingModeAuto: false,
    restartSettings: {},
    tradingModeState: {tradingMode: ''},
    placingBlocks: {},
    posAdjustment: {},
    settingsVolatileMode: {
        bitmexPlacingType: '',
        activeFields: [],
        placingBlocks: {},
        posAdjustment: {},
        baddBorder: 0,
        oaddBorder: 0,
    },

    corrParams: {
        corr: {},
        adj: {},
    }
});

export const updateCorrParams = function (corrData) {
    for (let k in corrData) {
        // if (null == k || "object" != typeof k) continue;
        if (corrData.hasOwnProperty(k)) {
            corrParams[k] = corrData[k];
            if ("object" == typeof k) {

            }
        }
    }
    console.log('corrParams:');
    console.log(toJS(corrParams));
};

export const corrParams = observable({
    corr: {},
    adj: {},
});

export const isActive = function (field) {
    const tmp = toJS(allSettings.settingsVolatileMode.activeFields);
    if (tmp instanceof Array) {
        return tmp.includes(field);
    }
    return false;
};

export const isActiveV = function (field) {
    if (allSettings.tradingModeState.tradingMode === 'VOLATILE') {
        return isActive(field);
    }
    return false;
};

export const mobxStore = observable({
    cm: 100,
    isEth: false,
    baseUrl: '',
    corrParams: {corr: {}},
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
                num = utils.btmUsdToContPure(this.amount, placingOrderObj.isEth, placingOrderObj.cm);
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


