'use strict';

var Http = require('../http');
var Utils = require('../utils');
var sprintf = require('sprintf-js').sprintf;

var exports = module.exports = {};

exports.showCorr = function (baseUrl) {
    const URL = baseUrl + '/settings/corr';
    const RESET_URL = baseUrl + '/settings/corr-set-max-error';

    Http.httpAsyncGet(URL, function (rawData) {
        let corrParams = JSON.parse(rawData);

        var corrMon = document.getElementById("corr-monitoring");
        var corrCountLabel = createMonitorCounter(corrMon, corrParams, RESET_URL);

        var main = document.getElementById("correction");
        createResetParam(main, corrParams, RESET_URL, corrCountLabel);
    });
};

function createResetParam(mainContainer, corrParams, RESET_URL, corrCountLabel) {
    var container = document.createElement('div');
    mainContainer.appendChild(container);

    var label = document.createElement('span');
    label.innerHTML = 'Max corr attempts';
    var edit = document.createElement('input');
    edit.style.width = '80px';
    // edit.value = corrParams.corrError.maxErrorAmount;
    var resultLabel = document.createElement('span');
    let fillResultLabel = function (el, params) {
        if (params.corrError.maxErrorAmount <= 0) {
            el.style.color = 'red';
        } else el.style.color = 'black';
        el.innerHTML = sprintf('%s/%s', params.corrError.currentErrorAmount, params.corrError.maxErrorAmount);
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

function setCorrCount(label, corrParams) {
    let count = corrParams.corrCount1 + corrParams.corrCount2;
    label.innerHTML = 'Corrections: ' + count;
}


