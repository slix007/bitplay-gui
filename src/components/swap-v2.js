'use strict';

var sprintf = require('sprintf-js').sprintf;
var Utils = require('../utils');
var Http = require('../http');

var exports = module.exports = {};

exports.showSwapV2 = function (baseUrl) {
    const MAIN_SWAP_PARAMS_URL = baseUrl + '/market/bitmex/swap';

    Http.httpAsyncGet(MAIN_SWAP_PARAMS_URL, function (rawData) {
        let swapParams = JSON.parse(rawData);
        createVerDropdown(swapParams.activeVersion, MAIN_SWAP_PARAMS_URL);
        createOrdTypeDropdown(swapParams.swapV2, MAIN_SWAP_PARAMS_URL);
        createOrdAmountInput(swapParams.swapV2, MAIN_SWAP_PARAMS_URL);
        createSwapTimeCorrMsInput(swapParams.swapV2, MAIN_SWAP_PARAMS_URL);
        createToSwapV2Open(swapParams.swapV2, MAIN_SWAP_PARAMS_URL);
    });
};

function createVerDropdown(ver, MAIN_SWAP_PARAMS_URL) {
    var container = document.getElementById("select-swap-version");

    var select = document.createElement('select');
    var option0 = document.createElement('option');
    var option1 = document.createElement('option');
    var option2 = document.createElement('option');
    option0.setAttribute("value", "OFF");
    option1.setAttribute("value", "V1");
    option2.setAttribute("value", "V2");
    option0.innerHTML = 'OFF';
    option1.innerHTML = 'V1';
    option2.innerHTML = 'V2';
    select.appendChild(option0);
    select.appendChild(option1);
    select.appendChild(option2);
    select.addEventListener("change", onVerPick);
    if (ver == null) {
        ver = "V1";
    }
    select.value = ver;

    container.appendChild(select);

    function enableDisableSwapV2() {
        // var selectOrdType = document.getElementById('swapV2-select');
        var title = document.getElementById('swapV2-title');
        var input = document.getElementById('swapV2-input');
        var button = document.getElementById('swapV2-button');
        if (title != null && input != null && button != null)
        if (select.value === 'V1') {
            // selectOrdType.disabled = true;
            title.disabled = true;
            input.disabled = true;
            button.disabled = true;
        } else {
            // selectOrdType.disabled = false;
            title.disabled = false;
            input.disabled = false;
            button.disabled = false;
        }
    }

    // enableDisableSwapV2();

    function onVerPick() {
        const requestData = JSON.stringify({version: this.value});

        Http.httpAsyncPost(MAIN_SWAP_PARAMS_URL + '/settings',
            requestData, function(result) {
                alert('Result' + result);
                // enableDisableSwapV2();
            });
    }
}

function createOrdTypeDropdown(swapV2, MAIN_SWAP_PARAMS_URL) {
    var container = document.getElementById("swap-v2");

    var select = document.createElement('select');
    select.setAttribute("id", "swapV2-select");
    var option1 = document.createElement('option');
    var option2 = document.createElement('option');
    option1.setAttribute("value", "Buy");
    option2.setAttribute("value", "Sell");
    option1.innerHTML = 'Buy';
    option2.innerHTML = 'Sell';
    select.appendChild(option1);
    select.appendChild(option2);
    select.addEventListener("change", onOrdTypePick);
    if (swapV2 == null) {
        swapV2 = {swapOpenType: 'Buy', swapOpenAmount: '0'}
    }
    select.value = swapV2.swapOpenType;

    container.appendChild(select);

    function onOrdTypePick() {
        const requestData = JSON.stringify({swapV2: {swapOpenType: this.value}});

        Http.httpAsyncPost(MAIN_SWAP_PARAMS_URL + '/settings',
            requestData, function(result) {
                alert('Result' + result);
            });
    }
}

function createOrdAmountInput(swapV2, MAIN_SWAP_PARAMS_URL) {
    var container = document.getElementById("swap-v2");
    if (swapV2 == null) {
        swapV2 = {swapOpenType: 'Buy', swapOpenAmount: '0'}
    }

    var span = document.createElement('span');
    var title = document.createElement('span');
    var input = document.createElement('input');
    var button = document.createElement('button');
    title.setAttribute("id", "swapV2-title");
    input.setAttribute("id", "swapV2-input");
    button.setAttribute("id", "swapV2-button");
    title.innerHTML = 'Amount:' + swapV2.swapOpenAmount;
    input.value = swapV2.swapOpenAmount;
    button.innerHTML = 'Update';
    span.appendChild(title);
    span.appendChild(input);
    span.appendChild(button);
    button.addEventListener("click", onUpdateClick);

    container.appendChild(span);

    function onUpdateClick() {
        const requestData = JSON.stringify({swapV2: {swapOpenAmount: input.value}});

        Http.httpAsyncPost(MAIN_SWAP_PARAMS_URL + '/settings',
            requestData, function(result) {
                alert('Result' + result);
                title.innerHTML = 'Amount:' + input.value;
            });
    }
}
function createSwapTimeCorrMsInput(swapV2, MAIN_SWAP_PARAMS_URL) {
    var container = document.getElementById("swap-v2");
    if (swapV2 == null) {
        swapV2 = {swapOpenType: 'Buy', swapOpenAmount: '0'}
    }

    var span = document.createElement('span');
    var title = document.createElement('span');
    var input = document.createElement('input');
    var button = document.createElement('button');
    title.setAttribute("style", "margin-right: 5px;");
    title.setAttribute("id", "swapTimeCorrMs-title");
    input.setAttribute("id", "swapTimeCorrMs-input");
    button.setAttribute("id", "swapTimeCorrMs-button");
    title.innerHTML = 'OpenTimeCorr(ms):' + swapV2.swapTimeCorrMs;
    input.value = swapV2.swapTimeCorrMs;
    button.innerHTML = 'Update';
    span.appendChild(title);
    span.appendChild(input);
    span.appendChild(button);
    button.addEventListener("click", onUpdateClick);

    container.appendChild(span);

    function onUpdateClick() {
        const requestData = JSON.stringify({swapV2: {swapTimeCorrMs: input.value}});

        Http.httpAsyncPost(MAIN_SWAP_PARAMS_URL + '/settings',
            requestData, function(result) {
                alert('Result' + result);
                title.innerHTML = 'OpenTimeCorr:' + input.value;
            });
    }
}

function createToSwapV2Open(swapV2, MAIN_SWAP_PARAMS_URL) {
    var container = document.getElementById("swap-v2");
    if (swapV2 == null) {
        swapV2 = {swapOpenType: 'Buy', swapOpenAmount: '0'}
    }

    var div = document.createElement('div');
    div.setAttribute("id", "div-swap-to-open");
    div.innerHTML = 'To open(swapV2): ' + swapV2.msToSwapString;
    container.appendChild(div);

    setInterval(updateToSwapV2Open, 1000, MAIN_SWAP_PARAMS_URL);
}

function updateToSwapV2Open(MAIN_SWAP_PARAMS_URL) {

    Http.httpAsyncGet(MAIN_SWAP_PARAMS_URL, function (rawData) {
        let swapParams = JSON.parse(rawData);
        const div = document.getElementById("div-swap-to-open");
        const swapV2 = swapParams.swapV2;
        div.innerHTML = 'To open(swapV2): ' + swapV2.msToSwapString;

    });
}
