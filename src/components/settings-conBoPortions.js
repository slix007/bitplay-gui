'use strict'

import { allSettings, setAllSettingsRaw, mobxStore } from '../store/settings-store'
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
    x => x.conBoPortions.minNtUsdToStartOkex + 'usd=' + okUsdToCont(x.conBoPortions.minNtUsdToStartOkex, mobxStore.isEth) + 'cont',
    x => x.arbScheme === 'CON_B_O_PORTIONS')
  _createSettingsParam($('<div>').appendTo($cont), 'Okex Max portion_usd: ',
    x => ({ conBoPortions: { maxPortionUsdOkex: x } }),
    x => x.conBoPortions.maxPortionUsdOkex + 'usd=' + okUsdToCont(x.conBoPortions.maxPortionUsdOkex, mobxStore.isEth) + 'cont',
    x => x.arbScheme === 'CON_B_O_PORTIONS')
}

function _createSettingsParam (
  container, labelName, requestCreator, valExtractor, isActiveFunc) {
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
      updateBtn.prop('disabled', false)
      edit.prop('disabled', false)
      lb.prop('disabled', false)
    } else {
      lb.css('color', 'grey').prop('title', '')
      realValue.css('color', 'grey').prop('title', '')
      updateBtn.prop('disabled', true)
      edit.prop('disabled', true)
      lb.prop('disabled', true)
    }
  })
}
