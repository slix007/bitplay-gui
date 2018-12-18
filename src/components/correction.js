'use strict';

let $ = require('jquery');
let Http = require('../http');
let utils = require('../utils');
let sprintf = require('sprintf-js').sprintf;
let mobx = require('mobx');
const {mobxStore} = require('../store/settings-store');

var exports = module.exports = {};

var URL, corrCountLabel, adjCountLabel, preliqCountLabel;

exports.showCorr = function (baseUrl) {
    URL = baseUrl + '/settings/corr';
    const RESET_CORR_URL = baseUrl + '/settings/corr/reset';


    Http.httpAsyncGet(URL, function (rawData) {
        let corrParams = JSON.parse(rawData);

        var corrMon = document.getElementById("corr-monitoring");
        corrCountLabel = createMonitorCounter(corrMon, corrParams, 'corr');
        adjCountLabel = createMonitorCounter(corrMon, corrParams, 'adj');
        preliqCountLabel = createMonitorCounter(corrMon, corrParams, 'preliq');
        createResetBtn(corrMon, RESET_CORR_URL);

        var main = document.getElementById("correction");

        createSetParam(main, URL, 'corr max attempts', corrParams, 'corr', 'maxErrorCount');
        createSetParam(main, URL, 'corr max total', corrParams, 'corr', 'maxTotalCount');
        createSetParamBlockUsd(main, URL, 'corr/adj maxBlock_usd', corrParams, 'corr', 'maxVolCorrUsd');

        var mainPreliq = document.getElementById("preliq");
        createSetParam(mainPreliq, URL, 'preliq max attempts', corrParams, 'preliq', 'maxErrorCount');
        createSetParam(mainPreliq, URL, 'preliq max total', corrParams, 'preliq', 'maxTotalCount');
        createSetParamBlockUsdPreliq(mainPreliq, URL,corrParams);

        var mainAdj = document.getElementById("pos-adj-params");

        createSetParam(mainAdj, URL, 'adj max attempts', corrParams, 'adj', 'maxErrorCount');
        createSetParam(mainAdj, URL, 'adj max total', corrParams, 'adj', 'maxTotalCount');

    });
};

function createResetBtn(mainContainer, RESET_URL) {
    var container = document.createElement('div');
    $(mainContainer).append(container);

    var setBtn = document.createElement('button');
    setBtn.innerHTML = 'Reset corr/preliq';
    $(setBtn).click(function () {
        setBtn.disabled = true;
        const requestData = JSON.stringify({command: 'reset corr/preliq'});
        console.log(requestData);

        Http.httpAsyncPost(RESET_URL, requestData, function (rawRes) {
            const res = JSON.parse(rawRes);
            console.log(res);
            setMonitoringCount(corrCountLabel, res, 'corr');
            setMonitoringCount(adjCountLabel, res, 'adj');
            setMonitoringCount(preliqCountLabel, res, 'preliq');
            setBtn.disabled = false;
        });

    });
    $(container).append(setBtn);
}

function getCurrTotalCount(corr) {
    if (corr.totalCount !== undefined) {
        return corr.totalCount;
    }
    return (corr.succeedCount + corr.failedCount);
}

function createSetParam(mainContainer, SET_URL, labelVal, paramsObj, paramName1, paramName2) {
    // label, edit, btn, currValLabel - currval, url+currvalObjectPlace
    var container = document.createElement('div');
    // $('#okex-limits-status')
    $(mainContainer).append(container);

    var label = document.createElement('span');
    label.innerHTML = labelVal;
    var edit = document.createElement('input');
    edit.style.width = '80px';
    var currValLabel = document.createElement('span');
    currValLabel.innerHTML = paramsObj[paramName1][paramName2];

    var setBtn = document.createElement('button');
    setBtn.innerHTML = 'set';
    $(setBtn).click(function () {
        setBtn.disabled = true;
        let requestObj = {[paramName1]: {[paramName2]: edit.value}};
        const requestData = JSON.stringify(requestObj);
        console.log(requestData);

        Http.httpAsyncPost(SET_URL, requestData, function (rawRes) {
            const res = JSON.parse(rawRes);
            console.log(res);
            currValLabel.innerHTML = res[paramName1][paramName2];
            setMonitoringCount(corrCountLabel, res, 'corr');
            setMonitoringCount(adjCountLabel, res, 'adj');
            setMonitoringCount(preliqCountLabel, res, 'preliq');

            setBtn.disabled = false;
            // alert(rawRes);
        });

    });
    $(container).append(label, edit, setBtn, currValLabel);
}

