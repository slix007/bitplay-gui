'use strict';

var Http = require('../http');
var sprintf = require('sprintf-js').sprintf;
const settingsStore = require('../store/settings-store');

var URL, bTimestampDelayMax, oTimestampDelayMax;

var exports = module.exports = {};

exports.showRestartEnable = function (baseUrl) {

    const SETTINGS_URL = baseUrl + '/settings/all';

    var container = document.getElementById("restart-div");
    let btnC = document.createElement('div');
    let maxDelayC = document.createElement('div');
    container.appendChild(btnC);
    container.appendChild(maxDelayC);

    createRestartDiv(btnC, settingsStore.allSettings, SETTINGS_URL);
    createMaxTimestampDelay(maxDelayC, settingsStore.allSettings, SETTINGS_URL);

    URL = baseUrl + '/restart-monitoring-params';
    var restMonCont = document.getElementById("restart-monitoring");
    createRestartMonitoringLabels(restMonCont);
};

function createRestartDiv(container, allSettings, SETTINGS_URL) {
    let label = document.createElement('span');
    label.innerHTML = 'Restart enabled: ';
    let realValue = document.createElement('span');
    realValue.innerHTML = allSettings.restartEnabled;

    let updateBtn = document.createElement('button');
    updateBtn.onclick = onBtnClick;
    updateBtn.innerHTML = 'switch';

    container.appendChild(label);
    container.appendChild(realValue);
    container.appendChild(updateBtn);

    function onBtnClick() {
        const requestData = JSON.stringify({restartEnabled: !allSettings.restartEnabled});
        updateBtn.disabled = true;
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
            let data = JSON.parse(result);
            settingsStore.allSettings.restartEnabled = data.restartEnabled;
            realValue.innerHTML = data.restartEnabled;
            updateBtn.disabled = false;
        });
    }
}

function createMaxTimestampDelay(container, allSettings, SETTINGS_URL) {
    let label = document.createElement('span');
    label.innerHTML = 'Max timestamp delay: ';
    let realValue = document.createElement('span');
    realValue.innerHTML = allSettings.restartSettings.maxTimestampDelay;

    let inputBox = document.createElement('input');

    let updateBtn = document.createElement('button');
    updateBtn.onclick = onBtnClick;
    updateBtn.innerHTML = 'set';

    container.appendChild(label);
    container.appendChild(inputBox);
    container.appendChild(updateBtn);
    container.appendChild(realValue);

    function onBtnClick() {
        const requestData = JSON.stringify({restartSettings: {maxTimestampDelay: inputBox.value}});
        updateBtn.disabled = true;
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
            let data = JSON.parse(result);
            settingsStore.allSettings.restartSettings.maxTimestampDelay = data.restartSettings.maxTimestampDelay;
            realValue.innerHTML = data.restartSettings.maxTimestampDelay;
            updateBtn.disabled = false;
        });
    }
}
// ====================

function createRestartMonitoringLabels(container) {
    bTimestampDelayMax = document.createElement('div');
    bTimestampDelayMax.innerHTML = 'bTimestampDelayMax: ';
    oTimestampDelayMax = document.createElement('div');
    oTimestampDelayMax.innerHTML = 'oTimestampDelayMax: ';

    let resetBtn = document.createElement('button');
    resetBtn.onclick = onBtnClick;
    resetBtn.innerHTML = 'reset';

    container.appendChild(bTimestampDelayMax);
    container.appendChild(oTimestampDelayMax);
    container.appendChild(resetBtn);

    function onBtnClick() {
        console.log('reset RestartMonitoring');
        const requestData = JSON.stringify({});
        resetBtn.disabled = true;
        Http.httpAsyncPost(URL, requestData, function (result) {
            let data = JSON.parse(result);
            fillRestartMonitoringLabels(data);
            resetBtn.disabled = false;
        });
    }
}

function fillRestartMonitoringLabels(data) {
    bTimestampDelayMax.innerHTML = 'bTimestampDelayMax: ' + data.btmDeltaMax;
    oTimestampDelayMax.innerHTML = 'oTimestampDelayMax: ' + data.okDeltaMax;
}


var updateMonitorFunction = function () {
    Http.httpAsyncGet(URL, function (rawData) {
        let data = JSON.parse(rawData);
        fillRestartMonitoringLabels(data);
    });
};

setInterval(updateMonitorFunction, 1000);