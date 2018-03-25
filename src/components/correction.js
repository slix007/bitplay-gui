'use strict';

var Http = require('../http');
var Utils = require('../utils');
var sprintf = require('sprintf-js').sprintf;

var exports = module.exports = {};

var URL, corrCountLabel, preliqCountLabel;
var errorLables = {};

exports.showCorr = function (baseUrl) {
    URL = baseUrl + '/settings/corr';
    const RESET_CORR_URL = baseUrl + '/settings/corr-set-max-error';
    const RESET_PRELIQ_URL = baseUrl + '/settings/corr-set-max-error-preliq';

    Http.httpAsyncGet(URL, function (rawData) {
        let corrParams = JSON.parse(rawData);

        var corrMon = document.getElementById("corr-monitoring");
        corrCountLabel = createMonitorCounter(corrMon, corrParams);
        preliqCountLabel = createMonitorPreliqCounter(corrMon, corrParams);

        var main = document.getElementById("correction");
        createResetParam(main, corrParams, 'corr', RESET_CORR_URL, corrCountLabel, preliqCountLabel);
        createResetParam(main, corrParams, 'preliq', RESET_PRELIQ_URL, corrCountLabel, preliqCountLabel);
        createSetPreliqBlock(main, corrParams, URL, corrCountLabel, preliqCountLabel);
    });
};

function createResetParam(mainContainer, corrParams, subObject, RESET_URL, corrCountLabel, preliqCountLabel) {
    var container = document.createElement('div');
    mainContainer.appendChild(container);

    var label = document.createElement('span');
    label.innerHTML = subObject + ' errors';
    var edit = document.createElement('input');
    edit.style.width = '80px';
    errorLables[subObject] = document.createElement('span');
    fillResultLabel(subObject, errorLables[subObject], corrParams);
    var setBtn = document.createElement('button');
    setBtn.onclick = function () {
        setBtn.disabled = true;
        let requestObj = {command: edit.value};
        const requestData = JSON.stringify(requestObj);
        console.log(requestData);
        Http.httpAsyncPost(RESET_URL, requestData, function (rawRes) {
            const res = JSON.parse(rawRes);
            fillResultLabel(subObject, errorLables[subObject], res);
            setCorrCount(corrCountLabel, res);
            setPreliqCount(preliqCountLabel, res);
            setBtn.disabled = false;
            // alert(rawRes);
        });
    };
    setBtn.innerHTML = 'set max';

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(setBtn);
    container.appendChild(errorLables[subObject]);
}

function createSetPreliqBlock(mainContainer, corrParams, URL, corrCountLabel, preliqCountLabel) {
    var container = document.createElement('div');
    mainContainer.appendChild(container);

    var label = document.createElement('span');
    label.innerHTML = 'Preliq okexBlock';
    var edit = document.createElement('input');
    edit.style.width = '80px';
    var resultLabel = document.createElement('span');
    resultLabel.innerHTML = corrParams.preliq.preliqBlockOkex + ' (bitmexBlock=' + corrParams.preliq.preliqBlockOkex * 100 + ')';
    var setBtn = document.createElement('button');
    setBtn.onclick = function () {
        setBtn.disabled = true;
        let requestObj = {preliq: {preliqBlockOkex: edit.value}};
        const requestData = JSON.stringify(requestObj);
        console.log(requestData);
        Http.httpAsyncPost(URL, requestData, function (rawRes) {
            const res = JSON.parse(rawRes);
            resultLabel.innerHTML = res.preliq.preliqBlockOkex + ' (bitmexBlock=' + res.preliq.preliqBlockOkex * 100 + ')';
            setCorrCount(corrCountLabel, res);
            setPreliqCount(preliqCountLabel, res);
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

function fillResultLabel(subObject, el, params) {
    if (params[subObject].maxErrorCount <= 0) {
        el.style.color = 'red';
    } else {
        el.style.color = 'black';
    }
    el.innerHTML = sprintf('%s/%s', params[subObject].currErrorCount, params[subObject].maxErrorCount);
}

function createMonitorCounter(corrMon, corrParams) {
    var container = document.createElement('div');
    corrMon.appendChild(container);

    var label = document.createElement('span');
    setCorrCount(label, corrParams);

    container.appendChild(label);
    return label;
}

function createMonitorPreliqCounter(corrMon, corrParams) {
    var container = document.createElement('div');
    corrMon.appendChild(container);

    var label = document.createElement('span');
    setPreliqCount(label, corrParams);

    container.appendChild(label);
    return label;
}

function setCorrCount(label, corrParams) {
    let succeedCount = corrParams.corr.succeedCount;
    let failedCount = corrParams.corr.failedCount;
    label.innerHTML = sprintf('Corrections success/fail: %s/%s', succeedCount, failedCount);
}

function setPreliqCount(label, corrParams) {
    let succeedCount = corrParams.preliq.succeedCount;
    let failedCount = corrParams.preliq.failedCount;
    label.innerHTML = sprintf('Preliq success/fail: %s/%s', succeedCount, failedCount);
}

var updateMonitorFunction = function () {
    Http.httpAsyncGet(URL, function (rawData) {
        let res = JSON.parse(rawData);
        fillResultLabel('corr', errorLables.corr, res);
        fillResultLabel('preliq', errorLables.preliq, res);
        setCorrCount(corrCountLabel, res);
        setPreliqCount(preliqCountLabel, res);
    });
};

setInterval(updateMonitorFunction, 1000);


