'use strict'

import { allSettings, mobxStore, setAllSettingsRaw } from '../store/settings-store'

import $ from 'jquery'
import * as mobx from 'mobx'
import Http from '../http'
import {getHHMMSSFromSeconds} from "../utils";

export { createFundingResultTimerBlock, createFundingResultBlock }

const createFundingResultTimerBlock = function () {
  const container = $('#funding-result-timer-block')

  const cont1 = $('<div>').appendTo(container)
  _createSettingsParam(cont1, 'Bitmex FF time: ',
    x => ({ fundingSettingsUpdate: { paramName: 'leftFf', time: x } }),
    x => x.fundingSettings.leftFf.time,
    true,
    x => x.fundingRateBordersBlock.left.ff.timer
  )
  _createScbParam(cont1,
    x => ({ fundingSettingsUpdate: { paramName: 'leftFf', scbString: x } }),
    x => x.fundingSettings.leftFf.scbSec
  )

  const cont2 = $('<div>').appendTo(container)
  _createSettingsParam(cont2, 'Okex FF time: ',
    x => ({ fundingSettingsUpdate: { paramName: 'rightFf', time: x } }),
    x => x.fundingSettings.rightFf.time,
    true,
    x => x.fundingRateBordersBlock.right.ff.timer
  )
  _createScbParam(cont2,
    x => ({ fundingSettingsUpdate: { paramName: 'rightFf', scbString: x } }),
    x => x.fundingSettings.rightFf.scbSec
  )

  const cont3 = $('<div>').appendTo(container)
  _createSettingsParam(cont3, 'Bitmex SF time: ',
    x => ({ fundingSettingsUpdate: { paramName: 'leftSf', time: x } }),
    x => x.fundingSettings.leftSf.time,
    true,
    x => x.fundingRateBordersBlock.left.sf.timer
  )
  _createScbParam(cont3,
    x => ({ fundingSettingsUpdate: { paramName: 'leftSf', scbString: x } }),
    x => x.fundingSettings.leftSf.scbSec
  )

  const cont4 = $('<div>').appendTo(container)
  _createSettingsParam(cont4, 'Okex SF time: ',
    x => ({ fundingSettingsUpdate: { paramName: 'rightSf', time: x } }),
    x => x.fundingSettings.rightSf.time,
    true,
    x => x.fundingRateBordersBlock.right.sf.timer
  )
  _createScbParam(cont4,
    x => ({ fundingSettingsUpdate: { paramName: 'rightSf', scbString: x } }),
    x => x.fundingSettings.rightSf.scbSec
  )
}

function _createSettingsParam (
  container, labelName, requestCreator, valExtractor, isActive, secondsLeftExtractor) {
  const lb = $('<span>').css({
    display: 'inline-block',
    width: '130px'
  }).text(labelName).appendTo(container)
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
    // const timeAt = ' ' + valExtractor(allSettings)
    const timer = secondsLeftExtractor(mobxStore)
    const timeAt = timer.scheduledTime
    timer
      ? realValue.text(timeAt + ' TimeLeft: ' + getHHMMSSFromSeconds(timer.secondsLeft) + ' ')
      : realValue.text(timeAt)
    if (timer.active) {
      lb.css('color', '#19b301')
      lb.css('font-weight', 'bold')
      realValue.css('color', '#19b301')
      realValue.css('font-weight', 'bold')
    } else {
      lb.css('color', 'black')
      lb.css('font-weight', 'normal')
      realValue.css('color', 'black')
      realValue.css('font-weight', 'normal')
    }
  })
}

function _createScbParam (
  container, requestCreator, valExtractor) {
  const lb = $('<span>').
  css({ display: 'inline-block', marginLeft: '10px' }).
  prop('title', 'Start calculate before').
  text('SCB, sec').
  appendTo(container)
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
    realValue.text(' ' + getHHMMSSFromSeconds(valExtractor(allSettings)))
  })
}

const createFundingResultBlock = function () {
  const container = $('#funding-result-timer-block')
  // const container = $('#funding-result-block')
  //checkbox
  const activeCheckbox = $('<input>').
  css('margin-left', '5px').
  css('margin-top', '15px').
  attr('type', 'checkbox').
  appendTo(container)

  activeCheckbox.click(() => {
    activeCheckbox.prop('disabled', true)
    Http.httpAsyncPost(allSettings.SETTINGS_URL, JSON.stringify(
        { fundingSettingsUpdate: { fundingResultEnabled: activeCheckbox.prop('checked') } }
      ),
      json => {
        setAllSettingsRaw(json)
        activeCheckbox.prop('disabled', false)
      }
    )
  })


  // funding result string
  const lb1 = $('<span>').
  // css({ display: 'inline-block', marginLeft: '10px' }).
  // prop('title', 'Start calculate before').
  text('FundingResult, pts = ').
  appendTo(container)
  const realValue = $('<span>').appendTo(container)

  mobx.autorun(function () {
    realValue.text(mobxStore.fundingRateBordersBlock.fundingResultBlock.fundingResultCalcString)
    activeCheckbox.prop('checked', allSettings.fundingSettings.fundingResultEnabled)
    realValue.css('color', allSettings.fundingSettings.fundingResultEnabled ? 'black' : 'grey')

  })
}