'use strict';
const $ = require('jquery');
const Http = require('../../http');
const Utils = require('../../utils')
const { mobxStore } = require('../../store/settings-store')

var exports = module.exports = {};

const ind = document.createElement('span');
const label = document.createElement('span');
const label2 = document.createElement('span');

// min max price
const limitAskLb = $('<span>').text('Limit ask /');
const limitAskVal = $('<span>');
const limitBidLb = $('<span>').text('Limit bid /');
const limitBidVal = $('<span>');
const limitMaxPriceLb = $('<span>').text('Max price = ');
const limitMaxPriceVal = $('<span>');
const limitMinPriceLb = $('<span>').text('Min price = ');
const limitMinPriceVal = $('<span>');
const limitTimestampVal = $('<span>');


exports.fillComponents = function (futureIndex, baseUrl) {
    URL = baseUrl + '/settings/all';

    ind.innerHTML = 'Index/Mark: ' + futureIndex.index + ', timestamp=' + futureIndex.timestamp + ', ';

    const indexCont = $('#okcoin-future-index');
    // const indexCont2 = $('#okcoin-future-index2');
    const indexCont3 = $('#okcoin-future-index3');
    if (indexCont.children().length === 0) {
        indexCont.append(ind);

        // const limitPrice = document.createElement('div');
        // indexCont2.append(limitPrice);
        // createLimitPrice(limitPrice, futureIndex.limits.limitPrice, URL);
        const line1 = $('<div>').appendTo(indexCont3);
        const line2 = $('<div>').appendTo(indexCont3);
        line1.append(label);
        if (Utils.isNonProdHost()) {
            createPriceForTest(line1, x => ({ limits: { okexMaxPriceForTest: x } }))
        }
        line2.append(label2)
        if (Utils.isNonProdHost()) {
            createPriceForTest(line2, x => ({ limits: { okexMinPriceForTest: x } }))
        }

        label.appendChild(limitAskLb.get(0));
        label.appendChild(limitMaxPriceLb.get(0));
        label.appendChild(limitAskVal.get(0));
        label.appendChild($('<span>').text(' / ').get(0));
        label.appendChild(limitMaxPriceVal.get(0));

        label2.appendChild(limitBidLb.get(0));
        label2.appendChild(limitMinPriceLb.get(0));
        label2.appendChild(limitBidVal.get(0));
        label2.appendChild($('<span>').text(' / ').get(0));
        label2.appendChild(limitMinPriceVal.get(0));
        line2.append(limitTimestampVal);
    }

    updateLimits(futureIndex.limits)

    mobxStore.okexSwapSettlement = futureIndex.okexSwapSettlement

};

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

function createLimitPrice(container, value, URL) {
    var label = document.createElement('span');
    label.innerHTML = 'Limit price, # ';
    var edit = document.createElement('input');
    edit.style.width = '80px';
    var setBtn = document.createElement('button');
    var valueLabel = document.createElement('span');
    valueLabel.innerHTML = ' #' + value;

    setBtn.onclick = function () {
        setBtn.disabled = true;
        let requestObj = {limits: {okexLimitPrice: edit.value}};
        const requestData = JSON.stringify(requestObj);
        // console.log(requestData);
        Http.httpAsyncPost(URL, requestData, function (rawRes) {
            const res = JSON.parse(rawRes);
            // console.log(res);
            valueLabel.innerHTML = ' #' + res.limits.okexLimitPrice;
            setBtn.disabled = false;
        });
    };
    setBtn.innerHTML = 'set';

    container.append(label);
    container.append(edit);
    container.append(setBtn);
    container.append(valueLabel);
}

function updateLimits(limits) {

    limitAskVal.text(limits.limitAsk);
    limitBidVal.text(limits.limitBid);
    limitMaxPriceVal.text(limits.maxPrice).prop('title', limits.priceRangeTimestamp)
    limitMinPriceVal.text(limits.minPrice).prop('title', limits.priceRangeTimestamp)
    limitTimestampVal.text(` min/max timestamp: ${limits.priceRangeTimestamp}`)

    if (limits.maxPriceForTest) {
        label.setAttribute('style', 'background-color:tomato');
    } else {
        label.setAttribute('style', 'background-color:white');
    }
    if (limits.minPriceForTest) {
        label2.setAttribute('style', 'background-color:tomato');
    } else {
        label2.setAttribute('style', 'background-color:white');
    }

    decorateLimits($('#okex-limits-status-b-delta'), limits.insideLimitsEx.btmDelta);
    decorateLimits($('#okex-limits-status-o-delta'), limits.insideLimitsEx.okDelta);
    decorateLimits($('#okex-limits-status-adj-buy'), limits.insideLimitsEx.adjBuy);
    decorateLimits($('#okex-limits-status-adj-sell'), limits.insideLimitsEx.adjSell);
    decorateLimits($('#okex-limits-status-corr-buy'), limits.insideLimitsEx.corrBuy);
    decorateLimits($('#okex-limits-status-corr-sell'), limits.insideLimitsEx.corrSell);

}

function decorateLimits(el, insideLimits) {
    if (insideLimits) {
        el.css('color', 'green').html('Inside limits');
    } else {
        el.css('color', 'red').html('Outside limits');
    }
}
