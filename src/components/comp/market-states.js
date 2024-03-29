'use strict';
import { allSettings, mobxStore, setAllSettingsRaw } from '../../store/settings-store'
import $ from 'jquery'
import Http from '../../http'
import * as mobx from 'mobx'
import { fillOkexSettlementEnding } from '../settings-okexSettlement'

export { repaintStates, createDqlState, createSeBestState, createRecoveryState }

const btmReconId = 'btm-reconnect-state';
const arbId = 'arb-state';
const firstId = 'first-state';
const secondId = 'second-state';

let repaintStates = function (returnData) {
    let container = document.getElementById("markets-states");

    if ($(container).children().length === 0) {
        let markets = $('#markets-states');
        $('<span>').text('Left state: ').appendTo(markets);
        $('<span>',{id:firstId}).text(returnData.firstMarket).appendTo(markets);
        $('<span>').text((returnData && returnData.firstTimeToReset && returnData.firstTimeToReset.length === 0
                ? '' : ('(' + returnData.firstTimeToReset + 'sec)'))).appendTo(markets);
        $('<span>').text(', Right state: ').appendTo(markets);
        $('<span>',{id:secondId}).text(returnData.secondMarket).appendTo(markets);
        $('<span>').text((returnData && returnData.secondTimeToReset && returnData.secondTimeToReset.length === 0
                ? '' : ('(' + returnData.secondTimeToReset + 'sec)'))).appendTo(markets);

        $('<span>').text('; Arbitrage state: ').appendTo(markets);
        $('<span>', {id: arbId}).text(returnData.arbState).appendTo(markets);

        if (allSettings.leftIsBtm) {
            $('<span>').text('; Bitmex reconnect state: ').appendTo(markets);
            $('<span>', {id: btmReconId}).text(returnData.bitmexReconnectState).appendTo(markets);
            const bitmexSoState = $('<span>').appendTo(markets);
            mobx.autorun(r => showBitmexSoState(bitmexSoState, allSettings));
        }

        const okexSettlement = $('<span>').appendTo(markets)
        mobx.autorun(r => showOkexSettlement(okexSettlement, allSettings))

        createSignalStatusBar();
    }

    updateState(firstId, returnData.firstMarket);
    updateState(secondId, returnData.secondMarket);
    updateState(arbId, returnData.arbState);
    if (allSettings.leftIsBtm) {
        updateState(btmReconId, returnData.bitmexReconnectState);
    }

    const sigDeltay = returnData.signalDelay;
    const timeToSig = '. Time to signal (ms): ' + showTimeToSignal(returnData.timeToSignal);
    $('#signal-delay-label').html(sigDeltay + timeToSig);
    $('#delayVM-label').text(convertTimeToReset((returnData.timeToVolatileMode / 1000).toFixed())); // ms to sec
    $('#timeToResetTradingMode-label').text(convertTimeToReset(returnData.timeToResetTradingMode));
    stateUpdateChecker(returnData.timeToResetTradingMode);
    allSettings.bitmexChangeOnSo.secToReset = returnData.timeToResetBitmexChangeOnSo;

    updateDelayTimer($('#corrDelaySec-id'), returnData.corrDelay);
    updateDelayTimer($('#posAdjustmentDelaySec-id'), returnData.posAdjustmentDelay);
    updateDelayTimer($('#preliqDelaySec-id'), returnData.preliqDelay);
    updateDelayTimer($('#killposDelaySec-id'), returnData.killposDelay);

    mobxStore.marketStates = returnData;
    allSettings.okexSettlementMode = returnData.okexSettlementMode;
    allSettings.nowMomentStr = returnData.nowMomentStr
    fillOkexSettlementEnding(allSettings)
    allSettings.settingsVolatileMode.borderCrossDepth = returnData.autoAddBorderJson.borderCrossDepth
    allSettings.settingsVolatileMode.baddBorder = returnData.autoAddBorderJson.leftAddBorder
    allSettings.settingsVolatileMode.oaddBorder = returnData.autoAddBorderJson.rightAddBorder
};

