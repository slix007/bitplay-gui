'use strict';

var Http = require('../http');
var sprintf = require('sprintf-js').sprintf;

var exports = module.exports = {};

exports.showOrderActions = function (firstMarketName, secondMarketName, baseUrl) {
    const BITMEX_ORDER_URL = sprintf('%s/market/%s/place-market-order', baseUrl, firstMarketName);
    const OKCOIN_ORDER_URL = sprintf('%s/market/%s/place-market-order', baseUrl, secondMarketName);

    var container = document.getElementById("bitmex-orders");

    createOrderActions(container, 'Taker  ', 'TAKER', BITMEX_ORDER_URL);
    createOrderActions(container, 'Maker', 'MAKER', BITMEX_ORDER_URL);

    var okcoinCont = document.getElementById("okcoin-orders");

    createOrderActions(okcoinCont, 'Taker  ', 'TAKER', OKCOIN_ORDER_URL);
    createOrderActions(okcoinCont, 'Maker  ', 'MAKER', OKCOIN_ORDER_URL);
    createOrderActions(okcoinCont, 'Hybrid ', 'HYBRID', OKCOIN_ORDER_URL);
};

function createOrderActions(mainContainer, labelName, placementType, SETTINGS_URL) {
    var container = document.createElement('div');
    mainContainer.appendChild(container);

    var label = document.createElement('span');
    label.innerHTML = labelName;
    var edit = document.createElement('input');
    edit.innerHTML = '';
    var buyBtn = document.createElement('button');
    buyBtn.onclick = function() { onBtnClick(this, 'BUY'); };
    buyBtn.innerHTML = labelName + ' buy';
    var sellBtn = document.createElement('button');
    sellBtn.onclick =  function() { onBtnClick(this, 'SELL'); };
    sellBtn.innerHTML = labelName + ' sell';
    var resultLabel = document.createElement('span');
    resultLabel.innerHTML = '';

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(buyBtn);
    container.appendChild(sellBtn);
    container.appendChild(resultLabel);

    function onBtnClick(thisButton, actionType) {
        const requestData = JSON.stringify({type: actionType, placementType: placementType, amount: edit.value});
        resultLabel.innerHTML = 'in progress...';
        thisButton.disabled = true;
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
            resultLabel.innerHTML = result; // JSON.parse(result);
            thisButton.disabled = false;
        });
    }
}


