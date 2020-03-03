'use strict'

import { allSettings, mobxStore, setAllSettingsRaw } from '../store/settings-store'
import $ from 'jquery'
import Http from '../http'
import * as mobx from 'mobx'

export { createOkexFtpd }

const createOkexFtpd = function (cont) {

  createFtpdTypeDropdown(cont)

  createOkexFtpdValue(cont)

  createOkexFtpdBod(cont)



}

function createFtpdTypeDropdown (container) {
  $('<span>').text('FTPD type: ').appendTo(container)
  let select = $('<select>')
  select.append($('<option>').val('PTS').text('PTS'))
  select.append($('<option>').val('PERCENT').text('PERCENT'))
  select.change(function () {
    const requestData = JSON.stringify({ okexFtpd: { okexFtpdType: this.value } })
    select.prop('disabled', true)
    Http.httpAsyncPost(allSettings.SETTINGS_URL, requestData, (result) => {
      setAllSettingsRaw(result)
      select.prop('disabled', false)
    })
  })

  mobx.autorun(r => {
    select.val(allSettings.okexFtpd.okexFtpdType)
  })

  container.append(select)
}

function createOkexFtpdValue (cont) {

  const label = $('<span/>', { title: 'Fake taker price deviation' }).text('FTPD ')
  const edit = $('<input>').width('80px')
  const resLabel = $('<span/>').html(allSettings.okexFtpd)
  let updateBtn = $('<button>').text('set').css('margin-right', '5px')

  cont.append(label).append(edit).append(updateBtn).append(resLabel)

  updateBtn.click(function () {
    updateBtn.attr('disabled', true)
    let requestData = JSON.stringify({ okexFtpd: {okexFtpd: edit.val()}  })
    console.log(requestData)
    Http.httpAsyncPost(allSettings.SETTINGS_URL, requestData, (result) => {
      setAllSettingsRaw(result)
      updateBtn.attr('disabled', false)
    })
  })

  mobx.autorun(r => {
    if (allSettings.okexFtpd.okexFtpdType === 'PTS') {
      label.text(' FTPD(usd) ')
    } else if (allSettings.okexFtpd.okexFtpdType === 'PERCENT') {
      label.text(' FTPD(percent) ')
    }
    resLabel.text(allSettings.okexFtpd.okexFtpd)
  })
}

function createOkexFtpdBod (cont) {

  const label = $('<span/>', { title: 'best offer distance' }).css('margin-left', '15px').text('bod ').appendTo(cont)
  const edit = $('<input>').width('80px').appendTo(cont)
  const updateBtn = $('<button>').text('set').css('margin-right', '5px').appendTo(cont)
  const resLabel = $('<span/>').html(allSettings.okexFtpd.okexFtpdBod).appendTo(cont)

  const bodDetailsLabel =$('<span>').appendTo(cont)


  updateBtn.click(function () {
    updateBtn.attr('disabled', true)
    let requestData = JSON.stringify({ okexFtpd: {okexFtpdBod: edit.val()}  })
    console.log(requestData)
    Http.httpAsyncPost(allSettings.SETTINGS_URL, requestData, (result) => {
      setAllSettingsRaw(result)
      updateBtn.attr('disabled', false)
    })
  })

  mobx.autorun(r => {
    resLabel.text(allSettings.okexFtpd.okexFtpdBod)
    const bod = mobxStore.marketStates.okexFtpdJson.bod
    const bodMax = mobxStore.marketStates.okexFtpdJson.bod_max
    const bodMin = mobxStore.marketStates.okexFtpdJson.bod_min
    bodDetailsLabel.text(
      ', bod_max=' + bodMax + ', bod_min=' + bodMin
    )
    if (bodMax < bod  || bodMin < bod) {
      resLabel.css('color', 'darkgoldenrod')
      resLabel.prop('title', 'FTPD is 0 because (bod_max < bod || bod_min < bod)')
      bodDetailsLabel.css('color', 'darkgoldenrod')
      bodDetailsLabel.prop('title', 'FTPD is 0 because (bod_max < bod || bod_min < bod)')
    } else {
      resLabel.css('color', 'black')
      resLabel.prop('title', '')
      bodDetailsLabel.css('color', 'black')
      bodDetailsLabel.prop('title', '')
    }
  })
}



