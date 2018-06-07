var Handsontable = require('handsontable');
var sprintf = require('sprintf-js').sprintf;
var Utils = require('./utils');
var Http = require('./http');
let bordersVar = require('./components/borders-v2');
let bitmexIndexVar = require('./components/comp/bitmex-index');
let okexIndexVar = require('./components/comp/okex-index');
let marketState = require('./components/comp/market-states');

var exports = module.exports = {};

exports.onDomLoadedFunc = function (firstMarketName, secondMarketName, baseUrl) {
    console.log(sprintf('first:%s, second:%s', firstMarketName, secondMarketName));

    Utils.fillLinksToLogs();
    Utils.addRestartButton();

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

    function httpAsyncGet(theUrl, callback) {
        Http.httpAsyncGet(theUrl, callback);
    }

    function httpAsyncPost(theUrl, data, callback, resultElement) {
        Http.httpAsyncPost(theUrl, data, callback, resultElement);
    }

    function httpGet(theUrl) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", theUrl, false); // false for synchronous request
        xmlHttp.send(null);
        return xmlHttp.responseText;
    }

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

        let inputData = JSON.parse(httpGet(dataUrl));

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
        let delta1Calc = document.getElementById("delta1Calc");
        let delta2Calc = document.getElementById("delta2Calc");
        let border1 = document.getElementById("border1");
        let border2 = document.getElementById("border2");
        // let makerDelta = document.getElementById("maker-delta");
        // let bu = document.getElementById("bu");
        let cumDelta = document.getElementById("cum-delta");
        let cumDeltaFact = document.getElementById("cum-delta-fact");
        let cumDiffFactBr = document.getElementById("cum-diff-fact-br");
        let cumDiff1 = document.getElementById("cum-diff1");
        let cumDiff2 = document.getElementById("cum-diff2");
        let cumDiff = document.getElementById("cum-diff");
        let cumCom1 = document.getElementById("cum-com1");
        let cumCom2 = document.getElementById("cum-com2");
        let cumBitmexMCom = document.getElementById("cumBitmexMCom");
        let slip = document.getElementById("slip");
        let count1 = document.getElementById("count1");
        let count2 = document.getElementById("count2");
        let reserveBtc1 = document.getElementById("reserveBtc1");
        let reserveBtc2 = document.getElementById("reserveBtc2");
        let hedgeAmount = document.getElementById("hedgeAmount");
        let fundingRateFee = document.getElementById("fundingRateFee");
        delta1.innerHTML = Utils.withSign(returnData.delta1);
        delta2.innerHTML = Utils.withSign(returnData.delta2);
        delta1Calc.innerHTML = Utils.withSign(returnData.delta1Calc);
        delta2Calc.innerHTML = Utils.withSign(returnData.delta2Calc);
        border1.innerHTML = returnData.border1;
        border2.innerHTML = returnData.border2;
        // makerDelta.innerHTML = returnData.makerDelta;
        // bu.innerHTML = returnData.buValue;
        cumDelta.innerHTML = sprintf('%s/%s', returnData.cumDelta, returnData.cumAstDelta);
        cumDeltaFact.innerHTML = sprintf('%s/%s', returnData.cumDeltaFact, returnData.cumAstDeltaFact);
        cumDiffFactBr.innerHTML = sprintf('%s', returnData.cumDiffFactBr);
        cumDiff1.innerHTML = sprintf('%s/%s', returnData.cumDiffFact1, returnData.cumAstDiffFact1);
        cumDiff2.innerHTML = sprintf('%s/%s', returnData.cumDiffFact2, returnData.cumAstDiffFact2);
        cumDiff.innerHTML = sprintf('%s/%s', returnData.cumDiffFact, returnData.cumAstDiffFact);
        cumCom1.innerHTML = sprintf('%s/%s', returnData.cumCom1, returnData.cumAstCom1);
        cumCom2.innerHTML = sprintf('%s/%s', returnData.cumCom2, returnData.cumAstCom2);
        cumBitmexMCom.innerHTML = sprintf('%s/%s', returnData.cumBitmexMCom, returnData.cumAstBitmexMCom);
        slip.innerHTML = returnData.slip;
        count1.innerHTML = returnData.count1 + '/' + returnData.completedCount1;
        count2.innerHTML = returnData.count2 + '/' + returnData.completedCount2;
        reserveBtc1.innerHTML = returnData.reserveBtc1;
        reserveBtc2.innerHTML = returnData.reserveBtc2;
        hedgeAmount.innerHTML = returnData.hedgeAmount;
        fundingRateFee.innerHTML = returnData.fundingRateFee;
    };
    let repaintStopMoving = function (returnData) {
        let isStopMoving = document.getElementById("is-stop-moving");
        let isEnabled = 'stopped';
        if (returnData.firstMarket) {
            isEnabled = 'stopped';
        } else {
            isEnabled = 'moving enabled';
        }
        isStopMoving.innerHTML = isEnabled;
    };
    let repaintPosCorr = function (returnData) {
        let periodToCorrection = document.getElementById("periodToCorrection");
        periodToCorrection.innerHTML = returnData.periodToCorrection + ' sec';
        let maxDiffCorr = document.getElementById("maxDiffCorr");
        maxDiffCorr.innerHTML = returnData.maxDiffCorr;
    };
    let repaintLiqParams = function (returnData) {
        let bMrLiq = document.getElementById("b_mr_liq");
        let oMrLiq = document.getElementById("o_mr_liq");
        let bDQLOpenMin = document.getElementById("b_DQL_open_min");
        let oDQLOpenMin = document.getElementById("o_DQL_open_min");
        let bDQLCloseMin = document.getElementById("b_DQL_close_min");
        let oDQLCloseMin = document.getElementById("o_DQL_close_min");
        bMrLiq.innerHTML = returnData.bMrLiq;
        oMrLiq.innerHTML = returnData.oMrLiq;
        bDQLOpenMin.innerHTML = returnData.bDQLOpenMin;
        oDQLOpenMin.innerHTML = returnData.oDQLOpenMin;
        bDQLCloseMin.innerHTML = returnData.bDQLCloseMin;
        oDQLCloseMin.innerHTML = returnData.oDQLCloseMin;
    };
    let repaintStates = function (returnData) {
        marketState.repaintStates(returnData);
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

    function moveOrderP(orderId, orderType) {
        moveOrder(orderId, orderType, sprintf('/market/%s/open-orders/move', firstMarketName));
    }

    function moveOrderO(orderId, orderType) {
        moveOrder(orderId, orderType, sprintf('/market/%s/open-orders/move', secondMarketName));
    }

    function moveOrder(orderId, orderType, moveUrl) {
        console.log("moveorder");

        let request = {id: orderId, orderType: orderType};
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

    function cancelOrderP() {
        console.log("cancelOrder");
    }

    function cancelOrderO(orderId) {
        console.log("cancelOrder" + orderId);
        let cancelUrl = sprintf('/market/%s/open-orders/cancel', secondMarketName);
        let request = {id: orderId};
        let requestData = JSON.stringify(request);
        console.log(requestData);

        let showResponse = function (responseData, resultElement) {
            console.log(responseData);
            alert(responseData);
        };
        httpAsyncPost(baseUrl + cancelUrl,
            requestData,
            showResponse,
            null);
    }

    var updateFunction = function () {

        fetch(sprintf('/market/%s/order-book', firstMarketName), function (jsonData) {
            let orderBookP = parseOrderBook(jsonData);
            // console.log('orderBookP.ask');
            // console.log(orderBookP.ask);
            askPoloniexTable.loadData(orderBookP.ask);
            bidPoloniexTable.loadData(orderBookP.bid);
        });

        fetch(sprintf('/market/%s/order-book', secondMarketName), function (jsonData) {
            let orderBookO = parseOrderBook(jsonData);
            askOkcoinTable.loadData(orderBookO.ask);
            bidOkcoinTable.loadData(orderBookO.bid);
        });

        fetch('/deadlock/check', function (resultJson) {
            let pTicker = document.getElementById('deadlock-checker');
            pTicker.innerHTML = resultJson.description;
        });
        fetch('/market/sum-bal', function (resultJson) {
            let sumBal = document.getElementById("sum-bal");
            sumBal.innerHTML = resultJson.result;
        });

        fetch('/market/pos-diff', function (resultJson) {
            let sumBal = document.getElementById("pos-diff");
            if (resultJson.result == 0) {
                sumBal.style.color = "#008f00";
            } else {
                sumBal.style.color = "#bf0000";
            }
            sumBal.innerHTML = 'Pos diff = ' + resultJson.description;
        });

        fetch(sprintf('/market/%s/account', firstMarketName), function (poloniexAccount) {
            let pBalance = document.getElementById(sprintf('%s-balance', firstMarketName));
            if (poloniexAccount.btc === null) {
                let quAvg = poloniexAccount.quAvg;
                pBalance.innerHTML = 'Balance: w' + poloniexAccount.wallet + '_' + Utils.toUsd(poloniexAccount.wallet, quAvg)
                                     + ', p' + poloniexAccount.position
                                     + ', lv' + poloniexAccount.leverage
                                     + ', lg' + Utils.withSign(poloniexAccount.availableForLong)
                                     + ', st' + Utils.withSign(poloniexAccount.availableForShort)
                                     + ', liq' + Utils.withSign(poloniexAccount.liqPrice)
                                     + ',<br> e_mark_' + poloniexAccount.eMark + '_' + Utils.toUsd(poloniexAccount.eMark, quAvg)
                                     + ',<br> e_best__' + poloniexAccount.eBest + '_' + Utils.toUsd(poloniexAccount.eBest, quAvg)
                                     + ',<br> e_avg__' + poloniexAccount.eAvg + '_' + Utils.toUsd(poloniexAccount.eAvg, quAvg)
                                     + ',<br> entry_price ' + poloniexAccount.entryPrice
                                     + ',<br> u' + poloniexAccount.upl + '_' + Utils.toUsd(poloniexAccount.upl, quAvg)
                                     + ',<br> m' + poloniexAccount.margin + '_' + Utils.toUsd(poloniexAccount.margin, quAvg)
                                     + ',<br> a' + poloniexAccount.available + '_' + Utils.toUsd(poloniexAccount.available, quAvg);
            } else {
                pBalance.innerHTML = 'Balance: btc=' + poloniexAccount.btc
                                     + ', usd=' + poloniexAccount.usd;
            }
        });

        fetch(sprintf('/market/%s/account', secondMarketName), function (marketAccount) {
            let oBalance = document.getElementById(sprintf('%s-balance', secondMarketName));
            if (marketAccount.btc === null) {
                let quAvg = marketAccount.quAvg;
                oBalance.innerHTML = 'Balance: w' + marketAccount.wallet + '_' + Utils.toUsd(marketAccount.wallet, quAvg)
                                     + ', p' + marketAccount.position
                                     + ', lv' + marketAccount.leverage
                                     + ', lg' + Utils.withSign(marketAccount.availableForLong)
                                     + ', st' + Utils.withSign(marketAccount.availableForShort)
                                     + ', liq' + Utils.withSign(marketAccount.liqPrice)
                                     + ',<br> e_last_' + marketAccount.eLast + '_' + Utils.toUsd(marketAccount.eLast, quAvg)
                                     + ',<br> e_best_' + marketAccount.eBest + '_' + Utils.toUsd(marketAccount.eBest, quAvg)
                                     + ',<br> e_avg_' + marketAccount.eAvg + '_' + Utils.toUsd(marketAccount.eAvg, quAvg)
                                     + ',<br> entry_price ' + marketAccount.entryPrice
                                     + ',<br> u' + marketAccount.upl + '_' + Utils.toUsd(marketAccount.upl, quAvg)
                                     + ',<br> m' + marketAccount.margin + '_' + Utils.toUsd(marketAccount.margin, quAvg)
                                     + ',<br> a' + marketAccount.available + '_' + Utils.toUsd(marketAccount.available, quAvg);

            } else {
                oBalance.innerHTML = 'Balance: btc=' + marketAccount.btc
                                     + ', usd=' + marketAccount.usd;
            }
        });
        fetch(sprintf('/market/%s/future-index', firstMarketName), function (futureIndex) {
            let ind = document.getElementById('bitmex-future-index');
            bitmexIndexVar.fillComponents(ind, futureIndex, baseUrl);

            let fund = document.getElementById('bitmex-future-index-funding');
            if (futureIndex.swapType === 'noSwap') {
                fund.style.color = "#008f00";
            } else {
                fund.style.color = "#bf0000";
            }
            fund.innerHTML = 'fRate' + futureIndex.fundingRate + '%'
                             + ' fCost' + futureIndex.fundingCost + 'XBT'
                             + ' p' + Utils.withSign(futureIndex.position)
                             + '(' + futureIndex.swapType + ')';

            let fundTime = document.getElementById('bitmex-future-index-funding-time');
            fundTime.innerHTML = ', timeToSwap=' + futureIndex.timeToSwap
                                 + ', swapTime=' + futureIndex.swapTime
                                 + ', ';
            let timeCompare = document.getElementById('timeCompare');
            timeCompare.innerHTML = futureIndex.timeCompareString;
            let timeCompareUpdating = document.getElementById('timeCompareUpdating');
            timeCompareUpdating.innerHTML = futureIndex.timeCompareUpdating;

        });
        fetch(sprintf('/market/%s/future-index', secondMarketName), function (futureIndex) {
            let oBalance = document.getElementById(sprintf('%s-future-index', secondMarketName));
            okexIndexVar.fillComponents(oBalance, futureIndex, baseUrl);
        });
        fetch(sprintf('/market/%s/liq-info', firstMarketName), function (marketAccount) {
            let liqInfo = document.getElementById(sprintf('%s-liq-info', firstMarketName));
            liqInfo.innerHTML = sprintf('%s %s', marketAccount.dql, marketAccount.dmrl)
                                + '<br>b_' + marketAccount.mmDql
                                + '<br>b_' + marketAccount.mmDmrl;
        });
        fetch(sprintf('/market/%s/liq-info', secondMarketName), function (marketAccount) {
            let liqInfo = document.getElementById(sprintf('%s-liq-info', secondMarketName));
            liqInfo.innerHTML = sprintf('%s %s;', marketAccount.dql, marketAccount.dmrl)
                                + '<br>o_' + marketAccount.mmDql
                                + '<br>o_' + marketAccount.mmDmrl;
        });
        fetch('/delta-params', function (result) {
            let b = document.getElementById('b_delta_minmax');
            let o = document.getElementById('o_delta_minmax');
            b.innerHTML = Utils.withSign(result.bDeltaMin) + '...' + Utils.withSign(result.bDeltaMax);
            o.innerHTML = Utils.withSign(result.oDeltaMin) + '...' + Utils.withSign(result.oDeltaMax);
        });
        fetch('/market/borders-timer', function (result) {
            let bordersTimer = document.getElementById('borders-timer');
            bordersTimer.innerHTML = result.result;
            bordersVar.updateTableHash(result.description);
        });
        // markets order is opposite for deltas
        fetch(sprintf('/market/deltas?market1=%s&market2=%s', secondMarketName, firstMarketName),
              function (returnData) {
                  repaintDeltasAndBorders(returnData);
              });

        // markets order is opposite for deltas
        fetch('/market/stop-moving', function (returnData) {
            repaintStopMoving(returnData);
        });
        fetch('/market/states', function (returnData) {
            repaintStates(returnData);
        });
        fetch('/market/pos-corr', function (returnData) {
            repaintPosCorr(returnData);
        });
        fetch('/market/liq-params', function (returnData) {
            repaintLiqParams(returnData);
        });

        var logsFetching = document.getElementById('logs-fetching');

        if (logsFetching.checked) {
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
            fetch('/market/warning-log', function (returnData) {
                let area1 = document.getElementById('warning-log');
                area1.scrollTop = area1.scrollHeight;
                area1.innerHTML = returnData.trades.length > 0
                    ? returnData.trades.reduce((a, b) => a + '\n' + b)
                    : "";
            });
        }

        function setOpenOrdersHeight(ordersContainer) {
            if (ordersContainer.childNodes.length > 4) {
                ordersContainer.style.height = 'auto';
            } else {
                ordersContainer.style.height = '80px';
            }
        }

        fetch(sprintf('/market/%s/open-orders', firstMarketName), function (returnData) {
            var myNode = document.getElementById(sprintf('%s-open-orders', firstMarketName));
            while (myNode.firstChild) {
                myNode.removeChild(myNode.firstChild);
            }
            setOpenOrdersHeight(myNode);
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
                    move.addEventListener("click", function () {
                        moveOrderP(oo.id, oo.orderType);
                    }, false);
                    let cancel = createElement("button", {"id": "p-cancel-" + oo.id}, "Cancel");
                    cancel.addEventListener("click", cancelOrderP, oo.id);

                    let openOrderDiv = createElement("div", {"id": "p-links"}, [labelOrder, move, cancel]);
                    const ordersContainer = document.getElementById(sprintf('%s-open-orders', firstMarketName));
                    ordersContainer.appendChild(openOrderDiv);
                    setOpenOrdersHeight(ordersContainer);
                }

            });
        });
        fetch('/market/okcoin/open-orders', function (returnData) {
            var myNode = document.getElementById("okcoin-open-orders");
            while (myNode.firstChild) {
                myNode.removeChild(myNode.firstChild);
            }
            setOpenOrdersHeight(myNode);
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
                    move.addEventListener("click", function () {
                        moveOrderO(oo.id, oo.orderType);
                    }, false);

                    let cancel = createElement("button", {"id": "o-cancel-" + oo.id}, "Cancel");
                    cancel.addEventListener("click", function () {
                        cancelOrderO(oo.id);
                    }, oo.id);

                    let openOrderDiv = createElement("div", {"id": "o-links"}, [labelOrder, move, cancel]);
                    const ordersContainer = document.getElementById("okcoin-open-orders");
                    ordersContainer.appendChild(openOrderDiv);
                    setOpenOrdersHeight(ordersContainer);
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
            //
            // if (element.id == 'update-maker-delta') {
            //     let newMakerDeltaValue = document.getElementById('maker-delta-edit').value;
            //     let request = {makerDelta: newMakerDeltaValue};
            //     let requestData = JSON.stringify(request);
            //     console.log(requestData);
            //
            //     httpAsyncPost(baseUrl + '/market/update-maker-delta',
            //         requestData,
            //         function (responseData, resultElement) {
            //             repaintDeltasAndBorders(responseData);
            //         },
            //         null
            //     );
            // }

            // if (element.id == 'update-bu') {
            //     let newPeriodSecValue = document.getElementById('bu-edit').value;
            //     let request = {buValue: newPeriodSecValue};
            //     let requestData = JSON.stringify(request);
            //     console.log(requestData);
            //
            //     httpAsyncPost(baseUrl + '/market/update-maker-delta',
            //         requestData,
            //         function (responseData, resultElement) {
            //             repaintDeltasAndBorders(responseData);
            //         },
            //         null
            //     );
            // }

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

            if (element.id == 'update-cum-diff-fact-br') {
                let newVal = document.getElementById('cum-diff-fact-br-edit').value;
                let request = {cumDiffFactBr: newVal};
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

            if (element.id == 'update-cum-diff') {
                let element = document.getElementById('cum-diff-edit').value;
                let request = {cumDiffFact: element};
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

            if (element.id == 'update-cum-com1') {
                let element = document.getElementById('cum-com1-edit').value;
                let request = {cumCom1: element};
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

            if (element.id == 'update-cum-com2') {
                let element = document.getElementById('cum-com2-edit').value;
                let request = {cumCom2: element};
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

            if (element.id == 'update-cumBitmexMCom') {
                let element = document.getElementById('cumBitmexMCom-edit').value;
                let request = {cumBitmexMCom: element};
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

          if (element.id == 'update-slip') {
                let element = document.getElementById('slip-edit').value;
                let request = {slip: element};
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

            if (element.id == 'reset-all-cum') {
                let confirmation = window.confirm("Reset all cum values!\n\nAre you sure?");
                if (confirmation) {
                    let request = {resetAllCumValues: true};
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
            }

            if (element.id == 'toggle-stop-moving') {
                let request = {firstMarket: true, secondMarket: true};
                let requestData = JSON.stringify(request);
                console.log(requestData);

                httpAsyncPost(baseUrl + '/market/toggle-stop-moving',
                    requestData,
                    function (responseData, resultElement) {
                        repaintStopMoving(JSON.parse(responseData));
                    },
                    null
                );
            }

            if (element.id == 'free-markets-states') {
                let request = {firstMarket: true, secondMarket: true};
                let requestData = JSON.stringify(request);
                console.log(requestData);

                httpAsyncPost(baseUrl + '/market/free-states',
                    requestData,
                    function (responseData, resultElement) {
                        repaintStates(JSON.parse(responseData));
                    },
                    null
                );
            }

            if (element.id == 'stop-markets') {
                let request = {firstMarket: 'STOPPED', secondMarket: 'STOPPED'};
                let requestData = JSON.stringify(request);
                console.log(requestData);

                httpAsyncPost(baseUrl + '/market/states',
                    requestData,
                    function (responseData, resultElement) {
                        repaintStates(JSON.parse(responseData));
                    },
                    null
                );
            }

            if (element.id == 'update-count1') {
                let element = document.getElementById('count1-edit').value;
                let request = {count1: element};
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
            if (element.id == 'update-count2') {
                let element = document.getElementById('count2-edit').value;
                let request = {count2: element};
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
            if (element.id == 'update-reserveBtc1') {
                let element = document.getElementById('reserveBtc1-edit').value;
                let request = {reserveBtc1: element};
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
            if (element.id == 'update-reserveBtc2') {
                let element = document.getElementById('reserveBtc2-edit').value;
                let request = {reserveBtc2: element};
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

            if (element.id == 'print-sum-bal') {
                let request = {};
                let requestData = JSON.stringify(request);
                console.log(requestData);

                httpAsyncPost(baseUrl + '/market/print-sum-bal',
                    requestData,
                    function (responseData, resultElement) {
                        repaintStates(JSON.parse(responseData));
                    },
                    null
                );
            }

            if (element.id == 'update-hedgeAmount') {
                let element = document.getElementById('hedgeAmount-edit').value;
                let request = {hedgeAmount: element};
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

            if (element.id == 'update-fundingRateFee') {
                let element = document.getElementById('fundingRateFee-edit').value;
                let request = {fundingRateFee: element};
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

            if (element.id == 'update-customSwapTime') {
                let element = document.getElementById('customSwapTime-edit').value;
                let request = {command: element};
                let requestData = JSON.stringify(request);
                console.log(requestData);
                httpAsyncPost(baseUrl + '/market/bitmex/custom-swap-time',
                    requestData,
                    function (responseData, resultElement) {
                        let cst = document.getElementById("customSwapTime");
                        cst.innerHTML = responseData.result;
                    },
                    null
                );
            }

            if (element.id == 'update-timeCompareUpdating') {
                let element = document.getElementById('timeCompareUpdating-edit').value;
                let request = {command: element};
                let requestData = JSON.stringify(request);
                console.log(requestData);
                httpAsyncPost(baseUrl + '/market/bitmex/update-time-compare-updating',
                    requestData,
                    function (responseData, resultElement) {
                        let timeCompareUpdating = document.getElementById('timeCompareUpdating');
                        timeCompareUpdating.innerHTML = responseData.result;
                    },
                    null
                );
            }


            if (element.id == 'update-pos-corr') {
                let posCorr = document.getElementById("pos-corr").innerHTML;
                if (posCorr == 'stopped') {
                    posCorr = 'enabled';
                } else {
                    posCorr = 'stopped';
                }
                let request = {status: posCorr};
                let requestData = JSON.stringify(request);
                console.log(requestData);

                httpAsyncPost(baseUrl + '/market/pos-corr',
                    requestData,
                    function (responseData, resultElement) {
                        repaintPosCorr(JSON.parse(responseData));
                    },
                    null
                );
            }

            if (element.id == 'update-periodToCorrection') {
                let element = document.getElementById('periodToCorrection-edit').value;
                let request = {periodToCorrection: element};
                let requestData = JSON.stringify(request);
                console.log(requestData);
                httpAsyncPost(baseUrl + '/market/pos-corr',
                    requestData,
                    function (responseData, resultElement) {
                        repaintPosCorr(responseData);
                    },
                    null
                );
            }

            if (element.id == 'update-maxDiffCorr') {
                let element = document.getElementById('maxDiffCorr-edit').value;
                let request = {maxDiffCorr: element};
                let requestData = JSON.stringify(request);
                console.log(requestData);
                httpAsyncPost(baseUrl + '/market/pos-corr',
                    requestData,
                    function (responseData, resultElement) {
                        repaintPosCorr(responseData);
                    },
                    null
                );
            }

            if (element.id == 'update-b_mr_liq') {
                let element = document.getElementById('b_mr_liq-edit').value;
                let request = {bMrLiq: element};
                let requestData = JSON.stringify(request);
                console.log(requestData);
                httpAsyncPost(baseUrl + '/market/liq-params',
                    requestData,
                    function (responseData, resultElement) {
                        repaintLiqParams(responseData);
                    },
                    null
                );
            }
            if (element.id == 'update-o_mr_liq') {
                let element = document.getElementById('o_mr_liq-edit').value;
                let request = {oMrLiq: element};
                let requestData = JSON.stringify(request);
                console.log(requestData);
                httpAsyncPost(baseUrl + '/market/liq-params',
                    requestData,
                    function (responseData, resultElement) {
                        repaintLiqParams(responseData);
                    },
                    null
                );
            }
            if (element.id == 'update-b_DQL_open_min') {
                let element = document.getElementById('b_DQL_open_min-edit').value;
                let request = {bDQLOpenMin: element};
                let requestData = JSON.stringify(request);
                console.log(requestData);
                httpAsyncPost(baseUrl + '/market/liq-params',
                    requestData,
                    function (responseData, resultElement) {
                        repaintLiqParams(responseData);
                    },
                    null
                );
            }
            if (element.id == 'update-o_DQL_open_min') {
                let element = document.getElementById('o_DQL_open_min-edit').value;
                let request = {oDQLOpenMin: element};
                let requestData = JSON.stringify(request);
                console.log(requestData);
                httpAsyncPost(baseUrl + '/market/liq-params',
                    requestData,
                    function (responseData, resultElement) {
                        repaintLiqParams(responseData);
                    },
                    null
                );
            }
            if (element.id == 'update-b_DQL_close_min') {
                let element = document.getElementById('b_DQL_close_min-edit').value;
                let request = {bDQLCloseMin: element};
                let requestData = JSON.stringify(request);
                console.log(requestData);
                httpAsyncPost(baseUrl + '/market/liq-params',
                    requestData,
                    function (responseData, resultElement) {
                        repaintLiqParams(responseData);
                    },
                    null
                );
            }
            if (element.id == 'update-o_DQL_close_min') {
                let element = document.getElementById('o_DQL_close_min-edit').value;
                let request = {oDQLCloseMin: element};
                let requestData = JSON.stringify(request);
                console.log(requestData);
                httpAsyncPost(baseUrl + '/market/liq-params',
                    requestData,
                    function (responseData, resultElement) {
                        repaintLiqParams(responseData);
                    },
                    null
                );
            }

            if (element.id == 'okcoin-reset-liq-info') {
                httpAsyncPost(baseUrl + '/market/okcoin/liq-info', '', function (responseData, resultElement) {}, null);
            }
            if (element.id == 'bitmex-reset-liq-info') {
                httpAsyncPost(baseUrl + '/market/bitmex/liq-info', '', function (responseData, resultElement) {}, null);
            }
            if (element.id == 'reset-delta-minmax') {
                httpAsyncPost(baseUrl + '/delta-params', '', function (responseData, resultElement) {}, null);
            }
            if (element.id == 'reset-time-compare') {
                httpAsyncPost(baseUrl + '/market/bitmex/reset-time-compare', '', function (responseData, resultElement) {
                    let timeCompare = document.getElementById('timeCompare');
                    timeCompare.innerHTML = responseData.result;
                }, null);
            }

        });
    }

    bindDumpButton(hot);

};