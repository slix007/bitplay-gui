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

    console.log('allSettings: (see nextLine)');
    console.log(toJS(allSettings));

    setCorrParams(toJS(allSettings.corrParams));
};

export const setAllSettingsRaw = function (result) {
    let settingsData = JSON.parse(result);
    setAllSettings(settingsData);
    return settingsData;
};

export const allSettings = observable({
    SETTINGS_URL: '',
    BASE_URL: '',

    // restartEnabled: false,
    tradingModeAuto: false,
    restartSettings: {},
    tradingModeState: {tradingMode: ''},
    placingBlocks: {},
    posAdjustment: {},
    bitmexPlacingType: '',

    settingsVolatileMode: {
        bitmexPlacingType: '',
        activeFields: [],
        placingBlocks: {},
        posAdjustment: {},
        baddBorder: 0,
        oaddBorder: 0,
    },

    bitmexChangeOnSo: {
        secToReset: 0,
        toTaker: false,
        toConBo: false,
    },

    okexEbestElast: false,

    // other settings
    feeSettings: {},

    corrParams: {
        corr: {},
        adj: {},
        preliq: {}
    },

    borderParams: {
        maxBorder: '',
        onlyOpen: false
    },

    // MarketStatesJson, /market/states
    marketStates: {
        signalParts: {},
    },

    ///settings/preset-all
    settingsPresets: [],

});

export const updateCorrParams = function (corrData) {
    for (let k in corrData) {
        if (corrData.hasOwnProperty(k)) {
            for (let m in corrData[k]) {
                if (corrData[k].hasOwnProperty(m)) {
                    mobxStore.corrParams[k][m] = corrData[k][m];
                }
            }
        }
    }
    // console.log('corrParams update: (see nextLine)');
    // console.log(toJS(mobxStore.corrParams));
};
export const setCorrParams = function (corrData) {
    // console.log('corrParams set: (see nextLine)');
    // console.log(corrData);
    mobxStore.corrParams = corrData;
    // console.log('corrParams set: (see nextLine)');
    // console.log(toJS(mobxStore.corrParams));
};

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
    // bitmex swap params
    //bxbtBal: 0,
    futureIndex: {
        b_index: 0,
        o_index: 0,
        twoMarketsIndexDiff: '',
    },
    b_bid_1: 0,
    b_ask_1: 0,
    o_bid_1: 0,
    o_ask_1: 0,
    o_delivery: 0,
    get o_delivery_round() {
        return this.isEth ? 3 : 2;
    },
    get b_best_sam() {
        return ((this.b_ask_1 + this.b_bid_1) / 2).toFixed(3);
    },
    get o_best_sam() {
        return ((this.o_ask_1 + this.o_bid_1) / 2).toFixed(3);
    },

    arbMod: {},
    // position: {
    //     pos_bitmex_cont: 0,
    //     pos_okex_cont_long: 0,
    //     pos_okex_cont_short: 0,
    // },

    
    corrParams: {
        corr: {},
        adj: {},
        preliq: {}
    },
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


