'use strict'

import { allSettings, setAllSettingsRaw } from '../store/settings-store'
import $ from 'jquery'
import Http from '../http'
import * as mobx from 'mobx'

export { createBitmexCtList }

const createBitmexCtList = function () {
  const $cont = $('#bitmex-ct-list')

  const firstCont = $('<div>').appendTo($cont)

  _createSettingsParam(firstCont, 'Bitmex [BTCUSD_Quarter]: ',
    x => ({ bitmexContractTypes: { btcUsdQuoter: x } }),
    x => x.bitmexContractTypes.btcUsdQuoter)

  const warnLb = $('<span>').css('font-weight', 'bold').css('color','red').appendTo(firstCont)
  mobx.autorun(r => {
    const globalWarnLb = $('#warn-lb').css('color','red').css('font-weight', 'bold')
    globalWarnLb.text(allSettings.restartWarn || allSettings.restartWarnBitmexCt ? 'RESTART IS NEEDED' : '')
    warnLb.text(allSettings.restartWarnBitmexCt ? 'RESTART IS NEEDED' : '')
  })

  _createSettingsParam($('<div>').appendTo($cont), 'Bitmex [BTCUSD_BiQuarter]: ',
    x => ({ bitmexContractTypes: { btcUsdBiQuoter: x } }),
    x => x.bitmexContractTypes.btcUsdBiQuoter)
  _createSettingsParam($('<div>').appendTo($cont), 'Bitmex [ETHUSD_Quarter]: ',
    x => ({ bitmexContractTypes: { ethUsdQuoter: x } }),
    x => x.bitmexContractTypes.ethUsdQuoter)
}

function _createSettingsParam (
  container, labelName, requestCreator, valExtractor) {
  const lb = $('<span>').text(labelName).appendTo(container)
  const edit = $('<input>').width('60px').appendTo(container)
  const updateBtn = $('<button>').text('set').appendTo(container)
  const realValue = $('<span>').appendTo(container)
  const warnLb = $('<span>').css('color', 'red').appendTo(container)
  updateBtn.click(() => {
    if (!validate(edit.val())) {
      warnLb.text('Rules: Starts with XBT or ETH and length should be 6.')
      return
    } else {
      warnLb.text('')
    }

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
    // : allSettings.tradingModeState.tradingMode === 'VOLATILE';
    lb.css('color', 'black').prop('title', '')
    realValue.css('color', 'black').prop('title', '')
    updateBtn.prop('disabled', false)
    edit.prop('disabled', false)
    lb.prop('disabled', false)
  })
}

function validate (ct) {
  const starts = ct.startsWith('XBT') || ct.startsWith('ETH')
  const length = ct.length === 6
  return starts && length
}
