'use strict';

var $ = require('jquery');
var Http = require('../http');
var Utils = require('../utils');

var exports = module.exports = {};

exports.showArbVersion = function (firstMarketName, secondMarketName, baseUrl) {
    const SETTINGS_URL = baseUrl + '/settings/all';

    Http.httpAsyncGet(SETTINGS_URL, function (rawData) {
        let settingsData = JSON.parse(rawData);

        // Arb version
        var container = document.getElementById("select-arb-version");
        createVerDropdown(container, settingsData.arbScheme, SETTINGS_URL);

        var bitmexPlacingCont = document.getElementById("bitmex-placing-type");
        createBitmexPlacingType(bitmexPlacingCont, settingsData.bitmexPlacingType, SETTINGS_URL);

        var okexPlacingCont = document.getElementById("okex-placing-type");
        createOkexPlacingType(okexPlacingCont, settingsData.okexPlacingType, SETTINGS_URL);

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

        createSignalDelay(settingsData, SETTINGS_URL);

        // createColdStorage(settingsData, SETTINGS_URL);

        createUsdQuoteType(settingsData, SETTINGS_URL);

        createOkFutureContractType(settingsData, SETTINGS_URL);
    });
};

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
            requestData, function(result) {
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

function createOkexPlacingType(mainContainer, ver, SETTINGS_URL) {
    var select = document.createElement('select');
    var option1 = document.createElement('option');
    var option2 = document.createElement('option');
    var option3 = document.createElement('option');
    option1.setAttribute("value", "TAKER");
    option2.setAttribute("value", "MAKER");
    option3.setAttribute("value", "HYBRID");
    option1.innerHTML = 'TAKER';
    option2.innerHTML = 'MAKER';
    option3.innerHTML = 'HYBRID';
    select.appendChild(option1);
    select.appendChild(option2);
    select.appendChild(option3);
    select.addEventListener("change", onVerPick);
    select.value = ver;

    mainContainer.appendChild(select);

    function onVerPick() {
        const requestData = JSON.stringify({okexPlacingType: this.value});

        Http.httpAsyncPost(SETTINGS_URL,
                           requestData, function(result) {
                let data = JSON.parse(result);
                alert('New value: ' + data.okexPlacingType);
            });
    }
}

function createBitmexPlacingType(mainContainer, ver, SETTINGS_URL) {
    var select = document.createElement('select');
    var option1 = document.createElement('option');
    var option2 = document.createElement('option');
    option1.setAttribute("value", "TAKER");
    option2.setAttribute("value", "MAKER");
    option1.innerHTML = 'TAKER';
    option2.innerHTML = 'MAKER';
    select.appendChild(option1);
    select.appendChild(option2);
    select.addEventListener("change", onVerPick);
    select.value = ver;

    mainContainer.appendChild(select);

    function onVerPick() {
        const requestData = JSON.stringify({bitmexPlacingType: this.value});

        Http.httpAsyncPost(SETTINGS_URL,
                           requestData, function(result) {
                let data = JSON.parse(result);
                alert('New value: ' + data.bitmexPlacingType);
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
        if (checkbox.checked) $('#limits-status').css("text-decoration", "line-through");
        else $('#limits-status').css("text-decoration", "initial");
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

function createSignalDelay(settingsData, SETTINGS_URL) {
    var container = document.getElementById("signal-delay");

    var label = document.createElement('span');
    label.innerHTML = 'Signal delay (ms):';
    var edit = document.createElement('input');
    edit.style.width = '80px';
    edit.innerHTML = '';
    // var resultLabel = document.createElement('span');
    // resultLabel.innerHTML = settingsData.signalDelayMs;
    var setBtn = document.createElement('button');
    setBtn.onclick = function () {
        setBtn.disabled = true;
        const requestData = JSON.stringify({signalDelayMs: edit.value});
        console.log(requestData);
        Http.httpAsyncPost(SETTINGS_URL,
                requestData, function (rawRes) {
                    const res = JSON.parse(rawRes);
                    // resultLabel.innerHTML = res.signalDelayMs;
                    setBtn.disabled = false;
                    // alert(rawRes);
                });
    };
    setBtn.innerHTML = 'set';

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(setBtn);
    // container.appendChild(resultLabel);
}

function createColdStorage(settingsData, SETTINGS_URL) {
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
        Http.httpAsyncPost(SETTINGS_URL,
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

function createOkFutureContractType(settingsData, SETTINGS_URL) {
    var arr = [
        'BTC_ThisWeek',
        'BTC_Quarter',
        'ETH_ThisWeek',
        'ETH_Quarter',
    ];
    const label = $('<span/>', {title: 'Type by contract delivery time'}).html('Okex future contract type: ');
    const select = $('<select/>').html($.map(arr, function (item) {
        return $('<option/>', {value: item, text: item});
    })).val(settingsData.okexContractType);
    select.on('change', onVerPick);

    const warnLabel = $('<span/>').css('color', 'red');

    function updateWarning(data) {
        warnLabel.html(data.okexContractType === data.okexContractTypeCurrent ? ''
                : 'warning: to apply the changes restart is needed');
    }

    updateWarning(settingsData);

    $("#okex-contract-type").append(label).append(select).append(warnLabel);

    function onVerPick() {
        console.log(this.value);
        const requestData = JSON.stringify({okexContractType: this.value});

        Http.httpAsyncPost(SETTINGS_URL,
                requestData, function (result) {
                    let data = JSON.parse(result);
                    updateWarning(data);
                    alert('New value: ' + data.okexContractType);
                });
    }

}
