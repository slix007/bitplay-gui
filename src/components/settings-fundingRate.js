'use strict'

import { allSettings, mobxStore } from '../store/settings-store'

import $ from 'jquery'
import * as mobx from 'mobx'
import { extractFirstTool } from '../utils'

export { createFundingRateBlock }

const createFundingRateBlock = function () {
  const container = $('#funding-rate-borders-block')
  // let container = $('#borders-main-settings-cont'); //$('<div>').css('display', 'flex').appendTo(main);
  // const mainLabel = $('<span>').text('Funding Rate block: ').appendTo(container)
// Bitmex FF rate, % = n,     // сделать хинт на FF - First Funding
// cost: BTC = n, USD = n, PTS = n,
// Bitmex SF rate, % = n,     // сделать хинт на SF - Second Funding
// cost: BTC = n, USD = n, PTS = n,
// Okex FF rate, % = n,         // сделать хинт на FF - First Funding
// cost: BTC = n, USD = n, PTS = n,
// Okex SF rate, % = n,          // сделать хинт на SF - Second Funding
// cost: BTC = n, USD = n, PTS = n.

  // Bitmex FF rate, % = n,     // сделать хинт на FF - First Funding
  // $('<span>').text('Bitmex FF rate').prop('title', 'First Funding').appendTo(container)
  // const realValue = $('<span>').appendTo(container)
  // $('<span>').text(label2).appendTo(container)

  _createDynamicInfo(
    $('<div>').appendTo(container).append($('<span>').text('Left ')).append(
      $('<span>').text('FF').prop('title', 'First Funding')
    ),
    x => (x.fundingRateBordersBlock.left.ff),
    allS => extractFirstTool(allS.contractModeCurrent.left)
  )
  _createDynamicInfo(
    $('<div>').appendTo(container).append($('<span>').text('Left ')).append(
      $('<span>').text('SF').prop('title', 'Second Funding')
    ),
    x => (x.fundingRateBordersBlock.left.sf),
    allS => extractFirstTool(allS.contractModeCurrent.left)
  )
  _createDynamicInfo(
    $('<div>').appendTo(container).append($('<span>').text('Right ')).append(
      $('<span>').text('FF').prop('title', 'First Funding')
    ),
    x => (x.fundingRateBordersBlock.right.ff),
    allS => extractFirstTool(allS.contractModeCurrent.right)
  )
  _createDynamicInfo(
    $('<div>').appendTo(container).append($('<span>').text('Right ')).append(
      $('<span>').text('SF').prop('title', 'Second Funding')
    ),
    x => (x.fundingRateBordersBlock.right.sf),
    allS => extractFirstTool(allS.contractModeCurrent.right)
  )
}

function _createDynamicInfo (container, valExtractor, contractNameExtractor) {
  $('<span>').text(' rate, % = ').appendTo(container)
  const rateValue = $('<span>').appendTo(container)
  $('<div>').appendTo(container)
  $('<span>').text('cost: ').appendTo(container)
  $('<span>').text('USD = ').appendTo(container)
  const usdValue = $('<span>').appendTo(container)
  $('<span>').text(', PTS = ').appendTo(container)
  const ptsValue = $('<span>').appendTo(container)

  mobx.autorun(function () {
    rateValue.text(valExtractor(mobxStore).rate)
    usdValue.text(valExtractor(mobxStore).costUsd)
    ptsValue.text(valExtractor(mobxStore).costPts)
  })
}
