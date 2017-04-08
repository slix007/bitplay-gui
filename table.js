var Handsontable = require('handsontable');

document.addEventListener("DOMContentLoaded", function() {

    let myData = Handsontable.helper.createSpreadsheetData(5, 5);
    let container = document.getElementById('example1');
    let positions = document.getElementById('positions');
    let hot;
    let poloniexBid = document.getElementById('poloniex-bid');
    let poloniexAsk = document.getElementById('poloniex-ask');
    let okcoinBid = document.getElementById('okcoin-bid');
    let okcoinAsk = document.getElementById('okcoin-ask');

    function httpGet(theUrl)
    {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
        xmlHttp.send( null );
        return xmlHttp.responseText;
    };

    let orderBook = function (dataUrl) {

        let inputData = JSON.parse(httpGet(dataUrl));

        let bidArray = [];
        inputData.bid.forEach(bid => {
            bidArray.push([bid.currency, bid.price, bid.amount, bid.orderType, bid.timestamp]);
        });
        // bid
        let askArray = [];
        inputData.ask.forEach(ask => {
            askArray.push([ask.currency, ask.price, ask.amount, ask.orderType, ask.timestamp]);
        });
        let orderBook = {};
        orderBook.bid = bidArray;
        orderBook.ask = askArray;

        return orderBook;
    };

    function createTable(container, dataUrl, dataPartName) {
        hot = new Handsontable(container, {
            data: orderBook(dataUrl)[dataPartName],
            colWidths: [100, 140, 100, 100, 120, 140],
            rowHeaders: true,
            colHeaders: ['currency', 'price', 'amount', 'orderType', 'timestamp'],
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

    createTable(poloniexAsk, 'http://localhost:4030/market/poloniex/order-book', 'ask');
    createTable(poloniexBid, 'http://localhost:4030/market/poloniex/order-book', 'bid');
    createTable(okcoinAsk, 'http://localhost:4030/market/okcoin/order-book', 'ask');
    createTable(okcoinBid, 'http://localhost:4030/market/okcoin/order-book', 'bid');

    setInterval(function () {
        var str = '';

        str += 'RowOffset: ' + hot.rowOffset();

        // positions.innerHTML = str;
    }, 100);

    function bindDumpButton(hot) {
        if (typeof Handsontable === "undefined") {
            return;
        }

        Handsontable.Dom.addEvent(document.body, 'click', function (e) {

            var element = e.target || e.srcElement;

            if (element.nodeName == "BUTTON" && element.name == 'dump') {
                var name = element.getAttribute('data-dump');
                var instance = element.getAttribute('data-instance');
                var hot = window[instance];
                console.log('data of ' + name, hot.getData());
            }

            if (element.nodeName == "BUTTON" && element.name == 'update') {
                var name = element.getAttribute('example1');
                // var instance = element.getAttribute('data-instance');
                // var hot = window[name];
                console.log('data of ' + name, hot.getData());
                hot.getData();


            }

        });
    }
    bindDumpButton(hot);


});