function convertTimeToReset(timeToResetTradingMode) {
    return ', To reset(sec): ' + (Number(timeToResetTradingMode) === Number(0) ? "_none_" : timeToResetTradingMode);
}

function showBitmexSoState(lb, allSettings) {
  if (allSettings.bitmexChangeOnSo.secToReset > 0) {
    let flags = []
    flags.push(allSettings.bitmexChangeOnSo.toConBo ? 'R_wait_L_portions' : '')
    flags.push(allSettings.bitmexChangeOnSo.adjToTaker ? 'Adj_to_TAKER' : '')
    flags.push(allSettings.bitmexChangeOnSo.signalTo ? 'Signal_to_' + allSettings.bitmexChangeOnSo.signalPlacingType : '')
    const flag = flags.filter(value => value !== '').join(', ')
    lb.text(', Bitmex SO: ' + flag)
    lb.css('color', 'darkgoldenrod')
    lb.css('font-weight', 'bold')
  } else {
    lb.text(', Bitmex SO: NONE')
    lb.css('color', 'black')
    lb.css('font-weight', 'normal')
  }
}

function showOkexSettlement (lb, allSettings) {
    if (allSettings.okexSettlementMode) {
        lb.text(', Okex settlement! ' + allSettings.okexSettlementModeEnding)
        lb.css('color', 'orange')
        lb.css('font-weight', 'bold')
    } else {
        lb.text('')
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
        case 'KILLPOS':
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

    const deltaName = $('<span>').text('_').css(my_css_class).appendTo(cont);
    const signalDelay = $('<span>').text('signal_delay').css(my_css_class).appendTo(cont);
    const b_order_book = $('<span>').text('L_order_book').css(my_css_class).appendTo(cont);
    const b_order_book_XBTUSD = $('<span>').text('L_order_book_xbtusd').css(my_css_class);
    if (allSettings.eth) {
        b_order_book_XBTUSD.appendTo(cont);
    }
    const o_order_book = $('<span>').text('R_order_book').css(my_css_class).appendTo(cont);
    const btmMaxDelta = $('<span>').text('L_max_delta').css(my_css_class).appendTo(cont);
    const okMaxDelta = $('<span>').text('R_max_delta').css(my_css_class).appendTo(cont);
    const ntUsd = $('<span>').text('nt_usd').css(my_css_class).appendTo(cont);
    const states = $('<span>').text('states').css(my_css_class).appendTo(cont);
    const leftDqlOpen = $('<span>').text('L_dql_open').css(my_css_class).appendTo(cont);
    const rightDqlOpen = $('<span>').text('R_dql_open').css(my_css_class).appendTo(cont);
    const leftAffordable = $('<span>').text('L_affordable').css(my_css_class).appendTo(cont);
    const rightAffordable = $('<span>').text('R_affordable').css(my_css_class).appendTo(cont);
    const priceLimits = $('<span>').text('price_limits').css(my_css_class).appendTo(cont);
    const obTsDiffs = $('<span>').text('OB_Timestamps_diffs').css(my_css_class).appendTo(cont);

    function showPart(el, status) {
        el.prop('title', status);
        switch (status) {
            case 'OK':
                el.css('color', 'green');
                break
            case 'WRONG':
                el.css('color', 'red')
                break
            case 'STARTED':
                el.css('color', 'orange');
                break;
            default:
                el.css('color', 'black');
        }
    }

    mobx.autorun(r => {
        const sp = mobxStore.marketStates.signalParts;
        deltaName.text(sp.deltaName);
        showPart(signalDelay, sp.signalDelay);
        showPart(b_order_book, sp.btmOrderBook);
        if (allSettings.eth) {
            showPart(b_order_book_XBTUSD, sp.btmOrderBookXBTUSD);
        } else {
            b_order_book_XBTUSD.text('');
        }
        if (mobxStore.balanceInfo.areBothOkex) {
            leftDqlOpen.text('L_dmrl_open')
            rightDqlOpen.text('R_dmrl_open')
        } else {
            leftDqlOpen.text('L_dql_open')
            rightDqlOpen.text('R_dql_open')
        }
        showPart(o_order_book, sp.okOrderBook);
        showPart(btmMaxDelta, sp.btmMaxDelta);
        showPart(okMaxDelta, sp.okMaxDelta);
        showPart(ntUsd, sp.ntUsd)
        showPart(states, sp.states)
        showPart(leftDqlOpen, sp.btmDqlOpen)
        showPart(rightDqlOpen, sp.okDqlOpen)
        showPart(leftAffordable, sp.btmAffordable)
        showPart(rightAffordable, sp.okAffordable)
        showPart(priceLimits, sp.priceLimits)
        showPart(obTsDiffs, sp.obTsDiffs)
    });
}

let createDqlState = function () {
    let markets = $('#dql-state')
    let dqlStateLabel = $('<span>').text('Dql state: ').appendTo(markets)
    const stateVar = $('<span>').css('font-weight', 'bold').text('...').appendTo(markets)

    mobx.autorun(r => {
            dqlStateLabel.text(mobxStore.balanceInfo.areBothOkex
            ? 'Dmrl state: '
            : 'Dql state: ')

        const stateValue = mobxStore.marketStates.dqlState
        stateVar.text(stateValue);
        if (stateValue === 'KILLPOS') stateVar.css('color', 'red')
        if (stateValue === 'PRELIQ') stateVar.css('color', 'red')
        if (stateValue === 'CLOSE_ONLY') stateVar.css('color', 'orange')
        if (stateValue === 'ANY_ORDERS') stateVar.css('color', 'green')
    });

}

const createSeBestState = function () {
    const cont = $('#sebest-state')
    $('<span>').text('S_e_best: ').css('margin-left', '30px').appendTo(cont)
    const stateVar = $('<span>').css('font-weight', 'bold').text('...').appendTo(cont)

    const resetBtn = $('<button>').text('reset').appendTo(cont)
    const resetRes = $('<span>').appendTo(cont)
    resetBtn.click(() => {
        resetBtn.prop('disabled', true)
        Http.httpAsyncPost(allSettings.BASE_URL + '/market/reset-ebestmin', '',
          json => {
              resetBtn.prop('disabled', false)
              console.log(json)
              const res = JSON.parse(json)
              resetRes.text(res.result)
          })
    })

    mobx.autorun(r => {
        const stateValue = mobxStore.marketStates.sebestStatus
        stateVar.text(stateValue)
        if (stateValue === 'NORMAL') {
            stateVar.css('color', 'green')
            resetBtn.prop('disabled', true)
        }
        if (stateValue === 'LOWER') {
            stateVar.css('color', 'red')
            resetBtn.prop('disabled', false)
        }
    });

}

const createRecoveryState = function () {
    // "Recovery_nt_usd" "IN_PROGRESS/OFF", [reset]
    const cont = $('#sebest-state')
    $('<span>').text('Recovery_nt_usd: ').css('margin-left', '30px').appendTo(cont)
    const stateVar = $('<span>').css('font-weight', 'bold').text('...').appendTo(cont)

    const resetBtn = $('<button>').text('reset').appendTo(cont)
    const resetRes = $('<span>').appendTo(cont)
    resetBtn.click(() => {
        resetBtn.prop('disabled', true)
        Http.httpAsyncPost(allSettings.BASE_URL + '/market/reset-recovery-state', '',
          json => {
              resetBtn.prop('disabled', false)
              console.log(json)
              const res = JSON.parse(json)
              resetRes.text(res.result)
          })
    })

    mobx.autorun(r => {
        const stateValue = mobxStore.marketStates.recoveryStatus
        stateVar.text(stateValue)
        if (stateValue === 'OFF') {
            stateVar.css('color', 'green')
            resetBtn.prop('disabled', true)
        }
        if (stateValue === 'IN_PROGRESS') {
            stateVar.css('color', 'orange')
            resetBtn.prop('disabled', false)
        }
    });

}



