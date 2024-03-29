'use strict';
import { observable, toJS } from 'mobx'
import utils from '../utils'

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

    restartWarn: {
        left: false,
        right: false
    },
    restartWarnBitmexCt: false,

    // GET /market/list
    marketList: {
        left: 'bitmex',
        right: 'okex',
        leftFutureContractName: 'x',
        rightFutureContractName: 'x',
        eth: false,
    },
    get leftIsBtm() {
        return this.marketList.left === 'bitmex'
    },

    extraFlags: [],
    movingStopped: false,
    // restartEnabled: false,
    eth: false,
    tradingModeAuto: false,
    restartSettings: {},
    tradingModeState: { tradingMode: '' },
    placingBlocks: {},
    posAdjustment: {},
    leftPlacingType: '',
    rightPlacingType: '',

    settingsVolatileMode: {
        leftPlacingType: '',
        rightPlacingType: '',
        activeFields: [],
        placingBlocks: {},
        posAdjustment: {},
        baddBorder: 0,
        oaddBorder: 0,
        conBoPortions: {},
        prem: {}
    },

    bitmexChangeOnSo: {
        secToReset: 0,
        toTaker: false,
        toConBo: false,
    },

    okexSettlementMode: false,
    okexSettlementModeEnding: '',
    nowMomentStr: '',
    okexSettlement: {
        active: false,
        startAtTimeStr: '',
        period: -1
    },
    allFtpd: { left: {}, right: {} },
    contractMode: { left: '', right: '' },
    contractModeCurrent: { modeScale: 3 },

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

    ///settings/preset-all
    settingsPresets: [],

    allPostOnlyArgs: { left: {}, right: {} }

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
    modeScale: 3,
    baseUrl: '',
    // bitmex swap params
    //bxbtBal: 0,
    futureIndex: {
        b_index: 0,
        o_index: 0,
    },
    b_bid_1: 0,
    b_ask_1: 0,
    o_bid_1: 0,
    o_ask_1: 0,
    b_delivery: 0,
    o_delivery: 0,
    get o_delivery_round() {
        return this.isEth ? 3 : 2;
    },
    get left_best_sam() {
        return ((this.b_ask_1 + this.b_bid_1) / 2).toFixed(this.modeScale);
    },
    get right_best_sam() {
        return ((this.o_ask_1 + this.o_bid_1) / 2).toFixed(this.modeScale);
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

    quAvg: 0,
    // okex: close-all-pos: button mkt
    secondMarketAccount: {
        positionStr : "+0-0",
        longAvailToClose: 0,
        shortAvailToClose: 0,
    },
    okexMktActive: false,

    get secondMarketAccountJs() {
        return toJS(this.secondMarketAccount);
    },

    allMon: {},

    leftSwapSettlement: '',
    rightSwapSettlement: '',

    // MarketStatesJson, /market/states
    marketStates: {
        signalParts: {},
        orderPortionsJson: {},
        leftFtpdJson: {},
        rightFtpdJson: {},
        twoMarketsIndexDiff: '',
        lt: {}, rt: {},
        autoAddBorderJson: {},
        sebestStatus: 'undefined',
        recoveryStatus: 'undefined'
    },

    balanceInfo: {
        leftDql: '',
        rightDql: '',
        leftEmark: '',
        rightEmark: '',
        areBothOkex: false,
        isDefined: false,
    }
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
                num = allSettings.leftIsBtm
                  ? utils.btmUsdToContPure(this.amount, placingOrderObj.isEth, placingOrderObj.cm)
                  : utils.okUsdToCont(this.amount, placingOrderObj.isEth);
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
            let num
            if (this.isUsd) {
                num = utils.btmUsdToContPure(this.amount, false, 100)
            } else {
                num = this.amount;
            }
            return Number(num).toFixed(0)
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

export const bitmexChangeOnSoToTaker = function bitmexChangeOnSoToTaker() {
    return allSettings.bitmexChangeOnSo.secToReset > 0 && allSettings.bitmexChangeOnSo.adjToTaker;
};

export const bitmexSignalChangeOnSo = () => {
    return allSettings.bitmexChangeOnSo.secToReset > 0 && allSettings.bitmexChangeOnSo.signalTo
      ? allSettings.bitmexChangeOnSo.signalPlacingType
      : undefined;
};

export const bitmexChangeOnSoToConBo = function bitmexChangeOnSoToConBo() {
    return allSettings.bitmexChangeOnSo.secToReset > 0 && allSettings.bitmexChangeOnSo.toConBo;
};

