'use strict'

import { mobxStore } from '../../store/settings-store'

const $ = require('jquery')

const Http = require('../../http')
const mobx = require('mobx')

export { createSwapFunding }

const createSwapFunding = function (prevCont, arbType) {

  // const container = $('#okex-swap-funding')
  const container = $('<div>').appendTo(prevCont)
  // const URL = allSettings.BASE_URL + '/market/okcoin/swap-funding'

  const lb = $('<span>').appendTo(container)
  // lb.html('asdfsad')

  mobx.autorun(function () {
    // console.log(mobxStore.okexSwapSettlement.fundingRate)
    // console.log(mobxStore.okexSwapSettlement.fundingTime)

    const val = arbType === 'left' ? mobxStore.leftSwapSettlement : mobxStore.rightSwapSettlement
    // lb.html(mobxStore.okexSwapSettlement.fundingRate)

    if (val) {
      //   lb.html(val)
      lb.html(`
              fundingTime=${val.fundingTime}<br> 
              fundingRate=${val.fundingRate}<br> 
              estimatedRate=${val.estimatedRate}<br> 
              settlementTime=${val.settlementTime}<br> 
      `)
    }

  })

}
