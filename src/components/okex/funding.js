'use strict'

import { mobxStore } from '../../store/settings-store'

const $ = require('jquery')

const Http = require('../../http')
const mobx = require('mobx')

export { createSwapFunding }

const createSwapFunding = function (prevCont, arbType) {

  const container = $('<div>').appendTo(prevCont)
  const lb = $('<span>').appendTo(container)

  mobx.autorun(function () {
    const val = arbType === 'left' ? mobxStore.leftSwapSettlement : mobxStore.rightSwapSettlement
    if (val) {
      lb.html(`
              fundingTime=${val.fundingTime}<br> 
              fundingRate=${val.fundingRate}<br> 
              estimatedRate=${val.estimatedRate}<br> 
              settlementTime=${val.settlementTime}<br> 
      `)
    }

  })

}
