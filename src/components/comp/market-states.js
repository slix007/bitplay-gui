'use strict';
import {allSettings, setAllSettingsRaw} from "../../store/settings-store";
import $ from "jquery";
import Http from "../../http"
import * as mobx from "mobx";

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

        const bitmexSoState = $('<span>').appendTo(markets);
        mobx.autorun(r => showBitmexSoState(bitmexSoState, allSettings));

        createSignalStatusBar();
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
    allSettings.bitmexChangeOnSo.secToReset = returnData.timeToResetBitmexChangeOnSo;

    updateDelayTimer($('#corrDelaySec-id'), returnData.corrDelay);
    updateDelayTimer($('#posAdjustmentDelaySec-id'), returnData.posAdjustmentDelay);
    updateDelayTimer($('#preliqDelaySec-id'), returnData.preliqDelay);

    allSettings.marketStates = returnData;
};

function convertTimeToReset(timeToResetTradingMode) {
    return ', To reset(sec): ' + (timeToResetTradingMode === 0 ? "_none_" : timeToResetTradingMode);
}

function showBitmexSoState(lb, allSettings) {
    if (allSettings.bitmexChangeOnSo.secToReset > 0) {
        lb.text(', Bitmex SO: always TAKER');
        lb.css('color', 'darkgoldenrod');
        lb.css('font-weight', 'bold');
    } else {
        lb.text(', Bitmex SO: NONE');
        lb.css('color', 'black');
        lb.css('font-weight', 'normal');
    }
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

function createSignalStatusBar() {
    const my_css_class = {'margin': '10px'};

    const contMain = $('#signal-status-bar').css('display', 'flex');
    const cont = $('<div>')
    .css('background-color', 'azure')
    .css('border-radius', '10px')
    .css('border', '1px dotted black')
    .appendTo(contMain);

    const signalDelay = $('<span>').text('signal_delay').css(my_css_class).appendTo(cont);
    const btmMaxDelta = $('<span>').text('b_max_delta').css(my_css_class).appendTo(cont);
    const okMaxDelta = $('<span>').text('o_max_delta').css(my_css_class).appendTo(cont);
    const ntUsd = $('<span>').text('nt_usd').css(my_css_class).appendTo(cont);
    const states = $('<span>').text('states').css(my_css_class).appendTo(cont);
    const btmDqlOpen = $('<span>').text('bitmex_dql_open').css(my_css_class).appendTo(cont);
    const okDqlOpen = $('<span>').text('okex_dql_open').css(my_css_class).appendTo(cont);
    const btmAffordable = $('<span>').text('bitmex_affordable').css(my_css_class).appendTo(cont);
    const okAffordable = $('<span>').text('okex_affordable').css(my_css_class).appendTo(cont);
    const priceLimits = $('<span>').text('price_limits').css(my_css_class).appendTo(cont);

    function showPart(el, status) {
        el.prop('title', status);
        switch (status) {
            case 'OK':
                el.css('color', 'green');
                break;
            case 'WRONG':
                el.css('color', 'red');
                break;
            case 'STARTED':
                el.css('color', 'orange');
                break;
            default:
                el.css('color', 'black');
        }
    }

    mobx.autorun(r => {
        const sp = allSettings.marketStates.signalParts;
        showPart(signalDelay, sp.signalDelay);
        showPart(btmMaxDelta, sp.btmMaxDelta);
        showPart(okMaxDelta, sp.okMaxDelta);
        showPart(ntUsd, sp.ntUsd);
        showPart(states, sp.states);
        showPart(btmDqlOpen, sp.btmDqlOpen);
        showPart(okDqlOpen, sp.okDqlOpen);
        showPart(btmAffordable, sp.btmAffordable);
        showPart(okAffordable, sp.okAffordable);
        showPart(priceLimits, sp.priceLimits);
    });
}



