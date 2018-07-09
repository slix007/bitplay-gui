'use strict';
var $ = require('jquery');
var Http = require('../../http');
// var Utils = require('../utils');
var sprintf = require('sprintf-js').sprintf;

var exports = module.exports = {};

let deltaMsTable = $('<table>');
let deltaMs = $('<div>');
let btmDeltaMs = $('<div>');
let okDeltaMs = $('<div>');
let btmValidateDeltaMs = $('<div>');
let okValidateDeltaMs = $('<div>');

let label = $('<div>');
// let maxBorderMs = $('<div>');
// let lastBorderTime = $('<div>');
let items = $('<div>');
let resetBtn = $('<button>');

exports.updateMonCalcDelta = function (baseUrl, resultJson) {
    const RESET_URL = baseUrl + '/mon/calc-delta/reset';

    const main = $('#mon-calc-delta');

    var myDivs = main.children('div');
    if (myDivs.length === 0) {
        label = $('<div>').text('ms * 1000').appendTo(main);
        deltaMsTable = $('<table></table>').appendTo(main);
        // deltaMs = $('<div>').appendTo(main);
        // btmDeltaMs = $('<div>').appendTo(main);
        // okDeltaMs = $('<div>').appendTo(main);
        // btmValidateDeltaMs = $('<div>').appendTo(main);
        // okValidateDeltaMs = $('<div>').appendTo(main);
        // maxBorderMs = $('<div>').appendTo(main);
        // lastBorderTime = $('<div>').appendTo(main);
        items = $('<div>').appendTo(main);

        $('<a>').attr('href', baseUrl + '/mon/calc-delta/list').text('/mon/calc-delta/list')
        .appendTo($('<div>').appendTo(main));
        $('<a>').attr('href', baseUrl + '/mon/calc-delta/list/bitmex').text('/mon/calc-delta/list/bitmex')
        .appendTo($('<div>').appendTo(main));
        $('<a>').attr('href', baseUrl + '/mon/calc-delta/list/okex').text('/mon/calc-delta/list/okex')
        .appendTo($('<div>').appendTo(main));
        $('<a>').attr('href', baseUrl + '/mon/calc-delta/list/bitmex-all').text('/mon/calc-delta/list/bitmex-all')
        .appendTo($('<div>').appendTo(main));
        $('<a>').attr('href', baseUrl + '/mon/calc-delta/list/okex-all').text('/mon/calc-delta/list/okex-all')
        .appendTo($('<div>').appendTo(main));
        $('<a>').attr('href', baseUrl + '/market/debug-log').text('/market/debug-log')
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

        var row = $('<tr>').appendTo(deltaMsTable);
        $('<td></td>').text("btmDeltaMs/max/timestamp=").appendTo(row);
        $('<td></td>').attr('id', 'btmDeltaMs').text(sprintf('%s/%s/%s', resultJson.btmDeltaMs, resultJson.maxBtmDeltaMs, resultJson.lastBtmDeltaTime)).appendTo(row);
        var row = $('<tr>').appendTo(deltaMsTable);
        $('<td></td>').text("btmValidateDeltaMs/max/timestamp=").appendTo(row);
        $('<td></td>').attr('id', 'btmValidateDeltaMs').text(sprintf('%s/%s/%s', resultJson.btmValidateDeltaMs, resultJson.maxBtmValidateDeltaMs, resultJson.lastBtmValidateDeltaTime)).appendTo(row);
        var row = $('<tr>').appendTo(deltaMsTable);
        $('<td></td>').text("okDeltaMs/max/timestamp=").appendTo(row);
        $('<td></td>').attr('id', 'okDeltaMs').text(sprintf('%s/%s/%s', resultJson.okDeltaMs, resultJson.maxOkDeltaMs, resultJson.lastOkDeltaTime)).appendTo(row);
        var row = $('<tr>').appendTo(deltaMsTable);
        $('<td></td>').text("okValidateDeltaMs/max/timestamp=").appendTo(row);
        $('<td></td>').attr('id', 'okValidateDeltaMs').text(sprintf('%s/%s/%s', resultJson.okValidateDeltaMs, resultJson.maxOkValidateDeltaMs, resultJson.lastOkValidateDeltaTime)).appendTo(row);

        var row = $('<tr>').appendTo(deltaMsTable);
        $('<td></td>').text("").appendTo(row);
        $('<td></td>').text("").appendTo(row);

        var row = $('<tr>').appendTo(deltaMsTable);
        $('<td></td>').text("addNewDeltaMs/max/timestamp=").appendTo(row);
        $('<td></td>').attr('id', 'addNewDeltaMs').text(sprintf('%s/%s/%s', resultJson.deltaMs, resultJson.maxDeltaMs, resultJson.lastDeltaTime)).appendTo(row);

        var row = $('<tr>').appendTo(deltaMsTable);
        $('<td></td>').text("borderMs/max/timestamp=").appendTo(row);
        $('<td></td>').attr('id', 'borderMs').text(sprintf('%s/%s/%s', resultJson.borderMs, resultJson.maxBorderMs, resultJson.lastBorderTime)).appendTo(row);

    }
    $('#addNewDeltaMs').text(sprintf('%s / %s / %s', resultJson.deltaMs, resultJson.maxDeltaMs, resultJson.lastDeltaTime));
    $('#btmDeltaMs').text(sprintf('%s / %s / %s', resultJson.btmDeltaMs, resultJson.maxBtmDeltaMs, resultJson.lastBtmDeltaTime));
    $('#btmValidateDeltaMs').text(sprintf('%s / %s / %s', resultJson.btmValidateDeltaMs, resultJson.maxBtmValidateDeltaMs, resultJson.lastBtmValidateDeltaTime));
    $('#okDeltaMs').text(sprintf('%s / %s / %s', resultJson.okDeltaMs, resultJson.maxOkDeltaMs, resultJson.lastOkDeltaTime));
    $('#okValidateDeltaMs').text(sprintf('%s / %s / %s', resultJson.okValidateDeltaMs, resultJson.maxOkValidateDeltaMs, resultJson.lastOkValidateDeltaTime));
    $('#borderMs').text(sprintf('%s / %s / %s', resultJson.borderMs, resultJson.maxBorderMs, resultJson.lastBorderTime));


    // deltaMs.html(sprintf('AddNewDeltaMs/max/timestamp=%s/%s/%s', resultJson.deltaMs, resultJson.maxDeltaMs, resultJson.lastDeltaTime));
    // btmDeltaMs.html(sprintf('btmDeltaMs/max/timestamp=%s/%s/%s', resultJson.btmDeltaMs, resultJson.maxBtmDeltaMs, resultJson.lastBtmDeltaTime));
    // okDeltaMs.html(sprintf('btmValidateDeltaMs/max/timestamp=%s/%s/%s', resultJson.btmValidateDeltaMs, resultJson.maxBtmValidateDeltaMs, resultJson.lastBtmValidateDeltaTime));
    // btmValidateDeltaMs.html(sprintf('okDeltaMs/max/timestamp=%s/%s/%s', resultJson.okDeltaMs, resultJson.maxOkDeltaMs, resultJson.lastOkDeltaTime));
    // okValidateDeltaMs.html(sprintf('okValidateDeltaMs/max/timestamp=%s/%s/%s', resultJson.okValidateDeltaMs, resultJson.maxOkValidateDeltaMs, resultJson.lastOkValidateDeltaTime));
    // maxDeltaMs.html('maxDeltaMs=' + resultJson.maxDeltaMs);
    // lastDeltaTime.html('lastDeltaTime=' + resultJson.lastDeltaTime);
    // borderMs.html(sprintf('borderMs/max/timestamp=%s/%s/%s', resultJson.borderMs, resultJson.maxBorderMs, resultJson.lastBorderTime));
    // maxBorderMs.html('maxBorderMs=' + resultJson.maxBorderMs);
    // lastBorderTime.html('lastBorderTime=' + resultJson.lastBorderTime);
    items.html('delta items in calculation. b=' + resultJson.bdeltaItems + ', o=' + resultJson.odeltaItems);

    // console.log(resultJson);
};
