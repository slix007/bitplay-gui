'use strict';

import {allSettings} from '../store/settings-store';
import $ from 'jquery';
import {httpAsyncGet, httpAsyncPost} from "../http";

export {showPresets};

let select = $('<select>');

let showPresets = function (baseUrl) {
    const cont = $('#settings-preset');

    const list = $('<div>').appendTo(cont);
    createPresetList(baseUrl, list);

    const contForNew = $('<div>').appendTo(cont);
    createPresetSaver(allSettings.BASE_URL + '/settings/preset-save', contForNew);

};

function updateCurrentList() {
    const get_url = allSettings.BASE_URL + '/settings/preset-all';
    select.empty();

    httpAsyncGet(get_url, rawData => {
        const data = JSON.parse(rawData);
        const presets = data.settingsPresets;
        console.log('Presets: ' + presets.reduce((sum, curr) => sum + curr.name + ', ', ''));
        for (const preset of presets) {
            select.append($('<option>').val(preset.name).text(preset.name));
        }
    });
}

function createPresetList(baseUrl, cont) {
    const set_url = baseUrl + '/settings/preset-set';
    const del_url = baseUrl + '/settings/preset-delete';

    $('<span>').text('Presets: ').appendTo(cont);
    select.appendTo(cont);
    const btnSet = $('<button>').text('set').appendTo(cont);
    const btnDel = $('<button>').text('remove').appendTo(cont);

    updateCurrentList();

    btnSet.click(() => {
        btnSet.prop('disabled', true);
        const data = select.val();
        console.log('sending: ' + data);
        httpAsyncPost(set_url, data, rawData => {
            btnSet.prop('disabled', false);
            updateCurrentList();
            // update the page
            location.reload();
        });
    });

    btnDel.click(() => {
        btnDel.prop('disabled', true);
        const data = select.val();
        console.log('sending: ' + data);
        httpAsyncPost(del_url, data, rawData => {
            btnDel.prop('disabled', false);
            updateCurrentList();
        });
    });

}

function createPresetSaver(url, cont) {
    $('<span>').text('Save current settings as ').appendTo(cont);
    const inputName = $('<input>').prop('placeholder', 'preset name').appendTo(cont);
    const btn = $('<button>').text('save').appendTo(cont);
    btn.click(() => {
        btn.prop('disabled', true);
        const data = inputName.val();
        // console.log('sending: ' + data);
        httpAsyncPost(url, data, (rawRes) => {
            btn.prop('disabled', false);
            updateCurrentList();
        });

    });

}

