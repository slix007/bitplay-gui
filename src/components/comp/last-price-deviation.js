'use strict';
var $ = require('jquery');
var Http = require('../../http');

var exports = module.exports = {};

// const resLabel = $('<span>');
const resLabel = $('<span>');
const lbBitmex = $('<span>');
const lbBitmexExtra = $('<span>');
const lbOkex = $('<span>');

exports.fillComponents = function (jsonData, baseUrl) {
    let SET_URL = baseUrl + '/market/last-price-deviation';

    const indexCont = $('#last-price-deviation');
    if (indexCont.children().length === 0) {
        let edit = $('<input>').width('80px');
        let setBtn = $('<button>').text('set');
        setBtn.click(function () {
            setBtn.disabled = true;
            let requestObj = {percentage: edit.val()};
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
        indexCont.append(lbBitmexExtra);
    }

    updateInfo(jsonData);
};

function showDev(label, isExceed, text, baseVal, currVal, description) {
    if (isExceed) {
        label.css('color', 'red');
    } else {
        label.css('color', 'black');
    }
    label.html(text + baseVal);

    // abs(curr/base*100 - 100) == persentage
    const dev = Math.abs(currVal / baseVal * 100 - 100).toFixed(2);
    let info = 'current=' + currVal + '\ndev=' + dev + '%';
    if (description) {
        info += '\n(' + description + ')';
    }
    label.prop('title', info);
}

function updateInfo(jsonData) {
    resLabel.html(sprintf('%s %%  ', jsonData.percentage));
    showDev(lbBitmex, jsonData.bitmexMainExceed, 'bitmex=', jsonData.bitmexMain, jsonData.bitmexMainCurr);
    showDev(lbOkex, jsonData.okexMainExceed, ', okex=', jsonData.okexMain, jsonData.okexMainCurr);
    if (jsonData.bitmexExtra) {
        showDev(lbBitmexExtra, jsonData.bitmexExtraExceed, ', bitmex_extraSet=', jsonData.bitmexExtra, jsonData.bitmexExtraCurr, 'bid[1]');
    }
}