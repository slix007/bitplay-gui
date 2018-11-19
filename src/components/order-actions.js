'use strict';

let $ = require('jquery');
let _ = require('lodash');
let Http = require('../http');
let sprintf = require('sprintf-js').sprintf;
const {placingOrderObj} = require('../store/settings-store');
let mobx = require('mobx');
// const {decorate, observable} = require('mobx');

//         для всех set_bu:
//     bitmex: 1 USD = 1 cont,
//     okex: 100 USD = 1 cont,
//         для всех set_eu:
//     bitmex: 10 / CM USD = 1 cont,
//     okex: 10 USD = 1 cont.
//
// class PlacingOrderObj {
//     constructor() {
//         // this.restartEnabled;
//         this.title = "";
//     }
//
//     // id = Math.random();
//     // finished = false;
// }
//
// decorate(PlacingOrderObj, {
//     title: observable,
//     finished: observable
// });
//
// let exports = module.exports = {};

exports.showOrderActions = function (firstMarketName, secondMarketName, baseUrl, isEth) {
    const BITMEX_ORDER_URL = sprintf('%s/market/%s/place-market-order', baseUrl, firstMarketName);
    const OKCOIN_ORDER_URL = sprintf('%s/market/%s/place-market-order', baseUrl, secondMarketName);

    let btmCont = document.getElementById("bitmex-order-actions");
    // createAmountType(btmCont, btmLabelCont);
    // createOrderActions(btmCont, btmLabelCont.get()[0], 'bitmex', BITMEX_ORDER_URL);
    createOrderActions(btmCont, 'Order ', 'btm', BITMEX_ORDER_URL);

    if (isEth) {
        let btmCont_ETH_XBTUSD = document.getElementById("bitmex-order-actions-ETH-XBTUSD");
        // createOrderActions(btmCont_ETH_XBTUSD, btmXBTUSDLabelCont.get()[0], 'bitmex_ETH_XBTUSD', BITMEX_ORDER_URL, "XBTUSD");
        createOrderActions(btmCont_ETH_XBTUSD, 'XBTUSD Order ', 'btmXBTUSD', BITMEX_ORDER_URL, "XBTUSD");
    }

    let okCont = document.getElementById("okcoin-order-actions");
    // createOrderActions(okCont, okLabelCont.get()[0], 'okex', OKCOIN_ORDER_URL);
    createOrderActions(okCont, 'Order ', 'ok', OKCOIN_ORDER_URL);
};

// function createAmountType(mainCont, label) {
//     const checkbox = $('<input>').prop('title', 'Use USD').prop('type', 'checkbox').appendTo(mainCont);
//     // const label = $('<label>')
//     label.text(mobxStore.placingOrderObj.amountTypeBitmex)
//     .appendTo(mainCont);
//     checkbox.click(function () {
//         mobxStore.placingOrderObj.isBitmexUsd = checkbox.prop('checked');
//     });
//
//     mobx.autorun(function () {
//         label.text(mobxStore.placingOrderObj.amountTypeBitmex);
//     });
// }

function createOrderActions(container, labelName, idName, SETTINGS_URL, toolName) {
    const checkboxLabel = $('<span>').appendTo(container);
    const checkbox = $('<input>')
    .prop('title', 'Use USD')
    .prop('type', 'checkbox')
    .prop('checked', true).appendTo(container);

    let label = $('<label>').html(labelName);

    mobx.autorun(function () {
        // console.log(placingOrderObj[idName]);
        if (placingOrderObj[idName]) {
            label.html(placingOrderObj[idName].amountContLabel);
            label.prop('title', 'cm=' + placingOrderObj.cm);
        }
    });

    let edit = $('<input>').width('80px');
    edit.on('keyup', function (event) {
        // placingOrderObj[event.target.name] = $(this).val();
        placingOrderObj[idName].amount = $(this).val();
    });

    let buyBtn = $('<button>').text('buy').click(function () {
        onBtnClick(this, 'BUY');
    });
    let sellBtn = $('<button>').text('sell').click(function () {
        onBtnClick(this, 'SELL');
    });

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

    container.appendChild(edit.get()[0]);
    const contLabel = $('<span>').text(labelName).appendTo(container);
    container.append(contLabel.get(0));
    container.appendChild(label.get(0));
    container.appendChild(buyBtn.get()[0]);
    container.appendChild(sellBtn.get()[0]);
    container.append(select.get(0));
    container.appendChild(resultLabel);

    function renderContLabel() {
        placingOrderObj[idName].isUsd = checkbox.prop('checked');
        if (checkbox.prop('checked')) {
            checkboxLabel.html('USD');
        } else {
            checkboxLabel.html('CONT');
        }
    }

    renderContLabel();
    checkbox.click(function () {
        renderContLabel();
    });

    function onBtnClick(thisButton, actionType) {
        let amount = placingOrderObj[idName].amountCont;
        // let amountType = checkbox.prop('checked') ? 'USD' : 'CONT';
        let amountType = 'CONT'; // always converted
        const requestData = JSON.stringify({type: actionType, placementType: placementType, amount: amount, toolName: toolName, amountType: amountType});
        resultLabel.innerHTML = 'in progress...';
        thisButton.disabled = true;
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
            resultLabel.innerHTML = result; // JSON.parse(result);
            thisButton.disabled = false;
        });
    }
}




