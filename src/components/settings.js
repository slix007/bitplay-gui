'use strict';

import { createPlacingBlocksVolatile } from '../components/placing-blocks'
import { createAdjVolatile } from './pos-adjustment'
import { fillBitmexChangeOnSo } from './settings-bitmexChangeOnSo'
import { bitmexChangeOnSoToConBo, bitmexSignalChangeOnSo } from '../store/settings-store'
import { showBitmexOrderBookType } from './settings/bitmex-custom'
import { showPreSignalObReFetch } from './settings/pre-signal'
import { showBitmexFokMaxDiff } from './settings/FOK_max_diff'
import { createPortions } from './settings-conBoPortions'
import { createAbortSignal } from './settings-abortSignal'
import { createBitmexCtList } from './settings-bitmexCtList'
import { showSumBalImpliedInput } from './settings/sum-bal-implied-input'

let $ = require('jquery');
let Http = require('../http');
let Utils = require('../utils');
let sprintf = require('sprintf-js').sprintf;
let mobx = require('mobx');
const {allSettings, mobxStore, setAllSettings, setAllSettingsRaw, isActive, isActiveV} = require('../store/settings-store');

const enableRestart = require('../components/enable-restart');
const obTimestamps = require('../components/settings-ob-timestamps');

export {showArbVersion, updateAllSettings, createSettingsInput, createCheckboxV, createSettingsV};

let updateAllSettings = function () {
    Http.httpAsyncGet(allSettings.SETTINGS_URL, function (rawData) {
        let settingsData = JSON.parse(rawData);
        setAllSettings(settingsData, allSettings.SETTINGS_URL);
    });
};

