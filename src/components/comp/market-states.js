'use strict';
import {allSettings, setAllSettingsRaw} from "../../store/settings-store";
import $ from "jquery";
import Http from "../../http"

export {repaintStates};

const btmReconId = 'btm-reconnect-state';
const arbId = 'arb-state';
const firstId = 'first-state';
const secondId = 'second-state';

let repaintStates = function (returnData) {
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

        $('<span>').text('; preliq_queue_size: bitmex=').appendTo(markets);
        $('<span>', {id: 'btmPreliqQueueId'}).text(returnData.btmPreliqQueue).appendTo(markets);

        $('<span>').text(', okex=').appendTo(markets);
        $('<span>', {id: 'okexPreliqQueueId'}).text(returnData.okexPreliqQueue).appendTo(markets);
    }

    updateState(firstId, returnData.firstMarket);
    updateState(secondId, returnData.secondMarket);
    updateState(arbId, returnData.arbState);
    updateState(btmReconId, returnData.bitmexReconnectState);
    $('#btmPreliqQueueId').html(returnData.btmPreliqQueue);
    $('#okexPreliqQueueId').html(returnData.okexPreliqQueue);

    const sigDeltay = returnData.signalDelay;
    const timeToSig = '. Time to signal (ms): ' + showTimeToSignal(returnData.timeToSignal);
    $('#signal-delay-label').html(sigDeltay + timeToSig);
    $('#timeToResetTradingMode-label').text(convertTimeToReset(returnData.timeToResetTradingMode));
    stateUpdateChecker(returnData.timeToResetTradingMode);

    updateDelayTimer($('#corrDelaySec-id'), returnData.corrDelay);
    updateDelayTimer($('#posAdjustmentDelaySec-id'), returnData.posAdjustmentDelay);
    updateDelayTimer($('#preliqDelaySec-id'), returnData.preliqDelay);
};

function convertTimeToReset(timeToResetTradingMode) {
    return ', To reset(sec): ' + (timeToResetTradingMode === 0 ? "_none_" : timeToResetTradingMode);
}

function stateUpdateChecker(timeToResetTradingMode) {
    const vGotReset = timeToResetTradingMode === 0
            && allSettings.tradingModeState.tradingMode === 'VOLATILE'
            && allSettings.settingsVolatileMode.volatileDurationSec > 0;
    const vGotActivated = timeToResetTradingMode > 0
            && allSettings.tradingModeState.tradingMode !== 'VOLATILE';

    if (vGotReset || vGotActivated) {
        Http.httpAsyncGet(allSettings.SETTINGS_URL, function (rawData) {
            setAllSettingsRaw(rawData);
        });
    }
}

function updateDelayTimer(el, dt) {
    el
    .prop('title', dt.activeNames.reduce((a, b) => a + '\n' + b, ""))
    .html(sprintf('%s. (%s)To signal(sec): %s', dt.delaySec, dt.activeCount, showTimeToSignal(dt.toSignalSec)));
}

function showTimeToSignal(timeToSignal) {
    let text = timeToSignal;
    if (timeToSignal === '_ready_') {
        text = '<span style="color: orange; font-weight: bold;">' + timeToSignal + '</span>';
    }
    return text;
}

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
        case 'PRELIQ':
            el.style.color = 'red';
            break;
        default:
            el.style.color = 'black';
    }
    el.style.fontWeight = 'bold';
    el.innerText = text;
}
