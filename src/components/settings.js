'use strict';

import {createPlacingBlocksVolatile} from "../components/placing-blocks";
import {createAdjVolatile} from "./pos-adjustment";

let $ = require('jquery');
let Http = require('../http');
let Utils = require('../utils');
let sprintf = require('sprintf-js').sprintf;
let mobx = require('mobx');
const {allSettings, setAllSettings, setAllSettingsRaw, isActive, isActiveV} = require('../store/settings-store');

const enableRestart = require('../components/enable-restart');

export {showArbVersion};

let showArbVersion = function (firstMarketName, secondMarketName, baseUrl) {
    const SETTINGS_URL = baseUrl + '/settings/all';
    const SETTINGS_ADMIN_URL = baseUrl + '/settings/all-admin';

    Http.httpAsyncGet(SETTINGS_URL, function (rawData) {
        let settingsData = JSON.parse(rawData);
        setAllSettings(settingsData, SETTINGS_URL);
        enableRestart.showRestartEnable(baseUrl);

        // Arb version
        var container = document.getElementById("select-arb-version");
        createVerDropdown(container, settingsData.arbScheme, SETTINGS_URL);

        // Bitmex place orders type:
        let $bitmexPlacingCont = $('#bitmex-placing-type');
        const btmPlacingLb = $('<span>').text('Bitmex place orders type:');
        btmPlacingLb.appendTo($bitmexPlacingCont);
        createPlacingType($bitmexPlacingCont.get(0), SETTINGS_URL,
                x => ({bitmexPlacingType: x}),
                x => x.bitmexPlacingType,
                btmPlacingLb, 'bitmexPlacingType', true);

        let okexPlacingCont = $('#okex-placing-type');
        const okPlacingLb = $('<span>').text('Okex place orders type:');
        okPlacingLb.appendTo(okexPlacingCont);
        createPlacingType(okexPlacingCont.get(0), SETTINGS_URL,
                x => ({okexPlacingType: x}),
                x => x.okexPlacingType,
                okPlacingLb, 'okexPlacingType', true);

        // System overload settings
        var overloadContainer = document.getElementById("sys-overload-settings");
        createPlaceAttempts(overloadContainer, settingsData.bitmexSysOverloadArgs, SETTINGS_URL);
        createSysOverloadErrors(overloadContainer, settingsData.bitmexSysOverloadArgs, SETTINGS_URL);
        createSysOverloadTime(overloadContainer, settingsData.bitmexSysOverloadArgs, SETTINGS_URL);

        // Bitmex price workaround (for testing)
        var bitmexPriceCont = document.getElementById("bitmex-price");
        createBitmexSpecialPrice(bitmexPriceCont, settingsData.bitmexPrice, SETTINGS_URL);

        // Fee settings
        var feeSettings = document.getElementById("fee-settings");
        createNumberParam(feeSettings, settingsData, 'feeSettings', SETTINGS_URL, 'bTakerComRate');
        createNumberParam(feeSettings, settingsData, 'feeSettings', SETTINGS_URL, 'bMakerComRate');
        createNumberParam(feeSettings, settingsData, 'feeSettings', SETTINGS_URL, 'oTakerComRate');
        createNumberParam(feeSettings, settingsData, 'feeSettings', SETTINGS_URL, 'oMakerComRate');

        // Ignore limits
        createIgnoreLimitPrice(settingsData, SETTINGS_URL);

        createSignalDelay($('#signal-delay'), SETTINGS_URL, x => ({signalDelayMs: x}), null, true);

        createColdStorage(settingsData, SETTINGS_ADMIN_URL);
        createEBestMin(settingsData, SETTINGS_ADMIN_URL);

        createUsdQuoteType(settingsData, SETTINGS_URL);

        createContractModes(settingsData, SETTINGS_URL);
        createHedgeSettings(settingsData, SETTINGS_URL);

        maxBitmexReconnects(settingsData, SETTINGS_URL);

        createOkexFakePriceDev(settingsData, SETTINGS_URL);

        createAdjustByNtUsd($('#adjust-by-nt-usd'), SETTINGS_URL, x => ({adjustByNtUsd: x}), x => x.adjustByNtUsd, true);
        createNtUsdMultiplicityOkex(settingsData, SETTINGS_URL);

    });

    // Volatile mode
    createTradingModeDropdown(SETTINGS_URL);

    const $column1Cont = $('#volatile-mode-params-1');
    // timer-Label
    const contTimer = $('<div>').appendTo($column1Cont);
    createSettingsV(contTimer, SETTINGS_URL, 'Volatile duration(sec)',
            x => ({settingsVolatileMode: {volatileDurationSec: x}}),
            x => x.settingsVolatileMode.volatileDurationSec,
            x => false);
    $('<span>').attr('id', 'timeToResetTradingMode-label').appendTo(contTimer);
    createSettingsV($('<div>').appendTo($column1Cont), SETTINGS_URL, 'Border cross depth',
            x => ({settingsVolatileMode: {borderCrossDepth: x}}),
            x => x.settingsVolatileMode.borderCrossDepth,
            x => x.tradingModeAuto);

    const $column2Cont = $('#volatile-mode-params-2');
    const $btmPlacingContV = $('<div>').appendTo($column2Cont);
    createCheckboxV($btmPlacingContV, SETTINGS_URL, 'bitmexPlacingType');
    const btmPlacingLbV = $('<span>').text('Bitmex place orders type:');
    btmPlacingLbV.appendTo($btmPlacingContV);
    createPlacingType($btmPlacingContV.get(0), SETTINGS_URL,
            x => ({settingsVolatileMode: {bitmexPlacingType: x}}),
            x => x.settingsVolatileMode.bitmexPlacingType,
            btmPlacingLbV, 'bitmexPlacingType'
    );

    const $okPlacingContV = $('<div>').appendTo($column2Cont);
    createCheckboxV($okPlacingContV, SETTINGS_URL, 'okexPlacingType');
    const okPlacingLbV = $('<span>').text('Okex place orders type:');
    okPlacingLbV.appendTo($okPlacingContV);
    createPlacingType($okPlacingContV.get(0), SETTINGS_URL,
            x => ({settingsVolatileMode: {okexPlacingType: x}}),
            x => x.settingsVolatileMode.okexPlacingType,
            okPlacingLbV, 'okexPlacingType'
    );

    const $signalDelayContV = $('<div>').appendTo($column2Cont);
    createCheckboxV($signalDelayContV, SETTINGS_URL, 'signalDelayMs');
    createSignalDelay($signalDelayContV, SETTINGS_URL, x => ({settingsVolatileMode: {signalDelayMs: x}}),
            x => x.settingsVolatileMode.signalDelayMs);
    createSettingsV($('<div>').appendTo($column2Cont), SETTINGS_URL, 'b_add_border',
            x => ({settingsVolatileMode: {baddBorder: x}}),
            x => x.settingsVolatileMode.baddBorder);
    createSettingsV($('<div>').appendTo($column2Cont), SETTINGS_URL, 'o_add_border',
            x => ({settingsVolatileMode: {oaddBorder: x}}),
            x => x.settingsVolatileMode.oaddBorder);

    const $column3Cont = $('#volatile-mode-params-3');
    const $placingBlocksContV = $('<div>').appendTo($column3Cont);
    createCheckboxV($placingBlocksContV, SETTINGS_URL, 'placingBlocks');
    createPlacingBlocksVolatile($placingBlocksContV, SETTINGS_URL);

    const $posAdjustmentContV = $('<div>').appendTo($column3Cont);
    createCheckboxV($posAdjustmentContV, SETTINGS_URL, 'posAdjustment');
    const posAdjLb = $('<span>').text('posAdjustment:').appendTo($posAdjustmentContV);
    createPlacingType($posAdjustmentContV.get(0), SETTINGS_URL,
            x => ({settingsVolatileMode: {posAdjustment: {posAdjustmentPlacingType: x}}}),
            x => x.settingsVolatileMode.posAdjustment.posAdjustmentPlacingType,
            posAdjLb, 'posAdjustment'
    );
    createAdjVolatile($posAdjustmentContV, SETTINGS_URL);

    const $adjustByNtUsdContV = $('<div>').appendTo($column3Cont);
    createCheckboxV($adjustByNtUsdContV, SETTINGS_URL, 'adjustByNtUsd');
    $adjustByNtUsdContV.append($('<span>').text('adjustByNtUsd:'));
    createAdjustByNtUsd($adjustByNtUsdContV, SETTINGS_URL, x => ({settingsVolatileMode: {adjustByNtUsd: x}}),
            x => x.settingsVolatileMode.adjustByNtUsd);

    //TODO
    const $corr_adjContV = $('<div>').appendTo($column3Cont);
    createCheckboxV($corr_adjContV, SETTINGS_URL, 'corr_adj');
    $corr_adjContV.append($('<span>').text('corr_adj:'));
    //TODO

};