let showArbVersion = function (baseUrl) {
    const SETTINGS_URL = baseUrl + '/settings/all';
    const TOGGLE_STOP_MOVING_URL = baseUrl + '/settings/toggle-stop-moving';
    const SETTINGS_ADMIN_URL = baseUrl + '/settings/all-admin';

    Http.httpAsyncGet(SETTINGS_URL, function (rawData) {
        let settingsData = JSON.parse(rawData)
        setAllSettings(settingsData, SETTINGS_URL)
        enableRestart.showRestartEnable(baseUrl)
        obTimestamps.showSettingsObTimestamps(baseUrl)

        // Arb version
        let container = document.getElementById('select-arb-version')
        createArbScheme(container, SETTINGS_URL,
          x => ({ arbScheme: x }),
          x => x.arbScheme,
          true,
          x => x
        )
        createPortions(container)
        createAbortSignal(container)
        createBitmexCtList()

        // Bitmex place orders type:
        let $bitmexPlacingCont = $('#bitmex-placing-type')
        const btmPlacingLb = $('<span>').text('Left place orders type:')
        btmPlacingLb.appendTo($bitmexPlacingCont)
        createPlacingTypeWithBtmChangeOnSo($bitmexPlacingCont.get(0), SETTINGS_URL,
          x => ({ leftPlacingType: x }),
          x => x.leftPlacingType,
          btmPlacingLb, 'leftPlacingType', true)

        let okexPlacingCont = $('#okex-placing-type')
        const okPlacingLb = $('<span>').text('Right place orders type:')
        okPlacingLb.appendTo(okexPlacingCont)
        createPlacingType(okexPlacingCont.get(0), SETTINGS_URL,
          x => ({ rightPlacingType: x }),
          x => x.rightPlacingType,
          okPlacingLb, 'rightPlacingType', true)

        // okex postOnly settings
        // // let postOnlyContainer = $('#post-only-settings')
        // // createPostOnlyCheckbox(postOnlyContainer, settingsData.okexPostOnlyArgs, SETTINGS_URL)
        // // createPostOnlyWithoutLastCheckbox(postOnlyContainer, settingsData.okexPostOnlyArgs, SETTINGS_URL)
        // createSettingsInput(postOnlyContainer, SETTINGS_URL, 'placeTry',
        //   x => ({ okexPostOnlyArgs: { postOnlyAttempts: x } }),
        //   x => (x.okexPostOnlyArgs.postOnlyAttempts))
        // createSettingsInput(postOnlyContainer, SETTINGS_URL, 'betweenTryMs',
        //   x => ({ okexPostOnlyArgs: { postOnlyBetweenAttemptsMs: x } }),
        //         x => (x.okexPostOnlyArgs.postOnlyBetweenAttemptsMs));
        // // okex leverage
        // createSetttingsOkexLeverage();



        // Fee settings
        // const $feeCont = $('#fee-settings');
        const $feeCont = $('#fee-settings').css('display', 'flex');
        const comParamsCont = $('<div>').css('float', 'left').appendTo($feeCont);
        const table = $('<table>').css('border-spacing', 'unset').appendTo(comParamsCont);
        const tbody = $('<tbody>').appendTo(table);
        createComParam(tbody, x => ({feeSettings: {leftTakerComRate: x}}), x => x.feeSettings.leftTakerComRate,
                'L_taker_com_rate', 'left_best_sam', 'L_taker_com_');
        createComParam(tbody, x => ({feeSettings: {leftMakerComRate: x}}), x => x.feeSettings.leftMakerComRate,
                'L_maker_com_rate', 'left_best_sam', 'L_maker_com_');
        createComParam(tbody, x => ({feeSettings: {rightTakerComRate: x}}), x => x.feeSettings.rightTakerComRate,
                'R_taker_com_rate', 'right_best_sam', 'R_taker_com_');
        createComParam(tbody, x => ({feeSettings: {rightMakerComRate: x}}), x => x.feeSettings.rightMakerComRate,
                'R_maker_com_rate', 'right_best_sam', 'R_maker_com_');
        createComPtsSum($feeCont);

        // Ignore limits
        createIgnoreLimitPrice(settingsData, SETTINGS_URL);

        createManageType(settingsData, SETTINGS_URL);
        createStopMoving(settingsData, TOGGLE_STOP_MOVING_URL);

        createSignalDelay($('#signal-delay'), SETTINGS_URL, x => ({ signalDelayMs: x }), null, true)

        createColdStorage('btc', settingsData, SETTINGS_ADMIN_URL, x => ({ coldStorageBtc: x }), x => x.coldStorageBtc)
        if (settingsData.eth) {
            createColdStorage('eth', settingsData, SETTINGS_ADMIN_URL, x => ({ coldStorageEth: x }),
              x => x.coldStorageEth)
        }
        createEBestMin(settingsData, SETTINGS_ADMIN_URL)

        createUsdQuoteType(settingsData, SETTINGS_URL)

        createContractMode(settingsData, SETTINGS_URL, "left")
        createContractMode(settingsData, SETTINGS_URL, "right")
        createHedgeSettings(settingsData, SETTINGS_URL)


        // createOkexFakePriceDev(settingsData, SETTINGS_URL)
        // createOkexFtpd()

        createAdjustByNtUsd($('#adjust-by-nt-usd'), SETTINGS_URL, x => ({ adjustByNtUsd: x }), x => x.adjustByNtUsd,
          true)
        if (!allSettings.leftIsBtm) {
            createNtUsdMultiplicityOkex(settingsData, SETTINGS_URL, 'left')
        }
        createNtUsdMultiplicityOkex(settingsData, SETTINGS_URL)

        createOkexEbestElast(settingsData, SETTINGS_URL)

        createDqlParams(SETTINGS_URL)

        createDqlKillPos(SETTINGS_URL)

        createDqlLevel(SETTINGS_URL)

        showSumBalImpliedInput()
        mobx.autorun(function () {
            if (allSettings.eth) {
                console.log('hide sum-bal-implied')
                $('#sum-bal-implied-input').hide()
                $('#sum-bal-implied').hide()
            } else {
                console.log('show sum-bal-implied')
                $('#sum-bal-implied-input').show()
                $('#sum-bal-implied').show()
            }
        })

        if (allSettings.marketList.left === 'bitmex') {
            showBitmexOrderBookType()
            maxBitmexReconnects(settingsData, SETTINGS_URL)
            showBitmexFokMaxDiff()

            // System overload settings
            const overloadCnt = document.getElementById('sys-overload-settings')
            $('<span>').text('System overload and Post only settings').appendTo(overloadCnt)
            const overloadContainer = $('<span>').appendTo(overloadCnt)
            createPlaceAttempts(overloadContainer, settingsData.bitmexSysOverloadArgs, SETTINGS_URL)
            createSysOverloadErrors(overloadContainer, settingsData.bitmexSysOverloadArgs, SETTINGS_URL)
            createSysOverloadTime(overloadContainer, settingsData.bitmexSysOverloadArgs, SETTINGS_URL)
            createSysOverloadAttemptDelay(overloadContainer, settingsData.bitmexSysOverloadArgs, SETTINGS_URL)
            createXRateLimitBtm(overloadContainer)

            // Bitmex price workaround (for testing)
            createBitmexSpecialPrice(settingsData.bitmexPrice, SETTINGS_URL);

        } else {
            $('#bitmex-funding-rate-block').hide()
        }

        showPreSignalObReFetch()
    });

    // Volatile mode
    createTradingModeDropdown(SETTINGS_URL);

    const $column1Cont = $('#volatile-mode-params-1');
    // delay-timer-Label
    const contDelayTimer = $('<div>').appendTo($column1Cont);
    createSettingsV(contDelayTimer, SETTINGS_URL, 'Time to start VM(sec)',
            x => ({settingsVolatileMode: {volatileDelayMs: x * 1000}}),
            x => (x.settingsVolatileMode.volatileDelayMs / 1000).toFixed(),
            x => false);
    $('<span>').attr('id', 'delayVM-label').appendTo(contDelayTimer);
    // reset-timer-Label
    const contTimer = $('<div>').appendTo($column1Cont);
    createSettingsV(contTimer, SETTINGS_URL, 'Volatile duration(sec)',
            x => ({settingsVolatileMode: {volatileDurationSec: x}}),
      x => x.settingsVolatileMode.volatileDurationSec,
      x => false);
    $('<span>').attr('id', 'timeToResetTradingMode-label').appendTo(contTimer)
    const $borderCrossDepth = $('<div>').appendTo($column1Cont)
    createSettingsV($borderCrossDepth, SETTINGS_URL, 'Border cross depth',
      x => ({ settingsVolatileMode: { borderCrossDepth: x } }),
      x => x.settingsVolatileMode.borderCrossDepth,
      x => x.tradingModeAuto)
    createCheckboxPrem($borderCrossDepth, SETTINGS_URL, 'BCD_prem')

    const $column2Cont = $('#volatile-mode-params-2')
    const $btmPlacingContV = $('<div>').appendTo($column2Cont)
    createCheckboxV($btmPlacingContV, SETTINGS_URL, 'leftPlacingType')
    const btmPlacingLbV = $('<span>').text('Left place orders type:')
    btmPlacingLbV.appendTo($btmPlacingContV)
    createPlacingType($btmPlacingContV.get(0), SETTINGS_URL,
      x => ({ settingsVolatileMode: { leftPlacingType: x } }),
      x => x.settingsVolatileMode.leftPlacingType,
      btmPlacingLbV, 'leftPlacingType', false, true,
      x => x.settingsVolatileMode
    )

    const $okPlacingContV = $('<div>').appendTo($column2Cont)
    createCheckboxV($okPlacingContV, SETTINGS_URL, 'rightPlacingType')
    const okPlacingLbV = $('<span>').text('Right place orders type:')
    okPlacingLbV.appendTo($okPlacingContV)
    createPlacingType($okPlacingContV.get(0), SETTINGS_URL,
      x => ({ settingsVolatileMode: { rightPlacingType: x } }),
      x => x.settingsVolatileMode.rightPlacingType,
      okPlacingLbV, 'rightPlacingType'
    )

    const $signalDelayContV = $('<div>').appendTo($column2Cont)
    createCheckboxV($signalDelayContV, SETTINGS_URL, 'signalDelayMs')
    createSignalDelay($signalDelayContV, SETTINGS_URL, x => ({ settingsVolatileMode: { signalDelayMs: x } }),
      x => x.settingsVolatileMode.signalDelayMs)

    createSettingsV($('<div>').appendTo($column2Cont), SETTINGS_URL, 'BCD_prem: ',
      x => ({ settingsVolatileMode: { prem: { bcdPrem: Number(x).toFixed(3) } } }),
      x => x.settingsVolatileMode.prem.bcdPrem)
    createSettingsV($('<div>').appendTo($column2Cont), SETTINGS_URL, 'L_add_border_prem: ',
      x => ({ settingsVolatileMode: { prem: { leftAddBorderPrem: Number(x).toFixed(3) } } }),
      x => x.settingsVolatileMode.prem.leftAddBorderPrem)
    createSettingsV($('<div>').appendTo($column2Cont), SETTINGS_URL, 'R_add_border_prem: ',
      x => ({ settingsVolatileMode: { prem: { rightAddBorderPrem: Number(x).toFixed(3) } } }),
      x => x.settingsVolatileMode.prem.rightAddBorderPrem)

    const $leftAddBorder = $('<div>').appendTo($column1Cont)
    createSettingsV($leftAddBorder, SETTINGS_URL, 'L_add_border',
      x => ({ settingsVolatileMode: { baddBorder: x } }),
      x => x.settingsVolatileMode.baddBorder)
    createCheckboxPrem($leftAddBorder, SETTINGS_URL, 'L_add_border_prem')
    const $rightAddBorder = $('<div>').appendTo($column1Cont)
    createSettingsV($rightAddBorder, SETTINGS_URL, 'R_add_border',
      x => ({ settingsVolatileMode: { oaddBorder: x } }),
      x => x.settingsVolatileMode.oaddBorder)
    createCheckboxPrem($rightAddBorder, SETTINGS_URL, 'R_add_border_prem')

    const $column3Cont = $('#volatile-mode-params-3')
    const $placingBlocksContV = $('<div>').appendTo($column3Cont)
    createCheckboxV($placingBlocksContV, SETTINGS_URL, 'placingBlocks');
    createPlacingBlocksVolatile($placingBlocksContV, SETTINGS_URL);

    const $posAdjustmentContV = $('<div>').appendTo($column3Cont);
    createCheckboxV($posAdjustmentContV, SETTINGS_URL, 'posAdjustment');
    const posAdjLb = $('<span>').text('posAdjustment:').appendTo($posAdjustmentContV);
    createPlacingType($posAdjustmentContV.get(0), SETTINGS_URL,
            x => ({settingsVolatileMode: {posAdjustment: {posAdjustmentPlacingType: x}}}),
            x => x.settingsVolatileMode.posAdjustment.posAdjustmentPlacingType,
            posAdjLb, 'posAdjustment', false, true
    );
    createAdjVolatile($posAdjustmentContV, SETTINGS_URL);

    const $adjustByNtUsdContV = $('<div>').appendTo($column3Cont);
    createCheckboxV($adjustByNtUsdContV, SETTINGS_URL, 'adjustByNtUsd');
    $adjustByNtUsdContV.append($('<span>').text('adjustByNtUsd:'));
    createAdjustByNtUsd($adjustByNtUsdContV, SETTINGS_URL, x => ({settingsVolatileMode: {adjustByNtUsd: x}}),
            x => x.settingsVolatileMode.adjustByNtUsd);

    const $corr_adjContV = $('<div>').appendTo($column3Cont);
    createCheckboxV($corr_adjContV, SETTINGS_URL, 'corr_adj');
    $corr_adjContV.append($('<span>').text('corr_adj:'));
    createSettingsV($corr_adjContV, SETTINGS_URL, ' corr max total',
            x => ({settingsVolatileMode: {corrMaxTotalCount: x}}),
            x => x.settingsVolatileMode.corrMaxTotalCount);
    createSettingsV($corr_adjContV, SETTINGS_URL, ', adj max total',
            x => ({settingsVolatileMode: {adjMaxTotalCount: x}}),
            x => x.settingsVolatileMode.adjMaxTotalCount);

    const $arbSchemeV = $('<div>').appendTo($column3Cont);
    createCheckboxV($arbSchemeV, SETTINGS_URL, 'arb_scheme')
    createArbScheme($arbSchemeV, SETTINGS_URL,
      x => ({ settingsVolatileMode: { arbScheme: x } }),
      x => x.settingsVolatileMode.arbScheme,
      false,
      x => x.settingsVolatileMode
    )

    if (allSettings.marketList.left === 'bitmex') {
        fillBitmexChangeOnSo();
    }
};

