import * as mobx from 'mobx'

export { showCloseAllPosExtraInfo }

const $ = require('jquery')
const { mobxStore } = require('../../store/settings-store')

function showCloseAllPosExtraInfo () {

  const leftCont = $('#bitmex-close-all-pos-extra-info')
  $('<span>').text('L_DQL_').appendTo(leftCont)
  const leftDqlF = $('<span>').appendTo(leftCont)
  $('<span>').text(', ').appendTo(leftCont)
  const leftEmarkF = $('<span>').appendTo(leftCont)

  const rightCont = $('#okex-close-all-pos-extra-info')
  $('<span>').text('R_DQL_').appendTo(rightCont)
  const rightDqlF = $('<span>').appendTo(rightCont)
  $('<span>').text(', ').appendTo(rightCont)
  const rightEmarkF = $('<span>').appendTo(rightCont)

  mobx.autorun(r => {
    leftDqlF.text(mobxStore.balanceInfo.leftDql)
    leftEmarkF.text(mobxStore.balanceInfo.leftEmark)
    rightDqlF.text(mobxStore.balanceInfo.rightDql)
    rightEmarkF.text(mobxStore.balanceInfo.rightEmark)
  })
}