function createSettingsV(container, SETTINGS_URL, labelName, requestCreator, valExtractor, isActiveFunc) {
    const lb = $('<span>').text(labelName).appendTo(container);
    const edit = $('<input>').width('40px').appendTo(container);
    const updateBtn = $('<button>').text('set').appendTo(container);
    const realValue = $('<span>').appendTo(container);
    updateBtn.click(() => {
        const requestData = JSON.stringify(requestCreator(edit.val()));
        updateBtn.prop('disabled', true);
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
            setAllSettingsRaw(result);
            updateBtn.prop('disabled', false);
        });
    });
    mobx.autorun(function () {
        const value = valExtractor(allSettings);
        realValue.text(value);
        const isActive = isActiveFunc ? isActiveFunc(allSettings)
                : allSettings.tradingModeState.tradingMode === 'VOLATILE';
        if (isActive && value !== 0) {
            lb.css('font-weight', 'bold').prop('title', '');
        } else {
            lb.css('font-weight', 'normal').prop('title', '');
        }
    });
}

function createCheckboxV(cont, SETTINGS_URL, fieldName) {
    const checkbox = $('<input>').attr('type', 'checkbox').appendTo(cont);
    mobx.autorun(function () {
        checkbox.prop('checked', isActive(fieldName));
    });
    checkbox.click(function () {
        Utils.disableElements(cont);

        const req = checkbox.prop('checked')
                ? {settingsVolatileMode: {fieldToAdd: fieldName}}
                : {settingsVolatileMode: {fieldToRemove: fieldName}};
        const requestData = JSON.stringify(req);

        Http.httpAsyncPost(SETTINGS_URL,
                requestData, function (result) {
                    setAllSettingsRaw(result);
                    Utils.enableElements(cont);
                });
    });
}

