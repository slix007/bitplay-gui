var $ = require('jquery');
var Handsontable = require('handsontable');
var sprintf = require('sprintf-js').sprintf;
var Utils = require('./utils');
var Http = require('./http');

var exports = module.exports = {};

exports.showDeltaLogs = function (firstMarketName, secondMarketName, baseUrl) {

    const URL = sprintf('%s/trade/list', baseUrl);

    const mainContainer = $('div[data-name="deltalogs-page"]');
    const mainCont = mainContainer.get()[0];
    // var elementBitmexAsk = document.getElementById('div[data-name="deltalogs-page"]');

    let parseTradeLogs = function (trades) {

        const logs = trades.map(item => item.deltaLog)[0];

        // let bidArray = [];
        // trades.bid
        // .slice(0, 5)
        // .forEach(bid => {
        //     bidArray.push([bid.currency, bid.price, bid.amount, bid.amountInBtc, bid.timestamp]);
        // });
        //
        // let orderBook = {};
        // orderBook.bid = bidArray;

        console.log(logs);

        return logs;
    };

    let fetchTradeLogs = function (dataUrl) {

        let inputData = JSON.parse(Http.httpGet(dataUrl));

        return parseTradeLogs(inputData);
    };


    function createTable(container, dataUrl) {
        return new Handsontable(container, {
            data: fetchTradeLogs(dataUrl),
            colWidths: [100, 140, 300],
            rowHeaders: true,
            colHeaders: ['level', 'time', 'details'],
            fixedRowsTop: 1,
            fixedColumnsLeft: 1,
            fixedRowsBottom: 1,
            manualColumnResize: true,
            columnSorting: true,
            sortIndicator: true,
            stretchH: 'last',
            autoColumnSize: {
                samplingRatio: 23
            }
        });
    }

    let tradeTable = createTable(mainCont, URL);



    Http.httpAsyncGet(URL, function (rawData) {
        const jsonData = JSON.parse(rawData);
        let logs = parseTradeLogs(jsonData);

        tradeTable.loadData(logs);

    });



};