'use strict';

var Http = require('../http');
const settingsStore = require('../store/settings-store');
let enableRestart = require('../components/enable-restart');

var exports = module.exports = {};

exports.showPlacingBlocksVersion = function (baseUrl) {
    const SETTINGS_URL = baseUrl + '/settings/all';

    Http.httpAsyncGet(SETTINGS_URL, function (rawData) {
        let settingsData = JSON.parse(rawData);

        var container = document.getElementById("placing-blocks");
        let fixedCont = document.createElement('div');
        let dynCont = document.createElement('div');
        let posAdjCont = document.createElement('div');
        let posAdjTypeCont = document.createElement('div');

        createVerDropdown(container, settingsData.placingBlocks, SETTINGS_URL, fixedCont, dynCont);

        container.appendChild(fixedCont);
        container.appendChild(dynCont);
        container.appendChild(document.createElement('p'));
        container.appendChild(posAdjCont);
        container.appendChild(posAdjTypeCont);
        createFixedBlocks(fixedCont, settingsData, SETTINGS_URL);
        createDynamicBlocks(dynCont, settingsData, SETTINGS_URL);
        createPosAdjustment(posAdjCont, settingsData, SETTINGS_URL);
        createPosAdjustmentPlacingType(posAdjTypeCont, settingsData, SETTINGS_URL);

        // TODO move it to the end. Using options
        // 1) data-binding with vanilla js https://namitamalik.github.io/2-way-data-binding-in-Plain-Vanilla-JavaScript/
        // 2) mobx for store ?
        // 3) vue binding + vuex store ?
        settingsStore.allSettings.setRestartEnabled(settingsData.restartEnabled);
        settingsStore.allSettings.setRestartSettings(settingsData.restartSettings);
        enableRestart.showRestartEnable(baseUrl);
    });
};

exports.updateBlocks = function (bl) {
    var fixedBlocks = document.getElementById("fixedBlocks");
    fixedBlocks.innerHTML = bl.fixedBlockOkex + ', fixedBlockBitmex:' + bl.fixedBlockBitmex;

    var dynBlocks = document.getElementById("dynBlocks");
    dynBlocks.innerHTML = bl.dynMaxBlockOkex + ', dynMaxBlockBitmex:' + bl.dynMaxBlockBitmex;

    var posAdjustment = document.getElementById("posAdjustmentId");
    posAdjustment.innerHTML = bl.posAdjustment;
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
    realValue.setAttribute('id', 'fixedBlocks');
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
    realValue.setAttribute('id', 'dynBlocks');
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

function createPosAdjustment(container, settingsData, SETTINGS_URL) {
    let label = document.createElement('span');
    label.innerHTML = 'posAdjustment: ';
    let edit = document.createElement('input');
    edit.innerHTML = '';
    let updateBtn = document.createElement('button');
    updateBtn.onclick = onBtnClick;
    updateBtn.innerHTML = 'update';
    let realValue = document.createElement('span');
    realValue.setAttribute('id', 'posAdjustmentId');
    let bl = settingsData.placingBlocks;
    realValue.innerHTML = bl.posAdjustment;

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(updateBtn);
    container.appendChild(realValue);

    function onBtnClick() {
        const requestData = JSON.stringify({placingBlocks: {posAdjustment: edit.value}});
        updateBtn.disabled = true;
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
            let data = JSON.parse(result);
            let bl = data.placingBlocks;
            realValue.innerHTML = bl.posAdjustment;
            updateBtn.disabled = false;
        });
    }
}

function createPosAdjustmentPlacingType(mainContainer, settingsData, SETTINGS_URL) {
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
    select.value = settingsData.placingBlocks.posAdjustmentPlacingType;

    let label = document.createElement('span');
    label.innerText = 'posAdjustment placing type: ';
    mainContainer.appendChild(label );
    mainContainer.appendChild(select);

    function onVerPick() {
        const requestData = JSON.stringify({placingBlocks: {posAdjustmentPlacingType: this.value}});

        Http.httpAsyncPost(SETTINGS_URL,
                requestData, function(result) {
                    let data = JSON.parse(result);
                    alert('New value: ' + data.placingBlocks.posAdjustmentPlacingType);
                });
    }
}