let createSettingsV = function(container, SETTINGS_URL, labelName, requestCreator, valExtractor, isActiveFunc) {
    const lb = $('<span>').text(labelName).appendTo(container);
    const edit = $('<input>').width('40px').appendTo(container);
    const updateBtn = $('<button>').text('set').appendTo(container);
    const realValue = $('<span>').appendTo(container);
    updateBtn.click(() => {
        const requestData = JSON.stringify(requestCreator(edit.val()));
        updateBtn.prop('disabled', true);
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
            setAllSettingsRaw(result);
            updateBtn.prop('disabled', false);
        });
    });
    mobx.autorun(function () {
        const value = valExtractor(allSettings);
        realValue.text(value);
        const isActive = isActiveFunc ? isActiveFunc(allSettings)
                : allSettings.tradingModeState.tradingMode === 'VOLATILE';
        if (isActive && value !== 0) {
            lb.css('font-weight', 'bold').prop('title', '');
        } else {
            lb.css('font-weight', 'normal').prop('title', '');
        }
    });
}

let createCheckboxV = function(cont, SETTINGS_URL, fieldName) {
    const checkbox = $('<input>').attr('type', 'checkbox').appendTo(cont);
    mobx.autorun(function () {
        checkbox.prop('checked', isActive(fieldName));
    });
    checkbox.click(function () {
        Utils.disableElements(cont);

        const req = checkbox.prop('checked')
                ? {settingsVolatileMode: {fieldToAdd: fieldName}}
                : {settingsVolatileMode: {fieldToRemove: fieldName}};
        const requestData = JSON.stringify(req);

        Http.httpAsyncPost(SETTINGS_URL,
                requestData, function (result) {
                    setAllSettingsRaw(result);
                    Utils.enableElements(cont);
                });
    });
}

let createCheckboxPrem = function(cont, SETTINGS_URL, fieldName) {
    const checkbox = $('<input>').attr('type', 'checkbox').prop('title','auto').appendTo(cont);
    const lb = $('<spin>').text('auto').appendTo(cont)
    mobx.autorun(function () {
        if (isActive(fieldName)) {
            checkbox.prop('checked', true);
            lb.css("font-weight","bold")
            Utils.disableElements(cont);
            checkbox.prop('disabled', false)
        } else {
            checkbox.prop('checked', false);
            lb.css("font-weight","normal")
            Utils.enableElements(cont);
        }
    });
    checkbox.click(function () {
        checkbox.prop('disabled', true)
        const req = checkbox.prop('checked')
          ? {settingsVolatileMode: {fieldToAdd: fieldName}}
          : {settingsVolatileMode: {fieldToRemove: fieldName}};
        const requestData = JSON.stringify(req);
        Http.httpAsyncPost(SETTINGS_URL,
          requestData, function (result) {
              setAllSettingsRaw(result);
              checkbox.prop('disabled', false)
          });
    });
}

function createTradingModeDropdown(SETTINGS_URL) {
    let $cont = $('#volatile-mode-params-1');

    // select
    let select = $('<select>', {id: 'tradingMode-id'});
    select.append($('<option>').val('CURRENT').text('Current'));
    select.append($('<option>').val('VOLATILE').text('Volatile'));
    mobx.autorun(function () {
        select.val(allSettings.tradingModeState.tradingMode);
    });

    $('<span>').text('Trading mode: ').appendTo($cont);
    $cont.append(select);

    select.change(() => Http.httpAsyncPost(SETTINGS_URL, JSON.stringify({tradingModeState: {tradingMode: select.val()}}),
            json => {
                const res = setAllSettingsRaw(json);
                alert('New value: ' + res.tradingModeState.tradingMode);
            }));

    // checkbox auto
    const autoCheckbox = $('<input>').attr('type', 'checkbox').appendTo($cont);
    const lb = $('<label>').text('auto').appendTo($cont);
    autoCheckbox.click(function () {
        Http.httpAsyncPost(SETTINGS_URL, JSON.stringify({tradingModeAuto: autoCheckbox.prop('checked')}),
                json => setAllSettingsRaw(json))
    });

    mobx.autorun(function () {
        autoCheckbox.prop('checked', allSettings.tradingModeAuto);
        if (allSettings.tradingModeAuto && allSettings.settingsVolatileMode.borderCrossDepth !== 0) {
            lb.css('font-weight', 'bold').prop('title', 'Activated auto select mode');
        } else {
            lb.css('font-weight', 'normal').prop('title', '');
        }
    });
}

function createPlaceAttempts(mainContainer, obj, SETTINGS_URL) {
    let container = document.createElement('div');
    mainContainer.append(container);

    let label = document.createElement('span');
    label.innerHTML = 'placeTry';
    let edit = document.createElement('input');
    edit.innerHTML = '';
    let updateBtn = document.createElement('button');
    updateBtn.onclick = onBtnClick;
    updateBtn.innerHTML = 'update';
    let realValue = document.createElement('span');
    realValue.innerHTML = obj.placeAttempts;

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(updateBtn);
    container.appendChild(realValue);

    function onBtnClick() {
        const requestData = JSON.stringify({bitmexSysOverloadArgs: {placeAttempts: edit.value}});
        updateBtn.disabled = true;
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
            let data = JSON.parse(result);
            realValue.innerHTML = data.bitmexSysOverloadArgs.placeAttempts;
            updateBtn.disabled = false;
        });
    }
}

function createSysOverloadErrors(mainContainer, obj, SETTINGS_URL) {
    var container = document.createElement('div');
    mainContainer.append(container);

    var label = document.createElement('span');
    label.innerHTML = 'movingErrorsForOverload';
    var edit = document.createElement('input');
    edit.innerHTML = '';
    var updateBtn = document.createElement('button');
    updateBtn.onclick = onBtnClick;
    updateBtn.innerHTML = 'update';
    var realValue = document.createElement('span');
    realValue.innerHTML = obj.movingErrorsForOverload;

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(updateBtn);
    container.appendChild(realValue);

    function onBtnClick() {
        const requestData = JSON.stringify({bitmexSysOverloadArgs: {movingErrorsForOverload: edit.value}});
        updateBtn.disabled = true;
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
            let data = JSON.parse(result);
            realValue.innerHTML = data.bitmexSysOverloadArgs.movingErrorsForOverload;
            updateBtn.disabled = false;
        });
    }
}

function createSysOverloadTime(mainContainer, obj, SETTINGS_URL) {
    let container = document.createElement('div');
    mainContainer.append(container);

    let label = document.createElement('span');
    label.innerHTML = 'overloadTimeMs';
    let edit = document.createElement('input');
    edit.innerHTML = '';
    let updateBtn = document.createElement('button');
    updateBtn.onclick = onBtnClick;
    updateBtn.innerHTML = 'update';
    let realValue = document.createElement('span');
    realValue.innerHTML = obj.overloadTimeMs;

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(updateBtn);
    container.appendChild(realValue);

    function onBtnClick() {
        const requestData = JSON.stringify({bitmexSysOverloadArgs: {overloadTimeMs: edit.value}});
        updateBtn.disabled = true;
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
            let data = JSON.parse(result);
            realValue.innerHTML = data.bitmexSysOverloadArgs.overloadTimeMs;
            updateBtn.disabled = false;
        });
    }
}

function createSysOverloadAttemptDelay(mainContainer, obj, SETTINGS_URL) {
    let container = document.createElement('div');
    mainContainer.append(container);

    let label = document.createElement('span');
    label.innerHTML = 'betweenTryMs';
    let edit = document.createElement('input');
    edit.innerHTML = '';
    let updateBtn = document.createElement('button');
    updateBtn.onclick = onBtnClick
    updateBtn.innerHTML = 'update'
    let realValue = document.createElement('span')
    realValue.innerHTML = obj.betweenAttemptsMs

    container.appendChild(label)
    container.appendChild(edit)
    container.appendChild(updateBtn)
    container.appendChild(realValue)

    function onBtnClick () {
        const requestData = JSON.stringify({ bitmexSysOverloadArgs: { betweenAttemptsMs: edit.value } })
        updateBtn.disabled = true
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
            let data = JSON.parse(result)
            realValue.innerHTML = data.bitmexSysOverloadArgs.betweenAttemptsMs
            updateBtn.disabled = false
        })
    }
}

function createXRateLimitBtm (mainCont) {
    const $cont = $('<div>').appendTo(mainCont)
    const label = $('<span>').appendTo($cont)
    mobx.autorun(r => {
        const lim = mobxStore.allMon.xrateLimitBtm
        const t = mobxStore.allMon.xrateLimitBtmUpdated
        label.text(`xRateLimit=${lim}; timestamp:${t}`)
        if (lim < 5) {
            label.css('color', 'red')
        } else {
            label.css('color', 'black')
        }
    })
}

