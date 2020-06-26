'use strict'

import { allSettings, mobxStore, setAllSettingsRaw } from '../../store/settings-store'

const $ = require('jquery')
const Http = require('../../http')
const mobx = require('mobx')

export { showSumBalImpliedInput }

let showSumBalImpliedInput = function () {

  const cont = $('#sum-bal-implied-input')
  cont.append($('<span>').text('Hedge_imp: '))

  cont.append($('<span>').css('margin-left', '10px'))
  createInputUsdBtc(cont, allSettings.SETTINGS_URL, 'vol_usd',
    x => ({ implied: { volUsd: x } }),
    x => (x.implied.volUsd), true)

  cont.append($('<span>').css('margin-left', '10px'))
  createInputUsdBtc(cont, allSettings.SETTINGS_URL, 'usd_qu_ini',
    x => ({ implied: { usdQuIni: x } }),
    x => (x.implied.usdQuIni), true, true)

  cont.append($('<span>').css('margin-left', '10px'))
  createInputUsdBtc(cont, allSettings.SETTINGS_URL, 's_e_best_ini_usd',
    x => ({ implied: { sebestIniUsd: x } }),
    x => (x.implied.sebestIniUsd), true)

  cont.append($('<span>').css('margin-left', '10px'))
  const fixCurrentBtn = $('<button>').text('Fix current').appendTo(cont)
  // const realValue = $('<span>').appendTo(container)
  fixCurrentBtn.click(() => {
    fixCurrentBtn.prop('disabled', true)
    Http.httpAsyncPost(allSettings.BASE_URL + '/market/implied/fix-current', {}, function (result) {
      setAllSettingsRaw(result)
      fixCurrentBtn.prop('disabled', false)
    })
  })

}

function createInputUsdBtc (mainCont, SETTINGS_URL, labelName, requestCreator, valExtractor, sameCont, usdOnly) {
  const container = sameCont ? mainCont : $('<div>').appendTo(mainCont)
  const lb = $('<span>').text(labelName).appendTo(container)
  const edit = $('<input>').width('40px').appendTo(container)
  const updateBtn = $('<button>').text('set').appendTo(container)
  const realValue = $('<span>').appendTo(container)
  updateBtn.click(() => {
    const requestData = JSON.stringify(requestCreator(edit.val()))
    updateBtn.prop('disabled', true)
    console.log('SettingsInput request:' + requestData + ' to ' + SETTINGS_URL)
    Http.httpAsyncPost(SETTINGS_URL, requestData, function (result) {
      setAllSettingsRaw(result)
      updateBtn.prop('disabled', false)
    })
  })
  mobx.autorun(function () {
    const valueUsd = valExtractor(allSettings)
    // Значения в btc рассчитывается
    // для vol_usd: vol_usd / usd_qu,
    // для s_e_best_ini_usd: s_e_best_ini_usd / usd_qu.
    if (mobxStore.quAvg !== 0) {
      const valueBtc = (valueUsd / mobxStore.quAvg).toFixed(8)
      if (usdOnly) {
        realValue.text(`[${valueUsd} usd]`)
      } else {
        realValue.text(`[${valueUsd} usd / ${valueBtc} btc]`)
      }
    }
  })
  return realValue
}
