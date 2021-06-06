'use strict';

import { allSettings, mobxStore } from '../store/settings-store'

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

export {showOrderActions};

let showOrderActions = function (baseUrl, isEth) {
    const LEFT_ORDER_URL = `${baseUrl}/market/left/place-market-order`
    const RIGHT_ORDER_URL = `${baseUrl}/market/right/place-market-order`
    const LEFT_CNL_ALL = `${baseUrl}/market/left/open-orders/cancel-all`
    const RIGHT_CNL_ALL = `${baseUrl}/market/right/open-orders/cancel-all`

    let btmCont = document.getElementById("left-order-actions");
    createOrderActions(btmCont, 'Order ', 'btm', LEFT_ORDER_URL, null, LEFT_CNL_ALL);

    if (isEth && allSettings.leftIsBtm) {
        let btmCont_ETH_XBTUSD = document.getElementById("left-order-actions-ETH-XBTUSD");
        createOrderActions(btmCont_ETH_XBTUSD, 'XBTUSD Order ', 'btmXBTUSD', LEFT_ORDER_URL, "XBTUSD");
    } else {
        $('#left-order-actions-ETH-XBTUSD').hide()
        $('#right-order-actions-ETH-XBTUSD').hide()
    }

    let okCont = document.getElementById("right-order-actions");
    createOrderActions(okCont, 'Order ', 'ok', RIGHT_ORDER_URL, null, RIGHT_CNL_ALL);
};

function createOrderActions(container, labelName, idName, ORDER_URL, toolName, CNL_ALL_URL) {
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
            label.prop('title', 'cm=' + placingOrderObj.cm + ', mobxStore.cm=' + mobxStore.cm);
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
    if (idName.startsWith('btm') && allSettings.leftIsBtm) {
        select.append($('<option>').val('TAKER_FOK').text('TAKER_FOK'));
        select.append($('<option>').val('TAKER_IOC').text('TAKER_IOC'));
    }
    select.append($('<option>').val('MAKER').text('MAKER'));
    select.append($('<option>').val('HYBRID').text('HYBRID'));
    select.append($('<option>').val('MAKER_TICK').text('MAKER_TICK'));
    select.append($('<option>').val('HYBRID_TICK').text('HYBRID_TICK'));
    select.val('MAKER');
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

    let pt_edit = $('<input>').width('30px').prop('title', 'portions_qty').prop('disabled', true).val('1');

    if (!(toolName && toolName === 'XBTUSD')) {
        const pt_checkbox = $('<input>')
        .prop('title', 'portion_qty')
        .prop('type', 'checkbox')
        .prop('checked', false).appendTo(container);
        pt_edit.appendTo(container);

        pt_checkbox.click(() => {
            pt_edit.prop('disabled', !pt_checkbox.prop('checked'));
        });
        let pt_lb = $('<span>').text('0').appendTo(container);
        mobx.autorun(r => {
            pt_lb.text(mobxStore.marketStates.orderPortionsJson[idName]);
        });

        let cnlAllBtn = $('<button>').text('cnlAll').appendTo(container)
        cnlAllBtn.click(function () {
            cnlAllBtn.prop('disabled', true);
            Http.httpAsyncPost(CNL_ALL_URL, "", function (result) {
                cnlAllBtn.prop('disabled', false);
                resultLabel.innerHTML = result;
            });
        });
    }

    container.appendChild(resultLabel);

    function onBtnClick(thisButton, actionType) {
        // let amountType = checkbox.prop('checked') ? 'USD' : 'CONT';
        const requestData = JSON.stringify({
            type: actionType,
            placementType: placementType,
            amount: placingOrderObj[idName].amountCont,
            toolName: toolName,
            amountType: 'CONT', // always converted
            portionsQty: pt_edit.val()
        });
        resultLabel.innerHTML = 'in progress...';
        console.log(requestData);
        thisButton.disabled = true;
        Http.httpAsyncPost(ORDER_URL, requestData, function (result) {
            resultLabel.innerHTML = result; // JSON.parse(result);
            thisButton.disabled = false;
        });
    }

}