function createTradingModeDropdown(SETTINGS_URL) {
    let $cont = $('#volatile-mode-params-1');

    // select
    let select = $('<select>', {id: 'tradingMode-id'});
    select.append($('<option>').val('CURRENT').text('Current'));
    select.append($('<option>').val('VOLATILE').text('Volatile'));
    mobx.autorun(function () {
        select.val(allSettings.tradingModeState.tradingMode);
    });

    $('<span>').text('Trading mode: ').appendTo($cont);
    $cont.append(select);

    select.change(() => Http.httpAsyncPost(SETTINGS_URL, JSON.stringify({tradingModeState: {tradingMode: select.val()}}),
            json => {
                const res = setAllSettingsRaw(json);
                alert('New value: ' + res.tradingModeState.tradingMode);
            }));

    // checkbox auto
    const autoCheckbox = $('<input>').attr('type', 'checkbox').appendTo($cont);
    const lb = $('<label>').text('auto').appendTo($cont);
    autoCheckbox.click(function () {
        Http.httpAsyncPost(SETTINGS_URL, JSON.stringify({tradingModeAuto: autoCheckbox.prop('checked')}),
                json => setAllSettingsRaw(json))
    });

    mobx.autorun(function () {
        autoCheckbox.prop('checked', allSettings.tradingModeAuto);
        if (allSettings.tradingModeAuto && allSettings.settingsVolatileMode.borderCrossDepth !== 0) {
            lb.css('font-weight', 'bold').prop('title', 'Activated auto select mode');
        } else {
            lb.css('font-weight', 'normal').prop('title', '');
        }
    });
}

function createVerDropdown(container, ver, ARB_SETTINGS_URL) {

    var select = document.createElement('select');
    var option1 = document.createElement('option');
    var option2 = document.createElement('option');
    option1.setAttribute("value", "SIM");
    option2.setAttribute("value", "CON_B_O");
    option1.innerHTML = 'SIM';
    option2.innerHTML = 'CON_B_O';
    select.appendChild(option1);
    select.appendChild(option2);
    select.addEventListener("change", onVerPick);
    select.value = ver;

    container.appendChild(select);

    function onVerPick() {
        const requestData = JSON.stringify({arbScheme: this.value});

        Http.httpAsyncPost(ARB_SETTINGS_URL,
                requestData, function (result) {
                    let data = JSON.parse(result);
                    alert('New value: ' + data.arbScheme);
                });
    }
}

function createPlaceAttempts(mainContainer, obj, SETTINGS_URL) {
    let container = document.createElement('div');
    mainContainer.appendChild(container);

    let label = document.createElement('span');
    label.innerHTML = 'placeAttempts';
    let edit = document.createElement('input');
    edit.innerHTML = '';
    let updateBtn = document.createElement('button');
    updateBtn.onclick = onBtnClick;
    updateBtn.innerHTML = 'update';
    let realValue = document.createElement('span');
    realValue.innerHTML = obj.placeAttempts;

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(updateBtn);
    container.appendChild(realValue);

    function onBtnClick() {
        const requestData = JSON.stringify({bitmexSysOverloadArgs: {placeAttempts: edit.value}});
        updateBtn.disabled = true;
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
            let data = JSON.parse(result);
            realValue.innerHTML = data.bitmexSysOverloadArgs.placeAttempts;
            updateBtn.disabled = false;
        });
    }
}

