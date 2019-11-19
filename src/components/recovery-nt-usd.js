'use strict'

import Http from '../http'
import $ from 'jquery'
import { allSettings, setAllSettingsRaw } from '../store/settings-store'

export { createRecoveryNtUsd }

let createRecoveryNtUsd = function (baseUrl) {

  recovery(baseUrl)

}

function recovery (baseUrl) {
  const URL_ACTION = baseUrl + '/market/recovery-nt-usd'

  const cont = $('#recovery-nt-usd')
  const checkbox = $('<input>').attr('type', 'checkbox').appendTo(cont)
  const btn = $('<button>').text('recovery nt_usd').appendTo(cont)
  const lb = $('<span>').appendTo(cont)

  btn.prop('disabled', true)

  btn.click(() => {
    // let confirmation = window.confirm("Bitmex: close all positions\n\nAre you sure?");
    // if (confirmation)
    {
      // console.log('request to ' + URL_ACTION);
      btn.prop('disabled', true)
      lb.text('in progress')

      Http.httpAsyncPost(URL_ACTION,
        '', function (rawData) {
          const result = JSON.parse(rawData)
          lb.text(result.result)
          // if (result.orderId && result.orderId.length > 0) {
          //     lb.text('orderId: ' + result.orderId + ' ' + result.details);
          // } else {
          //     lb.text('Error: ' + result.details);
          // }
          btn.prop('disabled', false)
        })
    }
  })

  function setManualMode () {
    checkbox.prop('disabled', true)
    const data = JSON.stringify({ manageType: 'MANUAL' })
    Http.httpAsyncPost(allSettings.SETTINGS_URL, data,
      json => {
        checkbox.prop('disabled', false)
        const res = setAllSettingsRaw(json)
        // alert('New value: ' + res.manageType);
      })
  }

  checkbox.click(() => {
    if (checkbox.prop('checked')) {
      btn.prop('disabled', false)
      btn.addClass('redBtn')
      setManualMode()
    } else {
      btn.prop('disabled', true)
      btn.removeClass('redBtn')
    }

  })
}

