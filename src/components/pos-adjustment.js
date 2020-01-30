'use strict';

import {
    allSettings,
    bitmexChangeOnSoToTaker,
    isActiveV,
    setAllSettingsRaw
} from '../store/settings-store'
import * as mobx from "mobx";

var Http = require('../http');
var Utils = require('../utils');
var $ = require('jquery');

export {show, updateAll, createAdjVolatile};

let show = function (baseUrl) {
    const SETTINGS_URL = baseUrl + '/settings/all';

    Http.httpAsyncGet(SETTINGS_URL, function (rawData) {
        const settingsData = JSON.parse(rawData);

        const container = document.getElementById("pos-adjustment");
        const posAdjTypeCont = document.createElement('div');
        container.appendChild(posAdjTypeCont);
        createPosAdjustmentPlacingType(posAdjTypeCont, SETTINGS_URL);
        // createNumberValue(container, settingsData, SETTINGS_URL, 'posAdjustmentMin');
        // createNumberValue(container, settingsData, SETTINGS_URL, 'posAdjustmentMax');
        createAdjMinMax(container, SETTINGS_URL, 'posAdjustmentMin: ',
                x => ({posAdjustment: {posAdjustmentMin: x}}),
                x => x.posAdjustment.posAdjustmentMin, true
        );
        createAdjMinMax($('<div>').appendTo(container), SETTINGS_URL, 'posAdjustmentMax: ',
                x => ({posAdjustment: {posAdjustmentMax: x}}),
                x => x.posAdjustment.posAdjustmentMax, true
        );

        createNumberValue(container, settingsData, SETTINGS_URL, 'posAdjustmentDelaySec');

        createNumberValue(container, settingsData, SETTINGS_URL, 'corrDelaySec');
        createNumberValue(container, settingsData, SETTINGS_URL, 'preliqDelaySec');
        createNumberValue(container, settingsData, SETTINGS_URL, 'killposDelaySec');

    });
};

let updateAll = function (bl) {
    let min = document.getElementById("posAdjustmentMin-id");
    min.innerHTML = bl.posAdjustmentMin;
    let max = document.getElementById("posAdjustmentMax-id");
    max.innerHTML = bl.posAdjustmentMax;
    // let delay= document.getElementById("posAdjustmentDelaySec-id");
    // delay.innerHTML = bl.posAdjustmentDelaySec;
    // let corrDelaySec = document.getElementById("corrDelaySec-id");
    // corrDelaySec.innerHTML = bl.corrDelaySec;
};

let createAdjVolatile = function (container, SETTINGS_URL) {
    createAdjMinMax(container, SETTINGS_URL, ', min:',
            x => ({settingsVolatileMode: {posAdjustment: {posAdjustmentMin: x}}}),
            x => x.settingsVolatileMode.posAdjustment.posAdjustmentMin
    );
    createAdjMinMax(container, SETTINGS_URL, ', max:',
            x => ({settingsVolatileMode: {posAdjustment: {posAdjustmentMax: x}}}),
            x => x.settingsVolatileMode.posAdjustment.posAdjustmentMax
    );
};

function createAdjMinMax(container, SETTINGS_URL, labelName, requestCreator, valExtractor, isMain) {
    {
        const lb = $('<span>').text(labelName).appendTo(container);
        const edit = $('<input>').width('40px').appendTo(container);
        const updateBtn = $('<button>').text('set').appendTo(container);
        const realValue = $('<span>').appendTo(container);
        updateBtn.click(() => {
            const requestData = JSON.stringify(requestCreator(edit.val()));
            updateBtn.prop('disabled', true);
            Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
                setAllSettingsRaw(result);
                updateBtn.prop('disabled', false);
            });
        });

        mobx.autorun(function () {
            realValue.text(valExtractor(allSettings));
            if (isActiveV('posAdjustment')) {
                lb.css('font-weight', 'bold').prop('title', 'Activated VOLATILE mode');
                if (isMain) {
                    updateBtn.prop('disabled', true);
                }
            } else {
                lb.css('font-weight', 'normal').prop('title', '');
                if (isMain) {
                    updateBtn.prop('disabled', false);
                }
            }
        });
    }
}

function createPosAdjustmentPlacingType(parentCont, SETTINGS_URL) {
    let mainContainer = $('<div>');
    parentCont.appendChild(mainContainer.get(0));

    const select = $('<select>');
    select.append($('<option>').val('TAKER').text('TAKER'));
    select.append($('<option>').val('TAKER_FOK').text('TAKER_FOK'));
    select.append($('<option>').val('MAKER').text('MAKER'));
    select.append($('<option>').val('HYBRID').text('HYBRID'));
    select.append($('<option>').val('MAKER_TICK').text('MAKER_TICK'));
    select.append($('<option>').val('HYBRID_TICK').text('HYBRID_TICK'));
    select.change(onVerPick);

    let lb = $('<span>').text('posAdjustment placing type: ');
    mainContainer.append(lb);
    mainContainer.append(select);

    function onVerPick() {
        const requestData = JSON.stringify({posAdjustment: {posAdjustmentPlacingType: select.val()}});
        select.get(0).disabled = true;
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
            setAllSettingsRaw(result);
            select.get(0).disabled = false;
        });
    }

    mobx.autorun(r => {
        select.val(allSettings.posAdjustment.posAdjustmentPlacingType);
        let extraTitle = '';
        if (bitmexChangeOnSoToTaker()) {
            extraTitle += 'BitmexChangeOnSo: Adj_to_TAKER';
            select.val('TAKER');
        }
        if (isActiveV('posAdjustment')) {
            extraTitle += '\nActivated VOLATILE mode';
        }
        if (extraTitle.length > 0) {
            lb.css('font-weight', 'bold').prop('title', extraTitle);
            select.prop('disabled', true);
        } else {
            lb.css('font-weight', 'normal').prop('title', '');
            select.prop('disabled', false);
        }
    });
}

function createNumberValue(parentCont, settingsData, SETTINGS_URL, name, nameLabel) {
    let container = document.createElement('div');
    parentCont.appendChild(container);

    let label = document.createElement('span');
    label.innerHTML = (nameLabel ? nameLabel : name) + ': ';
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
