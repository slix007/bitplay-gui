'use strict'
import { createOkexFtpd } from '../settings-okexFtpd'
import { okexAfterLimitsSettings } from './okex-after-limits'

const $ = require('jquery')
const Http = require('../../http')
const Utils = require('../../utils')
const { mobxStore } = require('../../store/settings-store')

export { fillComponents, createBeforeAndAfterOrderBook }

function createBeforeAndAfterOrderBook (arbType) {
    const contBeforeOrderBook = $(`#${arbType}-before-orderbook`)


    const label = $('<span>', { 'id': `${arbType}-label` })
    const label2 = $('<span>', { 'id': `${arbType}-label2` })

    const limitAskLb = $('<span>', { 'id': `${arbType}-limitAskLb` }).text('Limit ask /')
    const limitAskVal = $('<span>', { 'id': `${arbType}-limitAskVal` })
    const limitBidLb = $('<span>', { 'id': `${arbType}-limitBidLb` }).text('Limit bid /')
    const limitBidVal = $('<span>', { 'id': `${arbType}-limitBidVal` })
    const limitMaxPriceLb = $('<span>', { 'id': `${arbType}-limitMaxPriceLb` }).text('Max price = ')
    const limitMaxPriceVal = $('<span>', { 'id': `${arbType}-limitMaxPriceVal` })
    const limitMinPriceLb = $('<span>', { 'id': `${arbType}-limitMinPriceLb` }).text('Min price = ')
    const limitMinPriceVal = $('<span>', { 'id': `${arbType}-limitMinPriceVal` })
    const limitTimestampVal = $('<span>', { 'id': `${arbType}-limitTimestampVal` })
    const indexCont = $('<div>', { 'id': `${arbType}-indexCont` })
    const ftpdDiv = $('<div>')
    const indexCont3 = $('<div>')

    indexCont.appendTo(contBeforeOrderBook)
    ftpdDiv.appendTo(contBeforeOrderBook)
    indexCont3.appendTo(contBeforeOrderBook)
    createOkexFtpd(ftpdDiv, arbType)

    const line1 = $('<div>').appendTo(indexCont3)
    const line2 = $('<div>').appendTo(indexCont3)
    line1.append(label)
    if (Utils.isNonProdHost()) {
        createPriceForTest(line1, x => ({ limits: { okexMaxPriceForTest: x } }))
    }
    line2.append(label2)
    if (Utils.isNonProdHost()) {
        createPriceForTest(line2, x => ({ limits: { okexMinPriceForTest: x } }))
    }

    label.append(limitAskLb)
    label.append(limitMaxPriceLb)
    label.append(limitAskVal)
    label.append($('<span>').text(' / '))
    label.append(limitMaxPriceVal)

    label2.append(limitBidLb)
    label2.append(limitMinPriceLb)
    label2.append(limitBidVal)
    label2.append($('<span>').text(' / '))
    label2.append(limitMinPriceVal)
    line2.append(limitTimestampVal)

    const limitsDiv = $(`#${arbType}-limits-status`)
    $('<div>').text('Okex price limits:').appendTo(limitsDiv)
    const bDeltaDiv = $('<div>').text('L_delta:').appendTo(limitsDiv)
    $('<span>', { 'id': `${arbType}-limits-status-b-delta` }).appendTo(bDeltaDiv)
    const oDeltaDiv = $('<div>').text('R_delta:').appendTo(limitsDiv)
    $('<span>', { 'id': `${arbType}-limits-status-o-delta` }).appendTo(oDeltaDiv)
    const adjBuyDiv = $('<div>').text('adj_buy:').appendTo(limitsDiv)
    $('<span>', { 'id': `${arbType}-limits-status-adj-buy` }).appendTo(adjBuyDiv)
    const adjSellDiv = $('<div>').text('adj_sell:').appendTo(limitsDiv)
    $('<span>', { 'id': `${arbType}-limits-status-adj-sell` }).appendTo(adjSellDiv)
    const corrBuyDiv = $('<div>').text('corr/preliq/killpos_buy:').appendTo(limitsDiv)
    $('<span>', { 'id': `${arbType}-limits-status-corr-buy` }).appendTo(corrBuyDiv)
    const corrSellDiv = $('<div>').text('corr/preliq/killpos_sell:').appendTo(limitsDiv)
    $('<span>', { 'id': `${arbType}-limits-status-corr-sell` }).appendTo(corrSellDiv)

    okexAfterLimitsSettings(arbType)
}