function createSettingsInput(mainCont, SETTINGS_URL, labelName, requestCreator, valExtractor, sameCont) {
    const container = sameCont ? mainCont : $('<div>').appendTo(mainCont);
    const lb = $('<span>').text(labelName).appendTo(container);
    const edit = $('<input>').width('40px').appendTo(container);
    const updateBtn = $('<button>').text('set').appendTo(container);
    const realValue = $('<span>').appendTo(container);
    updateBtn.click(() => {
        const requestData = JSON.stringify(requestCreator(edit.val()));
        updateBtn.prop('disabled', true);
        console.log('SettingsInput request:' + requestData + ' to ' + SETTINGS_URL)
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
            setAllSettingsRaw(result);
            updateBtn.prop('disabled', false);
        });
    });
    mobx.autorun(function () {
        const value = valExtractor(allSettings);
        realValue.text(value);
    });
    return realValue
}

function createPlacingType (mainContainer, SETTINGS_URL, requestCreator, valExtractor, lb, fieldName, isMain,
  withTakerFok, settingsObj) {
    const select = $('<select>')
    select.append($('<option>').val('TAKER').text('TAKER'))
    const optionTakerFok = $('<option>').val('TAKER_FOK').text('TAKER_FOK')
    const optionTakerIoc = $('<option>').val('TAKER_IOC').text('TAKER_IOC')
    if (withTakerFok) {
        select.append(optionTakerFok)
        select.append(optionTakerIoc)
    }
    select.append($('<option>').val('MAKER').text('MAKER'))
    select.append($('<option>').val('HYBRID').text('HYBRID'))
    select.append($('<option>').val('MAKER_TICK').text('MAKER_TICK'))
    select.append($('<option>').val('HYBRID_TICK').text('HYBRID_TICK'))
    select.change(onVerPick)

    mainContainer.appendChild(select.get(0))

    mobx.autorun(function () {
        if (settingsObj) {
            optionTakerFok.attr('disabled', settingsObj(allSettings).arbScheme !== 'R_wait_L_portions')
        }
        if (!allSettings.leftIsBtm) {
            optionTakerFok.attr('disabled', true)
            optionTakerIoc.attr('disabled', true)
        }

        select.val(valExtractor(allSettings))
        if (isActiveV(fieldName)) {
            lb.css('font-weight', 'bold').prop('title', 'Activated VOLATILE mode')
        } else {
            lb.css('font-weight', 'normal').prop('title', '')
        }
        if (isMain) {
            if (isActiveV(fieldName)) {
                select.get(0).disabled = true
            } else {
                select.get(0).disabled = false;
            }
        }
    });

    function onVerPick() {
        const requestData = JSON.stringify(requestCreator(this.value));
        select.get(0).disabled = true;
        Http.httpAsyncPost(SETTINGS_URL,
                requestData, function (result) {
                    setAllSettingsRaw(result);
                    select.get(0).disabled = false;
                });
    }
}

function createPlacingTypeWithBtmChangeOnSo(mainContainer, SETTINGS_URL, requestCreator, valExtractor, lb, fieldName, isMain) {
    const select = $('<select>')
    select.append($('<option>').val('TAKER').text('TAKER'))
    // select.append($('<option>').val('TAKER_FOK').text('TAKER_FOK'))
    // const optionIoc = $('<option>').val('TAKER_IOC').text('TAKER_IOC')
    // select.append(optionIoc);
    const optionTakerFok = $('<option>').val('TAKER_FOK').text('TAKER_FOK')
    const optionTakerIoc = $('<option>').val('TAKER_IOC').text('TAKER_IOC')
    select.append(optionTakerFok)
    select.append(optionTakerIoc)
    select.append($('<option>').val('MAKER').text('MAKER'))
    select.append($('<option>').val('HYBRID').text('HYBRID'))
    select.append($('<option>').val('MAKER_TICK').text('MAKER_TICK'))
    select.append($('<option>').val('HYBRID_TICK').text('HYBRID_TICK'))
    select.change(onVerPick)
    mainContainer.appendChild(select.get(0))

    mobx.autorun(function () {
        optionTakerIoc.attr('disabled', allSettings.arbScheme !== 'R_wait_L_portions')
        if (!allSettings.leftIsBtm) {
            optionTakerFok.attr('disabled', true)
            optionTakerIoc.attr('disabled', true)
        }
        select.val(valExtractor(allSettings))
        if (isMain) {
            let extraTitle = ''
            const bitmexChangeOnSoSignalType = bitmexSignalChangeOnSo()
            if (bitmexChangeOnSoSignalType) {
                extraTitle += 'BitmexChangeOnSo: Signal_to_' + bitmexChangeOnSoSignalType
                select.val(bitmexChangeOnSoSignalType)
            }
            if (isActiveV(fieldName)) {
                extraTitle += '\nActivated VOLATILE mode'
            }
            if (extraTitle.length > 0) {
                lb.css('font-weight', 'bold').prop('title', extraTitle);
                select.get(0).disabled = true;
            } else {
                lb.css('font-weight', 'normal').prop('title', '');
                select.get(0).disabled = false;
            }
        }
    });

    function onVerPick() {
        const requestData = JSON.stringify(requestCreator(select.val()));
        select.get(0).disabled = true;
        Http.httpAsyncPost(SETTINGS_URL,
                requestData, function (result) {
                    setAllSettingsRaw(result);
                    select.get(0).disabled = false;
                });
    }
}

function createArbScheme (container, SETTINGS_URL, requestCreator, valExtractor, isMain, settingsObj) {
    const lb = $('<span>').text('Arbitrage version:').appendTo(container)
    let select = $('<select>').appendTo(container)
    const optionSim = $('<option>').val('L_with_R').text('L_with_R')
    const optionConBo = $('<option>').val('R_wait_L').text('R_wait_L')
    select.append(optionSim)
    select.append(optionConBo)
    select.append($('<option>').val('R_wait_L_portions').text('R_wait_L_portions'))
    select.change(function () {
        const requestData = JSON.stringify(requestCreator(this.value))
        select.disabled = true
        Http.httpAsyncPost(SETTINGS_URL, requestData, result => {
            setAllSettingsRaw(result)
            select.attr('disabled', false)
        })
    })
    mobx.autorun(function () {
        if (settingsObj(allSettings).leftPlacingType === 'TAKER_IOC') {
            optionSim.attr('disabled', true)
            optionConBo.attr('disabled', true)
        } else {
            optionSim.attr('disabled', false)
            optionConBo.attr('disabled', false)
        }
        select.val(valExtractor(allSettings))
        if (isMain) {
            let extraTitle = ''
            if (bitmexChangeOnSoToConBo()) {
                extraTitle += 'BitmexChangeOnSo:R_wait_L_portions'
                select.val('R_wait_L_portions')
            }
            if (isActiveV('arb_scheme')) {
                extraTitle += '\nActivated VOLATILE mode'
            }
            if (extraTitle.length > 0) {
                lb.css('font-weight', 'bold').prop('title', extraTitle);
                select.attr('disabled', true);
            } else {
                lb.css('font-weight', 'normal').prop('title', '');
                select.attr('disabled', false);
            }
        }
    });
}

function createBitmexSpecialPrice(obj, SETTINGS_URL) {
    let mainContainer = document.getElementById("bitmex-price");
    $('#bitmex-price').css('font-style', 'italic').css('text-decoration', 'underline')
    .prop('title', 'the testing price for non-taker or taker-fill-or-kill orders');
    let container = document.createElement('div');
    mainContainer.appendChild(container);

    let label = document.createElement('span');
    label.innerHTML = 'bitmexPrice';
    let edit = document.createElement('input');
    edit.innerHTML = '';
    let updateBtn = document.createElement('button');
    updateBtn.onclick = onBtnClick;
    updateBtn.innerHTML = 'update';
    let realValue = document.createElement('span');
    realValue.innerHTML = obj;

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(updateBtn);
    container.appendChild(realValue);

    function onBtnClick() {
        const requestData = JSON.stringify({bitmexPrice: edit.value});
        updateBtn.disabled = true;
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
            setAllSettingsRaw(result);
            updateBtn.disabled = false;
        });
    }

    mobx.autorun(() => {
        realValue.innerHTML = allSettings.bitmexPrice;
        if (!allSettings.bitmexPrice || allSettings.bitmexPrice === 0) {
            label.style.backgroundColor = 'white';
        } else {
            label.style.backgroundColor = 'tomato';
        }
    });
}

