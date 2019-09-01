'use strict';
import * as mobx from 'mobx'
import { allSettings } from '../../store/settings-store'
import { fillOkexSettlement } from '../settings-okexSettlement'

let $ = require('jquery');
let Http = require('../../http');
let bordersUtils = require('./borders-utils');

let deltaCalcTypeSelectId = 'delta-calc-type-select-id';
let deltaCalcPastId = 'delta-calc-past-id';

let deltaSaveTypeSelectId = 'delta-save-type-select-id';
let deltaSaveDevId = 'delta-save-dev-id';
let deltaSavePerSecId = 'delta-save-per-sec-id';

export function repaint(borderData, BORDERS_SETTINGS_URL) {
    let container = $('#borders-main-settings-cont') //$('<div>').css('display', 'flex').appendTo(main);

    allSettings.borderParams = borderData;
    // allSettings.borderParams.onlyOpen = borderData.onlyOpen;
    // allSettings.borderParams.maxBorder = borderData.maxBorder;

    if ($(container).children().length === 0) {
        const firstPart = $('<div>').
        attr('id', 'first-part').
        css('float', 'left').
        css('margin', '10px').
        appendTo(container)
        createVerDropdown(firstPart, borderData.activeVersion, BORDERS_SETTINGS_URL);
        createPeriodSec(firstPart, borderData, BORDERS_SETTINGS_URL);
        createDeltaMinPeriodSec(firstPart, borderData, BORDERS_SETTINGS_URL);
        createMaxDelta('b_max_delta', firstPart, borderData, BORDERS_SETTINGS_URL, x => ({btmMaxDelta: x}), x => x.borderParams.btmMaxDelta);
        createOnlyOpen(firstPart, borderData, BORDERS_SETTINGS_URL);
        let firstPart1 = $('<div>').appendTo(firstPart);
        createMaxDelta('o_max_delta', firstPart1, borderData, BORDERS_SETTINGS_URL, x => ({okMaxDelta: x}), x => x.borderParams.okMaxDelta);
        createOnlyOpen(firstPart1, borderData, BORDERS_SETTINGS_URL, true);

        const secondPart = $('<div>').
        css('float', 'left').
        css('margin', '10px').
        appendTo(container)
        createDeltaCalcTypeDropdown(firstPart, secondPart, borderData, BORDERS_SETTINGS_URL);
        createSmaCheckbox(secondPart, borderData, BORDERS_SETTINGS_URL);
        createDeltaCalcPast(secondPart, borderData, BORDERS_SETTINGS_URL);
        createDeltaHistReset(secondPart, borderData, BORDERS_SETTINGS_URL);
        deltaCalcChanged();

        const thirdPart = $('<div>').css('float', 'left').css('margin-left', '10px').appendTo(container);
        createDeltaSaveType(thirdPart, borderData, BORDERS_SETTINGS_URL);
        deltaSaveDev(thirdPart, borderData, BORDERS_SETTINGS_URL);
        deltaSavePerSec(thirdPart, borderData, BORDERS_SETTINGS_URL);
        deltaSaveChanged();

        fillOkexSettlement()
    }
}

function createSmaCheckbox(container, borderData, BORDERS_SETTINGS_URL) {
    const smaOffCont = $('<div>').appendTo(container);
    const smaOffCheckbox = $('<input>').attr('type', 'checkbox').appendTo(smaOffCont);
    const label = $('<label>').appendTo(smaOffCont);

    function updateLabel(val) {
        // console.log('use ' + val);
        let valName;
        if (val === 'false' || val === false) {
            valName = 'OFF';
            smaOffCheckbox.prop('checked', false);

        } else {
            valName = 'ON';
            smaOffCheckbox.prop('checked', true);
        }
        label.text('SMA ' + valName);
    }

    updateLabel(borderData.borderDelta.deltaSmaCalcOn);

    smaOffCheckbox.click(function () {
        label.text('SMA ...');

        smaOffCheckbox.attr('disabled', true);
        const requestData = JSON.stringify({borderDelta: {deltaSmaCalcOn: smaOffCheckbox.prop('checked')}});
        console.log(requestData);

        Http.httpAsyncPost(BORDERS_SETTINGS_URL,
                requestData, function (result) {
                    const res = JSON.parse(result);
                    updateLabel(res.result);
                    smaOffCheckbox.attr('disabled', false);
                });
    });
}

