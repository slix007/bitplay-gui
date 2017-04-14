var Handsontable = require('handsontable');

document.addEventListener("DOMContentLoaded", function() {

    let myData = Handsontable.helper.createSpreadsheetData(5, 5);
    let container = document.getElementById('example1');
    let positions = document.getElementById('positions');
    let hot;
    var elementPoloniexBid = document.getElementById('poloniex-bid');
    var elementPoloniexAsk = document.getElementById('poloniex-ask');
    var elementOkcoinBid = document.getElementById('okcoin-bid');
    var elementOkcoinAsk = document.getElementById('okcoin-ask');

    //var socket = new WebSocket("ws://localhost:4030/market/socket");
    // alert("Socket created");
    //
    // socket.onopen = function() {
    //     alert("Соединение установлено.");
    // };
    // socket.onclose = function(event) {
    //     if (event.wasClean) {
    //         alert('Соединение закрыто чисто');
    //     } else {
    //         alert('Обрыв соединения'); // например, "убит" процесс сервера
    //     }
    //     alert('Код: ' + event.code + ' причина: ' + event.reason);
    // };
    // socket.onmessage = function(event) {
    //     alert("Получены данные " + event.data);
    // };
    // socket.onerror = function(error) {
    //     alert("Ошибка " + error.message);
    // };
    // socket.send("Привет");


    function httpGet(theUrl)
    {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
        xmlHttp.send( null );
        return xmlHttp.responseText;
    };

    let fetchOrderBook = function (dataUrl) {

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
        return new Handsontable(container, {
            data: fetchOrderBook(dataUrl)[dataPartName],
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

    // var askPoloniexTable = createTable(elementPoloniexAsk, 'http://localhost:4030/market/poloniex/order-book', 'ask');
    // var bidPoloniexTable = createTable(elementPoloniexBid, 'http://localhost:4030/market/poloniex/order-book', 'bid');
    // var askOkcoinTable = createTable(elementOkcoinAsk, 'http://localhost:4030/market/okcoin/order-book', 'ask');
    // var bidOkcoinTable = createTable(elementOkcoinBid, 'http://localhost:4030/market/okcoin/order-book', 'bid');

    var askPoloniexTable = createTable(elementPoloniexAsk, 'http://bp.magsto.com:4030/market/poloniex/order-book', 'ask');
    var bidPoloniexTable = createTable(elementPoloniexBid, 'http://bp.magsto.com:4030/market/poloniex/order-book', 'bid');
    var askOkcoinTable = createTable(elementOkcoinAsk, 'http://bp.magsto.com:4030/market/okcoin/order-book', 'ask');
    var bidOkcoinTable = createTable(elementOkcoinBid, 'http://bp.magsto.com:4030/market/okcoin/order-book', 'bid');

    this.b = 1;
    var that = this;

    var updateFunction = function () {
        const orderBookP = fetchOrderBook('http://bp.magsto.com:4030/market/poloniex/order-book');
        const orderBookO = fetchOrderBook('http://bp.magsto.com:4030/market/okcoin/order-book');
        // const orderBookP = fetchOrderBook('http://localhost:4030/market/poloniex/order-book');
        // const orderBookO = fetchOrderBook('http://localhost:4030/market/okcoin/order-book');
        askPoloniexTable.loadData(orderBookP.ask);
        bidPoloniexTable.loadData(orderBookP.bid);
        askOkcoinTable.loadData(orderBookO.ask);
        bidOkcoinTable.loadData(orderBookO.bid);
    };
    var updateData = setInterval(updateFunction, 1000);

    function bindDumpButton() {
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
                // var name = element.getAttribute('example1');
                // var instance = element.getAttribute('data-instance');
                // var hot = window[name];
                // console.log('data of ' + name, hot);

                clearInterval(updateData); // stop the setInterval()
                const interval = parseInt(document.getElementById('update_interval').value);
                console.log('new interval ' + interval);
                updateData = setInterval(updateFunction, interval);
            }

            if (element.name == 'sendToSocket') {
                socket.send("test message");
            }

            if (element.name == 'fetchPoloniexOrderBook') {
                const orderBookP = fetchOrderBook('http://bp.magsto.com:4030/market/poloniex/order-book-fetch');
                askPoloniexTable.loadData(orderBookP.ask);
                bidPoloniexTable.loadData(orderBookP.bid);
            }

            });
    }
    bindDumpButton(hot);


});