function createSysOverloadErrors(mainContainer, obj, SETTINGS_URL) {
    var container = document.createElement('div');
    mainContainer.appendChild(container);

    var label = document.createElement('span');
    label.innerHTML = 'movingErrorsForOverload';
    var edit = document.createElement('input');
    edit.innerHTML = '';
    var updateBtn = document.createElement('button');
    updateBtn.onclick = onBtnClick;
    updateBtn.innerHTML = 'update';
    var realValue = document.createElement('span');
    realValue.innerHTML = obj.movingErrorsForOverload;

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(updateBtn);
    container.appendChild(realValue);

    function onBtnClick() {
        const requestData = JSON.stringify({bitmexSysOverloadArgs: {movingErrorsForOverload: edit.value}});
        updateBtn.disabled = true;
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
            let data = JSON.parse(result);
            realValue.innerHTML = data.bitmexSysOverloadArgs.movingErrorsForOverload;
            updateBtn.disabled = false;
        });
    }
}

function createSysOverloadTime(mainContainer, obj, SETTINGS_URL) {
    let container = document.createElement('div');
    mainContainer.appendChild(container);

    let label = document.createElement('span');
    label.innerHTML = 'overloadTimeSec';
    let edit = document.createElement('input');
    edit.innerHTML = '';
    let updateBtn = document.createElement('button');
    updateBtn.onclick = onBtnClick;
    updateBtn.innerHTML = 'update';
    let realValue = document.createElement('span');
    realValue.innerHTML = obj.overloadTimeSec;

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(updateBtn);
    container.appendChild(realValue);

    function onBtnClick() {
        const requestData = JSON.stringify({bitmexSysOverloadArgs: {overloadTimeSec: edit.value}});
        updateBtn.disabled = true;
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
            let data = JSON.parse(result);
            realValue.innerHTML = data.bitmexSysOverloadArgs.overloadTimeSec;
            updateBtn.disabled = false;
        });
    }
}

function createPlacingType(mainContainer, SETTINGS_URL, requestCreator, valExtractor, lb, fieldName, isMain) {
    var select = document.createElement('select');
    var option1 = document.createElement('option');
    var option2 = document.createElement('option');
    var option3 = document.createElement('option');
    var option4 = document.createElement('option');
    var option5 = document.createElement('option');
    option1.setAttribute("value", "TAKER");
    option2.setAttribute("value", "MAKER");
    option3.setAttribute("value", "HYBRID");
    option4.setAttribute("value", "MAKER_TICK");
    option5.setAttribute("value", "HYBRID_TICK");
    option1.innerHTML = 'TAKER';
    option2.innerHTML = 'MAKER';
    option3.innerHTML = 'HYBRID';
    option4.innerHTML = 'MAKER_TICK';
    option5.innerHTML = 'HYBRID_TICK';
    select.appendChild(option1);
    select.appendChild(option2);
    select.appendChild(option3);
    select.appendChild(option4);
    select.appendChild(option5);
    select.addEventListener("change", onVerPick);

    mainContainer.appendChild(select);

    mobx.autorun(function () {
        select.value = valExtractor(allSettings);
        if (isActiveV(fieldName)) {
            lb.css('font-weight', 'bold').prop('title', 'Activated VOLATILE mode');
        } else {
            lb.css('font-weight', 'normal').prop('title', '');
        }
        if (isMain) {
            if (isActiveV(fieldName)) {
                select.disabled = true;
            } else {
                select.disabled = false;
            }
        }
    });

    function onVerPick() {
        const requestData = JSON.stringify(requestCreator(this.value));

        Http.httpAsyncPost(SETTINGS_URL,
                requestData, function (result) {
                    setAllSettingsRaw(result);
                    let data = JSON.parse(result);
                    alert('New value: ' + valExtractor(data));
                });
    }
}

function createBitmexSpecialPrice(mainContainer, obj, SETTINGS_URL) {
    let container = document.createElement('div');
    mainContainer.appendChild(container);

    let label = document.createElement('span');
    label.innerHTML = 'bitmexPrice';
    let edit = document.createElement('input');
    edit.innerHTML = '';
    let updateBtn = document.createElement('button');
    updateBtn.onclick = onBtnClick;
    updateBtn.innerHTML = 'update';
    let realValue = document.createElement('span');
    realValue.innerHTML = obj;

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(updateBtn);
    container.appendChild(realValue);

    function onBtnClick() {
        const requestData = JSON.stringify({bitmexPrice: edit.value});
        updateBtn.disabled = true;
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
            let data = JSON.parse(result);
            realValue.innerHTML = data.bitmexPrice;
            updateBtn.disabled = false;
        });
    }
}

function createNumberParam(mainContainer, mainObj, nestedObjName, SETTINGS_URL, elName) {
    var container = document.createElement('div');
    mainContainer.appendChild(container);

    var label = document.createElement('span');
    label.innerHTML = Utils.camelToUnderscore(elName);
    var edit = document.createElement('input');
    edit.style.width = '80px';
    edit.innerHTML = '';
    var resultLabel = document.createElement('span');
    resultLabel.innerHTML = mainObj[nestedObjName][elName];
    var setBtn = document.createElement('button');
    setBtn.onclick = function () {
        setBtn.disabled = true;
        mainObj[nestedObjName][elName] = Number(edit.value);
        saveParamAsNumber(SETTINGS_URL, mainObj, resultLabel, setBtn, nestedObjName, elName);
    };
    setBtn.innerHTML = 'set';

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(setBtn);
    container.appendChild(resultLabel);
}

