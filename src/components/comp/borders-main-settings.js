'use strict';
let $ = require('jquery');
let Http = require('../../http');
let bordersUtils = require('./borders-utils');

// let exports = module.exports = {};

const firstId = 'first-state';
const secondId = 'second-state';

export function repaint(borderData, BORDERS_SETTINGS_URL) {
    let container = $('#borders-main-settings');

    if ($(container).children().length === 0) {
        createVerDropdown(container, borderData.activeVersion,
                BORDERS_SETTINGS_URL);
        createPeriodSec(container, borderData, BORDERS_SETTINGS_URL);

        // $('<span>').text('Bitmex state: ').appendTo(markets);
        // $('<span>', {id: firstId}).text(returnData.firstMarket).appendTo(
        //         markets);
        // $('<span>').text((returnData.firstTimeToReset.length === 0 ? '' : ('('
        //         + returnData.firstTimeToReset + 'sec)'))).appendTo(markets);
        // $('<span>').text(', Okex state: ').appendTo(markets);
        // $('<span>', {id: secondId}).text(returnData.secondMarket).appendTo(
        //         markets);
        // $('<span>').text((returnData.secondTimeToReset.length === 0 ? '' : ('('
        //         + returnData.secondTimeToReset + 'sec)'))).appendTo(markets);
    }

    //
    // updateState(firstId, returnData.firstMarket);
    // updateState(secondId, returnData.secondMarket);
}

function createVerDropdown(parent, ver, BORDERS_SETTINGS_URL) {
    let container = $('<span>',{id:'border-select-version'}).appendTo(parent);
    // let container = document.getElementById("border-select-version");
    let label = $('<span>').text('Borders version').appendTo(container);

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
    // let container = document.cre("border-period-sec");
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