function createVerDropdown(container, ver, BORDERS_SETTINGS_URL) {
    $('<span>').text('Borders version: ').appendTo(container);

    let select = document.createElement('select');
    let option1 = document.createElement('option');
    let option2 = document.createElement('option');
    let option3 = document.createElement('option');
    option1.setAttribute("value", "V1");
    option2.setAttribute("value", "V2");
    option3.setAttribute("value", "OFF");
    option1.innerHTML = 'V1';
    option2.innerHTML = 'V2';
    option3.innerHTML = 'OFF';
    select.appendChild(option1);
    select.appendChild(option2);
    select.appendChild(option3);
    select.addEventListener("change", function () {
        select.disabled = true;
        bordersUtils.saveBordersSettings(BORDERS_SETTINGS_URL, 'version', this.value, select);
    });
    select.value = ver;

    container.append(select);
}

function createPeriodSec(parent, borderData, BORDERS_SETTINGS_URL) {
    let container = $('<div>').appendTo(parent);
    container.attr('id', 'border-comp-period');
    let label = document.createElement('span');
    label.innerHTML = 'Border comp period (sec)';
    container.append(label);
    let edit = document.createElement('input');
    edit.style.width = '80px';
    edit.innerHTML = '';
    let resultLabel = document.createElement('span');
    resultLabel.innerHTML = borderData.recalcPeriodSec;
    let setBtn = document.createElement('button');
    setBtn.onclick = function () {
        setBtn.disabled = true;
        bordersUtils.saveParamAsNumber(BORDERS_SETTINGS_URL, 'recalcPeriodSec', edit.value, resultLabel, setBtn);
    };
    setBtn.innerHTML = 'set';

    container.append(label);
    container.append(edit);
    container.append(setBtn);
    container.append(resultLabel);
}

function createDeltaMinPeriodSec(parent, borderData, BORDERS_SETTINGS_URL) {
    let container = $('<div>').appendTo(parent);
    container.attr('id', 'delta-min-period');
    let label = document.createElement('span');
    label.innerHTML = 'Delta min period (sec)';
    container.append(label);
    let edit = document.createElement('input');
    edit.style.width = '80px';
    edit.innerHTML = '';
    let resultLabel = document.createElement('span');
    resultLabel.innerHTML = borderData.deltaMinFixPeriodSec;
    let setBtn = document.createElement('button');
    setBtn.onclick = function () {
        setBtn.disabled = true;
        bordersUtils.saveParamAsNumber(BORDERS_SETTINGS_URL, 'deltaMinFixPeriodSec', edit.value, resultLabel, setBtn);
    };
    setBtn.innerHTML = 'set';

    container.append(label);
    container.append(edit);
    container.append(setBtn);
    container.append(resultLabel);
}

function createDeltaCalcTypeDropdown(firstPart, parent, borderData, BORDERS_SETTINGS_URL) {
    let container = $('<span>').appendTo(parent);
    $('<span>').text('Border comp type: ').appendTo(container);

    let select = $('<select>', {id: deltaCalcTypeSelectId});
    select.append($('<option>').val('DELTA').text('Delta_SAM'));
    if (borderData.borderDelta.deltaCalcType === 'AVG_DELTA') {
        select.append($('<option>').val('AVG_DELTA').text('Delta_SMA'));
    }
    select.append($('<option>').val('AVG_DELTA_EVERY_BORDER_COMP_IN_PARTS').text('Delta_SMA_EVERY_BORDER_COMP'));
    select.append($('<option>').val('AVG_DELTA_EVERY_NEW_DELTA_IN_PARTS').text('Delta_SMA_EVERY_NEW_DELTA'));
    select.append($('<option>').val('DELTA_MIN').text('Delta_MIN'));
    // select.append($('<option>').val('AVG_DELTA_EVERY_BORDER_COMP_AT_ONCE').text('Delta_SMA_EVERY_BORDER_COMP_AT_ONCE'));
    // select.append($('<option>').val('AVG_DELTA_EVERY_NEW_DELTA_AT_ONCE').text('Delta_SMA_EVERY_NEW_DELTA_AT_ONCE'));
    select.change(function () {
        select.disabled = true;
        const requestData = JSON.stringify({borderDelta: {deltaCalcType: this.value}});
        updateBorderCompPeriod(firstPart, this.value);
        console.log(requestData);

        Http.httpAsyncPost(BORDERS_SETTINGS_URL,
                requestData, function (result) {
                    deltaCalcChanged();
                    select.disabled = false;
                });
    });
    select.val(borderData.borderDelta.deltaCalcType);
    updateBorderCompPeriod(firstPart, borderData.borderDelta.deltaCalcType);

    container.append(select);
}