function saveParamAsNumber(SETTINGS_URL, requestObj, el, setBtn, nestedObjName, elName) {
    const requestData = JSON.stringify(requestObj);
    console.log(requestData);
    Http.httpAsyncPost(SETTINGS_URL,
            requestData, function (rawRes) {
                const res = JSON.parse(rawRes);
                el.innerHTML = res[nestedObjName][elName];
                setBtn.disabled = false;
                // alert(rawRes);
            });
}

function createIgnoreLimitPrice(settingsData, SETTINGS_URL) {
    var container = document.getElementById("ignore-limits");

    let checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.checked = settingsData.limits.ignoreLimits;
    let decorateLimitsStatus = function () {
        if (checkbox.checked) {
            $('#limits-status').css("text-decoration", "line-through");
        } else {
            $('#limits-status').css("text-decoration", "initial");
        }
    };
    decorateLimitsStatus();

    checkbox.id = "ignoreLimits";
    checkbox.onchange = function (ev) {
        checkbox.disabled = true;

        let requestObj = {limits: {ignoreLimits: checkbox.checked}};
        const requestData = JSON.stringify(requestObj);
        console.log(requestData);
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (rawRes) {
            const res = JSON.parse(rawRes);
            console.log(res);
            checkbox.checked = res.limits.ignoreLimits;
            decorateLimitsStatus();
            checkbox.disabled = false;
        });
    };

    let label = document.createElement('label');
    label.appendChild(document.createTextNode('ignoreLimits'));

    container.appendChild(checkbox);
    container.appendChild(label);
}

function createSignalDelay(cont, SETTINGS_URL, requestCreator, valExtractor, isMain) {
    let container = cont.get(0);
    let label = $('<span>');
    label.text('Signal delay (ms):');
    let edit = document.createElement('input');
    edit.style.width = '80px';
    edit.innerHTML = '';
    let resultLabel = document.createElement('span');
    let setBtn = document.createElement('button');
    setBtn.onclick = function () {
        setBtn.disabled = true;
        Http.httpAsyncPost(SETTINGS_URL, JSON.stringify(requestCreator(edit.value)), function (rawRes) {
            setAllSettingsRaw(rawRes);
            setBtn.disabled = false;
        });
    };
    setBtn.innerHTML = 'set';

    container.appendChild(label.get(0));
    container.appendChild(edit);
    container.appendChild(setBtn);
    container.appendChild(resultLabel);

    mobx.autorun(function () {
        if (valExtractor) {
            resultLabel.innerText = valExtractor(allSettings);
        }
        if (isActiveV('signalDelayMs')) {
            label.css('font-weight', 'bold').prop('title', 'Activated VOLATILE mode');
            if (isMain) {
                setBtn.disabled = true;
            }
        } else {
            label.css('font-weight', 'normal').prop('title', '');
            if (isMain) {
                setBtn.disabled = false;
            }
        }
    });
}

function createColdStorage(settingsData, SETTINGS_ADMIN_URL) {
    var container = document.getElementById("cold-storage");

    var label = document.createElement('span');
    label.innerHTML = 'Cold Storage(btc):';
    var edit = document.createElement('input');
    edit.style.width = '80px';
    edit.innerHTML = '';
    var resultLabel = document.createElement('span');
    resultLabel.innerHTML = settingsData.coldStorageBtc;
    var setBtn = document.createElement('button');
    setBtn.onclick = function () {
        setBtn.disabled = true;
        const requestData = JSON.stringify({coldStorageBtc: edit.value});
        console.log(requestData);
        Http.httpAsyncPost(SETTINGS_ADMIN_URL,
                requestData, function (rawRes) {
                    const res = JSON.parse(rawRes);
                    resultLabel.innerHTML = res.coldStorageBtc;
                    setBtn.disabled = false;
                    // alert(rawRes);
                });
    };
    setBtn.innerHTML = 'set';

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(setBtn);
    container.appendChild(resultLabel);

    if (!userInfo.isAdmin()) {
        Utils.disableChildren(container);
    }
}

