'use strict';

var Http = require('../http');
var $ = require('jquery');
var sprintf = require('sprintf-js').sprintf;
const {mobxStore, allSettings, isActiveV, setAllSettingsRaw} = require('../store/settings-store');
const mobx = require('mobx');

var exports = module.exports = {};

var updateBlocks = function (bl) {
    $('#fixedBlocks')
    .prop('title', sprintf('cm=%s, isEth=%s', bl.cm, bl.eth))
    .text(sprintf('%susd (bitmex=%scont, okex=%scont)', bl.fixedBlockUsd, bl.fixedBlockBitmex, bl.fixedBlockOkex));
    $('#dynBlocks')
    .prop('title', sprintf('cm=%s, isEth=%s', bl.cm, bl.eth))
    .text(sprintf('%susd (bitmex=%scont, okex=%scont)', bl.dynMaxBlockUsd, bl.dynMaxBlockBitmex, bl.dynMaxBlockOkex));
};

exports.updateBlocks = updateBlocks;

exports.showPlacingBlocksVersion = function (baseUrl) {
    const SETTINGS_URL = baseUrl + '/settings/all';
    mobxStore.baseUrl = baseUrl;

    let container = document.getElementById("placing-blocks");
    let fixedCont = document.createElement('div');
    let dynCont = document.createElement('div');

    createVerDropdown(container, SETTINGS_URL, fixedCont, dynCont);

    container.appendChild(fixedCont);
    container.appendChild(dynCont);
    container.appendChild(document.createElement('p'));
    createFixedBlocks(fixedCont, SETTINGS_URL);
    createDynamicBlocks(dynCont, SETTINGS_URL);
    mobx.autorun(function () {
        updateBlocks(allSettings.placingBlocks);
    });
};

exports.createPlacingBlocksVolatile = function (container, SETTINGS_URL) {
    // dropdown
    {
        const lb = $('<span>').text('placingBlocks:').appendTo(container);
        let select = $('<select>').appendTo(container);
        select.append($('<option>').val('FIXED').text('FIXED'));
        select.append($('<option>').val('DYNAMIC').text('DYNAMIC'));
        select.change(function () {
            const requestData = JSON.stringify({settingsVolatileMode: {placingBlocks: {activeVersion: this.value}}});
            select.disabled = true;
            Http.httpAsyncPost(SETTINGS_URL, requestData, result => {
                setAllSettingsRaw(result);
                select.disabled = false;
            });
        });
        mobx.autorun(function () {
            select.val(allSettings.settingsVolatileMode.placingBlocks.activeVersion);
            if (isActiveV('placingBlocks')) {
                lb.css('font-weight', 'bold').prop('title', 'Activated VOLATILE mode');
                select.disabled = true;
            } else {
                lb.css('font-weight', 'normal').prop('title', '');
                select.disabled = false;
            }
        });
    }

    // fixedBlock_usd
    createBlock(container, SETTINGS_URL, ', fixedBlock_usd',
            x => ({settingsVolatileMode: {placingBlocks: {fixedBlockUsd: x}}}),
            x => x.settingsVolatileMode.placingBlocks.fixedBlockUsd
    );

    // dynamicBlock_usd
    createBlock(container, SETTINGS_URL, ', dynMaxBlock_usd',
            x => ({settingsVolatileMode: {placingBlocks: {dynMaxBlockUsd: x}}}),
            x => x.settingsVolatileMode.placingBlocks.dynMaxBlockUsd
    );

};

function createBlock(container, SETTINGS_URL, labelName, requestCreator, valExtractor) {
    let lb = $('<span>').text(labelName).appendTo(container);
    let edit = $('<input>').width('40px').appendTo(container);
    let updateBtn = $('<button>').text('set').appendTo(container);
    let realValue = $('<span>').appendTo(container);
    // realValue.prop('id', 'fixedBlocks');

    updateBtn.click(() => {
        const requestData = JSON.stringify(requestCreator(edit.val()));
        updateBtn.disabled = true;
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
            setAllSettingsRaw(result);
            updateBtn.disabled = false;
        });
    });

    mobx.autorun(function () {
        realValue.text(valExtractor(allSettings));
        if (isActiveV('placingBlocks')) {
            lb.css('font-weight', 'bold').prop('title', 'Activated VOLATILE mode');
            updateBtn.disabled = true;
        } else {
            lb.css('font-weight', 'normal').prop('title', '');
            updateBtn.disabled = false;
        }
    });
}

function createVerDropdown(container, SETTINGS_URL, fixedCont, dynCont) {
    const lb = $('<span>').text('Placing blocks:');
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
    mobx.autorun(function () {
        select.value = allSettings.placingBlocks.activeVersion;
        highlightActive(allSettings.placingBlocks.activeVersion, fixedCont, dynCont);
        if (isActiveV('placingBlocks')) {
            lb.css('font-weight', 'bold').prop('title', 'Activated VOLATILE mode');
            select.disabled = true;
        } else {
            lb.css('font-weight', 'normal').prop('title', '');
            select.disabled = false;
        }
    });

    container.appendChild(lb.get(0));
    container.appendChild(select);

    function onVerPick() {
        const requestData = JSON.stringify({placingBlocks: {activeVersion: this.value}});
        Http.httpAsyncPost(SETTINGS_URL, requestData, result => {
            setAllSettingsRaw(result);
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

function createFixedBlocks(container, SETTINGS_URL) {
    let lb = $('<span>').text('fixedBlock_usd');
    let edit = document.createElement('input');
    edit.innerHTML = '';
    let updateBtn = document.createElement('button');
    updateBtn.onclick = onBtnClick;
    updateBtn.innerHTML = 'update';
    let realValue = document.createElement('span');
    realValue.setAttribute('id', 'fixedBlocks');

    container.appendChild(lb.get(0));
    container.appendChild(edit);
    container.appendChild(updateBtn);
    container.appendChild(realValue);

    function onBtnClick() {
        const requestData = JSON.stringify({placingBlocks: {fixedBlockUsd: edit.value}});
        updateBtn.disabled = true;
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
            setAllSettingsRaw(result);
            updateBtn.disabled = false;
        });
    }

    mobx.autorun(function () {
        if (isActiveV('placingBlocks')) {
            lb.css('font-weight', 'bold').prop('title', 'Activated VOLATILE mode');
            updateBtn.disabled = true;
        } else {
            lb.css('font-weight', 'normal').prop('title', '');
            updateBtn.disabled = false;
        }
    });
}

function createDynamicBlocks(container, SETTINGS_URL) {
    let lb = $('<span>').text('dynMaxBlock_usd');
    let edit = document.createElement('input');
    edit.innerHTML = '';
    let updateBtn = document.createElement('button');
    updateBtn.onclick = onBtnClick;
    updateBtn.innerHTML = 'update';
    let realValue = document.createElement('span');
    realValue.setAttribute('id', 'dynBlocks');

    container.appendChild(lb.get(0));
    container.appendChild(edit);
    container.appendChild(updateBtn);
    container.appendChild(realValue);

    function onBtnClick() {
        const requestData = JSON.stringify({placingBlocks: {dynMaxBlockUsd: edit.value}});
        updateBtn.disabled = true;
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
            setAllSettingsRaw(result);
            updateBtn.disabled = false;
        });
    }

    mobx.autorun(function () {
        if (isActiveV('placingBlocks')) {
            lb.css('font-weight', 'bold').prop('title', 'Activated VOLATILE mode');
            updateBtn.disabled = true;
        } else {
            lb.css('font-weight', 'normal').prop('title', '');
            updateBtn.disabled = false;
        }
    });
}

