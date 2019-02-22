'use strict';

import {allSettings, setAllSettingsRaw} from "../store/settings-store";
import $ from "jquery";
import Http from "../http"
import * as mobx from "mobx";

export {fillBitmexChangeOnSo};

let fillBitmexChangeOnSo = function () {
    const $cont = $('#bitmex-change-on-so');
    $('<span>').text('Bitmex change on ').appendTo($cont);
    $('<span>').text('SO:').prop('title', 'SYSTEM OVERLOAD').appendTo($cont);

    // checkbox toTaker
    const toTakerCheckbox = $('<input>').css('margin-left', '15px').attr('type', 'checkbox').appendTo($cont);
    $('<label>').text('to_TAKER').appendTo($cont);
    mobx.autorun(() => toTakerCheckbox.prop('checked', allSettings.bitmexChangeOnSo.toTaker));
    toTakerCheckbox.click(() => {
        toTakerCheckbox.prop('disabled', true);
        Http.httpAsyncPost(allSettings.SETTINGS_URL, JSON.stringify({bitmexChangeOnSo: {toTaker: toTakerCheckbox.prop('checked')}}),
                json => {
                    setAllSettingsRaw(json);
                    toTakerCheckbox.prop('disabled', false);
                }
        )
    });

    // checkbox toConBo
    const toConBoCheckbox = $('<input>').css('margin-left', '15px').attr('type', 'checkbox').appendTo($cont);
    $('<label>').text('to_CON_B_O').appendTo($cont);
    mobx.autorun(() => toConBoCheckbox.prop('checked', allSettings.bitmexChangeOnSo.toConBo));
    toConBoCheckbox.click(() => {
        toConBoCheckbox.prop('disabled', true);
        Http.httpAsyncPost(allSettings.SETTINGS_URL, JSON.stringify({bitmexChangeOnSo: {toConBo: toConBoCheckbox.prop('checked')}}),
                json => {
                    setAllSettingsRaw(json);
                    toConBoCheckbox.prop('disabled', false);
                }
        )
    });

    createSettingsParam($('<div>').appendTo($cont), 'countToActivate: ',
            x => ({bitmexChangeOnSo: {countToActivate: x}}),
            x => x.bitmexChangeOnSo.countToActivate);
    createSettingsParam($('<div>').appendTo($cont), 'durationSec: ',
            x => ({bitmexChangeOnSo: {durationSec: x}}),
            x => x.bitmexChangeOnSo.durationSec);

    const $contTimer = $('<div>').appendTo($cont);
    const resetBtn = $('<button>').text('reset').appendTo($contTimer);
    resetBtn.click(() => {
        const requestData = JSON.stringify({bitmexChangeOnSo: {resetFromUi: true}});
        resetBtn.prop('disabled', true);
        Http.httpAsyncPost(allSettings.SETTINGS_URL, requestData, function (result) {
            setAllSettingsRaw(result);
            resetBtn.prop('disabled', false);
        });
    });

    const timer = $('<span>').appendTo($contTimer);
    mobx.autorun(() => {
        timer.text('To reset(sec): ' + allSettings.bitmexChangeOnSo.secToReset);
        const selectToTaker = $('#bitmex-place-order-type-select-id');
        if (allSettings.bitmexChangeOnSo.secToReset > 0 && allSettings.bitmexChangeOnSo.toTaker) {
            selectToTaker.prop('disabled', true);
            selectToTaker.val('TAKER');
        } else {
            selectToTaker.prop('disabled', false);
            selectToTaker.val(allSettings.bitmexPlacingType);
        }
        const selectToConBo = $('#select-arb-version-id');
        if (allSettings.bitmexChangeOnSo.secToReset > 0 && allSettings.bitmexChangeOnSo.toConBo) {
            selectToConBo.prop('disabled', true);
            selectToConBo.val('CON_B_O');
        } else {
            selectToConBo.prop('disabled', false);
            selectToConBo.val(allSettings.arbScheme);
        }
    });

    testingSystemOverloaded();
};

function testingSystemOverloaded() {
    const $cont = $('#bitmex-change-on-so-testing');
    // checkbox auto
    const autoCheckbox = $('<input>').attr('type', 'checkbox').appendTo($cont);
    const lb = $('<label>').text('throw SYSTEM_OVERLOADED for testing with 1 sec delay')
    .prop('title', 'on each moving/placing')
    .css('font-style', 'italic')
    // .css('font-variant', 'small-caps')
    .css('text-decoration', 'underline')
    // .css('text-decoration', 'line-through')
    .appendTo($cont);
    mobx.autorun(() => {
        autoCheckbox.prop('checked', allSettings.bitmexChangeOnSo.testingSo);
        if (allSettings.bitmexChangeOnSo.testingSo) {
            lb.css('background-color', 'tomato');
        } else {
            lb.css('background-color', 'white');
        }
    });
    autoCheckbox.click(() => {
        autoCheckbox.prop('disabled', true);
        Http.httpAsyncPost(allSettings.SETTINGS_URL, JSON.stringify({bitmexChangeOnSo: {testingSo: autoCheckbox.prop('checked')}}),
                json => {
                    setAllSettingsRaw(json);
                    autoCheckbox.prop('disabled', false);
                }
        )
    });

}

function createSettingsParam(container, labelName, requestCreator, valExtractor, isActiveFunc) {
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
        // const isActive = isActiveFunc ? isActiveFunc(allSettings)
        //         : allSettings.tradingModeState.tradingMode === 'VOLATILE';
        // if (isActive && value !== 0) {
        //     lb.css('font-weight', 'bold').prop('title', '');
        // } else {
        //     lb.css('font-weight', 'normal').prop('title', '');
        // }
    });
}