function createComParam(tbody, requestCreator, valExtractor, label_rate, best_sam_name, el_name_part) {
    const container = $('<tr>').appendTo(tbody);

    $('<span>').text(label_rate).appendTo($('<td>').appendTo(container));
    const edit = $('<input>').width('80px').appendTo($('<td>').appendTo(container));
    const updateBtn = $('<button>').text('set').appendTo($('<td>').appendTo(container));
    const realVal = $('<span>').text(';').prop('title', '%').appendTo($('<td>').appendTo(container));
    const realValPts = $('<span>').text(';').css('margin-left', '20px').appendTo($('<td>').appendTo(container));
    const realValPts2 = $('<span>').text(';').prop('title', 'pts * 2').appendTo($('<td>').appendTo(container));
    updateBtn.click(() => {
        const requestData = JSON.stringify(requestCreator(edit.val()));
        updateBtn.prop('disabled', true);
        Http.httpAsyncPost(allSettings.SETTINGS_URL, requestData, function (result) {
            setAllSettingsRaw(result);
            updateBtn.prop('disabled', false);
        });
    });

    mobx.autorun(r => {
        const realRate = valExtractor(allSettings);
        const best_sam = mobxStore[best_sam_name];
        const pts = (realRate / 100 * best_sam).toFixed(3);
        realVal.text(realRate);
        realValPts.text('pts = ' + pts);
        realValPts2.text(' /  ' + pts * 2);

        realValPts.prop('title', sprintf('%s_pts = %s_rate / 100 * %s\n' +
                '%s = %s / 100 * %s',
                el_name_part, el_name_part, best_sam_name,
                pts, realRate, best_sam
        ));

    });
}

function createComPtsSum($feeCont) {
    const comParamsCont2 = $('<div>').css('float', 'left').css('margin-left', '20px').appendTo($feeCont);
    const table2 = $('<table>').appendTo(comParamsCont2);
    const tbody2 = $('<tbody>').appendTo(table2);
    const sumMaker = $('<span>').text('L_maker + R_maker = ');
    sumMaker.appendTo($('<td>').appendTo($('<tr>').appendTo(tbody2)));
    const sumTaker = $('<span>').text('L_taker + R_taker = ');
    sumTaker.appendTo($('<td>').appendTo($('<tr>').appendTo(tbody2)));
    mobx.autorun(r => {
        // b_maker + o_maker;
        // b_taker + o_taker.
        const left_taker_com_pts = Number((allSettings.feeSettings.leftTakerComRate / 100 * mobxStore.left_best_sam).toFixed(3));
        const left_maker_com_pts = Number((allSettings.feeSettings.leftMakerComRate / 100 * mobxStore.left_best_sam).toFixed(3));
        const right_taker_com_pts = Number((allSettings.feeSettings.rightTakerComRate / 100 * mobxStore.right_best_sam).toFixed(3));
        const right_maker_com_pts = Number((allSettings.feeSettings.rightMakerComRate / 100 * mobxStore.right_best_sam).toFixed(3));
        // const sumM = (Number(left_maker_com_pts) + Number(right_maker_com_pts));
        const sumM = Number((left_maker_com_pts + right_maker_com_pts).toFixed(3));
        const sumM2 = (sumM * 2).toFixed(3);
        sumMaker.text('L_maker + R_maker = ' + sumM + ' / ' + sumM2);
        const sumT = Number((left_taker_com_pts + right_taker_com_pts).toFixed(3));
        const sumT2 = (sumT * 2).toFixed(3);
        sumTaker.text('L_taker + R_taker = ' + sumT + ' / ' + sumT2);
    });

}


function createIgnoreLimitPrice(settingsData, SETTINGS_URL) {
    let container = document.getElementById("ignore-limits");

    let checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.checked = settingsData.limits.ignoreLimits;
    let decorateLimitsStatus = function () {
        if (checkbox.checked) {
            $('#left-limits-status').css("text-decoration", "line-through");
            $('#right-limits-status').css("text-decoration", "line-through");
        } else {
            $('#left-limits-status').css("text-decoration", "initial");
            $('#right-limits-status').css("text-decoration", "initial");
        }
    };
    decorateLimitsStatus();

    checkbox.id = "ignoreLimits";
    checkbox.onchange = function (ev) {
        checkbox.disabled = true;

        let requestObj = {limits: {ignoreLimits: checkbox.checked}};
        const requestData = JSON.stringify(requestObj);
        console.log(requestData);
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (rawRes) {
            const res = JSON.parse(rawRes);
            console.log(res);
            checkbox.checked = res.limits.ignoreLimits;
            decorateLimitsStatus();
            checkbox.disabled = false;
        });
    };

    let label = document.createElement('label');
    label.appendChild(document.createTextNode('ignoreLimits'));

    container.appendChild(checkbox);
    container.appendChild(label);
}

function createManageType(settingsData, SETTINGS_URL) {
    const $cont = $('#manage-type');
    $('<span>').text('Manage type: ').appendTo($cont);
    const manageTypeEl = $('<span>').text('Manage type: ').css('font-weight', 'bold').appendTo($cont);
    let btn = $('<button>').appendTo($cont);

    mobx.autorun(function () {
        manageTypeEl.text(allSettings.manageType);
        if (allSettings.manageType === 'AUTO') {
            manageTypeEl.css('color', 'green');
            btn.text('Switch to MANUAL');
        } else { // MANUAL
            manageTypeEl.css('color', 'red');
            btn.text('Switch to AUTO');
        }
    });
    btn.click(() => {
        btn.prop('disabled', true);
        const val = allSettings.manageType === 'AUTO' ? 'MANUAL' : 'AUTO';
        const data = JSON.stringify({manageType: val});
        Http.httpAsyncPost(SETTINGS_URL, data,
                json => {
                    btn.prop('disabled', false);
                    const res = setAllSettingsRaw(json);
                    // alert('New value: ' + res.manageType);
                })
    });
}

function createStopMoving(settingsData, TOGGLE_STOP_MOVING_URL) {
    const $cont = $('#manage-type'); // add after.
    const stopMovingCheckbox = $('<input>').css('margin-left', '15px').attr('type', 'checkbox').appendTo($cont);
    const stopMovingLb = $('<span>').text('moving ...').appendTo($cont);
    mobx.autorun(function () {
        if (allSettings.extraFlags.includes('STOP_MOVING')) {
            stopMovingLb.text('moving disabled').css('color', 'red');;
            stopMovingCheckbox.prop('checked', true);
        } else {
            stopMovingLb.text('disable moving').css('color', 'black');;
            stopMovingCheckbox.prop('checked', false);
        }
    });
    stopMovingCheckbox.click(() => {
        stopMovingCheckbox.prop('disabled', true);
        Http.httpAsyncPost(TOGGLE_STOP_MOVING_URL, "",
                json => {
                    stopMovingCheckbox.prop('disabled', false);
                    const res = setAllSettingsRaw(json);
                    // alert('New value: ' + res.manageType);
                })
    });
}

function createSignalDelay(cont, SETTINGS_URL, requestCreator, valExtractor, isMain) {
    let container = cont.get(0);
    let label = $('<span>');
    label.text('Signal delay (ms):');
    let edit = document.createElement('input');
    edit.style.width = '80px';
    edit.innerHTML = '';
    let resultLabel = document.createElement('span');
    let setBtn = document.createElement('button');
    setBtn.onclick = function () {
        setBtn.disabled = true;
        Http.httpAsyncPost(SETTINGS_URL, JSON.stringify(requestCreator(edit.value)), function (rawRes) {
            setAllSettingsRaw(rawRes);
            setBtn.disabled = false;
        });
    };
    setBtn.innerHTML = 'set';

    container.appendChild(label.get(0));
    container.appendChild(edit);
    container.appendChild(setBtn);
    container.appendChild(resultLabel);

    mobx.autorun(function () {
        if (valExtractor) {
            resultLabel.innerText = valExtractor(allSettings);
        }
        if (isActiveV('signalDelayMs')) {
            label.css('font-weight', 'bold').prop('title', 'Activated VOLATILE mode');
            if (isMain) {
                setBtn.disabled = true;
            }
        } else {
            label.css('font-weight', 'normal').prop('title', '');
            if (isMain) {
                setBtn.disabled = false;
            }
        }
    });
}