function createEBestMin(settingsData, SETTINGS_ADMIN_URL) {
    var container = document.getElementById("e-best-min");

    var label = document.createElement('span');
    label.innerHTML = 'e_best_min:';
    var edit = document.createElement('input');
    edit.style.width = '80px';
    edit.innerHTML = '';
    var resultLabel = document.createElement('span');
    resultLabel.innerHTML = settingsData.ebestMin;
    var setBtn = document.createElement('button');
    setBtn.onclick = function () {
        setBtn.disabled = true;
        const requestData = JSON.stringify({ebestMin: edit.value});
        console.log(requestData);
        Http.httpAsyncPost(SETTINGS_ADMIN_URL,
                requestData, function (rawRes) {
                    const res = JSON.parse(rawRes);
                    resultLabel.innerHTML = res.ebestMin;
                    setBtn.disabled = false;
                    // alert(rawRes);
                });
    };
    setBtn.innerHTML = 'set';

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(setBtn);
    container.appendChild(resultLabel);

    if (!userInfo.isAdmin()) {
        Utils.disableElements($("#e-best-min"));
    }
}

function createUsdQuoteType(settingsData, SETTINGS_URL) {
    var arr = [
        'BITMEX',
        'OKEX',
        'AVG',
        'INDEX_BITMEX',
        'INDEX_OKEX'
    ];
    const label = $('<span/>', {title: 'How to convert BTC to USD'}).html('Usd quote type: ');
    const select = $('<select/>').html($.map(arr, function (item) {
        return $('<option/>', {value: item, text: item});
    })).val(settingsData.usdQuoteType);
    select.on('change', onVerPick);

    $("#usd-quote-type").append(label).append(select);

    function onVerPick() {
        console.log(this.value);
        const requestData = JSON.stringify({usdQuoteType: this.value});

        Http.httpAsyncPost(SETTINGS_URL,
                requestData, function (result) {
                    let data = JSON.parse(result);
                    alert('New value: ' + data.usdQuoteType);
                });
    }

}

function createOkexFakePriceDev(settingsData, SETTINGS_URL) {
    const cont = $("#okex-fake-taker-price-deviation");

    const label = $('<span/>', {title: 'Fake taker price deviation'}).html('FTPD(usd) ');
    const edit = $('<input>').width('80px');
    const resLabel = $('<span/>').html(settingsData.okexFakeTakerDev);
    let updateBtn = $('<button>').text('Update').css('margin-right', '5px');

    cont.append(label).append(edit).append(updateBtn).append(resLabel);

    updateBtn.click(function () {
        updateBtn.attr('disabled', true);

        let requestData = JSON.stringify({okexFakeTakerDev: edit.val()});
        console.log(requestData);
        Http.httpAsyncPost(SETTINGS_URL, requestData,
                function (rawResp) {
                    const res = JSON.parse(rawResp);
                    resLabel.html(res.okexFakeTakerDev);
                    updateBtn.attr('disabled', false);
                }
        );
    });
}

const set_bu11 = $('<span/>', {title: 'set_bu11: b = XBTUSD, o = BTC_W (%s), hedge_btc'}).html('set_bu11');
const set_bu10_1 = $('<span/>', {title: 'set_bu10: b = XBTUSD, o = null, hedge_btc'}).html('set_bu10 + ');
const set_bu10_2 = $('<span/>', {title: 'set_bu10: b = XBTUSD, o = null, hedge_btc'}).html('set_bu10 + ');
const set_bu12 = $('<span/>', {title: 'set_bu12: b = XBTUSD, o = BTC_BW (%s), hedge_btc'}).html('set_bu12');
const set_bu23 = $('<span/>', {title: 'set_bu23: b = XBT_Q, o = BTC_Q (%s), hedge_btc'}).html('set_bu23');
const set_eu11 = $('<span/>', {title: 'set_eu11: b = ETHUSD, o = ETH_W (%s), hedge_eth'}).addClass('templ').html('set_eu11');
const set_eu12 = $('<span/>', {title: 'set_eu12: b = ETHUSD, o = ETH_BW (%s), hedge_eth'}).addClass('templ').html('set_eu12');
const set_bu10_set_eu11 = $('<span/>').append(set_bu10_1).append(set_eu11);
const set_bu10_set_eu12 = $('<span/>').append(set_bu10_2).append(set_eu12);
var arbModArr = [
    {val: 'MODE1_SET_BU11', txt: 'M10: set_bu11', info: set_bu11, mod: "M10", mainSet: "set_bu11"},
    {val: 'MODE2_SET_BU12', txt: 'M11: set_bu12', info: set_bu12, mod: "M11", mainSet: "set_bu12"},
    {val: 'MODE3_SET_BU23', txt: 'M20: set_bu23', info: set_bu23, mod: "M20", mainSet: "set_bu23"},
    {val: 'MODE4_SET_BU10_SET_EU11', txt: 'M21: set_bu10 + set_eu11', info: set_bu10_set_eu11, mod: "M21", mainSet: "set_eu11"},
    {val: 'MODE5_SET_BU10_SET_EU12', txt: 'M22: set_bu10 + set_eu12', info: set_bu10_set_eu12, mod: "M22", mainSet: "set_eu12"},
];