function createSetParamBlockUsdPreliq(mainContainer, SET_URL, paramsObj) {
    let paramName1 = 'preliq', paramName2 = 'preliqBlockUsd';
    let labelVal = 'preliq block_usd';
    let resLabel1 = $('<span>');
    mobx.autorun(function () {
        const usd = mobxStore.corrParams[paramName1][paramName2];
        resLabel1.text(sprintf('%susd (b=%scont, o=%scont)',
                usd,
                utils.btmUsdToCont(usd, mobxStore.isEth, mobxStore.cm),
                utils.okUsdToCont(usd, mobxStore.isEth)));
    });

    let cont = $('<div>').appendTo(mainContainer);
    $('<span>').html(labelVal).appendTo(cont);
    const edit = $('<input>').width('80px').appendTo(cont);
    let setBtn = $('<button>').text('set').appendTo(cont);
    setBtn.click(function () {
        setBtn.disabled = true;
        let requestObj = {[paramName1]: {[paramName2]: edit.val()}};
        const requestData = JSON.stringify(requestObj);
        console.log(requestData);

        Http.httpAsyncPost(SET_URL, requestData, function (rawRes) {
            const res = JSON.parse(rawRes);
            mobxStore.corrParams = res;
            setMonitoringCount(corrCountLabel, res, 'corr');
            setMonitoringCount(adjCountLabel, res, 'adj');
            setMonitoringCount(preliqCountLabel, res, 'preliq');

            setBtn.disabled = false;
        });
    });
    resLabel1.appendTo(cont);
    mobxStore.corrParams = paramsObj;
}

function createSetParamBlockUsd(mainContainer, SET_URL, labelVal, paramsObj, paramName1, paramName2) {
    let resLabel1 = $('<span>');
    mobx.autorun(function () {
        utils.btmUsdToContPure();
        const usd = mobxStore.corrParams[paramName1][paramName2];
        resLabel1.text(sprintf('%susd (b=%scont, o=%scont)',
                usd,
                utils.btmUsdToContPure(usd, mobxStore.isEth, mobxStore.cm),
                utils.okUsdToCont(usd, mobxStore.isEth)));
    });

    let cont = $('<div>').appendTo(mainContainer);
    $('<span>').html(labelVal).appendTo(cont);
    const edit = $('<input>').width('80px').appendTo(cont);
    let setBtn = $('<button>').text('set').appendTo(cont);
    setBtn.click(function () {
        setBtn.disabled = true;
        let requestObj = {[paramName1]: {[paramName2]: edit.val()}};
        const requestData = JSON.stringify(requestObj);
        console.log(requestData);

        Http.httpAsyncPost(SET_URL, requestData, function (rawRes) {
            const res = JSON.parse(rawRes);
            mobxStore.corrParams = res;
            setMonitoringCount(corrCountLabel, res, 'corr');
            setMonitoringCount(adjCountLabel, res, 'adj');
            setMonitoringCount(preliqCountLabel, res, 'preliq');

            setBtn.disabled = false;
        });
    });
    resLabel1.appendTo(cont);
    mobxStore.corrParams = paramsObj;
}

function createMonitorCounter(corrMon, corrParams, subParamName) {
    var container = document.createElement('div');
    corrMon.appendChild(container);

    var label = document.createElement('span');
    setMonitoringCount(label, corrParams, subParamName);

    container.appendChild(label);
    return label;
}

function setMonitoringCount(label, corrParams, subParam) {
    const currErrorCount = corrParams[subParam].currErrorCount;
    const maxErrorCount = corrParams[subParam].maxErrorCount;
    const succeedCount = corrParams[subParam].succeedCount;
    const failedCount = corrParams[subParam].failedCount;
    const currTotalCount = getCurrTotalCount(corrParams[subParam]);
    const maxTotalCount = corrParams[subParam].maxTotalCount;
    if (currTotalCount >= maxTotalCount || currErrorCount >= maxErrorCount) {
        label.style.color = 'red';
    } else {
        label.style.color = 'black';
    }

    label.innerHTML = sprintf('%s: Attempts(curr/max): %s/%s. Total(success+fail / totalStarted / max): %s+%s / %s / %s',
            subParam,
            currErrorCount, maxErrorCount,
            succeedCount, failedCount, currTotalCount, maxTotalCount);

}

var updateMonitorFunction = function () {
    if (userInfo === undefined || !userInfo.isAuthorized()) {
        return;
    }
    Http.httpAsyncGet(URL, function (rawData) {
        let res = JSON.parse(rawData);
        setMonitoringCount(corrCountLabel, res, 'corr');
        setMonitoringCount(adjCountLabel, res, 'adj');
        setMonitoringCount(preliqCountLabel, res, 'preliq');
    });
};

setInterval(updateMonitorFunction, 2000);


