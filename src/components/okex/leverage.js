'use strict'

import { updateAllSettings } from '../settings'
import { allSettings } from '../../store/settings-store'

const $ = require('jquery')

const Http = require('../../http')
const mobx = require('mobx')

export { createSetttingsOkexLeverage }

const createSetttingsOkexLeverage = function (prevCont, arbType) {

  const container = $('<div>').css({ 'background-color': 'azure', 'border': 'solid' }).appendTo(prevCont)
  const URL = allSettings.BASE_URL + '/market/okcoin/change-leverage'

  createTransientParamChange(container, URL, 'O_Lvg',
    x => ({ leverage: x }),
    x => (x.settingsTransient ? x.settingsTransient.okexLeverage : ''))

}

function createTransientParamChange (
  mainCont, URL, labelName, requestCreator, valExtractor, sameCont) {
  const container = sameCont ? mainCont : $('<div>').appendTo(mainCont)
  const lb = $('<span>').text(labelName).appendTo(container)
  const edit = $('<input>').width('40px').appendTo(container)
  const updateBtn = $('<button>').text('set').appendTo(container)
  const realValue = $('<span>').appendTo(container)
  const resLabel = $('<span>').css('margin-left', '10px').appendTo(container)

  updateBtn.click(() => {
    const requestData = JSON.stringify(requestCreator(edit.val()))
    updateBtn.prop('disabled', true)
    Http.httpAsyncPost(URL, requestData, function (rawRes) {
      let res = JSON.parse(rawRes)
      resLabel.text(res.description)
      updateAllSettings()
      updateBtn.prop('disabled', false)
    })
  })
  mobx.autorun(function () {
    const value = valExtractor(allSettings)
    realValue.text(value)
  })
}