function createContractModes(settingsData, SETTINGS_URL) {

    const label = $('<span/>', {title: 'Type by contract delivery time'}).html('Arbitrage mod: ');
    let detailsLabel = $('<span/>');
    const select = $('<select/>').html($.map(arbModArr, function (item) {
        return $('<option/>', {value: item.val, text: item.txt});
    })).val(settingsData.contractMode);
    select.on('change', onVerPick);

    const warnLabel = $('<span/>').css('color', 'red');

    function updateLabels(data) {
        warnLabel.html(data.contractMode === data.contractModeCurrent ? ''
                : ' warning: to apply the changes restart is needed');
        let item = arbModArr.find(item => item.val === data.contractMode);

        detailsLabel.replaceWith(item.info);
        detailsLabel = item.info;
        if (detailsLabel.children().length === 0) {
            detailsLabel.attr('title', sprintf(detailsLabel.attr('title'), data.okexContractName));
        } else {
            detailsLabel.find('span.templ').each(function (idx, item) {
                item.title = sprintf(item.title, data.okexContractName);
            });
        }

    }

    updateLabels(settingsData);

    $("#contract-mode").append(label).append(select).append(detailsLabel).append(warnLabel);

    function onVerPick() {
        console.log(this.value);
        const requestData = JSON.stringify({contractMode: this.value});

        Http.httpAsyncPost(SETTINGS_URL,
                requestData, function (result) {
                    let data = JSON.parse(result);
                    updateLabels(data);
                    alert('New value: ' + data.contractMode);
                });
    }
}

function maxBitmexReconnects(settingsData, SETTINGS_URL) {
    var container = document.getElementById("max-bitmex-reconnects");

    var label = document.createElement('span');
    label.innerHTML = 'Max bitmex reconnects:';
    var edit = document.createElement('input');
    edit.style.width = '80px';
    edit.innerHTML = '';
    var resultLabel = document.createElement('span');

    resultLabel.innerHTML = settingsData.restartSettings.maxBitmexReconnects;
    var setBtn = document.createElement('button');
    setBtn.onclick = function () {
        setBtn.disabled = true;
        const requestData = JSON.stringify({restartSettings: {maxBitmexReconnects: edit.value}});
        console.log(requestData);
        console.log(SETTINGS_URL);
        Http.httpAsyncPost(SETTINGS_URL,
                requestData, function (rawRes) {
                    const res = JSON.parse(rawRes);
                    resultLabel.innerHTML = res.restartSettings.maxBitmexReconnects;
                    setBtn.disabled = false;
                    // alert(rawRes);
                });
    };
    setBtn.innerHTML = 'set';

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(setBtn);
    container.appendChild(resultLabel);
}

function createHedgeSettings(settingsData, SETTINGS_URL) {
    // var container = document.getElementById("hedge-settings");

    const parent = $('#hedge-settings').css('display', 'flex');
    // const mainCont = $('#hedge-settings').css('border', 'solid #555555');
    const mainCont = $('<div/>')
    .css('border', 'solid #555555')
    .css('padding', '3px')
    .css('display', 'block').appendTo(parent);

    /// auto
    const checkboxCont = $('<div/>').appendTo(mainCont);
    const checkbox = $('<input/>').attr('type', 'checkbox').html('auto').appendTo(checkboxCont);
    $('<span/>').html('auto').appendTo(checkboxCont);

    function setCheckBoxState(res) {
        checkbox.attr("checked", res.hedgeAuto);
        if (checkbox.is(":checked")) {
            mainCont.find('*').attr('disabled', true);
        } else {
            mainCont.find('*').attr('disabled', false);
        }
        checkbox.attr('disabled', false);
    }

    checkbox.change(function () {
        checkbox.attr('disabled', true);
        let requestData = JSON.stringify({hedgeAuto: checkbox.is(":checked")});
        console.log(requestData);
        Http.httpAsyncPost(SETTINGS_URL, requestData,
                function (rawResp) {
                    const res = JSON.parse(rawResp);
                    console.log(res.hedgeAuto);
                    setCheckBoxState(res);
                }
        );
    });

    /// BTC
    function addBtcHedge() {
        let btcHedgeName = settingsData.eth ? settingsData.extraSetNameCurrent : settingsData.mainSetNameCurrent;
        let arbMod = arbModArr.find(o => o.val === settingsData.contractModeCurrent);
        const labelName = sprintf('%s, %s, hedge', arbMod.mod, btcHedgeName);
        const cont = $('<div/>').appendTo(mainCont);
        $('<span/>').html(labelName).appendTo(cont); // 'Hedge BTC: '
        const editHedgeBtc = $('<input>').width('80px').appendTo(cont);
        const resLabelHedgeBtc = $('<span/>').html(settingsData.hedgeBtc);
        let updateBtn = $('<button>').text('Update')
        .css('margin-left', '5px').css('margin-right', '5px')
        .click(function () {
            updateBtn.attr('disabled', true);

            let requestData = JSON.stringify({hedgeBtc: editHedgeBtc.val()});
            console.log(requestData);
            Http.httpAsyncPost(SETTINGS_URL, requestData,
                    function (rawResp) {
                        const res = JSON.parse(rawResp);
                        resLabelHedgeBtc.html(res.hedgeBtc);
                        updateBtn.attr('disabled', false);
                    }
            );
        }).appendTo(cont);
        resLabelHedgeBtc.appendTo(cont);
    }

    /// ETH
    function addEthHedge() {
        let ethHedgeName = settingsData.mainSetNameCurrent;
        let arbMod = arbModArr.find(o => o.val === settingsData.contractModeCurrent);
        const labelName = sprintf('%s, %s, hedge', arbMod.mod, ethHedgeName);

        const contEth = $('<div/>').appendTo(mainCont);
        $('<span/>').html(labelName).appendTo(contEth);
        const editHedgeEth = $('<input>').width('80px').appendTo(contEth);
        const resLabelHedgeEth = $('<span/>').html(settingsData.hedgeEth);
        let updateBtnEth = $('<button>').text('Update')
        .css('margin-left', '5px').css('margin-right', '5px')
        .click(function () {
            updateBtnEth.attr('disabled', true);
            let requestData = JSON.stringify({hedgeEth: editHedgeEth.val()});
            console.log(requestData);
            Http.httpAsyncPost(SETTINGS_URL, requestData,
                    function (rawResp) {
                        const res = JSON.parse(rawResp);
                        resLabelHedgeEth.html(res.hedgeEth);
                        updateBtnEth.attr('disabled', false);
                    }
            );
        }).appendTo(contEth);
        resLabelHedgeEth.appendTo(contEth);
    }

    if (settingsData.eth) {
        addEthHedge();
    }
    addBtcHedge();

    setCheckBoxState(settingsData);

    let arbMod = arbModArr.find(o => o.val === settingsData.contractModeCurrent);
    Utils.setDocumentTitle(arbMod.mod.toLowerCase());
}

