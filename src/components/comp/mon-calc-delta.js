'use strict';
var $ = require('jquery');
var Http = require('../../http');
// var Utils = require('../utils');
var sprintf = require('sprintf-js').sprintf;

var exports = module.exports = {};

let deltaMs = $('<div>');
let maxDeltaMs = $('<div>');
let lastDeltaTime = $('<div>');
let borderMs = $('<div>');
let maxBorderMs = $('<div>');
let lastBorderTime = $('<div>');
let items = $('<div>');
let resetBtn = $('<button>');

exports.updateMonCalcDelta = function (baseUrl, resultJson) {
    const RESET_URL = baseUrl + '/mon/calc-delta/reset';

    const main = $('#mon-calc-delta');

    var myDivs = main.children('div');
    if (myDivs.length === 0) {
        deltaMs = $('<div>').appendTo(main);
        maxDeltaMs = $('<div>').appendTo(main);
        lastDeltaTime = $('<div>').appendTo(main);
        borderMs = $('<div>').appendTo(main);
        maxBorderMs = $('<div>').appendTo(main);
        lastBorderTime = $('<div>').appendTo(main);
        items = $('<div>').appendTo(main);

        $('<a>').attr('href', baseUrl + '/mon/calc-delta/list').text('/mon/calc-delta/list')
        .appendTo($('<div>').appendTo(main));

        resetBtn = $('<button>').text('Reset').click(function () {
            resetBtn.disabled = true;

            const requestData = JSON.stringify({requestStub: 'request'});
            console.log(requestData);

            Http.httpAsyncPost(RESET_URL, requestData, function (result) {
                console.log(result);
                resetBtn.disabled = false;
            });
        }).appendTo(main);
    }

    deltaMs.html('deltaMs=' + resultJson.deltaMs);
    maxDeltaMs.html('maxDeltaMs=' + resultJson.maxDeltaMs);
    lastDeltaTime.html('lastDeltaTime=' + resultJson.lastDeltaTime);
    borderMs.html('borderMs=' + resultJson.borderMs);
    maxBorderMs.html('maxBorderMs=' + resultJson.maxBorderMs);
    lastBorderTime.html('lastBorderTime=' + resultJson.lastBorderTime);
    items.html('delta items in calculation. b=' + resultJson.bdeltaItems + ', o=' + resultJson.odeltaItems);

    // console.log(resultJson);
};
