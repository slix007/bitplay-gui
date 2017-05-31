var Handsontable = require('handsontable');
var sprintf = require('sprintf-js').sprintf;

var exports = module.exports = {};

exports.onDomLoadedFunc = function (firstMarketName, secondMarketName, baseUrl) {
    console.log(sprintf('first:%s, second:%s', firstMarketName, secondMarketName));

    let myData = Handsontable.helper.createSpreadsheetData(5, 5);
    let container = document.getElementById('example1');
    let positions = document.getElementById('positions');
    let hot;
    var elementPoloniexBid = document.getElementById(sprintf('%s-bid', firstMarketName));
    var elementPoloniexAsk = document.getElementById(sprintf('%s-ask', firstMarketName));
    var elementOkcoinBid = document.getElementById(sprintf('%s-bid', secondMarketName));
    var elementOkcoinAsk = document.getElementById(sprintf('%s-ask', secondMarketName));

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
            colHeaders: ['currency', 'quote', 'amount', 'orderType', 'timestamp'],
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

    var askPoloniexTable = createTable(elementPoloniexAsk,
                                       sprintf('%s/market/%s/order-book', baseUrl, firstMarketName), 'ask');
    var bidPoloniexTable = createTable(elementPoloniexBid,
                                       sprintf('%s/market/%s/order-book', baseUrl, firstMarketName), 'bid');
    var askOkcoinTable = createTable(elementOkcoinAsk,
                                     sprintf('%s/market/%s/order-book', baseUrl, secondMarketName), 'ask');
    var bidOkcoinTable = createTable(elementOkcoinBid,
                                     sprintf('%s/market/%s/order-book', baseUrl, secondMarketName), 'bid');

    this.b = 1;
    var that = this;

    let fetch = function (url, callback) {
        httpAsyncGet(baseUrl + url, function (rawData) {
            const jsonData = JSON.parse(rawData);
            callback(jsonData);
        });
    };

    let repaintDeltasAndBorders = function (returnData) {
        let delta1 = document.getElementById("delta1");
        let delta2 = document.getElementById("delta2");
        let border1 = document.getElementById("border1");
        let border2 = document.getElementById("border2");
        let makerDelta = document.getElementById("maker-delta");
        let sumDelta = document.getElementById("sum-delta");
        let periodSec = document.getElementById("period-sec");
        let bu = document.getElementById("bu");
        let cumDelta = document.getElementById("cum-delta");
        let lastDelta = document.getElementById("last-delta");
        let cumDeltaFact = document.getElementById("cum-delta-fact");
        let cumDiff1 = document.getElementById("cum-diff1");
        let cumDiff2 = document.getElementById("cum-diff2");
        delta1.innerHTML = returnData.delta1;
        delta2.innerHTML = returnData.delta2;
        border1.innerHTML = returnData.border1;
        border2.innerHTML = returnData.border2;
        makerDelta.innerHTML = returnData.makerDelta;
        sumDelta.innerHTML = returnData.sumDelta;
        periodSec.innerHTML = returnData.periodSec;
        bu.innerHTML = returnData.buValue;
        cumDelta.innerHTML = returnData.cumDelta;
        lastDelta.innerHTML = returnData.lastDelta;
        cumDeltaFact.innerHTML = returnData.cumDeltaFact;
        cumDiff1.innerHTML = returnData.cumDiffFact1;
        cumDiff2.innerHTML = returnData.cumDiffFact2;
    };

    function createElement(element, attribute, inner) {
        if (typeof(element) === "undefined") {
            return false;
        }
        if (typeof(inner) === "undefined") {
            inner = "";
        }
        var el = document.createElement(element);
        if (typeof(attribute) === 'object') {
            for (var key in attribute) {
                el.setAttribute(key, attribute[key]);
            }
        }
        if (!Array.isArray(inner)) {
            inner = [inner];
        }
        for (var k = 0; k < inner.length; k++) {
            if (inner[k].tagName) {
                el.appendChild(inner[k]);
            } else {
                el.appendChild(document.createTextNode(inner[k]));
            }
        }
        return el;
    }

// var google = createElement("a",{"href":"http://google.com"},"google"),
//     youtube = createElement("a",{"href":"http://youtube.com"},"youtube"),
//     facebook = createElement("a",{"href":"http://facebook.com"},"facebook"),
//     links_conteiner = createElement("div",{"id":"links"},[google,youtube,facebook]);
// Will make this:
//
// <div id="links">
//     <a href="http://google.com">google</a>
//     <a href="http://youtube.com">youtube</a>
//     <a href="http://facebook.com">facebook</a>
// </div>

    function moveOrderP(orderId) {
        moveOrder(orderId, sprintf('/market/%s/open-orders/move', firstMarketName));
    }

    function moveOrderO(orderId) {
        moveOrder(orderId, sprintf('/market/%s/open-orders/move', secondMarketName));
    }
    function moveOrder(orderId, moveUrl) {
        console.log("moveorder");

        let request = {id: orderId};
        let requestData = JSON.stringify(request);
        console.log(requestData);

        let showResponse = function (responseData, resultElement) {
            console.log(responseData);
            alert(responseData);
        };
        httpAsyncPost(baseUrl + moveUrl,
                      requestData,
                      showResponse,
                      null);
    }

    function cancelOrder() {
        console.log("cancelOrder");
    }

    var updateFunction = function () {

        fetch(sprintf('/market/%s/order-book', firstMarketName), function (jsonData) {
            let orderBookP = parseOrderBook(jsonData);
            askPoloniexTable.loadData(orderBookP.ask);
            bidPoloniexTable.loadData(orderBookP.bid);
        });

        fetch(sprintf('/market/%s/order-book', secondMarketName), function (jsonData) {
            let orderBookO = parseOrderBook(jsonData);
            askOkcoinTable.loadData(orderBookO.ask);
            bidOkcoinTable.loadData(orderBookO.bid);
        });

        /*fetch(sprintf('/market/%s/ticker', firstMarketName), function (jsonData) {
            let pTicker = document.getElementById(sprintf('%s-ticker', firstMarketName));
            pTicker.innerHTML = parseTicker(jsonData);
        });*/

        fetch(sprintf('/market/%s/account', firstMarketName), function (poloniexAccount) {
            let pBalance = document.getElementById(sprintf('%s-balance', firstMarketName));
            if (poloniexAccount.btc === null) {
                pBalance.innerHTML = 'Balance: wallet=' + poloniexAccount.wallet
                                     + ', margin=' + poloniexAccount.margin
                                     + ', available=' + poloniexAccount.available
                                     + ', position=' + poloniexAccount.position;
            } else {
                pBalance.innerHTML = 'Balance: btc=' + poloniexAccount.btc
                                     + ', usd=' + poloniexAccount.usd;
            }
        });

        fetch(sprintf('/market/%s/account', secondMarketName), function (okcoinAccount) {
            let oBalance = document.getElementById(sprintf('%s-balance', secondMarketName));
            oBalance.innerHTML = 'Balance: btc=' + okcoinAccount.btc + ', usd=' + okcoinAccount.usd;
        });

        // markets order is opposite for deltas
        fetch(sprintf('/market/deltas?market1=%s&market2=%s', secondMarketName, firstMarketName),
              function (returnData) {
            repaintDeltasAndBorders(returnData);
        });

        fetch(sprintf('/market/trade-log/%s', firstMarketName), function (returnData) {
            let area1 = document.getElementById(firstMarketName + '-trade-log');
            area1.scrollTop = area1.scrollHeight;
            area1.innerHTML = returnData.trades.length > 0
                ? returnData.trades.reduce((a, b) => a + '\n' + b)
                : "";
        });
        fetch('/market/trade-log/okcoin', function (returnData) {
            let area1 = document.getElementById(sprintf('%s-trade-log', secondMarketName));
            area1.scrollTop = area1.scrollHeight;
            area1.innerHTML = returnData.trades.length > 0
                ? returnData.trades.reduce((a, b) => a + '\n' + b)
                : "";

        });
        fetch('/market/deltas-log', function (returnData) {
            let area1 = document.getElementById('deltas-log');
            area1.scrollTop = area1.scrollHeight;
            area1.innerHTML = returnData.trades.length > 0
                ? returnData.trades.reduce((a, b) => a + '\n' + b)
                : "";

        });

        fetch(sprintf('/market/%s/open-orders', firstMarketName), function (returnData) {
            var myNode = document.getElementById(sprintf('%s-open-orders', firstMarketName));
            while (myNode.firstChild) {
                myNode.removeChild(myNode.firstChild);
            }
            returnData.forEach(function (oo) {

                let existedOrder = document.getElementById("p-span-" + oo.id);
                if (existedOrder === null) {
                    let labelOrder = createElement("span", {"id": "p-span-" + oo.id},
                                                   "id=" + oo.id
                                                   + ",t=" + oo.orderType
                                                   + ",s=" + oo.status
                                                   + ",q=" + oo.price
                                                   + ",a=" + oo.amount
                                                   + ",time=" + oo.timestamp
                    );
                    let move = createElement("button", {"id": "p-move-" + oo.id}, "Try move");
                    move.addEventListener("click", function() { moveOrderP( oo.id); }, false);
                    let cancel = createElement("button", {"id": "p-cancel-" + oo.id}, "Cancel");
                    cancel.addEventListener("click", cancelOrder, oo.id);

                    let openOrderDiv = createElement("div", {"id": "p-links"}, [labelOrder, move, cancel]);
                    document.getElementById(sprintf('%s-open-orders', firstMarketName)).appendChild(openOrderDiv);
                }

            });
        });
        fetch('/market/okcoin/open-orders', function (returnData) {
            var myNode = document.getElementById("okcoin-open-orders");
            while (myNode.firstChild) {
                myNode.removeChild(myNode.firstChild);
            }
            returnData.forEach(function (oo) {
                let existedOrder = document.getElementById("o-span-" + oo.id);
                if (existedOrder === null) {
                    let labelOrder = createElement("span", {"id": "o-span-" + oo.id},
                                                   "id=" + oo.id
                                                   + ",t=" + oo.orderType
                                                   + ",s=" + oo.status
                                                   + ",q=" + oo.price
                                                   + ",a=" + oo.amount
                                                   + ",time=" + oo.timestamp
                    );
                    let move = createElement("button", {"id": "o-move-" + oo.id}, "Try move");
                    move.addEventListener("click", function() { moveOrderO( oo.id); }, false);

                    let cancel = createElement("button", {"id": "o-cancel-" + oo.id}, "Cancel");
                    cancel.addEventListener("click", cancelOrder, oo.id);

                    let openOrderDiv = createElement("div", {"id": "o-links"}, [labelOrder, move, cancel]);
                    document.getElementById("okcoin-open-orders").appendChild(openOrderDiv);
                }
            });
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
                const orderBookP = fetchOrderBook(
                    sprintf('%s/market/%s/order-book-fetch', baseUrl, firstMarketName));
                askPoloniexTable.loadData(orderBookP.ask);
                bidPoloniexTable.loadData(orderBookP.bid);
            }

            if (element.name == 'cleanPoloniexOrderBook') {
                const orderBookP = fetchOrderBook(
                    sprintf('%s/market/%s/order-book-clean', baseUrl, firstMarketName));
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

                let trades;
                if (responseObj.orderId !== null) {
                    if (responseObj.details.poloniexPublicTrades.length === 0) {
                        trades = 'just placed';
                    } else {
                        trades = responseObj.details.poloniexPublicTrades
                            .map(trade => 'rate=' + trade.rate + ',amount=' + trade.amount)
                            .reduce((a, b) => a + "; " + b);
                    }
                }

                resultElement.innerHTML = 'Result orderId=' + responseObj.orderId + '. ' + trades;

            };

            if (element.id == sprintf('%s-taker-buy', firstMarketName)) {
                let amount = document.getElementById(sprintf('%s-taker-input', firstMarketName)).value;
                let request = {type: 'BUY', placementType: 'TAKER', amount: amount};
                let requestData = JSON.stringify(request);
                console.log(requestData);

                let resultElement = document.getElementById(sprintf('%s-taker-result', firstMarketName));
                httpAsyncPost(sprintf('%s/market/%s/place-market-order', baseUrl, firstMarketName),
                              requestData,
                              showPoloniexResponse,
                              resultElement
                );
            }
            if (element.id == sprintf('%s-taker-sell', firstMarketName)) {
                let amount = document.getElementById(sprintf('%s-taker-input', firstMarketName)).value;
                let request = {type: 'SELL', placementType: 'TAKER', amount: amount};
                let requestData = JSON.stringify(request);
                console.log(requestData);

                let resultElement = document.getElementById(sprintf('%s-taker-result', firstMarketName));
                httpAsyncPost(sprintf('%s/market/%s/place-market-order', baseUrl, firstMarketName),
                              requestData,
                              showPoloniexResponse,
                              resultElement
                );
            }
            if (element.id == sprintf('%s-maker-buy', firstMarketName)) {
                let amount = document.getElementById(sprintf('%s-maker-input', firstMarketName)).value;
                let request = {type: 'BUY', placementType: 'MAKER', amount: amount};
                let requestData = JSON.stringify(request);
                console.log(requestData);

                let resultElement = document.getElementById(sprintf('%s-maker-result', firstMarketName));
                httpAsyncPost(sprintf('%s/market/%s/place-market-order', baseUrl, firstMarketName),
                              requestData,
                              showPoloniexResponse,
                              resultElement
                );
            }
            if (element.id == sprintf('%s-maker-sell', firstMarketName)) {
                let amount = document.getElementById(sprintf('%s-maker-input', firstMarketName)).value;
                let request = {type: 'SELL', placementType: 'MAKER', amount: amount};
                let requestData = JSON.stringify(request);
                console.log(requestData);

                let resultElement = document.getElementById(sprintf('%s-maker-result', firstMarketName));
                httpAsyncPost(sprintf('%s/market/%s/place-market-order', baseUrl, firstMarketName),
                              requestData,
                              showPoloniexResponse,
                              resultElement
                );
            }


            if (element.id == sprintf('%s-taker-buy', secondMarketName)) {
                let amount = document.getElementById(sprintf('%s-taker-input', secondMarketName)).value;
                let request = {type: 'BUY', placementType: 'TAKER', amount: amount};
                let requestData = JSON.stringify(request);
                console.log(requestData);

                let resultElement = document.getElementById(sprintf('%s-taker-result', secondMarketName));
                httpAsyncPost(sprintf('%s/market/%s/place-market-order', baseUrl, secondMarketName),
                              requestData,
                              showResponse,
                              resultElement
                );
            }
            if (element.id == sprintf('%s-taker-sell', secondMarketName)) {
                let amount = document.getElementById(sprintf('%s-taker-input', secondMarketName)).value;
                let request = {type: 'SELL', placementType: 'TAKER', amount: amount};
                let requestData = JSON.stringify(request);
                console.log(requestData);

                let resultElement = document.getElementById(sprintf('%s-taker-result', secondMarketName));
                httpAsyncPost(sprintf('%s/market/%s/place-market-order', baseUrl, secondMarketName),
                              requestData,
                              showResponse,
                              resultElement
                );
            }
            if (element.id == sprintf('%s-maker-buy', secondMarketName)) {
                let amount = document.getElementById(sprintf('%s-maker-input', secondMarketName)).value;
                let request = {type: 'BUY', placementType: 'MAKER', amount: amount};
                let requestData = JSON.stringify(request);
                console.log(requestData);

                let resultElement = document.getElementById(sprintf('%s-maker-result', secondMarketName));
                httpAsyncPost(sprintf('%s/market/%s/place-market-order', baseUrl, secondMarketName),
                              requestData,
                              showResponse,
                              resultElement
                );
            }
            if (element.id == sprintf('%s-maker-sell', secondMarketName)) {
                let amount = document.getElementById(sprintf('%s-maker-input', secondMarketName)).value;
                let request = {type: 'SELL', placementType: 'MAKER', amount: amount};
                let requestData = JSON.stringify(request);
                console.log(requestData);

                let resultElement = document.getElementById(sprintf('%s-maker-result', secondMarketName));
                httpAsyncPost(sprintf('%s/market/%s/place-market-order', baseUrl, secondMarketName),
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

                httpAsyncPost(baseUrl + '/market/update-borders',
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

                httpAsyncPost(baseUrl + '/market/update-borders',
                              requestData,
                              function (responseData, resultElement) {
                                  repaintDeltasAndBorders(responseData);
                              },
                              null
                );
            }

            if (element.id == 'update-maker-delta') {
                let newMakerDeltaValue = document.getElementById('maker-delta-edit').value;
                let request = {makerDelta: newMakerDeltaValue};
                let requestData = JSON.stringify(request);
                console.log(requestData);

                httpAsyncPost(baseUrl + '/market/update-maker-delta',
                              requestData,
                              function (responseData, resultElement) {
                                  repaintDeltasAndBorders(responseData);
                              },
                              null
                );
            }

            if (element.id == 'update-sum-delta') {
                let newSumDeltaValue = document.getElementById('sum-delta-edit').value;
                let request = {sumDelta: newSumDeltaValue};
                let requestData = JSON.stringify(request);
                console.log(requestData);

                httpAsyncPost(baseUrl + '/market/update-maker-delta',
                              requestData,
                              function (responseData, resultElement) {
                                  repaintDeltasAndBorders(responseData);
                              },
                              null
                );
            }

            if (element.id == 'update-period-sec') {
                let newPeriodSecValue = document.getElementById('period-sec-edit').value;
                let request = {periodSec: newPeriodSecValue};
                let requestData = JSON.stringify(request);
                console.log(requestData);

                httpAsyncPost(baseUrl + '/market/update-maker-delta',
                              requestData,
                              function (responseData, resultElement) {
                                  repaintDeltasAndBorders(responseData);
                              },
                              null
                );
            }

            if (element.id == 'update-bu') {
                let newPeriodSecValue = document.getElementById('bu-edit').value;
                let request = {buValue: newPeriodSecValue};
                let requestData = JSON.stringify(request);
                console.log(requestData);

                httpAsyncPost(baseUrl + '/market/update-maker-delta',
                              requestData,
                              function (responseData, resultElement) {
                                  repaintDeltasAndBorders(responseData);
                              },
                              null
                );
            }

            if (element.id == 'update-cum-delta') {
                let newCumDeltaValue = document.getElementById('cum-delta-edit').value;
                let request = {cumDelta: newCumDeltaValue};
                let requestData = JSON.stringify(request);
                console.log(requestData);

                httpAsyncPost(baseUrl + '/market/update-maker-delta',
                              requestData,
                              function (responseData, resultElement) {
                                  repaintDeltasAndBorders(responseData);
                              },
                              null
                );
            }

            if (element.id == 'update-last-delta') {
                let newLastDeltaValue = document.getElementById('last-delta-edit').value;
                let request = {lastDelta: newLastDeltaValue};
                let requestData = JSON.stringify(request);
                console.log(requestData);

                httpAsyncPost(baseUrl + '/market/update-maker-delta',
                              requestData,
                              function (responseData, resultElement) {
                                  repaintDeltasAndBorders(responseData);
                              },
                              null
                );
            }

            if (element.id == 'update-cum-delta-fact') {
                let newCumDeltaFactValue = document.getElementById('cum-delta-fact-edit').value;
                let request = {cumDeltaFact: newCumDeltaFactValue};
                let requestData = JSON.stringify(request);
                console.log(requestData);

                httpAsyncPost(baseUrl + '/market/update-maker-delta',
                              requestData,
                              function (responseData, resultElement) {
                                  repaintDeltasAndBorders(responseData);
                              },
                              null
                );
            }

            if (element.id == 'update-cum-diff1') {
                let element = document.getElementById('cum-diff1-edit').value;
                let request = {cumDiffFact1: element};
                let requestData = JSON.stringify(request);
                console.log(requestData);

                httpAsyncPost(baseUrl + '/market/update-maker-delta',
                              requestData,
                              function (responseData, resultElement) {
                                  repaintDeltasAndBorders(responseData);
                              },
                              null
                );
            }

            if (element.id == 'update-cum-diff2') {
                let element = document.getElementById('cum-diff2-edit').value;
                let request = {cumDiffFact2: element};
                let requestData = JSON.stringify(request);
                console.log(requestData);

                httpAsyncPost(baseUrl + '/market/update-maker-delta',
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

}