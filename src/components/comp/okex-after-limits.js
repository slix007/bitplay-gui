import { createSetttingsOkexLeverage } from '../okex/leverage'
import { createSettingsInput } from '../settings'
import * as mobx from 'mobx'
import { allSettings } from '../../store/settings-store'
import { createSwapFunding } from '../okex/funding'

export { okexAfterLimitsSettings }

const $ = require('jquery')
const Http = require('../../http')
const Utils = require('../../utils')
const { mobxStore } = require('../../store/settings-store')

const okexAfterLimitsSettings = function (arbType) {
  // okex postOnly settings
  const cont = $(`#${arbType}-after-limits`).css({ 'background-color': 'azure', 'border': 'solid' })
  cont.append($('<span>').text('Post only settings'))

  let postOnlyContainer = $('<div>').appendTo(cont)
  createPostOnlyCheckbox(postOnlyContainer, allSettings.okexPostOnlyArgs, allSettings.SETTINGS_URL)
  createPostOnlyWithoutLastCheckbox(postOnlyContainer, allSettings.okexPostOnlyArgs, allSettings.SETTINGS_URL)
  createSettingsInput(postOnlyContainer, allSettings.SETTINGS_URL, 'placeTry',
    x => ({ okexPostOnlyArgs: { postOnlyAttempts: x } }),
    x => (x.okexPostOnlyArgs.postOnlyAttempts))
  createSettingsInput(postOnlyContainer, allSettings.SETTINGS_URL, 'betweenTryMs',
    x => ({ okexPostOnlyArgs: { postOnlyBetweenAttemptsMs: x } }),
    x => (x.okexPostOnlyArgs.postOnlyBetweenAttemptsMs))
  // okex leverage
  createSetttingsOkexLeverage(cont, arbType)

  createSwapFunding(cont, arbType)

}

function createPostOnlyCheckbox (mainCont, obj, SETTINGS_URL) {
  const $cont = $('<div>').appendTo(mainCont)
  const checkbox = $('<input>').attr('type', 'checkbox').appendTo($cont)
  const label = $('<span>').text('postOnly').prop('title', 'the placingTypes are MAKER/MAKER_TICK').appendTo($cont)
  checkbox.click(function () {
    checkbox.prop('disabled', true)
    const requestData = JSON.stringify({ okexPostOnlyArgs: { postOnlyEnabled: checkbox.prop('checked') } })
    Http.httpAsyncPost(SETTINGS_URL, requestData,
      json => {
        checkbox.prop('disabled', false)
        const res = setAllSettingsRaw(json)
        // alert('New value: ' + res.manageType);
      })

  })
  mobx.autorun(r => {
    checkbox.prop('checked', allSettings.okexPostOnlyArgs.postOnlyEnabled)
  })
}

function createPostOnlyWithoutLastCheckbox (mainCont, obj, SETTINGS_URL) {
  const $cont = $('<div>').appendTo(mainCont)
  const checkbox = $('<input>').attr('type', 'checkbox').appendTo($cont)
  const label = $('<span>').
  text('the last is NORMAL').
  prop('title', 'the last attempt is always NORMAL').
  appendTo($cont)
  checkbox.click(function () {
    checkbox.prop('disabled', true)
    const requestData = JSON.stringify({ okexPostOnlyArgs: { postOnlyWithoutLast: checkbox.prop('checked') } })
    Http.httpAsyncPost(SETTINGS_URL, requestData,
      json => {
        checkbox.prop('disabled', false)
        const res = setAllSettingsRaw(json)
        // alert('New value: ' + res.manageType);
      })

  })
  mobx.autorun(r => {
    checkbox.prop('checked', allSettings.okexPostOnlyArgs.postOnlyWithoutLast)
  })
}


