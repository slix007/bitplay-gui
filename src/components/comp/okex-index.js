'use strict';
var $ = require('jquery');
var Http = require('../../http');

var exports = module.exports = {};

const ind = document.createElement('div');
const label = document.createElement('div');
const label2 = document.createElement('div');

exports.fillComponents = function (container, futureIndex, baseUrl) {
    URL = baseUrl + '/settings/all';

    // ind.innerHTML = 'Index/Mark: ' + futureIndex.index + ', timestamp=' + futureIndex.timestamp;
    ind.innerHTML = 'Index: ' + futureIndex.index
                         + ', timestamp=' + futureIndex.timestamp;

    if ($(container).children().length === 0) {
        container.appendChild(ind);

        const limitPrice = document.createElement('div');
        container.append(limitPrice);
        createLimitPrice(limitPrice, futureIndex.limits.limitPrice, URL);
        container.append(label);
        container.append(label2);
    }

    updateLimits(futureIndex.limits);

};

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

    if (limits.insideLimits) {
        $('#okex-limits-status').css('color', 'green').html('Inside limits');
    } else {
        $('#okex-limits-status').css('color', 'red').html('Outside limits');
    }
}
