'use strict';
var $ = require('jquery');

var exports = module.exports = {};

const firstId = 'first-state';
const secondId = 'second-state';

exports.repaintStates = function (returnData) {
    let container = document.getElementById("markets-states");

    if ($(container).children().length === 0) {
        let markets = $('#markets-states');
        $('<span>').text('Market is ready for new signals(flag isBusy and openOrders.size==0). ').appendTo(markets);
        $('<span>').text('First: ').appendTo(markets);
        $('<span>',{id:firstId}).text(returnData.firstMarket).appendTo(markets);
        $('<span>').text((returnData.firstTimeToReset.length === 0 ? '' : ('(' + returnData.firstTimeToReset + 'sec)'))).appendTo(markets);
        $('<span>').text(', second: ').appendTo(markets);
        $('<span>',{id:secondId}).text(returnData.secondMarket).appendTo(markets);
        $('<span>').text((returnData.secondTimeToReset.length === 0 ? '' : ('(' + returnData.secondTimeToReset + 'sec)'))).appendTo(markets);
    }

    updateState(firstId, returnData.firstMarket);
    updateState(secondId, returnData.secondMarket);
};

function updateState(id, text) {
    let el = document.getElementById(id);
    switch (text) {
        case 'READY':
            el.style.color = 'green';
            break;
        case 'ARBITRAGE':
        case 'WAITING_ARB':
        case 'MOVING':
        case 'PLACING_ORDER':
        case 'SWAP':
        case 'SWAP_AWAIT':
            el.style.color = 'darkgoldenrod';
            break;
        case 'STOPPED':
        case 'SYSTEM_OVERLOADED':
            el.style.color = 'red';
            break;
        default:
    }
    el.style.fontWeight = 'bold';
    el.innerText = text;
}
