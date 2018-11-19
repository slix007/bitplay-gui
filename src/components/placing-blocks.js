'use strict';

var Http = require('../http');
var $ = require('jquery');
var sprintf = require('sprintf-js').sprintf;
const {mobxStore, allSettings} = require('../store/settings-store');

let enableRestart = require('../components/enable-restart');

var exports = module.exports = {};

var updateBlocks = function (bl) {
    $('#fixedBlocks')
    .prop('title', sprintf('cm=%s, isEth=%s', bl.cm, bl.eth))
    .text(sprintf('%susd (bitmex=%scont, okex=%scont)', bl.fixedBlockUsd, bl.fixedBlockBitmex, bl.fixedBlockOkex));
    $('#dynBlocks')
    .prop('title', sprintf('cm=%s, isEth=%s', bl.cm, bl.eth))
    .text(sprintf('%susd (bitmex=%scont, okex=%scont)', bl.fixedBlockUsd, bl.dynMaxBlockBitmex, bl.dynMaxBlockOkex));
};

exports.updateBlocks = updateBlocks;

exports.showPlacingBlocksVersion = function (baseUrl) {
    const SETTINGS_URL = baseUrl + '/settings/all';
    mobxStore.baseUrl = baseUrl;

    Http.httpAsyncGet(SETTINGS_URL, function (rawData) {
        let settingsData = JSON.parse(rawData);

        var container = document.getElementById("placing-blocks");
        let fixedCont = document.createElement('div');
        let dynCont = document.createElement('div');

        createVerDropdown(container, settingsData.placingBlocks, SETTINGS_URL, fixedCont, dynCont);

        container.appendChild(fixedCont);
        container.appendChild(dynCont);
        container.appendChild(document.createElement('p'));
        createFixedBlocks(fixedCont, settingsData, SETTINGS_URL);
        createDynamicBlocks(dynCont, settingsData, SETTINGS_URL);
        updateBlocks(settingsData.placingBlocks);

        // TODO move it to the end. Using options
        // 1) data-binding with vanilla js https://namitamalik.github.io/2-way-data-binding-in-Plain-Vanilla-JavaScript/
        // 2) mobx for store ?
        // 3) vue binding + vuex store ?
        allSettings.setRestartEnabled(settingsData.restartEnabled);
        allSettings.setRestartSettings(settingsData.restartSettings);
        enableRestart.showRestartEnable(baseUrl);
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
    label.innerHTML = 'fixedBlock_usd';
    let edit = document.createElement('input');
    edit.innerHTML = '';
    let updateBtn = document.createElement('button');
    updateBtn.onclick = onBtnClick;
    updateBtn.innerHTML = 'update';
    let realValue = document.createElement('span');
    realValue.setAttribute('id', 'fixedBlocks');

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(updateBtn);
    container.appendChild(realValue);

    function onBtnClick() {
        const requestData = JSON.stringify({placingBlocks: {fixedBlockUsd: edit.value}});
        updateBtn.disabled = true;
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
            let data = JSON.parse(result);
            let bl = data.placingBlocks;
            updateBlocks(bl);
            updateBtn.disabled = false;
        });
    }
}

function createDynamicBlocks(container, settingsData, SETTINGS_URL) {
    let label = document.createElement('span');
    label.innerHTML = 'dynMaxBlock_usd';
    let edit = document.createElement('input');
    edit.innerHTML = '';
    let updateBtn = document.createElement('button');
    updateBtn.onclick = onBtnClick;
    updateBtn.innerHTML = 'update';
    let realValue = document.createElement('span');
    realValue.setAttribute('id', 'dynBlocks');

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(updateBtn);
    container.appendChild(realValue);

    function onBtnClick() {
        const requestData = JSON.stringify({placingBlocks: {dynMaxBlockUsd: edit.value}});
        updateBtn.disabled = true;
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
            let data = JSON.parse(result);
            let bl = data.placingBlocks;
            updateBlocks(bl);
            updateBtn.disabled = false;
        });
    }
}

