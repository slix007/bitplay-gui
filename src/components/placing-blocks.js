'use strict';

var Http = require('../http');

var exports = module.exports = {};

exports.showPlacingBlocksVersion = function (baseUrl) {
    const SETTINGS_URL = baseUrl + '/settings/all';

    Http.httpAsyncGet(SETTINGS_URL, function (rawData) {
        let settingsData = JSON.parse(rawData);

        var container = document.getElementById("placing-blocks");
        let fixedCont = document.createElement('div');
        let dynCont = document.createElement('div');

        createVerDropdown(container, settingsData.placingBlocks, SETTINGS_URL, fixedCont, dynCont);

        container.appendChild(fixedCont);
        container.appendChild(dynCont);
        createFixedBlocks(fixedCont, settingsData, SETTINGS_URL);
        createDynamicBlocks(dynCont, settingsData, SETTINGS_URL);
    });
};

function createVerDropdown(container, placingBlocks, SETTINGS_URL, fixedCont, dynCont) {

    let select = document.createElement('select');
    let option1 = document.createElement('option');
    let option2 = document.createElement('option');
    option1.setAttribute("value", "FIXED");
    option2.setAttribute("value", "DYNAMIC");
    option1.innerHTML = 'FIXED';
    option2.innerHTML = 'DYNAMIC';
    select.appendChild(option1);
    select.appendChild(option2);
    select.addEventListener("change", onVerPick);
    select.value = placingBlocks.activeVersion;
    highlightActive(placingBlocks.activeVersion, fixedCont, dynCont);

    container.appendChild(select);

    function onVerPick() {
        const requestData = JSON.stringify({placingBlocks: {activeVersion: this.value}});

        Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
            let data = JSON.parse(result);
            highlightActive(data.placingBlocks.activeVersion, fixedCont, dynCont);
            alert('New value: ' + data.placingBlocks.activeVersion);
        });
    }
}

function highlightActive(activeVersion, fixedCont, dynCont) {
    if (activeVersion === 'FIXED') {
        fixedCont.style.color = "black";
        dynCont.style.color = "grey";
    } else {
        fixedCont.style.color = "grey";
        dynCont.style.color = "black";
    }
}

function createFixedBlocks(container, settingsData, SETTINGS_URL) {
    let label = document.createElement('span');
    label.innerHTML = 'fixedBlockOkex';
    let edit = document.createElement('input');
    edit.innerHTML = '';
    let updateBtn = document.createElement('button');
    updateBtn.onclick = onBtnClick;
    updateBtn.innerHTML = 'update';
    let realValue = document.createElement('span');
    let bl = settingsData.placingBlocks;
    realValue.innerHTML = bl.fixedBlockOkex + ', fixedBlockBitmex:' + bl.fixedBlockBitmex;

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(updateBtn);
    container.appendChild(realValue);

    function onBtnClick() {
        const requestData = JSON.stringify({placingBlocks: {fixedBlockOkex: edit.value}});
        updateBtn.disabled = true;
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
            let data = JSON.parse(result);
            let bl = data.placingBlocks;
            realValue.innerHTML = bl.fixedBlockOkex + ', fixedBlockBitmex:' + bl.fixedBlockBitmex;
            updateBtn.disabled = false;
        });
    }
}

function createDynamicBlocks(container, settingsData, SETTINGS_URL) {
    let label = document.createElement('span');
    label.innerHTML = 'dynMaxBlockOkex';
    let edit = document.createElement('input');
    edit.innerHTML = '';
    let updateBtn = document.createElement('button');
    updateBtn.onclick = onBtnClick;
    updateBtn.innerHTML = 'update';
    let realValue = document.createElement('span');
    let bl = settingsData.placingBlocks;
    realValue.innerHTML = bl.dynMaxBlockOkex + ', dynMaxBlockBitmex:' + bl.dynMaxBlockBitmex;

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(updateBtn);
    container.appendChild(realValue);

    function onBtnClick() {
        const requestData = JSON.stringify({placingBlocks: {dynMaxBlockOkex: edit.value}});
        updateBtn.disabled = true;
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
            let data = JSON.parse(result);
            let bl = data.placingBlocks;
            realValue.innerHTML = bl.dynMaxBlockOkex + ', dynMaxBlockBitmex:' + bl.dynMaxBlockBitmex;
            updateBtn.disabled = false;
        });
    }
}

