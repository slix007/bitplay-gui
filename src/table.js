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


    function httpAsyncGet(theUrl, callback)
    {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", theUrl, true ); // false for synchronous request
        xmlHttp.send( null );
        // return xmlHttp.responseText;

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4) {
                if(xmlHttp.status == 200) {
                    callback(xmlHttp.responseText);
                }
            }
        };
    }

    function httpAsyncPost(theUrl, data, callback, resultElement) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("POST", theUrl, true); // false for synchronous request
        xmlHttp.setRequestHeader("Content-type", "application/json");
        xmlHttp.send(data);

        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4) {
                if (xmlHttp.status == 200) {
                    callback(xmlHttp.responseText, resultElement);
                }
            }
        };
    }



    function httpGet(theUrl)
    {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
        xmlHttp.send( null );
        return xmlHttp.responseText;
    }

    let parseTicker = function (inputData) {
        return inputData.value;
    };

    let parseOrderBook = function (orderBookJson) {
        let bidArray = [];
        orderBookJson.bid.forEach(bid => {
            bidArray.push([bid.currency, bid.price, bid.amount, bid.orderType, bid.timestamp]);
        });
        // bid
        let askArray = [];
        orderBookJson.ask.forEach(ask => {
            askArray.push([ask.currency, ask.price, ask.amount, ask.orderType, ask.timestamp]);
        });
        let orderBook = {};
        orderBook.bid = bidArray;
        orderBook.ask = askArray;

        return orderBook;
    };

    let fetchOrderBook = function (dataUrl) {

        let inputData = JSON.parse(httpGet(dataUrl));

        return parseOrderBook(inputData);
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

    var askPoloniexTable = createTable(elementPoloniexAsk, process.env.baseUrl + '/market/poloniex/order-book', 'ask');
    var bidPoloniexTable = createTable(elementPoloniexBid, process.env.baseUrl + '/market/poloniex/order-book', 'bid');
    var askOkcoinTable = createTable(elementOkcoinAsk, process.env.baseUrl + '/market/okcoin/order-book', 'ask');
    var bidOkcoinTable = createTable(elementOkcoinBid, process.env.baseUrl + '/market/okcoin/order-book', 'bid');

    this.b = 1;
    var that = this;

    let fetch = function (url, callback) {
        httpAsyncGet(process.env.baseUrl + url, function (rawData) {
            const jsonData = JSON.parse(rawData);
            callback(jsonData);
        });
    };

    let repaintDeltasAndBorders = function (returnData) {
        let delta1 = document.getElementById("delta1");
        let delta2 = document.getElementById("delta2");
        let border1 = document.getElementById("border1");
        let border2 = document.getElementById("border2");
        delta1.innerHTML = returnData.delta1;
        delta2.innerHTML = returnData.delta2;
        border1.innerHTML = returnData.border1;
        border2.innerHTML = returnData.border2;
    };


    var updateFunction = function () {
        fetch('/market/poloniex/order-book', function (jsonData) {
            let orderBookP = parseOrderBook(jsonData);
            askPoloniexTable.loadData(orderBookP.ask);
            bidPoloniexTable.loadData(orderBookP.bid);
        });

        fetch('/market/okcoin/order-book', function (jsonData) {
            let orderBookO = parseOrderBook(jsonData);
            askOkcoinTable.loadData(orderBookO.ask);
            bidOkcoinTable.loadData(orderBookO.bid);
        });

        fetch('/market/poloniex/ticker', function (jsonData) {
            let pTicker = document.getElementById("poloniex-ticker");
            pTicker.innerHTML = parseTicker(jsonData);
        });

        fetch('/market/poloniex/account', function (poloniexAccount) {
            let pBalance = document.getElementById("poloniex-balance");
            pBalance.innerHTML = 'Balance: btc=' + poloniexAccount.btc + ', usd=' + poloniexAccount.usd;
        });

        fetch('/market/okcoin/account', function (okcoinAccount) {
            let oBalance = document.getElementById("okcoin-balance");
            oBalance.innerHTML = 'Balance: btc=' + okcoinAccount.btc + ', usd=' + okcoinAccount.usd;
        });

        fetch('/market/deltas?market1=okcoin&market2=poloniex', function (returnData) {
            repaintDeltasAndBorders(returnData);
        });

        fetch('/market/trade-log/poloniex', function (returnData) {
            let area1 = document.getElementById("poloniex-trade-log");
            area1.innerHTML = returnData.trades.reduce((a,b)=> a + '\n' + b);
        });
        fetch('/market/trade-log/okcoin', function (returnData) {
            let area1 = document.getElementById("okcoin-trade-log");
            area1.innerHTML = returnData.trades.reduce((a,b)=> a + '\n' + b);
        });

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
                const orderBookP = fetchOrderBook(process.env.baseUrl + '/market/poloniex/order-book-fetch');
                askPoloniexTable.loadData(orderBookP.ask);
                bidPoloniexTable.loadData(orderBookP.bid);
            }

            if (element.name == 'cleanPoloniexOrderBook') {
                const orderBookP = fetchOrderBook(process.env.baseUrl + '/market/poloniex/order-book-clean');
                askPoloniexTable.loadData(orderBookP.ask);
                bidPoloniexTable.loadData(orderBookP.bid);
            }

            let showResponse = function (responseData, resultElement) {
                console.log(responseData);
                let responseObj = JSON.parse(responseData);

                resultElement.innerHTML = 'Result orderId=' + responseObj.orderId;
            };

            let showPoloniexResponse = function (responseData, resultElement) {
                console.log(responseData);
                let responseObj = JSON.parse(responseData);

                let trades = responseObj.details.poloniexPublicTrades
                    .map(trade => 'rate=' + trade.rate + ',amount=' + trade.amount)
                    .reduce((a, b) => a + "; " + b);

                resultElement.innerHTML = 'Result orderId=' + responseObj.orderId + '. ' + trades;

            };

            if (element.id == 'poloniex-buy') {
                let amount = document.getElementById('poloniex-trading-input').value;
                let request = {type: 'BUY', amount: amount};
                let requestData = JSON.stringify(request);
                console.log(requestData);

                let resultElement = document.getElementById('poloniex-trading-result');
                httpAsyncPost(process.env.baseUrl + '/market/poloniex/place-market-order',
                              requestData,
                              showPoloniexResponse,
                              resultElement
                );

            }

            if (element.id == 'poloniex-sell') {
                let amount = document.getElementById('poloniex-trading-input').value;
                let request = {type: 'SELL', amount: amount};
                let requestData = JSON.stringify(request);
                console.log(requestData);

                let resultElement = document.getElementById('poloniex-trading-result');
                httpAsyncPost(process.env.baseUrl + '/market/poloniex/place-market-order',
                              requestData,
                              showPoloniexResponse,
                              resultElement
                );
            }

            if (element.id == 'okcoin-buy') {
                let amount = document.getElementById('okcoin-trading-input').value;
                let request = {type: 'BUY', amount: amount};
                let requestData = JSON.stringify(request);
                console.log(requestData);

                let resultElement = document.getElementById('okcoin-trading-result');
                httpAsyncPost(process.env.baseUrl + '/market/okcoin/place-market-order',
                              requestData,
                              showResponse,
                              resultElement
                );

            }

            if (element.id == 'okcoin-sell') {
                let amount = document.getElementById('okcoin-trading-input').value;
                let request = {type: 'SELL', amount: amount};
                let requestData = JSON.stringify(request);
                console.log(requestData);

                let resultElement = document.getElementById('okcoin-trading-result');
                httpAsyncPost(process.env.baseUrl + '/market/okcoin/place-market-order',
                              requestData,
                              showResponse,
                              resultElement
                );
            }

            if (element.id == 'update-border1') {
                let newBorderValue = document.getElementById('border1-edit').value;
                let request = {border1: newBorderValue};
                let requestData = JSON.stringify(request);
                console.log(requestData);

                httpAsyncPost(process.env.baseUrl + '/market/update-borders',
                              requestData,
                              function (responseData, resultElement) {
                                  repaintDeltasAndBorders(responseData);
                              },
                              null
                );
            }
            if (element.id == 'update-border2') {
                let newBorderValue = document.getElementById('border2-edit').value;
                let request = {border2: newBorderValue};
                let requestData = JSON.stringify(request);
                console.log(requestData);

                httpAsyncPost(process.env.baseUrl + '/market/update-borders',
                              requestData,
                              function (responseData, resultElement) {
                                  repaintDeltasAndBorders(responseData);
                              },
                              null
                );
            }


        });
    }
    bindDumpButton(hot);


});
