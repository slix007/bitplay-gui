'use strict'

import { allSettings, isActiveV, mobxStore, setAllSettingsRaw } from '../store/settings-store'
import { createCheckboxV } from './settings'
import { okUsdToCont } from '../utils'
import $ from 'jquery'
import Http from '../http'
import * as mobx from 'mobx'

export { createPortions }

const createPortions = function () {
  const $cont = $('#con-b-o-portions')
  $('<div>').text('CON_B_O_PORTIONS params:').appendTo($cont)

  _createSettingsParam($('<div>').appendTo($cont), 'Min nt_usd to start Okex: ',
    x => ({ conBoPortions: { minNtUsdToStartOkex: x } }),
    x => x.conBoPortions.minNtUsdToStartOkex + 'usd=' + okUsdToCont(x.conBoPortions.minNtUsdToStartOkex,
      mobxStore.isEth) + 'cont',
    x => x.arbScheme === 'CON_B_O_PORTIONS',
    true, 'conBoPortions_minNtUsdToStartOkex')
  _createSettingsParam($('<div>').appendTo($cont), 'Okex Max portion_usd: ',
    x => ({ conBoPortions: { maxPortionUsdOkex: x } }),
    x => x.conBoPortions.maxPortionUsdOkex + 'usd=' + okUsdToCont(x.conBoPortions.maxPortionUsdOkex, mobxStore.isEth)
      + 'cont',
    x => x.arbScheme === 'CON_B_O_PORTIONS',
    true, 'conBoPortions_maxPortionUsdOkex')

  const $column4Cont = $('#volatile-mode-params-4')
  const $conBoPortionsContV = $('<div>').appendTo($column4Cont)
  const btmPlacingLbV = $('<div>').text('CON_B_O_PORTIONS params:')
  btmPlacingLbV.appendTo($conBoPortionsContV)
  createCheckboxV($conBoPortionsContV, allSettings.SETTINGS_URL, 'conBoPortions_minNtUsdToStartOkex')
  _createSettingsParam($conBoPortionsContV, 'Min nt_usd to start Okex: ',
    x => ({ settingsVolatileMode: { conBoPortions: { minNtUsdToStartOkex: x } } }),
    x => x.settingsVolatileMode.conBoPortions.minNtUsdToStartOkex + 'usd='
      + okUsdToCont(x.settingsVolatileMode.conBoPortions.minNtUsdToStartOkex, mobxStore.isEth) + 'cont',
    x => x.arbScheme === 'CON_B_O_PORTIONS',
    false, 'conBoPortions_minNtUsdToStartOkex')

  const secondParam = $('<div>').appendTo($column4Cont)
  createCheckboxV(secondParam, allSettings.SETTINGS_URL, 'conBoPortions_maxPortionUsdOkex')
  _createSettingsParam(secondParam, 'Okex Max portion_usd: ',
    x => ({ settingsVolatileMode: { conBoPortions: { maxPortionUsdOkex: x } } }),
    x => x.settingsVolatileMode.conBoPortions.maxPortionUsdOkex + 'usd='
      + okUsdToCont(x.settingsVolatileMode.conBoPortions.maxPortionUsdOkex, mobxStore.isEth) + 'cont',
    x => x.arbScheme === 'CON_B_O_PORTIONS',
    false, 'conBoPortions_maxPortionUsdOkex')
}

function _createSettingsParam (
  container, labelName, requestCreator, valExtractor, isActiveFunc, isMain, fieldName) {
  const lb = $('<span>').text(labelName).appendTo(container)
  const edit = $('<input>').width('60px').appendTo(container)
  const updateBtn = $('<button>').text('set').appendTo(container)
  const realValue = $('<span>').appendTo(container)
  updateBtn.click(() => {
    const requestData = JSON.stringify(requestCreator(edit.val()))
    updateBtn.prop('disabled', true)
    Http.httpAsyncPost(allSettings.SETTINGS_URL, requestData,
      function (result) {
        setAllSettingsRaw(result)
        updateBtn.prop('disabled', false)
      })
  })
  mobx.autorun(function () {
    const value = valExtractor(allSettings)
    realValue.text(value)
    const isActive = isActiveFunc ? isActiveFunc(allSettings) : true
    // : allSettings.tradingModeState.tradingMode === 'VOLATILE';
    if (isActive) {
      lb.css('color', 'black').prop('title', '')
      realValue.css('color', 'black').prop('title', '')
      lb.prop('disabled', false)
    } else {
      lb.css('color', 'grey').prop('title', '')
      realValue.css('color', 'grey').prop('title', '')
      lb.prop('disabled', true)
    }

    if (isActiveV(fieldName)) {
      lb.css('font-weight', 'bold').prop('title', 'Activated VOLATILE mode')
      if (isMain) {
        updateBtn.prop('disabled', true)
        edit.prop('disabled', true)
      }
    } else {
      lb.css('font-weight', 'normal').prop('title', '')
      if (isMain) {
        updateBtn.prop('disabled', false)
        edit.prop('disabled', false)
      }
    }

  })
}
