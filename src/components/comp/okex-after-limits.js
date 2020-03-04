import { createSetttingsOkexLeverage } from '../okex/leverage'
import { createSettingsInput } from '../settings'
import * as mobx from 'mobx'
import { allSettings, setAllSettingsRaw } from '../../store/settings-store'
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
  createPostOnlyCheckbox(postOnlyContainer, arbType)
  createPostOnlyWithoutLastCheckbox(postOnlyContainer, arbType)
  createSettingsInput(postOnlyContainer, allSettings.SETTINGS_URL, 'placeTry',
    x => ({ allPostOnlyArgs: { [arbType]: { postOnlyAttempts: x } } }),
    x => (x.allPostOnlyArgs[arbType].postOnlyAttempts))
  createSettingsInput(postOnlyContainer, allSettings.SETTINGS_URL, 'betweenTryMs',
    x => ({ allPostOnlyArgs: { [arbType]: { postOnlyBetweenAttemptsMs: x } } }),
    x => (x.allPostOnlyArgs[arbType].postOnlyBetweenAttemptsMs))
  // okex leverage
  createSetttingsOkexLeverage(cont, arbType)

  createSwapFunding(cont, arbType)

}

function createPostOnlyCheckbox (mainCont, arbType) {
  const $cont = $('<div>').appendTo(mainCont)
  const checkbox = $('<input>').attr('type', 'checkbox').appendTo($cont)
  $('<span>').text('postOnly').prop('title', 'the placingTypes are MAKER/MAKER_TICK').appendTo($cont)
  checkbox.click(function () {
    checkbox.prop('disabled', true)
    const requestData = JSON.stringify(
      { allPostOnlyArgs: { [arbType]: { postOnlyEnabled: checkbox.prop('checked') } } })
    Http.httpAsyncPost(allSettings.SETTINGS_URL, requestData,
      json => {
        checkbox.prop('disabled', false)
        const res = setAllSettingsRaw(json)
        // alert('New value: ' + res.manageType);
      })

  })
  mobx.autorun(r => {
    checkbox.prop('checked', allSettings.allPostOnlyArgs[arbType].postOnlyEnabled)
  })
}

function createPostOnlyWithoutLastCheckbox (mainCont, arbType) {
  const $cont = $('<div>').appendTo(mainCont)
  const checkbox = $('<input>').attr('type', 'checkbox').appendTo($cont)
  const label = $('<span>').
  text('the last is NORMAL').
  prop('title', 'the last attempt is always NORMAL').
  appendTo($cont)
  checkbox.click(function () {
    checkbox.prop('disabled', true)
    const requestData = JSON.stringify(
      { allPostOnlyArgs: { [arbType]: { postOnlyWithoutLast: checkbox.prop('checked') } } })
    Http.httpAsyncPost(allSettings.SETTINGS_URL, requestData,
      json => {
        checkbox.prop('disabled', false)
        const res = setAllSettingsRaw(json)
        // alert('New value: ' + res.manageType);
      })

  })
  mobx.autorun(r => {
    checkbox.prop('checked', allSettings.allPostOnlyArgs[arbType].postOnlyWithoutLast)
  })
}


