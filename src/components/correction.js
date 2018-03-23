'use strict';

var Http = require('../http');
var Utils = require('../utils');
var sprintf = require('sprintf-js').sprintf;

var exports = module.exports = {};

exports.showCorr = function (baseUrl) {
    const URL = baseUrl + '/settings/corr';
    const RESET_CORR_URL = baseUrl + '/settings/corr-set-max-error';
    const RESET_PRELIQ_URL = baseUrl + '/settings/corr-set-max-error-preliq';

    Http.httpAsyncGet(URL, function (rawData) {
        let corrParams = JSON.parse(rawData);

        var corrMon = document.getElementById("corr-monitoring");
        var corrCountLabel = createMonitorCounter(corrMon, corrParams);
        var preliqCountLabel = createMonitorPreliqCounter(corrMon, corrParams);

        var main = document.getElementById("correction");
        createResetParam(main, corrParams, 'corr', RESET_CORR_URL, corrCountLabel, preliqCountLabel);
        createResetParam(main, corrParams, 'preliq', RESET_PRELIQ_URL, corrCountLabel, preliqCountLabel);
    });
};

function createResetParam(mainContainer, corrParams, subObject, RESET_URL, corrCountLabel, preliqCountLabel) {
    var container = document.createElement('div');
    mainContainer.appendChild(container);

    var label = document.createElement('span');
    label.innerHTML = 'Max '+ subObject + ' attempts';
    var edit = document.createElement('input');
    edit.style.width = '80px';
    var resultLabel = document.createElement('span');
    let fillResultLabel = function (el, params) {
        if (params[subObject].maxErrorCount <= 0) {
            el.style.color = 'red';
        } else el.style.color = 'black';
        el.innerHTML = sprintf('%s/%s', params[subObject].currErrorCount, params[subObject].maxErrorCount);
    };
    fillResultLabel(resultLabel, corrParams);
    var setBtn = document.createElement('button');
    setBtn.onclick = function () {
        setBtn.disabled = true;
        let requestObj = {command: edit.value};
        const requestData = JSON.stringify(requestObj);
        console.log(requestData);
        Http.httpAsyncPost(RESET_URL, requestData, function (rawRes) {
            const res = JSON.parse(rawRes);
            fillResultLabel(resultLabel, res);
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


