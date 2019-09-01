'use strict'

import { allSettings, setAllSettingsRaw } from '../store/settings-store'
import $ from 'jquery'
import Http from '../http'
import * as mobx from 'mobx'
import moment from 'moment'

export { fillOkexSettlement, fillOkexSettlementEnding }

function fillOkexSettlementEnding (allSettings) {
  if (allSettings.okexSettlementMode) {
    const startAt = moment(allSettings.okexSettlement.startAtTimeStr,
      'HH:mm:ss')
    const nowMoment = moment(allSettings.nowMomentStr, 'HH:mm:ss')
    const endAt = startAt.add(allSettings.okexSettlement.period, 'm')
    let secToEnd = endAt.diff(nowMoment, 's')
    allSettings.okexSettlementModeEnding =
      'ends at ' + endAt.format('HH:mm:ss')
      + ' in ' + secToEnd + ' sec'
  } else {
    allSettings.okexSettlementModeEnding = ''
  }
}

const fillOkexSettlement = function () {
  const $cont = $('#okex-settlement')
  // let $cont = $('#borders-main-settings-cont'); //$('<div>').css('display', 'flex').appendTo(main);
  const mainLabel = $('<span>').text('Okex settlement ').appendTo($cont)

  // noinspection DuplicatedCode
  const activeCheckbox = $('<input>').
  css('margin-left', '15px').
  attr('type', 'checkbox').
  appendTo($cont)
  $('<label>').text('active').appendTo($cont)
  activeCheckbox.click(() => {
    activeCheckbox.prop('disabled', true)
    Http.httpAsyncPost(allSettings.SETTINGS_URL, JSON.stringify(
      { okexSettlement: { active: activeCheckbox.prop('checked') } }),
      json => {
        setAllSettingsRaw(json)
        activeCheckbox.prop('disabled', false)
      }
    )
  })

  _createSettingsParam($('<div>').appendTo($cont), 'startAtTime: ',
    x => ({ okexSettlement: { startAtTimeStr: x } }),
    x => x.okexSettlement.startAtTime !== null
      ? x.okexSettlement.startAtTimeStr
      : 'wrong value. Use "hh:mm:ss" or "hh:mm"',
    x => x.okexSettlement.active)
  _createSettingsParam($('<div>').appendTo($cont), 'period: ',
    x => ({ okexSettlement: { period: x } }),
    x => x.okexSettlement.period + ' min',
    x => x.okexSettlement.active)

  const endsAtLb = $('<label>').css('font-weight', 'bold').appendTo($cont)
  mobx.autorun(() => {
    activeCheckbox.prop('checked', allSettings.okexSettlement.active)
    if (allSettings.okexSettlementMode) {
      mainLabel.css('font-weight', 'bold')
      endsAtLb.text('  ' + allSettings.okexSettlementModeEnding)
    } else {
      mainLabel.css('font-weight', 'normal')
      endsAtLb.text('')
    }
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
    if (isActive && value !== 0) {
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
