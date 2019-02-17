'use strict';

import {allSettings} from '../store/settings-store';
import $ from 'jquery';
import {httpAsyncGet, httpAsyncPost} from "../http";
import * as mobx from "mobx";

export {showPresets};

let select = $('<select>');
const NONE = "--Custom--";

let showPresets = function (baseUrl) {
    const cont = $('#settings-preset');

    const list = $('<div>').appendTo(cont);
    createPresetList(baseUrl, list);

    const contForNew = $('<div>').appendTo(cont);
    createPresetSaver(allSettings.BASE_URL + '/settings/preset-save', contForNew);

};

function updateCurrentList() {
    const get_url = allSettings.BASE_URL + '/settings/preset-all';

    httpAsyncGet(get_url, rawData => {
        const data = JSON.parse(rawData);
        allSettings.currentPreset = data.currentPreset;
        allSettings.settingsPresets = data.settingsPresets;
    });
}

function createPresetList(baseUrl, cont) {
    const set_url = baseUrl + '/settings/preset-set';
    const del_url = baseUrl + '/settings/preset-delete';

    $('<span>').text('Presets: ').appendTo(cont);
    select.appendTo(cont);
    const btnSet = $('<button>').text('load').appendTo(cont);
    const btnDel = $('<button>').text('remove').appendTo(cont);

    updateCurrentList();

    mobx.autorun(r => {
        const presets = allSettings.settingsPresets;
        const currentPreset = allSettings.currentPreset;
        // console.log('Presets: ' + presets.reduce((sum, curr) => sum + curr.name + ', ', ''));
        // console.log('currentPreset: ' + currentPreset);

        // recreate list
        select.empty();
        for (const preset of presets) {
            select.append($('<option>').val(preset.name).text(preset.name));
        }
        select.append($('<option>').val(NONE).text(NONE));
        // recreate list end

        if (currentPreset !== undefined && currentPreset !== "") {
            select.val(currentPreset);
        } else {
            select.val(NONE);
        }
    });

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
        const newName = inputName.val();
        // console.log('sending: ' + data);
        httpAsyncPost(url, newName, (rawRes) => {
            btn.prop('disabled', false);
            updateCurrentList();
            allSettings.currentPreset = newName;
        });

    });

}

