'use strict';

var Http = require('../http');
var Utils = require('../utils');
var $ = require('jquery');

var exports = module.exports = {};

exports.show = function (baseUrl) {
    const SETTINGS_URL = baseUrl + '/settings/all';

    Http.httpAsyncGet(SETTINGS_URL, function (rawData) {
        let settingsData = JSON.parse(rawData);

        var container = document.getElementById("pos-adjustment");
        let posAdjTypeCont = document.createElement('div');
        container.appendChild(posAdjTypeCont);
        createPosAdjustmentPlacingType(posAdjTypeCont, settingsData, SETTINGS_URL);
        createNumberValue(container, settingsData, SETTINGS_URL, 'posAdjustmentMin');
        createNumberValue(container, settingsData, SETTINGS_URL, 'posAdjustmentMax');
        createNumberValue(container, settingsData, SETTINGS_URL, 'posAdjustmentDelaySec');

        createNumberValue(container, settingsData, SETTINGS_URL, 'corrDelaySec');
        createNumberValue(container, settingsData, SETTINGS_URL, 'preliqDelaySec');

    });
};

exports.updateAll = function (bl) {
    let min = document.getElementById("posAdjustmentMin-id");
    min.innerHTML = bl.posAdjustmentMin;
    let max = document.getElementById("posAdjustmentMax-id");
    max.innerHTML = bl.posAdjustmentMax;
    let delay= document.getElementById("posAdjustmentDelaySec-id");
    delay.innerHTML = bl.posAdjustmentDelaySec;
    let corrDelaySec = document.getElementById("corrDelaySec-id");
    corrDelaySec.innerHTML = bl.corrDelaySec;
};

function createPosAdjustmentPlacingType(parentCont, settingsData, SETTINGS_URL) {
    let mainContainer = document.createElement('div');
    parentCont.appendChild(mainContainer);

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
    select.value = settingsData.posAdjustment.posAdjustmentPlacingType;

    let label = document.createElement('span');
    label.innerText = 'posAdjustment placing type: ';
    mainContainer.appendChild(label);
    mainContainer.appendChild(select);

    function onVerPick() {
        const requestData = JSON.stringify({posAdjustment: {posAdjustmentPlacingType: this.value}});

        Http.httpAsyncPost(SETTINGS_URL,
                requestData, function (result) {
                    let data = JSON.parse(result);
                    alert('New value: ' + data.posAdjustment.posAdjustmentPlacingType);
                });
    }
}

function createNumberValue(parentCont, settingsData, SETTINGS_URL, name) {
    let container = document.createElement('div');
    parentCont.appendChild(container);

    let label = document.createElement('span');
    label.innerHTML = name + ': ';
    let edit = document.createElement('input');
    edit.innerHTML = '';
    let updateBtn = document.createElement('button');
    updateBtn.onclick = onBtnClick;
    updateBtn.innerHTML = 'update';
    let realValue = document.createElement('span');
    realValue.setAttribute('id', name + '-id');
    let bl = settingsData.posAdjustment;
    realValue.innerHTML = bl[name];

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(updateBtn);
    container.appendChild(realValue);

    function onBtnClick() {
        const requestData = '{"posAdjustment": {"' + name + '": "' + edit.value + '"}}';
        updateBtn.disabled = true;
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
            let data = JSON.parse(result);
            let bl = data.posAdjustment;
            realValue.innerHTML = bl[name];
            updateBtn.disabled = false;
        });
    }
}
