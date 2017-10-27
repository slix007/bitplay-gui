'use strict';

var sprintf = require('sprintf-js').sprintf;
var Utils = require('./utils');
var Http = require('./http');

var exports = module.exports = {};

exports.showSwapV2 = function (firstMarketName, secondMarketName, baseUrl) {
    const MAIN_SWAP_PARAMS_URL = baseUrl + '/market/bitmex/swap';

    Http.httpAsyncGet(MAIN_SWAP_PARAMS_URL, function (rawData) {
        let swapParams = JSON.parse(rawData);
        createVerDropdown(swapParams.activeVersion, MAIN_SWAP_PARAMS_URL);
        createOrdTypeDropdown(swapParams.swapV2, MAIN_SWAP_PARAMS_URL);
        createOrdAmountInput(swapParams.swapV2, MAIN_SWAP_PARAMS_URL);
    });
};

function createVerDropdown(ver, MAIN_SWAP_PARAMS_URL) {
    var container = document.getElementById("select-swap-version");

    var select = document.createElement('select');
    var option1 = document.createElement('option');
    var option2 = document.createElement('option');
    option1.setAttribute("value", "V1");
    option2.setAttribute("value", "V2");
    option1.innerHTML = 'V1';
    option2.innerHTML = 'V2';
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
