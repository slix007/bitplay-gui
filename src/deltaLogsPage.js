var $ = require('jquery');
var Handsontable = require('handsontable');
var sprintf = require('sprintf-js').sprintf;
var Utils = require('./utils');
var Http = require('./http');

var exports = module.exports = {};

exports.showDeltaLogs = function (firstMarketName, secondMarketName, baseUrl) {

    const mainContainer = $('div[data-name="deltalogs-page"]');
    const mainCont = mainContainer.get()[0];
    // var elementBitmexAsk = document.getElementById('div[data-name="deltalogs-page"]');

    mainContainer.html('here will be the tables');

    let parseOrderBook = function (orderBookJson) {

        let bidArray = [];
        orderBookJson.bid
        .slice(0, 5)
        .forEach(bid => {
            bidArray.push([bid.currency, bid.price, bid.amount, bid.amountInBtc, bid.timestamp]);
        });
        // bid
        let askArray = [];
        orderBookJson.ask
        .slice(0, 5)
        .reverse().forEach(ask => {
            askArray.push([ask.currency, ask.price, ask.amount, ask.amountInBtc, ask.timestamp]);
        });
        let orderBook = {};
        orderBook.bid = bidArray;
        orderBook.ask = askArray;

        return orderBook;
    };

    let fetchOrderBook = function (dataUrl) {

        let inputData = JSON.parse(Http.httpGet(dataUrl));

        return parseOrderBook(inputData);
    };


    function createTable(container, dataUrl, dataPartName) {
        return new Handsontable(container, {
            data: fetchOrderBook(dataUrl)[dataPartName],
            colWidths: [100, 140, 100, 80, 90, 120, 140],
            rowHeaders: true,
            colHeaders: ['currency', 'quote', 'contracts', 'amount', 'timestamp'],
            fixedRowsTop: 1,
            fixedColumnsLeft: 1,
            fixedRowsBottom: 1,
            manualColumnResize: true,
            columnSorting: true,
            sortIndicator: true,
            autoColumnSize: {
                samplingRatio: 23
            }
        });
    }

    let tradeTable = createTable(mainCont,
            sprintf('%s/market/%s/order-book', baseUrl, firstMarketName), 'ask');



    Http.httpAsyncGet(sprintf('%s/market/%s/order-book', baseUrl, firstMarketName), function (rawData) {
        const jsonData = JSON.parse(rawData);
        let orderBookP = parseOrderBook(jsonData);
        console.log('orderBookP.ask');
        console.log(orderBookP.ask);
        tradeTable.loadData(orderBookP.ask);

    });



};