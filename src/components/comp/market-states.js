'use strict';
var $ = require('jquery');

var exports = module.exports = {};

const btmReconId = 'btm-reconnect-state';
const arbId = 'arb-state';
const firstId = 'first-state';
const secondId = 'second-state';

exports.repaintStates = function (returnData) {
    let container = document.getElementById("markets-states");

    if ($(container).children().length === 0) {
        let markets = $('#markets-states');
        $('<span>').text('Bitmex state: ').appendTo(markets);
        $('<span>',{id:firstId}).text(returnData.firstMarket).appendTo(markets);
        $('<span>').text((returnData.firstTimeToReset.length === 0 ? '' : ('(' + returnData.firstTimeToReset + 'sec)'))).appendTo(markets);
        $('<span>').text(', Okex state: ').appendTo(markets);
        $('<span>',{id:secondId}).text(returnData.secondMarket).appendTo(markets);
        $('<span>').text((returnData.secondTimeToReset.length === 0 ? '' : ('(' + returnData.secondTimeToReset + 'sec)'))).appendTo(markets);

        $('<span>').text('; Arbitrage state: ').appendTo(markets);
        $('<span>', {id: arbId}).text(returnData.arbState).appendTo(markets);

        $('<span>').text('; Bitmex reconnect state: ').appendTo(markets);
        $('<span>', {id: btmReconId}).text(returnData.bitmexReconnectState).appendTo(markets);
    }

    updateState(firstId, returnData.firstMarket);
    updateState(secondId, returnData.secondMarket);
    updateState(arbId, returnData.arbState);
    updateState(btmReconId, returnData.bitmexReconnectState);

    const sigDeltay = returnData.signalDelay;
    const timeToSig = '. Time to signal (ms): ' + returnData.timeToSignal;
    $('#signal-delay-label').html(sigDeltay + timeToSig);
};

function updateState(id, text) {
    let el = document.getElementById(id);
    switch (text) {
        case 'READY':
            el.style.color = 'green';
            break;
        case 'ARBITRAGE':
        case 'IN_PROGRESS':
        case 'WAITING_ARB':
        case 'MOVING':
        case 'PLACING_ORDER':
        case 'SWAP':
        case 'SWAP_AWAIT':
            el.style.color = 'darkgoldenrod';
            break;
        case 'STOPPED':
        case 'FORBIDDEN':
        case 'SYSTEM_OVERLOADED':
            el.style.color = 'red';
            break;
        default:
    }
    el.style.fontWeight = 'bold';
    el.innerText = text;
}
