'use strict';
var $ = require('jquery');
var Http = require('../../http');

var exports = module.exports = {};

const ind = document.createElement('span');
const label = document.createElement('span');
const label2 = document.createElement('span');

exports.fillComponents = function (futureIndex, baseUrl) {
    URL = baseUrl + '/settings/all';

    ind.innerHTML = 'Index: ' + futureIndex.index + ', timestamp=' + futureIndex.timestamp + ', ';

    const indexCont = $('#okcoin-future-index');
    const indexCont2 = $('#okcoin-future-index2');
    if (indexCont.children().length === 0) {
        indexCont.append(ind);

        const limitPrice = document.createElement('div');
        indexCont2.append(limitPrice);
        createLimitPrice(limitPrice, futureIndex.limits.limitPrice, URL);
        const line1 = $('<div>').appendTo(indexCont2);
        const line2 = $('<div>').appendTo(indexCont2);
        line1.append(label);
        createPriceForTest(line1, x => ({limits: {okexMaxPriceForTest: x}}));
        line2.append(label2);
        createPriceForTest(line2, x => ({limits: {okexMinPriceForTest: x}}));
    }

    updateLimits(futureIndex.limits);

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
    label.innerHTML = 'Limit ask / Max price = ' + limits.limitAsk + ' / ' + limits.maxPrice;
    label2.innerHTML = 'Limit bid / Min price = ' + limits.limitBid + ' / ' + limits.minPrice;
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
