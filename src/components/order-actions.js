'use strict';

var $ = require('jquery');
var Http = require('../http');
var sprintf = require('sprintf-js').sprintf;

var exports = module.exports = {};

exports.showOrderActions = function (firstMarketName, secondMarketName, baseUrl, isEth) {
    const BITMEX_ORDER_URL = sprintf('%s/market/%s/place-market-order', baseUrl, firstMarketName);
    const OKCOIN_ORDER_URL = sprintf('%s/market/%s/place-market-order', baseUrl, secondMarketName);

    let btmCont = document.getElementById("bitmex-order-actions");
    createOrderActions(btmCont, 'Order', 'bitmex', BITMEX_ORDER_URL);

    if (isEth) {
        let btmCont_ETH_XBTUSD = document.getElementById("bitmex-order-actions-ETH-XBTUSD");
        createOrderActions(btmCont_ETH_XBTUSD, 'XBTUSD Order', 'bitmex_ETH_XBTUSD', BITMEX_ORDER_URL, "XBTUSD");
    }

    let okCont = document.getElementById("okcoin-order-actions");
    createOrderActions(okCont, 'Order', 'okex', OKCOIN_ORDER_URL);
};

function createOrderActions(mainContainer, labelName, idName, SETTINGS_URL, toolName) {
    var container = document.createElement('div');
    mainContainer.appendChild(container);

    var label = document.createElement('span');
    label.innerHTML = labelName;
    var edit = document.createElement('input');
    edit.style.width = '80px';
    edit.innerHTML = '';
    var buyBtn = document.createElement('button');
    buyBtn.onclick = function() { onBtnClick(this, 'BUY'); };
    buyBtn.innerHTML = 'buy';
    var sellBtn = document.createElement('button');
    sellBtn.onclick =  function() { onBtnClick(this, 'SELL'); };
    sellBtn.innerHTML = 'sell';

    let select = $('<select>', {id: idName + '-placeType'});
    select.append($('<option>').val('TAKER').text('TAKER'));
    select.append($('<option>').val('MAKER').text('MAKER'));
    select.append($('<option>').val('HYBRID').text('HYBRID'));
    select.append($('<option>').val('MAKER_TICK').text('MAKER_TICK'));
    select.append($('<option>').val('HYBRID_TICK').text('HYBRID_TICK'));
    select.val('TAKER');
    let placementType = select.val();
    select.change(function () {
        placementType = select.val();
    });

    let resultLabel = document.createElement('span');
    resultLabel.innerHTML = '';

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(buyBtn);
    container.appendChild(sellBtn);
    container.append(select.get(0));
    container.appendChild(resultLabel);

    function onBtnClick(thisButton, actionType) {
        const requestData = JSON.stringify({type: actionType, placementType: placementType, amount: edit.value, toolName: toolName});
        resultLabel.innerHTML = 'in progress...';
        thisButton.disabled = true;
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
            resultLabel.innerHTML = result; // JSON.parse(result);
            thisButton.disabled = false;
        });
    }
}