function deltaCalcChanged() {
    let val = $('#' + deltaCalcTypeSelectId).val();
    $('#' + deltaCalcPastId).find('*').attr('disabled', val === 'DELTA');
}

function updateBorderCompPeriod(firstPart, theVal) {
    if (theVal === 'AVG_DELTA_EVERY_NEW_DELTA_IN_PARTS') {
        $('#border-comp-period').css('color', 'grey');
    } else {
        $('#border-comp-period').css('color', 'black');
    }
}

function createDeltaCalcPast(parent, borderData, BORDERS_SETTINGS_URL) {
    let container = $('<div>', {id: deltaCalcPastId}).appendTo(parent);
    $('<span>').text('Delta historical period (sec)').appendTo(container);
    let edit = $('<input>').width('80px').appendTo(container);
    let resultLabel = $('<span>').text(borderData.borderDelta.deltaCalcPast);
    let setBtn = $('<button>').text('set').click(function () {
        setBtn.disabled = true;

        const requestData = JSON.stringify({borderDelta: {deltaCalcPast: edit.val()}});
        console.log(requestData);

        Http.httpAsyncPost(BORDERS_SETTINGS_URL,
                requestData, function (result) {
                    const res = JSON.parse(result);
                    resultLabel.text(res.result);
                    setBtn.disabled = false;
                });
    });

    container.append(setBtn);
    container.append(resultLabel);
}

function createDeltaHistReset(parent, borderData, BORDERS_SETTINGS_URL) {
    let container = $('<div>').appendTo(parent);
    let setBtn = $('<button>').text('Reset delta_hist_per').click(function () {
        setBtn.disabled = true;

        const requestData = JSON.stringify({doResetDeltaHistPer: 'request'});
        console.log(requestData);

        Http.httpAsyncPost(BORDERS_SETTINGS_URL,
                requestData, function (result) {
                    console.log(result);
                    setBtn.disabled = false;
                });
    });

    container.append(setBtn);
}

function createDeltaSaveType(parent, borderData, BORDERS_SETTINGS_URL) {
    let container = $('<span>').appendTo(parent);
    $('<span>').text('DeltaSaveType: ').appendTo(container);

    let select = $('<select>', {id: deltaSaveTypeSelectId});
    select.append($('<option>').val('DEVIATION').text('DEVIATION'));
    select.append($('<option>').val('PERIODIC').text('PERIODIC'));
    select.append($('<option>').val('ALL').text('ALL'));
    select.change(function () {
        select.disabled = true;
        const requestData = JSON.stringify({borderDelta: {deltaSaveType: this.value}});
        console.log(requestData);

        Http.httpAsyncPost(BORDERS_SETTINGS_URL,
                requestData, function (result) {
                    deltaSaveChanged();
                    select.disabled = false;
                });
    });
    select.val(borderData.borderDelta.deltaSaveType);

    container.append(select);
}

function deltaSaveChanged() {
    let val = $('#' + deltaSaveTypeSelectId).val();
    $('#' + deltaSaveDevId).find('*').attr('disabled', val !== 'DEVIATION');
    $('#' + deltaSavePerSecId).find('*').attr('disabled', val === 'DEVIATION' || val === 'ALL');
}