const fillComponents = function (futureIndex, baseUrl, arbType) {
    URL = baseUrl + '/settings/all'

    updateLimits(futureIndex.limits, arbType)

    const indexString = 'Index/Mark: ' + futureIndex.index + ', timestamp=' + futureIndex.timestamp + ', '
      + futureIndex.contractExtraJson.ethBtcBal
    $(`#${arbType}-indexCont`).html(indexString)

    if (futureIndex.leftSwapSettlement) { mobxStore.leftSwapSettlement = futureIndex.leftSwapSettlement }

    if (futureIndex.rightSwapSettlement) { mobxStore.rightSwapSettlement = futureIndex.rightSwapSettlement }

}

function createPriceForTest(el, requestCreator) {
    $('<span>').html(' &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ').appendTo(el);
    const text = $('<span>').html('price for testing:').prop('title', 'use 0 to disable')
    .css('font-style', 'italic')
    .css('text-decoration', 'underline')
    .appendTo(el);
    const edit = $('<input>').width('60px').appendTo(el);
    const setBtn = $('<button>').text('set').appendTo(el);
    setBtn.click(function () {
        setBtn.disabled = true;
        let requestObj = requestCreator(edit.val());
        const requestData = JSON.stringify(requestObj);
        // console.log(requestData);
        Http.httpAsyncPost(URL, requestData, function (rawRes) {
            // const res = JSON.parse(rawRes);
            // console.log(res);
            // valueLabel.innerHTML = ' #' + res.limits.okexLimitPrice;
            setBtn.disabled = false;
        });
    });

}

function updateLimits (limits, arbType) {

    $(`#${arbType}-limitAskVal`).text(limits.limitAsk)
    $(`#${arbType}-limitBidVal`).text(limits.limitBid)
    $(`#${arbType}-limitMaxPriceVal`).text(limits.maxPrice).prop('title', limits.priceRangeTimestamp)
    $(`#${arbType}-limitMinPriceVal`).text(limits.minPrice).prop('title', limits.priceRangeTimestamp)
    $(`#${arbType}-limitTimestampVal`).text(` min/max timestamp: ${limits.priceRangeTimestamp}`)

    if (limits.maxPriceForTest) {
        $(`#${arbType}-label`).css('background-color', 'tomato')
    } else {
        $(`#${arbType}-label`).css('background-color', 'white')
    }
    if (limits.minPriceForTest) {
        $(`#${arbType}-label2`).css('background-color', 'tomato')
    } else {
        $(`#${arbType}-label2`).css('background-color', 'white')
    }

    if (limits && limits.insideLimitsEx) {
        decorateLimits($(`#${arbType}-limits-status-b-delta`), limits.insideLimitsEx.btmDelta)
        decorateLimits($(`#${arbType}-limits-status-o-delta`), limits.insideLimitsEx.okDelta)
        decorateLimits($(`#${arbType}-limits-status-adj-buy`), limits.insideLimitsEx.adjBuy)
        decorateLimits($(`#${arbType}-limits-status-adj-sell`), limits.insideLimitsEx.adjSell)
        decorateLimits($(`#${arbType}-limits-status-corr-buy`), limits.insideLimitsEx.corrBuy)
        decorateLimits($(`#${arbType}-limits-status-corr-sell`), limits.insideLimitsEx.corrSell)
    }

}

function decorateLimits(el, insideLimits) {
    if (insideLimits) {
        el.css('color', 'green').html('Inside limits');
    } else {
        el.css('color', 'red').html('Outside limits');
    }
}