function createColdStorage(coldStorageType, settingsData, SETTINGS_ADMIN_URL, requestCreator, valExtractor) {
    let container = document.getElementById("cold-storage-" + coldStorageType);

    let label = document.createElement('span');
    label.innerHTML = sprintf('Cold Storage(%s):', coldStorageType);
    let edit = document.createElement('input');
    edit.style.width = '80px';
    edit.innerHTML = '';
    let resultLabel = document.createElement('span');
    let setBtn = document.createElement('button');
    setBtn.innerHTML = 'set';
    setBtn.onclick = function () {
        setBtn.disabled = true;
        const requestData = JSON.stringify(requestCreator(edit.value));
        Http.httpAsyncPost(SETTINGS_ADMIN_URL,
                requestData, function (rawRes) {
                    setAllSettingsRaw(rawRes);
                    setBtn.disabled = false;
                });
    };
    mobx.autorun(function () {
        resultLabel.innerHTML = valExtractor(allSettings);
    });

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(setBtn);
    container.appendChild(resultLabel);

    if (!userInfo.isAdmin()) {
        Utils.disableChildren(container);
    }
}

function createEBestMin(settingsData, SETTINGS_ADMIN_URL) {
    var container = document.getElementById("e-best-min");

    var label = document.createElement('span');
    label.innerHTML = 'e_best_min:';
    var edit = document.createElement('input');
    edit.style.width = '80px';
    edit.innerHTML = '';
    var resultLabel = document.createElement('span');
    resultLabel.innerHTML = settingsData.ebestMin;
    var setBtn = document.createElement('button');
    setBtn.onclick = function () {
        setBtn.disabled = true;
        const requestData = JSON.stringify({ebestMin: edit.value});
        console.log(requestData);
        Http.httpAsyncPost(SETTINGS_ADMIN_URL,
                requestData, function (rawRes) {
                    const res = JSON.parse(rawRes);
                    resultLabel.innerHTML = res.ebestMin;
                    setBtn.disabled = false;
                    // alert(rawRes);
                });
    };
    setBtn.innerHTML = 'set';

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(setBtn);
    container.appendChild(resultLabel);

    if (!userInfo.isAdmin()) {
        Utils.disableElements($("#e-best-min"));
    }
}

function createUsdQuoteType(settingsData, SETTINGS_URL) {
    var arr = [
        'LEFT',
        'RIGHT',
        'AVG',
        'INDEX_LEFT',
        'INDEX_RIGHT'
    ];
    const label = $('<span/>', {title: 'How to convert BTC to USD'}).html('Usd quote type: ');
    const select = $('<select/>').html($.map(arr, function (item) {
        return $('<option/>', {value: item, text: item});
    })).val(settingsData.usdQuoteType);
    select.on('change', onVerPick);

    $("#usd-quote-type").append(label).append(select);

    function onVerPick() {
        console.log(this.value);
        const requestData = JSON.stringify({ usdQuoteType: this.value })

        Http.httpAsyncPost(SETTINGS_URL,
          requestData, function (result) {
              let data = JSON.parse(result)
              alert('New value: ' + data.usdQuoteType)
          })
    }

}

const leftContractTypes = [
    { txt: 'Bitmex [XBTUSD_Perpetual]', val: 'XBTUSD_Perpetual' },
    { txt: 'Bitmex [ETHUSD_Perpetual]', val: 'ETHUSD_Perpetual' },
    { txt: 'Bitmex [LINKUSDT_Perpetual]', val: 'LINKUSDT_Perpetual' },
    { txt: 'Bitmex [XRPUSD_Perpetual]', val: 'XRPUSD_Perpetual' },
    { txt: 'Bitmex [LTCUSD_Perpetual]', val: 'LTCUSD_Perpetual' },
    { txt: 'Bitmex [BCHUSD_Perpetual]', val: 'BCHUSD_Perpetual' },
    { txt: 'Bitmex [XBTUSD_Quarter]', val: 'XBTUSD_Quarter' },
    { txt: 'Bitmex [ETHUSD_Quarter]', val: 'ETHUSD_Quarter' },
    { txt: 'Bitmex [XBTUSD_BiQuarter]', val: 'XBTUSD_BiQuarter' },
    { txt: 'Okex [BTCUSD_ThisWeek]', val: 'BTC_ThisWeek' },
    { txt: 'Okex [BTCUSD_NextWeek]', val: 'BTC_NextWeek' },
    { txt: 'Okex [ETHUSD_ThisWeek]', val: 'ETH_ThisWeek' },
    { txt: 'Okex [ETHUSD_NextWeek]', val: 'ETH_NextWeek' },
]
//Okex [ETHUSD_ThisWeek]
// Okex [ETHUSD_NextWeek]
// Okex [ETHUSD_Swap]
// Okex [BTCUSD_ThisWeek]
// Okex [BTCUSD_NextWeek]
// Okex [BTCUSD_Quarter]
// Okex [BTC_Swap]
const rightContractTypes = [
    { txt: 'Okex [ETHUSD_ThisWeek]', val: 'ETH_ThisWeek' },
    { txt: 'Okex [ETHUSD_NextWeek]', val: 'ETH_NextWeek' },
    { txt: 'Okex [ETHUSD_Quarter]', val: 'ETH_Quarter' },
    { txt: 'Okex [ETHUSD_Perpetual]', val: 'ETH_Swap' },
    { txt: 'Okex [BTCUSD_ThisWeek]', val: 'BTC_ThisWeek' },
    { txt: 'Okex [BTCUSD_NextWeek]', val: 'BTC_NextWeek' },
    { txt: 'Okex [BTCUSD_Quarter]', val: 'BTC_Quarter' },
    { txt: 'Okex [BTCUSD_BiQuarter]', val: 'BTC_BiQuarter' },
    { txt: 'Okex [BTCUSD_Perpetual]', val: 'BTC_Swap' }
]


function createContractMode (settingsData, SETTINGS_URL, leftRightMarket) {
    // left-contract-type-select
    const cont = $(`#${leftRightMarket}-contract-type-select`)

    const select = $('<select>').appendTo(cont)
    const cntTypes = leftRightMarket === 'left' ? leftContractTypes : rightContractTypes
    select.html($.map(cntTypes, function (item) {
        return $('<option/>', { value: item.val, text: item.txt })
    }))
    select.change(function () {
        const requestData = `{ "contractMode": { "${leftRightMarket}" : "${this.value}" }}`
        console.log(requestData)
        select.disabled = true
        Http.httpAsyncPost(SETTINGS_URL, requestData, result => {
            setAllSettingsRaw(result)
            select.attr('disabled', false)
        })
    })

    // const lbCont = $('<span>').appendTo(cont)
    const lbWarn = $(`#${leftRightMarket}-contract-type-warn`).css('color', 'red')

    mobx.autorun(r => {
        const fromDb = allSettings.contractMode[leftRightMarket]
        const current = allSettings.contractModeCurrent[leftRightMarket]

        select.val(fromDb)

        if (leftRightMarket === 'left') {
            const contractType = leftContractTypes.filter(t => t.val === fromDb)[0]
            // console.log(contractType)
            // console.log(`fromDb=${fromDb}; current=${current}`)
            console.log('bitmex contract=' + allSettings.bitmexContractNames[fromDb])
            const theName = contractType.txt.lastIndexOf('Bitmex', 0) === 0
              ? allSettings.bitmexContractNames[fromDb]
              : getOkexName(allSettings, fromDb) // map contractNameEnum to contractNameWithDate

            $('#left-contract-type-label').text(theName);
        } else {
            const theName = getOkexName(allSettings, fromDb) // map contractNameEnum to contractNameWithDate
            $('#right-contract-type-label').text(theName);
        }
        // const needToShow = okexContractNameWithDate && okexContractNameWithDate !== 'SWAP'
        // lbCont.text(needToShow ? okexContractNameWithDate + ' ' : '')
        const needRestart = fromDb !== current
        lbWarn.text(needRestart ? 'RESTART IS NEEDED' : '')
        allSettings.restartWarn[leftRightMarket] = needRestart

    })

}

function getOkexName(allS, ct) {
    // "BTC_NextWeek": "BTC0529",
    // "ETH_Swap": "SWAP",
    // "ETH_BiQuarter": "ETH0925",
    // "ETH_ThisWeek": "ETH0522",
    // "ETH_NextWeek": "ETH0529",
    // "BTC_ThisWeek": "BTC0522",
    // "BTC_Quarter": "BTC0626",
    // "BTC_Swap": "SWAP",
    // "BTC_BiQuarter": "BTC0925",
    // "ETH_Quarter": "ETH0626"
    const name = allS.okexContractNames[ct]
    if (name !== 'SWAP') {
        return name.slice(0, 3) + 'USD' + name.substring(3)
    }
    return name
}