function deltaSaveDev(parent, borderData, BORDERS_SETTINGS_URL) {
    let container = $('<div>', {id: deltaSaveDevId}).appendTo(parent);
    $('<span>').text('deltaSaveDev(USD)').appendTo(container);
    let edit = $('<input>').width('80px').appendTo(container);
    let resultLabel = $('<span>').text(borderData.borderDelta.deltaSaveDev);
    let setBtn = $('<button>').text('set').click(function () {
        setBtn.disabled = true;

        const requestData = JSON.stringify({borderDelta: {deltaSaveDev: edit.val()}});
        console.log(requestData);

        Http.httpAsyncPost(BORDERS_SETTINGS_URL,
                requestData, function (result) {
                    const res = JSON.parse(result);
                    resultLabel.text(res.result);
                    setBtn.disabled = false;
                });
    });

    container.append(setBtn);
    container.append(resultLabel);
}

function deltaSavePerSec(parent, borderData, BORDERS_SETTINGS_URL) {
    let container = $('<div>', {id: deltaSavePerSecId}).appendTo(parent);
    $('<span>').text('deltaSavePerSec').appendTo(container);
    let edit = $('<input>').width('80px').appendTo(container);
    let resultLabel = $('<span>').text(borderData.borderDelta.deltaSavePerSec);
    let setBtn = $('<button>').text('set').click(function () {
        setBtn.disabled = true;

        const requestData = JSON.stringify({borderDelta: {deltaSavePerSec: edit.val()}});
        console.log(requestData);

        Http.httpAsyncPost(BORDERS_SETTINGS_URL,
                requestData, function (result) {
                    const res = JSON.parse(result);
                    resultLabel.text(res.result);
                    setBtn.disabled = false;
                });
    });

    container.append(setBtn);
    container.append(resultLabel);
}

function createMaxDelta(label, cont, borderData, BORDERS_SETTINGS_URL, requestCreator, valExtractor) {
    // let cont = $('<div>').appendTo(part4);
    let lb = $('<span>').text(label + ': ').appendTo(cont);
    let edit = $('<input>').width('80px').appendTo(cont);
    let setBtn = $('<button>').text('set').appendTo(cont);
    let resLb = $('<span>').text('').appendTo(cont);

    mobx.autorun(r => resLb.text(valExtractor(allSettings)));

    setBtn.click(function () {
        setBtn.disabled = true;
        const requestData = JSON.stringify(requestCreator(edit.val()));
        console.log(requestData);

        Http.httpAsyncPost(BORDERS_SETTINGS_URL, requestData, function (rawRes) {
            // console.log(rawRes);
            let borderParamsRes = JSON.parse(rawRes);
            allSettings.borderParams = borderParamsRes.object;
            setBtn.disabled = false;
        });
    });

}

function createOnlyOpen(cont, borderData, BORDERS_SETTINGS_URL, alwaysDisabled) {
    // let cont = $('<div>').appendTo(part4);
    const checkbox = $('<input>').attr('type', 'checkbox').appendTo(cont);
    let lb = $('<span>').text('OnlyOpen').appendTo(cont);

    mobx.autorun(r => {
        // const isChecked = allSettings.borderParams.onlyOpen;
        const isChecked = allSettings.borderParams.onlyOpen;
        checkbox.prop('checked', isChecked);
        lb.css('color', isChecked ? 'black' : 'grey');
    });

    if (alwaysDisabled) {
        checkbox.attr('disabled', true);
    }

    checkbox.click(function () {
        checkbox.attr('disabled', true);
        const requestData = JSON.stringify({onlyOpen: checkbox.prop('checked')});
        console.log(requestData);

        Http.httpAsyncPost(BORDERS_SETTINGS_URL,
                requestData, function (rawRes) {
                    let borderParamsRes = JSON.parse(rawRes);
                    allSettings.borderParams = borderParamsRes.object;
                    if (!alwaysDisabled) {
                        checkbox.attr('disabled', false);
                    }
                });
    });
}


