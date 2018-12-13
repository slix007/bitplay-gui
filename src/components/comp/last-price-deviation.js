'use strict';
var $ = require('jquery');
var Http = require('../../http');
let sprintf = require('sprintf-js').sprintf;

var exports = module.exports = {};

// const resLabel = $('<span>');
const resLabel = $('<span>');
const lbBitmex = $('<span>');
const lbOkex = $('<span>');

exports.fillComponents = function (jsonData, baseUrl) {
    let SET_URL = baseUrl + '/market/last-price-deviation';

    const indexCont = $('#last-price-deviation');
    if (indexCont.children().length === 0) {
        let edit = $('<input>').width('80px');
        let setBtn = $('<button>').text('set');
        setBtn.click(function () {
            setBtn.disabled = true;
            let requestObj = {maxDevUsd: edit.val()};
            const requestData = JSON.stringify(requestObj);
            console.log(requestData);

            Http.httpAsyncPost(SET_URL, requestData, function (rawRes) {
                const res = JSON.parse(rawRes);
                updateInfo(res);
                setBtn.disabled = false;
            });
        });
        let fixCurrBtn = $('<button>').text('fix current');
        fixCurrBtn.click(function () {
            fixCurrBtn.disabled = true;
            let requestObj = {};
            const requestData = JSON.stringify(requestObj);
            console.log(requestData);

            let FIX_URL = baseUrl + '/market/last-price-deviation/fix';
            Http.httpAsyncPost(FIX_URL, requestData, function (rawRes) {
                const res = JSON.parse(rawRes);
                updateInfo(res);
                fixCurrBtn.disabled = false;
            });
        });

        indexCont.append($('<span>').html('LastPrice deviation'));
        indexCont.append(edit);
        indexCont.append(setBtn);
        indexCont.append(resLabel);
        indexCont.append(fixCurrBtn);
        indexCont.append(lbBitmex);
        indexCont.append(lbOkex);
    }

    updateInfo(jsonData);
};

const getRoundVal = x => ((x.toString().includes('.')) ? (x.toString().split('.').pop().length) : (0));

function showDev(label, isExceed, text, baseVal, currVal) {
    if (isExceed) {
        label.css('color', 'red');
    } else {
        label.css('color', 'black');
    }
    // abs(curr/base*100 - 100) == persentage
    const devP = Math.abs(currVal / baseVal * 100 - 100).toFixed(2);
    label.html(text + baseVal + '(' + devP + '%)');

    const roundVal = getRoundVal(baseVal);
    const devUsd = Math.abs(currVal - baseVal).toFixed(roundVal);
    let info = sprintf('current=%s\ndev=%susd (%s%%)', currVal, devUsd, devP);
    label.prop('title', info);
}

function updateInfo(jsonData) {
    resLabel.html(sprintf('%s usd  ', jsonData.maxDevUsd));
    showDev(lbBitmex, jsonData.bitmexMainExceed, 'bitmex=', jsonData.bitmexMain, jsonData.bitmexMainCurr);
    showDev(lbOkex, jsonData.okexMainExceed, ', okex=', jsonData.okexMain, jsonData.okexMainCurr);
}