//
// function createContractModes(settingsData, SETTINGS_URL) {
//
//     const label = $('<span/>', {title: 'Type by contract delivery time'}).html('Arbitrage mod: ');
//     let detailsLabel = $('<span/>');
//     const select = $('<select/>').html($.map(arbModArr, function (item) {
//         return $('<option/>', {value: item.val, text: item.txt});
//     })).val(settingsData.contractMode);
//     select.on('change', onVerPick);
//
//     const warnLabel = $('<span/>').css('color', 'red');
//
//     function updateLabels(data) {
//         warnLabel.html(data.contractMode === data.contractModeCurrent ? ''
//                 : ' warning: to apply the changes restart is needed');
//         let item = arbModArr.find(item => item.val === data.contractMode);
//
//         detailsLabel.replaceWith(item.info);
//         detailsLabel = item.info;
//         if (detailsLabel.children().length === 0) {
//             detailsLabel.attr('title', sprintf(detailsLabel.attr('title'), data.okexContractName));
//         } else {
//             detailsLabel.find('span.templ').each(function (idx, item) {
//                 item.title = sprintf(item.title, data.okexContractName);
//             });
//         }
//
//     }
//
//     updateLabels(settingsData);
//
//     $("#contract-mode").append(label).append(select).append(detailsLabel).append(warnLabel);
//
//     function onVerPick() {
//         console.log(this.value);
//         const requestData = JSON.stringify({contractMode: this.value});
//
//         Http.httpAsyncPost(SETTINGS_URL,
//                 requestData, function (result) {
//                     let data = JSON.parse(result);
//                     updateLabels(data);
//                     alert('New value: ' + data.contractMode);
//                 });
//     }
// }

function maxBitmexReconnects (settingsData, SETTINGS_URL) {
    const container = document.getElementById('max-bitmex-reconnects')

    const label = document.createElement('span')
    label.innerHTML = 'Max bitmex reconnects:'
    const edit = document.createElement('input')
    edit.style.width = '80px'
    edit.innerHTML = ''
    const resultLabel = document.createElement('span')

    resultLabel.innerHTML = settingsData.restartSettings.maxBitmexReconnects
    const setBtn = document.createElement('button')
    setBtn.onclick = function () {
        setBtn.disabled = true
        const requestData = JSON.stringify({ restartSettings: { maxBitmexReconnects: edit.value } })
        console.log(requestData)
        console.log(SETTINGS_URL)
        Http.httpAsyncPost(SETTINGS_URL,
          requestData, function (rawRes) {
                    const res = JSON.parse(rawRes);
                    resultLabel.innerHTML = res.restartSettings.maxBitmexReconnects;
                    setBtn.disabled = false;
                    // alert(rawRes);
                });
    };
    setBtn.innerHTML = 'set';

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(setBtn);
    container.appendChild(resultLabel);
}

function createHedgeSettings(settingsData, SETTINGS_URL) {
    // var container = document.getElementById("hedge-settings");

    const parent = $('#hedge-settings').css('display', 'flex');
    // const mainCont = $('#hedge-settings').css('border', 'solid #555555');
    const mainCont = $('<div/>')
    .css('border', 'solid #555555')
    .css('padding', '3px')
    .css('display', 'block').appendTo(parent);

    /// auto
    const checkboxCont = $('<div/>').appendTo(mainCont);
    const checkbox = $('<input/>').attr('type', 'checkbox').html('auto').appendTo(checkboxCont);
    $('<span/>').html('auto').appendTo(checkboxCont);

    function setCheckBoxState(res) {
        checkbox.attr("checked", res.hedgeAuto);
        if (checkbox.is(":checked")) {
            mainCont.find('*').attr('disabled', true);
        } else {
            mainCont.find('*').attr('disabled', false);
        }
        checkbox.attr('disabled', false);
    }

    checkbox.change(function () {
        checkbox.attr('disabled', true);
        let requestData = JSON.stringify({hedgeAuto: checkbox.is(":checked")});
        console.log(requestData);
        Http.httpAsyncPost(SETTINGS_URL, requestData,
                function (rawResp) {
                    const res = JSON.parse(rawResp);
                    console.log(res.hedgeAuto);
                    setCheckBoxState(res);
                }
        );
    });

    /// BTC
    function addBtcHedge() {
        const modeName = settingsData.contractModeCurrent.modeName
        const labelName = sprintf('%s, btc, hedge', modeName)
        const cont = $('<div/>').appendTo(mainCont)
        $('<span/>').html(labelName).appendTo(cont) // 'Hedge BTC: '
        const editHedgeBtc = $('<input>').width('80px').appendTo(cont)
        const resLabelHedgeBtc = $('<span/>').html(settingsData.hedgeBtc)
        let updateBtn = $('<button>').
        text('Update').
        css('margin-left', '5px').
        css('margin-right', '5px').
        click(function () {
            updateBtn.attr('disabled', true)

            let requestData = JSON.stringify({ hedgeBtc: editHedgeBtc.val() })
            console.log(requestData)
            Http.httpAsyncPost(SETTINGS_URL, requestData,
              function (rawResp) {
                  const res = JSON.parse(rawResp)
                  resLabelHedgeBtc.html(res.hedgeBtc)
                  updateBtn.attr('disabled', false)
              }
            )
        }).appendTo(cont);
        resLabelHedgeBtc.appendTo(cont);
        mobx.autorun(r => {
            resLabelHedgeBtc.html(allSettings.hedgeBtc)
        })
    }

    /// ETH
    function addEthHedge() {
        const modeName = settingsData.contractModeCurrent.modeName
        const labelName = sprintf('%s, eth, hedge', modeName)

        const contEth = $('<div/>').appendTo(mainCont)
        $('<span/>').html(labelName).appendTo(contEth)
        const editHedgeEth = $('<input>').width('80px').appendTo(contEth)
        const resLabelHedgeEth = $('<span/>').html(settingsData.hedgeEth)
        let updateBtnEth = $('<button>').
        text('Update').
        css('margin-left', '5px').
        css('margin-right', '5px').
        click(function () {
            updateBtnEth.attr('disabled', true)
            let requestData = JSON.stringify({ hedgeEth: editHedgeEth.val() })
            console.log(requestData)
            Http.httpAsyncPost(SETTINGS_URL, requestData,
              function (rawResp) {
                  const res = JSON.parse(rawResp)
                  resLabelHedgeEth.html(res.hedgeEth)
                  updateBtnEth.attr('disabled', false)
              }
            )
        }).
        appendTo(contEth)
        resLabelHedgeEth.appendTo(contEth)
        mobx.autorun(r => {
            resLabelHedgeEth.html(allSettings.hedgeEth)
        })
    }

    if (settingsData.eth) {
        addEthHedge();
    }
    if (!settingsData.eth || allSettings.leftIsBtm) {
        addBtcHedge()
    }

    setCheckBoxState(settingsData)

    // let arbMod = arbModArr.find(o => o.val === settingsData.contractModeCurrent);
    // Utils.setDocumentTitle(arbMod.mod.toLowerCase());
    // mobxStore.arbMod = arbMod;
}

function createAdjustByNtUsd(cont, SETTINGS_URL, requestCreator, valExtractor, isMain) {
    let container = cont.get(0);
    let label = $('<span>').text('Adjust by nt_usd on the fly');

    let checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    mobx.autorun(function () {
        checkbox.checked = valExtractor(allSettings);
        if (isActiveV('adjustByNtUsd')) {
            label.css('font-weight', 'bold').prop('title', 'Activated VOLATILE mode');
            cont.css('font-weight', 'bold').prop('title', 'Activated VOLATILE mode');
            if (isMain) {
                checkbox.disabled = true;
            }
        } else {
            label.css('font-weight', 'normal').prop('title', '');
            cont.css('font-weight', 'normal').prop('title', '');
            if (isMain) {
                checkbox.disabled = false;
            }
        }
    });

    checkbox.id = "adjust-by-nt-usd-checkbox";
    checkbox.onchange = function (ev) {
        checkbox.disabled = true;

        const requestData = JSON.stringify(requestCreator(checkbox.checked));
        console.log(requestData);
        Http.httpAsyncPost(SETTINGS_URL, requestData, function (rawRes) {
            setAllSettingsRaw(rawRes);
            checkbox.disabled = false;
        });
    };

    // label.appendChild(document.createTextNode('Adjust by nt_usd on the fly'));

    container.appendChild(checkbox);
    container.appendChild(label.get(0));
}

