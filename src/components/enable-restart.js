'use strict';

var Http = require('../http');
var sprintf = require('sprintf-js').sprintf;

const settingsStore = require('../store/settings-store');

var exports = module.exports = {};

exports.showRestartEnable = function (baseUrl) {

    const SETTINGS_URL = baseUrl + '/settings/all';

    var container = document.getElementById("restart-div");

    createRestartDiv(container, settingsStore.allSettings, SETTINGS_URL);
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
