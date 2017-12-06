'use strict';

var Http = require('./http');

var exports = module.exports = {};

exports.showArbVersion = function (firstMarketName, secondMarketName, baseUrl) {
    const SETTINGS_URL = baseUrl + '/settings/all';

    Http.httpAsyncGet(SETTINGS_URL, function (rawData) {
        let settingsData = JSON.parse(rawData);

        var container = document.getElementById("select-arb-version");
        createVerDropdown(container, settingsData.arbScheme, SETTINGS_URL);

        var overloadContainer = document.getElementById("sys-overload-settings");
        createSysOverloadErrors(overloadContainer, settingsData.bitmexSysOverloadArgs, SETTINGS_URL);
        createSysOverloadTime(overloadContainer, settingsData.bitmexSysOverloadArgs, SETTINGS_URL);
        createMovingErrorsResetTimeout(overloadContainer, settingsData.bitmexSysOverloadArgs, SETTINGS_URL);
    });
};

function createVerDropdown(container, ver, ARB_SETTINGS_URL) {

    var select = document.createElement('select');
    var option1 = document.createElement('option');
    var option2 = document.createElement('option');
    var option3 = document.createElement('option');
    option1.setAttribute("value", "MT");
    option2.setAttribute("value", "MT2");
    option3.setAttribute("value", "TT");
    option1.innerHTML = 'MT';
    option2.innerHTML = 'MT2';
    option3.innerHTML = 'TT';
    select.appendChild(option1);
    select.appendChild(option2);
    select.appendChild(option3);
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

function createSysOverloadErrors(mainContainer, obj, SETTINGS_URL) {
    var container = document.createElement('div');
    mainContainer.appendChild(container);

    var label = document.createElement('span');
    label.innerHTML = 'errorsCountForOverload';
    var edit = document.createElement('input');
    edit.innerHTML = '';
    var updateBtn = document.createElement('button');
    updateBtn.onclick = onBtnClick;
    updateBtn.innerHTML = 'update';
    var realValue = document.createElement('span');
    realValue.innerHTML = obj.errorsCountForOverload;

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(updateBtn);
    container.appendChild(realValue);

    function onBtnClick() {
        const requestData = JSON.stringify({bitmexSysOverloadArgs: {errorsCountForOverload: edit.value}});
        updateBtn.disabled = true;
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
            let data = JSON.parse(result);
            realValue.innerHTML = data.bitmexSysOverloadArgs.errorsCountForOverload;
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

function createMovingErrorsResetTimeout(mainContainer, obj, SETTINGS_URL) {
    let container = document.createElement('div');
    mainContainer.appendChild(container);

    let label = document.createElement('span');
    label.innerHTML = 'movingErrorsResetTimeout';
    let edit = document.createElement('input');
    edit.innerHTML = '';
    let updateBtn = document.createElement('button');
    updateBtn.onclick = onBtnClick;
    updateBtn.innerHTML = 'update';
    let realValue = document.createElement('span');
    realValue.innerHTML = obj.movingErrorsResetTimeout;

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(updateBtn);
    container.appendChild(realValue);

    function onBtnClick() {
        const requestData = JSON.stringify({bitmexSysOverloadArgs: {movingErrorsResetTimeout: edit.value}});
        updateBtn.disabled = true;
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
            let data = JSON.parse(result);
            realValue.innerHTML = data.bitmexSysOverloadArgs.movingErrorsResetTimeout;
            updateBtn.disabled = false;
        });
    }
}