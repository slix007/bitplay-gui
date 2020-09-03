'use strict'

import $ from 'jquery'
import { allSettings, setAllSettingsRaw } from '../store/settings-store'
import { withSign } from '../utils'

let Http = require('../http')
let sprintf = require('sprintf-js').sprintf
const settingsStore = require('../store/settings-store')
const { mobxStore } = require('../store/settings-store')
let mobx = require('mobx')

let bTimestampDelayMax, oTimestampDelayMax

export { showSettingsObTimestamps }

const showSettingsObTimestamps = function (baseUrl) {

    const SETTINGS_URL = baseUrl + '/settings/all'

    let $cont = $('#settings-ob-timestamps-div')
    // let btnC = document.createElement('div')
    // let maxDelayC = document.createElement('div')
    // container.appendChild(btnC)
    // container.appendChild(maxDelayC)


    const $cont1 = $('<div>').appendTo($cont)
    _createSettingsParam($cont1, 'L_Acceptable_OB_Timestamp_Diff (ms): ',
      x => ({ settingsTimestamps: { l_Acceptable_OB_Timestamp_Diff_ms: x } }),
      x => x.settingsTimestamps.l_Acceptable_OB_Timestamp_Diff_ms)
    const $cont2 = $('<div>').appendTo($cont)
    _createSettingsParam($cont2, 'R_Acceptable_OB_Timestamp_Diff (ms): ',
      x => ({ settingsTimestamps: { r_Acceptable_OB_Timestamp_Diff_ms: x } }),
      x => x.settingsTimestamps.r_Acceptable_OB_Timestamp_Diff_ms)

    const $cont3 = $('<div>').appendTo($cont)
    _createSettingsParam($cont3, 'L_Acceptable_Get_OB_Delay (ms): ',
      x => ({ settingsTimestamps: { l_Acceptable_Get_OB_Delay_ms: x } }),
      x => x.settingsTimestamps.l_Acceptable_Get_OB_Delay_ms)
    const $cont4 = $('<div>').appendTo($cont)
    _createSettingsParam($cont4, 'R_Acceptable_Get_OB_Delay (ms): ',
      x => ({ settingsTimestamps: { r_Acceptable_Get_OB_Delay_ms: x } }),
      x => x.settingsTimestamps.r_Acceptable_Get_OB_Delay_ms)


    // $('<span>').css('margin-left', '30px').text('range: ').appendTo($cont3)
    // $('<span>').css('margin-left', '30px').text('range: ').appendTo($cont4)

    const leftObDiff = $('#l-ob-timestamps-range')
    const rightObDiff = $('#r-ob-timestamps-range')
    const leftGet = $('#l-ob-timestamps-get-range')
    const rightGet = $('#r-ob-timestamps-get-range')
    const leftExecDuration = $('#l-exec-duration-range')
    const rightExecDuration = $('#r-exec-duration-range')
    mobx.autorun(r => {
        leftObDiff.text(withSign(mobxStore.marketStates.lt.minObDiff) + '...' + withSign(mobxStore.marketStates.lt.maxObDiff))
        rightObDiff.text(withSign(mobxStore.marketStates.rt.minObDiff) + '...' + withSign(mobxStore.marketStates.rt.maxObDiff))
        leftGet.text(withSign(mobxStore.marketStates.lt.minGetOb) + '...' + withSign(mobxStore.marketStates.lt.maxGetOb))
        rightGet.text(withSign(mobxStore.marketStates.rt.minGetOb) + '...' + withSign(mobxStore.marketStates.rt.maxGetOb))
        leftExecDuration.text(withSign(mobxStore.marketStates.lt.minExecDuration) + '...' + withSign(mobxStore.marketStates.lt.maxExecDuration))
        rightExecDuration.text(withSign(mobxStore.marketStates.rt.minExecDuration) + '...' + withSign(mobxStore.marketStates.rt.maxExecDuration))
    })

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


