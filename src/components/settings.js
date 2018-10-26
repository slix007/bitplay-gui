'use strict';

var $ = require('jquery');
var Http = require('../http');
var Utils = require('../utils');
var sprintf = require('sprintf-js').sprintf;

var exports = module.exports = {};

exports.showArbVersion = function (firstMarketName, secondMarketName, baseUrl) {
    const SETTINGS_URL = baseUrl + '/settings/all';
    const SETTINGS_ADMIN_URL = baseUrl + '/settings/all-admin';

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

        createColdStorage(settingsData, SETTINGS_ADMIN_URL);
        createEBestMin(settingsData, SETTINGS_ADMIN_URL);

        createUsdQuoteType(settingsData, SETTINGS_URL);

        createContractModes(settingsData, SETTINGS_URL);
        createHedgeSettings(settingsData, SETTINGS_URL);

        maxBitmexReconnects(settingsData, SETTINGS_URL);

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
    {val: 'MODE3_SET_BU23', txt: 'M20: set_bu23', info: set_bu23, mod: "M23", mainSet: "set_bu23"},
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


}