function createAdjustByNtUsd(cont, SETTINGS_URL, requestCreator, valExtractor, isMain) {
    let container = cont.get(0);
    let label = $('<span>').text('Adjust by nt_usd on the fly');

    let checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    mobx.autorun(function () {
        checkbox.checked = valExtractor(allSettings);
        if (isActiveV('adjustByNtUsd')) {
            label.css('font-weight', 'bold').prop('title', 'Activated VOLATILE mode');
            cont.css('font-weight', 'bold').prop('title', 'Activated VOLATILE mode');
            if (isMain) {
                checkbox.disabled = true;
            }
        } else {
            label.css('font-weight', 'normal').prop('title', '');
            cont.css('font-weight', 'normal').prop('title', '');
            if (isMain) {
                checkbox.disabled = false;
            }
        }
    });

    checkbox.id = "adjust-by-nt-usd-checkbox";
    checkbox.onchange = function (ev) {
        checkbox.disabled = true;

        const requestData = JSON.stringify(requestCreator(checkbox.checked));
        console.log(requestData);
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (rawRes) {
            setAllSettingsRaw(rawRes);
            checkbox.disabled = false;
        });
    };

    // label.appendChild(document.createTextNode('Adjust by nt_usd on the fly'));

    container.appendChild(checkbox);
    container.appendChild(label.get(0));
}

function createNtUsdMultiplicityOkex(settingsData, SETTINGS_URL) {
    const $cont = $('#nt-usd-multiplicity-okex');

    let label = $('<span>').html('nt_usd_multiplicity_okex').appendTo($cont);
    let edit = $('<input>').width('60px').appendTo($cont);
    let updateBtn = $('<button>').text('set')
    .css('margin-right', '5px').appendTo($cont);
    let resLabel = $('<span>').html(settingsData.ntUsdMultiplicityOkex).appendTo($cont);

    updateBtn.click(function () {
        updateBtn.attr('disabled', true);
        let requestData = JSON.stringify({ntUsdMultiplicityOkex: edit.val()});
        console.log(requestData);
        Http.httpAsyncPost(SETTINGS_URL, requestData,
                function (rawResp) {
                    const res = JSON.parse(rawResp);
                    resLabel.html(res.ntUsdMultiplicityOkex);
                    updateBtn.attr('disabled', false);
                }
        );
    });

    label.prop('title', ('Samples:\n'
            + '    nt=237.65, mult=100 ==> 200\n'
            + '    nt=237.65, mult=10  ==> 230\n'
            + '    nt=237.65, mult=20  ==> 220\n'
            + '    nt=237.65, mult=1   ==> 237\n'
            + '    nt=237.65, mult=0   ==> 237.65\n'
            + '    nt=237.65, mult=-1  ==> 237.65\n'
            + '    nt=237.65, mult=-12 ==> 237.65\n'
            + '    nt=237.65, mult=-100==> 237.65\n'
    ));

}
