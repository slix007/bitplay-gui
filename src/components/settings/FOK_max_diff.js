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
    createSettingsInput($FOK_cont, allSettings.SETTINGS_URL,'FOK_max_diff',
            x => ({bitmexFokMaxDiff: x}),
            x => (x.bitmexFokMaxDiff), true);
    createSettingsCheckbox($FOK_cont,'Auto',
            x => ({bitmexFokMaxDiffAuto: x}),
            x => (x.bitmexFokMaxDiffAuto));

    createSettingsInput($FOK_cont, allSettings.SETTINGS_URL, 'FOK_total_diff',
            x => ({bitmexFokTotalDiff: x}),
            x => (x.bitmexFokTotalDiff));

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

