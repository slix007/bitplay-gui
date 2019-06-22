'use strict';

import {allSettings, setAllSettingsRaw} from "../../store/settings-store";
import {createSettingsInput} from "../settings";

const $ = require('jquery');
const Http = require('../../http');
const mobx = require('mobx');

export {showBitmexFokMaxDiff};

// bitmex fill or kill max diff
const showBitmexFokMaxDiff = () => {
    const $FOK_cont = $('#FOK_max_diff');
    createSettingsInputFokMaxDiff($FOK_cont, 'FOK_max_diff',
            x => ({bitmexFokMaxDiff: x}),
            x => (x.bitmexFokMaxDiff),
            x => (x.bitmexFokMaxDiffAuto));
    createSettingsCheckbox($FOK_cont,'Auto',
            x => ({bitmexFokMaxDiffAuto: x}),
            x => (x.bitmexFokMaxDiffAuto));

    createSettingsInput($FOK_cont, allSettings.SETTINGS_URL, 'FOK_total_diff',
            x => ({bitmexFokTotalDiff: x}),
            x => (x.bitmexFokTotalDiff));

}

function createSettingsInputFokMaxDiff(container, labelName, requestCreator, valExtractor, autoValExtractor) {
    const lb = $('<span>').text(labelName).appendTo(container);
    const edit = $('<input>').width('40px').appendTo(container);
    const updateBtn = $('<button>').text('set').appendTo(container);
    const realValue = $('<span>').appendTo(container);
    updateBtn.click(() => {
        const requestData = JSON.stringify(requestCreator(edit.val()));
        updateBtn.prop('disabled', true);
        Http.httpAsyncPost(allSettings.SETTINGS_URL, requestData, function (result) {
            setAllSettingsRaw(result);
            updateBtn.prop('disabled', false);
        });
    });
    mobx.autorun(function () {
        const value = valExtractor(allSettings);
        realValue.text(value);
        if (autoValExtractor(allSettings)) {
            edit.prop('disabled', true);
            updateBtn.prop('disabled', true);
        } else {
            edit.prop('disabled', false);
            updateBtn.prop('disabled', false);
        }
    });
}

function createSettingsCheckbox(container, labelName, requestCreator, valExtractor) {
    const checkbox = $('<input>').attr('type', 'checkbox').css('margin-left', '20px').appendTo(container);
    const lb = $('<span>').text(labelName).appendTo(container);
    checkbox.click(() => {
        const requestData = JSON.stringify(requestCreator(checkbox.prop('checked')));
        checkbox.prop('disabled', true);
        Http.httpAsyncPost(allSettings.SETTINGS_URL, requestData, function (result) {
            setAllSettingsRaw(result);
            checkbox.prop('disabled', false);
        });
    });
    mobx.autorun(function () {
        const value = valExtractor(allSettings);
        checkbox.prop('checked', value);
    });
}

