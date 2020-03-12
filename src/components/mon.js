'use strict';

var Http = require('../http');
var sprintf = require('sprintf-js').sprintf;
var $ = require('jquery');

let RESET_URL, bitmexMovingBefore, bitmexMovingWaitingPrev, bitmexMovingWaitingMarket, bitmexMovingAfter, bitmexMovingCount;
let bitmexPlacingBefore, bitmexPlacingWholePlacing, bitmexPlacingWaitingMarket, bitmexPlacingCount;
let okexPlacingBefore, okexPlacingWaitingMarket, okexPlacingWholePlacing, okexPlacingCount;
let okexMovingBefore, okexMovingWholeMoving, okexMovingCount;

var exports = module.exports = {};

exports.showMonMoving = function (baseUrl, data) {
    RESET_URL = baseUrl + '/mon/reset';

    var cont = document.getElementById("mon-moving-bitmex");
    if (!bitmexMovingBefore) {
        createMonMoving(cont);
    }
    fillLabels(data)
};

function showRange(data) {
    return sprintf('%s...%s / %s', data.min, data.max, data.last);
}

function fillLabels(data) {
    bitmexPlacingBefore.html('leftPlacingBefore: ' + showRange(data.monBitmexPlacing.before));
    bitmexPlacingWaitingMarket.html('leftPlacingWaitingMarket: ' + showRange(data.monBitmexPlacing.waitingMarket));
    bitmexPlacingWholePlacing.html('leftPlacingWholePlacing: ' + showRange(data.monBitmexPlacing.wholePlacing));
    bitmexPlacingCount.html('leftPlacingCount: ' + data.monBitmexPlacing.count);

    bitmexMovingBefore.html('leftMovingBefore: ' + showRange(data.monBitmexMoving.before));
    bitmexMovingWaitingPrev.html('leftMovingWaitingPrev: ' + showRange(data.monBitmexMoving.waitingPrev));
    bitmexMovingWaitingMarket.html('leftMovingWaitingMarket: ' + showRange(data.monBitmexMoving.waitingMarket));
    bitmexMovingAfter.html('leftMovingAfter: ' + showRange(data.monBitmexMoving.after));
    bitmexMovingCount.html('leftMovingCount: ' + data.monBitmexMoving.count);

    okexPlacingBefore.html('rightPlacingBefore: ' + showRange(data.monOkexPlacing.before));
    okexPlacingWaitingMarket.html('rightPlacingWaitingMarket: ' + showRange(data.monOkexPlacing.waitingMarket));
    okexPlacingWholePlacing.html('rightPlacingWholePlacing: ' + showRange(data.monOkexPlacing.wholePlacing));
    okexPlacingCount.html('rightPlacingWaitingCount: ' + data.monOkexPlacing.count);

    okexMovingBefore.html('rightMovingBefore: ' + showRange(data.monOkexMoving.before));
    okexMovingWholeMoving.html('rightMovingWholeMoving: ' + showRange(data.monOkexMoving.wholePlacing));
    okexMovingCount.html('rightMovingCount: ' + data.monOkexMoving.count);

}

function createMonMoving(container) {
    const cont = $(container);
    cont.css('display', 'flex');
    let cont1 = $('<div>').css('float', 'left').appendTo(cont);
    $('<div>').css('float', 'top').css('margin-bottom', '5px')
    .html('Requests monitoring(ms): min...max / last').appendTo(cont1);
    let mainCont = $('<div>').css('float', 'top').appendTo(cont1);

    let btmCont = $('<div>').css('float', 'left').appendTo(mainCont);
    let okexCont = $('<div>').css('float', 'left').css('margin-left', '10px').appendTo(mainCont);

    bitmexPlacingBefore = $('<div>').html('leftPlacingBefore: ').appendTo(btmCont);
    bitmexPlacingWholePlacing = $('<div>').html('leftPlacingWholePlacing: ').appendTo(btmCont);
    bitmexPlacingWaitingMarket = $('<div>').html('leftPlacingWaitingMarket: ').appendTo(btmCont);
    bitmexPlacingCount = $('<div>').css('margin-bottom', '5px').html('leftPlacingCount: ').appendTo(btmCont);

    bitmexMovingBefore = $('<div>').html('leftMovingBefore: ').appendTo(btmCont);
    bitmexMovingWaitingPrev = $('<div>').html('leftMovingWaitingPrev: ').appendTo(btmCont);
    bitmexMovingWaitingMarket = $('<div>').html('leftMovingWaitingMarket: ').appendTo(btmCont);
    bitmexMovingAfter = $('<div>').html('leftMovingAfter: ').appendTo(btmCont);
    bitmexMovingCount = $('<div>').html('leftMovingCount: ').appendTo(btmCont);

    okexPlacingBefore = $('<div>').html('rightPlacingBefore: ').appendTo(okexCont);
    okexPlacingWaitingMarket = $('<div>').html('rightPlacingWaitingMarket: ').appendTo(okexCont);
    okexPlacingWholePlacing = $('<div>').html('rightPlacingWholePlacing: ').appendTo(okexCont);
    okexPlacingCount = $('<div>').css('margin-bottom', '5px').html('rightPlacingCount: ').appendTo(okexCont);

    okexMovingBefore = $('<div>').html('rightMovingBefore: ').appendTo(okexCont);
    okexMovingWholeMoving = $('<div>').html('rightMovingWholeMoving: ').appendTo(okexCont);
    okexMovingCount = $('<div>').html('rightMovingCount: ').appendTo(okexCont);

    let resetBtn = $('<button>').text('Reset').click(function () {
        console.log('reset MonMoving');
        const requestData = JSON.stringify({monBitmexPlacing: {}});
        resetBtn.disabled = true;
        Http.httpAsyncPost(RESET_URL, requestData, function (result) {
            // let data = JSON.parse(result);
            // fillLabels(data);
            resetBtn.disabled = false;
        });
    }).appendTo(okexCont);

}
