import * as mobx from 'mobx'

export { showCloseAllPosExtraInfo }

const $ = require('jquery')
const { mobxStore } = require('../../store/settings-store')

function showCloseAllPosExtraInfo () {

  const leftCont = $('#bitmex-close-all-pos-extra-info')
  $('<span>').text('L_').appendTo(leftCont)
  const leftDqlF = $('<span>').appendTo(leftCont)
  $('<span>').text(', ').appendTo(leftCont)
  const leftEmarkF = $('<span>').appendTo(leftCont)

  const rightCont = $('#okex-close-all-pos-extra-info')
  $('<span>').text('R_').appendTo(rightCont)
  const rightDqlF = $('<span>').appendTo(rightCont)
  $('<span>').text(', ').appendTo(rightCont)
  const rightEmarkF = $('<span>').appendTo(rightCont)

  mobx.autorun(r => {
    const label = mobxStore.balanceInfo.areBothOkex ? 'DMRL_' : 'DQL_'

    leftDqlF.text(label + mobxStore.balanceInfo.leftDql)
    leftEmarkF.text(mobxStore.balanceInfo.leftEmark)
    rightDqlF.text(label + mobxStore.balanceInfo.rightDql)
    rightEmarkF.text(mobxStore.balanceInfo.rightEmark)
  })
}


