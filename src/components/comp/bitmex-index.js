'use strict';
var $ = require('jquery');
var Http = require('../../http');
var Utils = require('../../utils');

var exports = module.exports = {};

const ind = document.createElement('div');
const label = document.createElement('div');
const label2 = document.createElement('div');

exports.fillComponents = function (container, futureIndex, baseUrl) {
    URL = baseUrl + '/settings/all';

    ind.innerHTML = 'Index/Mark: ' + futureIndex.index + ', timestamp=' + futureIndex.timestamp;

    if ($(container).children().length === 0) {
        container.appendChild(ind);

        const limitPrice = document.createElement('div');
        container.append(limitPrice);
        createLimitPrice(limitPrice, futureIndex.limits.limitPrice, URL);
        container.append(label);
        container.append(label2);
    }

    if (futureIndex.limits != null) {
        updateLimits(futureIndex.limits);
    }

    fillBitmexFunding(futureIndex);
};

function fillBitmexFunding(futureIndex) {
    let fund = document.getElementById('bitmex-future-index-funding');
    if (futureIndex.swapType === 'noSwap') {
        fund.style.color = "#008f00";
    } else {
        fund.style.color = "#bf0000";
    }
    fund.innerHTML = 'fRate' + futureIndex.fundingRate + '%'
            + ' fCost' + futureIndex.fundingCost + 'XBT'
            + ' p' + Utils.withSign(futureIndex.position)
            + '(' + futureIndex.swapType + ')';

    let fundTime = document.getElementById('bitmex-future-index-funding-time');
    fundTime.innerHTML = ', timeToSwap=' + futureIndex.timeToSwap
            + ', swapTime=' + futureIndex.swapTime
            + ', ';
    let timeCompare = document.getElementById('timeCompare');
    timeCompare.innerHTML = futureIndex.timeCompareString;
    let timeCompareUpdating = document.getElementById('timeCompareUpdating');
    timeCompareUpdating.innerHTML = futureIndex.timeCompareUpdating;
}

function createLimitPrice(container, value, URL) {
    var label = document.createElement('span');
    label.innerHTML = 'Limit price, % ';
    var edit = document.createElement('input');
    edit.style.width = '80px';
    var setBtn = document.createElement('button');
    var valueLabel = document.createElement('span');
    valueLabel.innerHTML = ' ' + value + '%';

    setBtn.onclick = function () {
        setBtn.disabled = true;
        let requestObj = {limits: {bitmexLimitPrice: edit.value}};
        const requestData = JSON.stringify(requestObj);
        // console.log(requestData);
        Http.httpAsyncPost(URL, requestData, function (rawRes) {
            const res = JSON.parse(rawRes);
            // console.log(res);
            valueLabel.innerHTML = ' ' + res.limits.bitmexLimitPrice + '%';
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

    if (limits.insideLimits) {
        $('#bitmex-limits-status').css('color', 'green').html('Inside limits');
    } else {
        $('#bitmex-limits-status').css('color', 'red').html('Outside limits');
    }
}
