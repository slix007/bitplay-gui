'use strict'

import { allSettings, setAllSettingsRaw } from '../store/settings-store'
import $ from 'jquery'
import Http from '../http'
import * as mobx from 'mobx'

export { createAbortSignal }

const createAbortSignal = function () {
  const $cont = $('#abort-signal')

  const ch = $('<input>').attr('type', 'checkbox').attr('title', 'only R_wait_L_portions').appendTo($cont)
  ch.click(() => {
    ch.attr('disabled', true)
    const requestData = JSON.stringify({ abortSignal: { abortSignalPtsEnabled: ch.prop('checked') } })
    Http.httpAsyncPost(allSettings.SETTINGS_URL, requestData,
      function (result) {
        setAllSettingsRaw(result)
        ch.attr('disabled', false)
      })

  })
  mobx.autorun(function () {
    ch.prop('checked', allSettings.abortSignal.abortSignalPtsEnabled)
  })

  _createSettingsParam($cont, 'abort_signal_pts: ',
    x => ({ abortSignal: { abortSignalPts: x } }),
    x => x.abortSignal.abortSignalPts,
    x => x.arbScheme === 'R_wait_L_portions' && ch.prop('checked'))
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
