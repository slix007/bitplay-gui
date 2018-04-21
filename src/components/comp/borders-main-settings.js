'use strict';
let $ = require('jquery');
let Http = require('../../http');
let bordersUtils = require('./borders-utils');

export function repaint(borderData, BORDERS_SETTINGS_URL) {
    let container = $('#borders-main-settings');

    if ($(container).children().length === 0) {
        createVerDropdown(container, borderData.activeVersion, BORDERS_SETTINGS_URL);
        createPeriodSec(container, borderData, BORDERS_SETTINGS_URL);

        createDeltaCalcTypeDropdown(container, borderData, BORDERS_SETTINGS_URL);
        createDeltaCalcPast(container, borderData, BORDERS_SETTINGS_URL);

        createDeltaSaveType(container, borderData, BORDERS_SETTINGS_URL);
        deltaSaveDev(container, borderData, BORDERS_SETTINGS_URL);
        deltaSavePerSec(container, borderData, BORDERS_SETTINGS_URL);
    }
}

function createVerDropdown(parent, ver, BORDERS_SETTINGS_URL) {
    let container = $('<span>',{id:'border-select-version'}).appendTo(parent);
    $('<span>').text('Borders version').appendTo(container);

    let select = document.createElement('select');
    let option1 = document.createElement('option');
    let option2 = document.createElement('option');
    option1.setAttribute("value", "V1");
    option2.setAttribute("value", "V2");
    option1.innerHTML = 'V1';
    option2.innerHTML = 'V2';
    select.appendChild(option1);
    select.appendChild(option2);
    select.addEventListener("change", function () {
        select.disabled = true;
        bordersUtils.saveBordersSettings(BORDERS_SETTINGS_URL, 'version', this.value, select);
    });
    select.value = ver;

    container.append(select);
}

function createPeriodSec(parent, borderData, BORDERS_SETTINGS_URL) {
    let container = $('<div>').appendTo(parent);
    let label = document.createElement('span');
    label.innerHTML = 'Recalc period sec';
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

function createDeltaCalcTypeDropdown(parent, borderData, BORDERS_SETTINGS_URL) {
    let container = $('<span>').appendTo(parent);
    $('<span>').text('DeltaCalcType: ').appendTo(container);

    let select = $('<select>');
    select.append($('<option>').val('DELTA').text('DELTA'));
    select.append($('<option>').val('AVG_DELTA').text('AVG_DELTA'));
    select.change(function () {
        select.disabled = true;
        const requestData = JSON.stringify({borderDelta: {deltaCalcType: this.value}});
        console.log(requestData);

        Http.httpAsyncPost(BORDERS_SETTINGS_URL,
                requestData, function (result) {
                    alert('Result' + result);
                    select.disabled = false;
                });
    });
    select.val(borderData.borderDelta.deltaCalcType);

    container.append(select);
}

function createDeltaCalcPast(parent, borderData, BORDERS_SETTINGS_URL) {
    let container = $('<div>').appendTo(parent);
    $('<span>').text('deltaCalcPast').appendTo(container);
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

function createDeltaSaveType(parent, borderData, BORDERS_SETTINGS_URL) {
    let container = $('<span>').appendTo(parent);
    $('<span>').text('DeltaSaveType: ').appendTo(container);

    let select = $('<select>');
    select.append($('<option>').val('DEVIATION').text('DEVIATION'));
    select.append($('<option>').val('PERIODIC').text('PERIODIC'));
    select.append($('<option>').val('ALL').text('ALL'));
    select.change(function () {
        select.disabled = true;
        const requestData = JSON.stringify({borderDelta: {deltaSaveType: this.value}});
        console.log(requestData);

        Http.httpAsyncPost(BORDERS_SETTINGS_URL,
                requestData, function (result) {
                    alert('Result' + result);
                    select.disabled = false;
                });
    });
    select.val(borderData.borderDelta.deltaSaveType);

    container.append(select);
}

function deltaSaveDev(parent, borderData, BORDERS_SETTINGS_URL) {
    let container = $('<div>').appendTo(parent);
    $('<span>').text('deltaSaveDev').appendTo(container);
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
    let container = $('<div>').appendTo(parent);
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