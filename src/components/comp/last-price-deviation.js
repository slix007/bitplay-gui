'use strict';
var $ = require('jquery');
var Http = require('../../http');
let sprintf = require('sprintf-js').sprintf;

var exports = module.exports = {};

// const resLabel = $('<span>');
const resLabel = $('<span>');
const lbDelaySec = $('<span>');
const lbLeft = $('<span>');
const lbRight = $('<span>');

exports.fillComponents = function (jsonData, baseUrl) {
    let SET_URL = baseUrl + '/market/last-price-deviation';

    const indexCont = $('#last-price-deviation');
    if (indexCont.children().length === 0) {
        addLPD(SET_URL, baseUrl, indexCont);
        indexCont.append($('<br>'));
        addLPDDelay(SET_URL, baseUrl, indexCont);
    }

    updateInfo(jsonData);
};

function addLPD(SET_URL, baseUrl, indexCont) {
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

    indexCont.append($('<span>').prop('title', 'last price deviation').html('LPD: '));
    indexCont.append(edit);
    indexCont.append(setBtn);
    indexCont.append(resLabel);
    indexCont.append(fixCurrBtn);
    indexCont.append(lbLeft);
    indexCont.append(lbRight);
}

function addLPDDelay(SET_URL, baseUrl, indexCont) {
    let edit = $('<input>').width('80px');
    let setBtn = $('<button>').text('set');
    setBtn.click(function () {
        setBtn.disabled = true;
        let requestObj = {delaySec: edit.val()};
        const requestData = JSON.stringify(requestObj);
        console.log(requestData);

        Http.httpAsyncPost(SET_URL, requestData, function (rawRes) {
            const res = JSON.parse(rawRes);
            updateInfo(res);
            setBtn.disabled = false;
        });
    });

    indexCont.append($('<span>').prop('title', 'last price deviation period in seconds').html('LPD period: '));
    indexCont.append(edit);
    indexCont.append(setBtn);
    indexCont.append(lbDelaySec);
}

const getRoundVal = x => (x && (x.toString().includes('.'))
  ? (x.toString().split('.').pop().length) : (0));

function showDev(label, isExceed, text, baseVal, currVal, maxDevUsd) {
    if (isExceed) {
        label.css('color', 'red');
    } else {
        label.css('color', 'black');
    }
    // LPD% = LPD_usd / base_price *100;
    const lpdP = Math.abs(maxDevUsd / baseVal * 100).toFixed(2);
    label.html(text + baseVal + '(' + lpdP + '%)');

    const roundVal = getRoundVal(baseVal);
    const minUsd = Math.abs(baseVal - maxDevUsd).toFixed(roundVal);
    const maxUsd = Math.abs(baseVal + maxDevUsd).toFixed(roundVal);

    let info = sprintf('current = %s\n min = %s\n max = %s', currVal, minUsd, maxUsd);
    label.prop('title', info);
}

function updateInfo(jsonData) {
    resLabel.html(sprintf('%s usd  ', jsonData.maxDevUsd));
    showDev(lbLeft, jsonData.leftMainExceed, 'left=', jsonData.leftMain, jsonData.leftMainCurr, jsonData.maxDevUsd);
    showDev(lbRight, jsonData.rightMainExceed, ', right=', jsonData.rightMain, jsonData.rightMainCurr, jsonData.maxDevUsd);

    lbDelaySec.html(sprintf('%s sec. To fixCurrent(sec): %s', jsonData.delaySec, jsonData.toNextFix));
}