function createNtUsdMultiplicityOkex (settingsData, SETTINGS_URL, arbType) {
    const mainCont = $('#nt-usd-multiplicity-okex')
    const $cont = $('<div>').appendTo(mainCont)

    const labelVal = arbType && arbType == 'left' ? 'nt_usd_multiplicity_L_okex' : 'nt_usd_multiplicity_R_okex'
    let label = $('<span>').html(labelVal).appendTo($cont)
    let edit = $('<input>').width('60px').appendTo($cont)
    let updateBtn = $('<button>').text('set').css('margin-right', '5px').appendTo($cont)
    const paramName = arbType && arbType === 'left' ? 'ntUsdMultiplicityOkexLeft' : 'ntUsdMultiplicityOkex'
    let resLabel = $('<span>').html(settingsData[paramName]).appendTo($cont)

    updateBtn.click(function () {
        updateBtn.attr('disabled', true)
        let requestData = JSON.stringify({ [paramName]: edit.val() })
        console.log(requestData)
        Http.httpAsyncPost(SETTINGS_URL, requestData,
          function (rawResp) {
              const res = JSON.parse(rawResp)
              resLabel.html(res[paramName])
              updateBtn.attr('disabled', false)
                }
        );
    });

    label.prop('title', ('Samples:\n'
            + '    nt=237.65, mult=100 ==> 200\n'
            + '    nt=237.65, mult=10  ==> 230\n'
            + '    nt=237.65, mult=20  ==> 220\n'
            + '    nt=237.65, mult=1   ==> 237\n'
            + '    nt=237.65, mult=0   ==> 237.65\n'
            + '    nt=237.65, mult=-1  ==> 237.65\n'
            + '    nt=237.65, mult=-12 ==> 237.65\n'
            + '    nt=237.65, mult=-100==> 237.65\n'
    ));

}

function createOkexEbestElast() {
    const $cont = $('#okex_e_best_e_last');

    let checkbox = $('<input>').attr('type', 'checkbox').appendTo($cont);
    let label = $('<span>').html('e_best=e_last').appendTo($cont);

    mobx.autorun(r => {
        checkbox.prop('checked', allSettings.okexEbestElast);
        label.css('color', checkbox.prop('checked') ? 'black' : 'grey');
    });

    checkbox.click(function () {
        checkbox.attr('disabled', true);
        let requestData = JSON.stringify({ okexEbestElast: checkbox.prop('checked') })
        console.log(requestData)
        Http.httpAsyncPost(allSettings.SETTINGS_URL, requestData,
          function (result) {
              setAllSettingsRaw(result)
              checkbox.attr('disabled', false)
          }
        )
    });
}

function createDqlParams (SETTINGS_URL) {
    const dqlMrLiqCont = $('#dql-mr-liq')

    createSettingsInput(dqlMrLiqCont, SETTINGS_URL, 'L_mr_liq',
      x => ({ dql: { leftMrLiq: x } }), x => (x.dql.leftMrLiq))
    createSettingsInput(dqlMrLiqCont, SETTINGS_URL, 'R_mr_liq',
      x => ({ dql: { rightMrLiq: x } }), x => (x.dql.rightMrLiq))

    const dqlParamsCont = $('#dql-params')
    const leftDqlOpenMinCont = $('<div>').appendTo(dqlParamsCont)
    createSettingsInput(leftDqlOpenMinCont, SETTINGS_URL, 'L_DQL_open_min',
      x => ({ dql: { leftDqlOpenMin: x } }),
      x => (x.dql.leftDqlOpenMin), true)
    $('<span>').text('(new signals only if L_DQL >= L_DQL_open_min)').addClass('spanAsHint').appendTo(leftDqlOpenMinCont)

    const rightDqlOpenMinCont = $('<div>').appendTo(dqlParamsCont)
    createSettingsInput(rightDqlOpenMinCont, SETTINGS_URL, 'R_DQL_open_min',
      x => ({ dql: { rightDqlOpenMin: x } }),
      x => (x.dql.rightDqlOpenMin), true)
    $('<span>').text('(new signals only if R_DQL >= R_DQL_open_min)').addClass('spanAsHint').appendTo(rightDqlOpenMinCont)

    const leftDqlCloseMinCont = $('<div>').appendTo(dqlParamsCont)
    createSettingsInput(leftDqlCloseMinCont, SETTINGS_URL, 'L_DQL_close_min',
      x => ({ dql: { leftDqlCloseMin: x } }),
      x => (x.dql.leftDqlCloseMin), true)
    $('<span>').
    text('(#L_preliq correction when L_DQL <= L_DQL_close_min)').
    addClass('spanAsHint').
    appendTo(leftDqlCloseMinCont)

    const rightDqlCloseMinCont = $('<div>').appendTo(dqlParamsCont)
    createSettingsInput(rightDqlCloseMinCont, SETTINGS_URL, 'R_DQL_close_min',
      x => ({ dql: { rightDqlCloseMin: x } }),
      x => (x.dql.rightDqlCloseMin), true)
    $('<span>').
    text('(#R_preliq correction when R_DQL <= R_DQL_close_min)').
    addClass('spanAsHint').
    appendTo(rightDqlCloseMinCont)

    const decorateDql = (el, open, close) => {
        if (Number(open) < Number(close)) {
            el.css('font-weight', 'bold').css('color', 'red').prop('title', 'OpenMin should be more than CloseMin')
        } else {
            el.css('font-weight', 'normal').css('color', 'black').prop('title', '')
        }
    }
    mobx.autorun(r => {
        decorateDql(leftDqlOpenMinCont, allSettings.dql.leftDqlOpenMin, allSettings.dql.leftDqlCloseMin)
        decorateDql(leftDqlCloseMinCont, allSettings.dql.leftDqlOpenMin, allSettings.dql.leftDqlCloseMin)
        decorateDql(rightDqlOpenMinCont, allSettings.dql.rightDqlOpenMin, allSettings.dql.rightDqlCloseMin)
        decorateDql(rightDqlCloseMinCont, allSettings.dql.rightDqlOpenMin, allSettings.dql.rightDqlCloseMin)
    })
}

function createDqlKillPos (SETTINGS_URL) {
    const $cont = $('#dql-killpos')

    const btmKillpos = $('<div>').appendTo($cont)
    createSettingsInput(btmKillpos, SETTINGS_URL, 'L_DQL_killpos',
      x => ({ dql: { leftDqlKillPos: x } }),
      x => (x.dql.leftDqlKillPos))

    const okKillpos = $('<div>').appendTo($cont)
    createSettingsInput(okKillpos, SETTINGS_URL, 'R_DQL_killpos',
      x => ({ dql: { rightDqlKillPos: x } }),
      x => (x.dql.rightDqlKillPos))

    const decorateDql = (el, close, kill) => {
        if (Number(close) < Number(kill))
            el.css('font-weight', 'bold').css('color', 'red').prop('title', 'Killpos should be less than CloseMin')
        else
            el.css('font-weight', 'normal').css('color', 'black').prop('title', '')
    }
    mobx.autorun(r => {
        decorateDql(btmKillpos, allSettings.dql.leftDqlCloseMin, allSettings.dql.leftDqlKillPos)
        decorateDql(okKillpos, allSettings.dql.rightDqlCloseMin, allSettings.dql.rightDqlKillPos)
    })
}

function createDqlLevel(SETTINGS_URL) {
    const $cont = $('#dql-level');

    let label = $('<span>').html('DQL_level: ').appendTo($cont);
    label.prop('title', 'Preliq выполняется при уловиях:\n'
            + 'L_DQL <= L_DQL_close_min && L_DQL >= DQL_level, или\n'
            + 'R_DQL <= R_DQL_close_min && R_DQL >= DQL_level.');

    let edit = $('<input>').width('60px').appendTo($cont);
    let updateBtn = $('<button>').text('set')
    .css('margin-right', '5px').appendTo($cont);
    let resLabel = $('<span>').appendTo($cont);

    mobx.autorun(r => {
        resLabel.text(allSettings.dql.dqlLevel);
    });

    updateBtn.click(function () {
        updateBtn.attr('disabled', true);
        let requestData = JSON.stringify({dql: {dqlLevel: edit.val()}});
        console.log(requestData);
        Http.httpAsyncPost(SETTINGS_URL, requestData,
                function (rawResp) {
                    setAllSettingsRaw(rawResp);
                    // const res = JSON.parse(rawResp);
                    // resLabel.html(res.ntUsdMultiplicityOkex);
                    updateBtn.attr('disabled', false);
                }
        );
    });
}
