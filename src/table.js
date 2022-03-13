import { decorate_b_border, decorate_o_border } from './components/settings-utils'
import { updateCumParams } from './components/cum-params'
import { initDQLSettingsIfNeeded } from './components/settings'

var Handsontable = require('handsontable')
var $ = require('jquery')
var sprintf = require('sprintf-js').sprintf
var Utils = require('./utils')
var restartVar = require('./restart')
var Http = require('./http')
let bordersVar = require('./components/borders-v2')
let bitmexIndexVar = require('./components/comp/bitmex-index')
let okexIndexVar = require('./components/comp/okex-index')
let marketState = require('./components/comp/market-states')
let monCalcDelta = require('./components/comp/mon-calc-delta')
let eBestMin = require('./components/comp/e-best-min')
let placingBlocksVar = require('./components/placing-blocks')
let monVar = require('./components/mon')
const { placingOrderObj, mobxStore, allSettings } = require('./store/settings-store')
const lastPriceDevVar = require('./components/comp/last-price-deviation')

export { showMainInfo }

let showMainInfo = function (baseUrl) {
    if (!allSettings.leftIsBtm) {
        okexIndexVar.createBeforeAndAfterOrderBook('left')
    }
    okexIndexVar.createBeforeAndAfterOrderBook('right')

    Utils.fillLinksToLogs()
    restartVar.addRestartButton()
    if (allSettings.marketList.left === 'bitmex') {
        restartVar.addReconnectButton()
        restartVar.addResubscribeButton()
    }

    const elementLeftBid = document.getElementById('left-bid')
    const elementLeftAsk = document.getElementById('left-ask')
    const elementRightBid = document.getElementById('right-bid')
    const elementRightAsk = document.getElementById('right-ask')

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

    let parseOrderBook = function (orderBookJson) {
        let bidArray = []
        orderBookJson.bid.slice(0, 5).forEach(bid => {
            bidArray.push([bid.currency, bid.price, bid.amount, bid.amountInBtc, bid.timestamp])
        })
        // bid
        let askArray = []
        orderBookJson.ask.slice(0, 5).reverse().forEach(ask => {
            askArray.push([ask.currency, ask.price, ask.amount, ask.amountInBtc, ask.timestamp])
        })
        let orderBook = {}
        orderBook.bid = bidArray
        orderBook.ask = askArray

        return orderBook
    }

    let fetchOrderBook = function (dataUrl) {

        let inputData = JSON.parse(Http.httpGet(dataUrl))

        if (dataUrl.includes('bitmex')) {
            $('#left-last-price').html(inputData.lastPrice)
        } else {
            $('#right-last-price').html(inputData.lastPrice)
        }

        return parseOrderBook(inputData)
    }

    function createTable (container, dataUrl, dataPartName) {
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
        })
    }

    const askLeftTable = createTable(elementLeftAsk, `${baseUrl}/market/left/order-book`, 'ask')
    const bidLeftTable = createTable(elementLeftBid, `${baseUrl}/market/left/order-book`, 'bid')
    const askRightTable = createTable(elementRightAsk, `${baseUrl}/market/right/order-book`, 'ask')
    const bidRightTable = createTable(elementRightBid, `${baseUrl}/market/right/order-book`, 'bid')

    let fetch = function (url, callback) {
        Http.httpAsyncGet(baseUrl + url, function (rawData) {
            const jsonData = JSON.parse(rawData)
            callback(jsonData)
        })
    }

    let repaintDeltasAndBorders = function (returnData) {
        let delta1 = document.getElementById('delta1')
        let delta2 = document.getElementById('delta2')
        let delta1Sma = document.getElementById('delta1Sma')
        let delta2Sma = document.getElementById('delta2Sma')
        let delta1MinFixed = document.getElementById('delta1MinFixed')
        let delta2MinFixed = document.getElementById('delta2MinFixed')
        let delta1MinInstant = document.getElementById('delta1MinInstant')
        let delta2MinInstant = document.getElementById('delta2MinInstant')
        let delta1EveryCalc = document.getElementById('delta1EveryCalc')
        let delta2EveryCalc = document.getElementById('delta2EveryCalc')
        let deltaHistPerStarted = document.getElementById('deltaHistPerStarted')
        let deltaSmaUpdateIn = document.getElementById('deltaSmaUpdateIn')
        let border1 = $('#border1')
        let border2 = $('#border2')
        let reserveBtc1 = document.getElementById('reserveBtc1')
        let reserveBtc2 = document.getElementById('reserveBtc2')
        let fundingRateFee = document.getElementById('fundingRateFee')
        delta1.innerHTML = Utils.withSign(returnData.delta1)
        delta2.innerHTML = Utils.withSign(returnData.delta2)
        delta1Sma.innerHTML = Utils.withSign(returnData.delta1Sma)
        delta2Sma.innerHTML = Utils.withSign(returnData.delta2Sma)
        delta1MinFixed.innerHTML = Utils.withSign(returnData.delta1MinFixed)
        delta2MinFixed.innerHTML = Utils.withSign(returnData.delta2MinFixed)
        delta1MinInstant.innerHTML = 'L_delta_min_current=' + Utils.withSign(returnData.delta1MinInstant)
        delta2MinInstant.innerHTML = 'R_delta_min_current=' + Utils.withSign(returnData.delta2MinInstant)
        delta1EveryCalc.innerHTML = returnData.delta1EveryCalc
        delta2EveryCalc.innerHTML = returnData.delta2EveryCalc
        deltaHistPerStarted.innerHTML = returnData.deltaHistPerStarted
        deltaSmaUpdateIn.innerHTML = returnData.deltaSmaUpdateIn === '0'
          ? ''
          : 'Border_sma update in ' + returnData.deltaSmaUpdateIn + ' sec.'
        border1.text(returnData.border1)
        border2.text(returnData.border2)
        decorate_b_border($('#border1-lb'))
        decorate_b_border(border1)
        decorate_o_border($('#border2-lb'))
        decorate_o_border(border2)
        reserveBtc1.innerHTML = returnData.reserveBtc1
        reserveBtc2.innerHTML = returnData.reserveBtc2
        fundingRateFee.innerHTML = returnData.fundingRateFee
    }
    let repaintPosCorr = function (returnData) {
        let periodToCorrection = document.getElementById('periodToCorrection')
        periodToCorrection.innerHTML = returnData.periodToCorrection + ' sec'
        let maxDiffCorr = document.getElementById('maxDiffCorr')
        maxDiffCorr.innerHTML = returnData.maxDiffCorr
    }
    let repaintStates = function (returnData) {
        marketState.repaintStates(returnData)
    }

    function createElement (element, attribute, inner) {
        if (typeof (element) === 'undefined') {
            return false
        }
        if (typeof (inner) === 'undefined') {
            inner = ''
        }
        var el = document.createElement(element)
        if (typeof (attribute) === 'object') {
            for (var key in attribute) {
                el.setAttribute(key, attribute[key])
            }
        }
        if (!Array.isArray(inner)) {
            inner = [inner]
        }
        for (var k = 0; k < inner.length; k++) {
            if (inner[k].tagName) {
                el.appendChild(inner[k])
            } else {
                el.appendChild(document.createTextNode(inner[k]))
            }
        }
        return el
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

    function moveOrderP (orderId, orderType) {
        moveOrder(orderId, orderType, '/market/left/open-orders/move')
    }

    function moveOrderO (orderId, orderType) {
        moveOrder(orderId, orderType, '/market/right/open-orders/move')
    }

    function moveOrder (orderId, orderType, moveUrl) {
        console.log('moveorder')

        let request = { id: orderId, orderType: orderType }
        let requestData = JSON.stringify(request)
        console.log(requestData)

        let showResponse = function (responseData, resultElement) {
            console.log(responseData)
            alert(responseData)
        }
        Http.httpAsyncPost(baseUrl + moveUrl,
          requestData,
          showResponse,
          null)
    }

    function cancelOrder (orderId, marketName) {
        console.log('cancelOrder' + orderId)
        let cancelUrl = sprintf('/market/%s/open-orders/cancel', marketName)
        let request = { id: orderId }
        let requestData = JSON.stringify(request)
        console.log(requestData)

        let showResponse = function (responseData, resultElement) {
            console.log(responseData)
            alert(responseData)
        }
        Http.httpAsyncPost(baseUrl + cancelUrl,
          requestData,
          showResponse,
          null)
    }

    function lgst (long, short) {
        const lg = Utils.withSign(long)
        const st = Utils.withSign(short)
        const rawDataStr = ', lg' + lg + ', st' + st
        let styleStr = ''
        let titleStr = ''
        if (long === "0" && short === "0") {
            styleStr = 'font-weight: bold; color: red'
            titleStr = 'If balance>0 try create order by button(and cancel it then)'
        }
        return `<span style="${styleStr}" title="${titleStr}">${rawDataStr}</span>`
    }

    function showBalanceOkex (marketAccount, elBalance, isLeftAccount) {
        if (marketAccount.btc === null) {
            const quAvg = marketAccount.quAvg
            const ethBtcBid1 = marketAccount.ethBtcBid1
            mobxStore.secondMarketAccount = marketAccount
          const ppb_str = marketAccount.plPosBest ? ', pl_pos_best_' + marketAccount.plPosBest : ''
            if (ethBtcBid1 === null) {
                elBalance.innerHTML = 'Balance: w' + marketAccount.wallet + '_' + Utils.toUsd(marketAccount.wallet,
                  quAvg)
                  + ', p' + marketAccount.positionStr
                  + ', lv' + marketAccount.leverage
                  + lgst(marketAccount.availableForLong, marketAccount.availableForShort)
                  + ', lgMkt' + Utils.withSign(marketAccount.longAvailToClose)
                  + ', stMkt' + Utils.withSign(marketAccount.shortAvailToClose)
                  + ', liq' + Utils.withSign(marketAccount.liqPrice)
                  + ',<br> e_mark_' + marketAccount.eLast + '_' + Utils.toUsd(marketAccount.eLast, quAvg)
                  + ',<br> e_best_' + marketAccount.eBest + '_' + Utils.toUsd(marketAccount.eBest, quAvg)
                  + ',<br> e_avg_' + marketAccount.eAvg + '_' + Utils.toUsd(marketAccount.eAvg, quAvg)
                  + ',<br> entry_price ' + marketAccount.entryPrice
                  + ',<br> pl_pos_' + marketAccount.plPos + ppb_str
                  + ',<br> u' + marketAccount.upl + '_' + Utils.toUsd(marketAccount.upl, quAvg)
                  + ',<br> m' + marketAccount.margin + '_' + Utils.toUsd(marketAccount.margin, quAvg)
                  + ',<br> a' + marketAccount.available + '_' + Utils.toUsd(marketAccount.available, quAvg)

                const eMarkString = 'e_mark_' + marketAccount.eLast + '_' + Utils.toUsd(marketAccount.eLast, quAvg)
                if (isLeftAccount) {
                    mobxStore.balanceInfo.leftEmark = eMarkString
                } else {
                    mobxStore.balanceInfo.rightEmark = eMarkString
                }
            } else {
                const wBtc = Utils.ethToBtc(marketAccount.wallet, ethBtcBid1)
                const wUsd = Utils.toUsd(wBtc, quAvg)
                const eMarkBtc = Utils.ethToBtc(marketAccount.eLast, ethBtcBid1)
                const eMarkUsd = Utils.toUsd(eMarkBtc, quAvg)
                const eBestBtc = Utils.ethToBtc(marketAccount.eBest, ethBtcBid1)
                const eBestUsd = Utils.toUsd(eBestBtc, quAvg)
                const eAvgBtc = Utils.ethToBtc(marketAccount.eAvg, ethBtcBid1)
                const eAvgUsd = Utils.toUsd(eAvgBtc, quAvg)
                const uBtc = Utils.ethToBtc(marketAccount.upl, ethBtcBid1)
                const uUsd = Utils.toUsd(uBtc, quAvg)
                const mBtc = Utils.ethToBtc(marketAccount.margin, ethBtcBid1)
                const mUsd = Utils.toUsd(mBtc, quAvg)
                const aBtc = Utils.ethToBtc(marketAccount.available, ethBtcBid1)
                const aUsd = Utils.toUsd(aBtc, quAvg)
                elBalance.innerHTML = sprintf('Balance: w%s_%s_%s', marketAccount.wallet, wBtc, wUsd)
                  + ', p' + marketAccount.positionStr
                  + ', lv' + marketAccount.leverage
                  + lgst(marketAccount.availableForLong, marketAccount.availableForShort)
                  + ', lgMkt' + Utils.withSign(marketAccount.longAvailToClose)
                  + ', stMkt' + Utils.withSign(marketAccount.shortAvailToClose)
                  + ', liq' + Utils.withSign(marketAccount.liqPrice)
                  + ',<br> e_mark_' + marketAccount.eLast + '_' + eMarkBtc + '_' + eMarkUsd
                  + ',<br> e_best_' + marketAccount.eBest + '_' + eBestBtc + '_' + eBestUsd
                  + ',<br> e_avg_' + marketAccount.eAvg + '_' + eAvgBtc + '_' + eAvgUsd
                  + ',<br> entry_price ' + marketAccount.entryPrice
                  + ',<br> pl_pos_' + marketAccount.plPos + ppb_str
                  + ',<br> u' + marketAccount.upl + '_' + uBtc + '_' + uUsd
                  + ',<br> m' + marketAccount.margin + '_' + mBtc + '_' + mUsd
                  + ',<br> a' + marketAccount.available + '_' + aBtc + '_' + aUsd

                const eMarkString = 'e_mark_' + marketAccount.eLast + '_' + eMarkBtc + '_' + eMarkUsd
                if (isLeftAccount) {
                    mobxStore.balanceInfo.leftEmark = eMarkString
                } else {
                    mobxStore.balanceInfo.rightEmark = eMarkString
                }

            }

        } else {
            elBalance.innerHTML = 'Balance: btc=' + marketAccount.btc
              + ', usd=' + marketAccount.usd
        }
    }

    function showBalanceBitmex (btmAccount, elBalance) {
        if (btmAccount.btc === null) {
            let quAvg = btmAccount.quAvg
            elBalance.innerHTML = 'Balance: w' + btmAccount.wallet + '_' + Utils.toUsd(btmAccount.wallet,
              quAvg)
              + ', p' + btmAccount.positionStr
              + ', lv' + btmAccount.leverage
              + ', lg' + Utils.withSign(btmAccount.availableForLong)
              + ', st' + Utils.withSign(btmAccount.availableForShort)
              + ', liq' + Utils.withSign(btmAccount.liqPrice)
              + ',<br> e_mark_' + btmAccount.eMark + '_' + Utils.toUsd(btmAccount.eMark, quAvg)
              + ',<br> e_best__' + btmAccount.eBest + '_' + Utils.toUsd(btmAccount.eBest, quAvg)
              + ',<br> e_avg__' + btmAccount.eAvg + '_' + Utils.toUsd(btmAccount.eAvg, quAvg)
              + ',<br> entry_price ' + btmAccount.entryPrice
              // + '<br>'
              + ',<br> u' + btmAccount.upl + '_' + Utils.toUsd(btmAccount.upl, quAvg)
              + ',<br> m' + btmAccount.margin + '_' + Utils.toUsd(btmAccount.margin, quAvg)
              + ',<br> a' + btmAccount.available + '_' + Utils.toUsd(btmAccount.available, quAvg)

            mobxStore.balanceInfo.leftEmark = 'e_mark_' + btmAccount.eMark + '_' + Utils.toUsd(btmAccount.eMark, quAvg)
        } else {
            elBalance.innerHTML = 'Balance: btc=' + btmAccount.btc
              + ', usd=' + btmAccount.usd
        }
    }

    var updateFunction = function () {

        function showPosDiff (posDiffJson) {
            let mainSet = document.getElementById('main-set-string')
            if (posDiffJson.mainSetEqual) {
                mainSet.style.color = '#008f00'
            } else {
                mainSet.style.color = '#bf0000'
            }
            mainSet.innerHTML = posDiffJson.mainSetStr//Notional
            let mainSetSource = document.getElementById('main-set-source')
            mainSetSource.innerHTML = posDiffJson.mainSetSource
            if (posDiffJson.extraSetStr != null && allSettings.leftIsBtm) {
                let extraSetStr = document.getElementById('extra-set-string')
                if (posDiffJson.extraSetEqual) {
                    extraSetStr.style.color = '#008f00'
                } else {
                    extraSetStr.style.color = '#bf0000'
                }
                extraSetStr.innerHTML = posDiffJson.extraSetStr
                let extraSetSource = document.getElementById('extra-set-source')
                extraSetSource.innerHTML = posDiffJson.extraSetSource
            }
            if (posDiffJson.placingBlocks != null) {
                placingBlocksVar.updateBlocks(posDiffJson.placingBlocks)
            }
            $('#left-contract-usd').text(`(1 contract = $${posDiffJson.leftSCV})`)
            $('#right-contract-usd').text(`(1 contract = $${posDiffJson.rightSCV})`)
            if (posDiffJson.isEth != null) {
                placingOrderObj.isEth = posDiffJson.isEth
                mobxStore.isEth = posDiffJson.isEth
            }
            if (posDiffJson.cm != null) {
                placingOrderObj.cm = posDiffJson.cm
                mobxStore.cm = posDiffJson.cm
            }

            allSettings.hedgeBtc = posDiffJson.hedgeBtc
            allSettings.hedgeEth = posDiffJson.hedgeEth
        }

        fetch('/market/last-price-deviation', function (jsonData) {
            lastPriceDevVar.fillComponents(jsonData, baseUrl)
        })

        fetch('/market/left/order-book', function (jsonData) {
            let orderBookP = parseOrderBook(jsonData)
            // console.log('orderBookP.ask');
            // console.log(orderBookP.ask);
            askLeftTable.loadData(orderBookP.ask)
            bidLeftTable.loadData(orderBookP.bid)

            if (allSettings.leftIsBtm) {
                bitmexIndexVar.fillComponents(jsonData.futureIndex, baseUrl)
                $('#bitmex-bxbt-bal').html(jsonData.futureIndex.contractExtraJson.bxbtBal)
            } else {
                okexIndexVar.fillComponents(jsonData.futureIndex, baseUrl, 'left')
                bitmexIndexVar.createDelivery()
                mobxStore.b_delivery = Number(jsonData.futureIndex.leftEstimatedDeliveryPrice).toFixed(2)
            }

            mobxStore.fundingRateBordersBlock.left = jsonData.futureIndex.fundingRateBordersBlock

            $('#left-last-price').html(jsonData.lastPrice)

            mobxStore.futureIndex.b_index = Number(jsonData.futureIndex.indexVal)
            mobxStore.b_bid_1 = Number(jsonData.bid[0].price)
            mobxStore.b_ask_1 = Number(jsonData.ask[0].price)
        })

        fetch('/market/right/order-book', function (jsonData) {
            let orderBookO = parseOrderBook(jsonData)
            askRightTable.loadData(orderBookO.ask)
            bidRightTable.loadData(orderBookO.bid)

            okexIndexVar.fillComponents(jsonData.futureIndex, baseUrl, 'right')

            $('#right-last-price').html(jsonData.lastPrice)

            mobxStore.futureIndex.o_index = Number(jsonData.futureIndex.indexVal)
            mobxStore.fundingRateBordersBlock.right = jsonData.futureIndex.fundingRateBordersBlock
            mobxStore.o_bid_1 = Number(jsonData.bid[0].price)
            mobxStore.o_ask_1 = Number(jsonData.ask[0].price)
            mobxStore.o_delivery = Number(jsonData.futureIndex.rightEstimatedDeliveryPrice).toFixed(2)
        })

        fetch('/mon/all', function (resultJson) {
            let pTicker = document.getElementById('deadlock-checker')
            pTicker.innerHTML = resultJson.allHtml
            mobxStore.allMon.xrateLimitBtm = resultJson.xrateLimitBtm
            mobxStore.allMon.xrateLimitBtmUpdated = resultJson.xrateLimitBtmUpdated
            mobxStore.allMon.xrateLimitBtmResetAt = resultJson.xrateLimitBtmResetAt
            mobxStore.allMon.xrateLimitBtm1s = resultJson.xrateLimitBtm1s
            mobxStore.allMon.xrateLimitBtmUpdated1s = resultJson.xrateLimitBtmUpdated1s
            mobxStore.allMon.xrateLimitBtmResetAt1s = resultJson.xrateLimitBtmResetAt1s
            let bitmexReconnectCount = document.getElementById('bitmex-reconnect-count')
            bitmexReconnectCount.innerHTML = resultJson.bitmexReconnectCount
            monVar.showMonMoving(baseUrl, resultJson)
        })
        fetch('/mon/calc-delta', function (resultJson) {
            monCalcDelta.updateMonCalcDelta(baseUrl, resultJson)
        })

        fetch('/market/sum-bal', function (resultJson) {
            function boldOneParam (res, paramToBold) {
                const sInd = res.indexOf(paramToBold)
                const eInd2 = res.substring(sInd).indexOf(', ')
                const eInd = sInd + eInd2
                return res.substring(0, sInd) + '<b>' + res.substring(sInd, eInd) + '</b>' + res.substring(eInd)
            }

            const sumBalString = boldOneParam(resultJson.result, 's_e_best')
            $('#sum-bal').html(sumBalString)
            const impliedString = boldOneParam(resultJson.sumBalImpliedString, 's_e_best_imp')
            $('#sum-bal-implied').html(impliedString)
            eBestMin.fillComponents(resultJson)
        })

        fetch('/market/left/account', function (leftAccount) {
            mobxStore.quAvg = leftAccount.quAvg
            let elBalance = document.getElementById('left-balance')
            if (allSettings.marketList.left === 'bitmex') {
                showBalanceBitmex(leftAccount, elBalance)
            } else {
                showBalanceOkex(leftAccount, elBalance, true)
            }
        })

        fetch('/market/right/account', function (marketAccount) {
            let oBalance = document.getElementById('right-balance')
            showBalanceOkex(marketAccount, oBalance, false)
        })
        fetch('/market/left/liq-info', function (marketAccount) {
            mobxStore.balanceInfo.leftDql = marketAccount.dqlVal ? marketAccount.dqlVal : 'n/a'
            mobxStore.balanceInfo.areBothOkex = marketAccount.areBothOkex
            initDQLSettingsIfNeeded()
            let liqInfo = document.getElementById('left-liq-info')
            if (mobxStore.balanceInfo.areBothOkex) {
                    liqInfo.innerHTML = sprintf('%s', marketAccount.dmrl)
                      + '<br>L_' + marketAccount.mmDmrl
            } else {
                if (allSettings.leftIsBtm && allSettings.eth) {
                    liqInfo.innerHTML = sprintf('%s %s', marketAccount.dql, marketAccount.dmrl)
                      + '<br>L_' + marketAccount.mmDql
                      + '<br>L_' + marketAccount.mmDmrl
                      + '<br>' + marketAccount.dqlExtra
                      + '<br>L_' + marketAccount.mmDqlExtra
                } else {
                    liqInfo.innerHTML = sprintf('%s %s', marketAccount.dql, marketAccount.dmrl)
                      + '<br>L_' + marketAccount.mmDql
                      + '<br>L_' + marketAccount.mmDmrl
                }
            }
        })
        fetch('/market/right/liq-info', function (marketAccount) {
            mobxStore.balanceInfo.rightDql = marketAccount.dqlVal ? marketAccount.dqlVal : 'n/a'
            mobxStore.balanceInfo.areBothOkex = marketAccount.areBothOkex
            initDQLSettingsIfNeeded()
            let liqInfo = document.getElementById('right-liq-info')
            if (mobxStore.balanceInfo.areBothOkex) {
                liqInfo.innerHTML = sprintf('%s', marketAccount.dmrl)
                  + '<br>R_' + marketAccount.mmDmrl
            } else {
                let labelHtml = sprintf('%s %s;', marketAccount.dql, marketAccount.dmrl)
                  + '<br>R_' + marketAccount.mmDql
                  + '<br>R_' + marketAccount.mmDmrl
                if (allSettings.leftIsBtm && allSettings.eth) {
                    labelHtml += '<br>'
                    labelHtml += '<br>'
                }
                liqInfo.innerHTML = labelHtml
            }
        })
        fetch('/delta-params', function (result) {
            let b = document.getElementById('L_delta_minmax')
            let o = document.getElementById('R_delta_minmax')
            b.innerHTML = Utils.withSign(result.instantDelta.btmDeltaMin) + '...'
            o.innerHTML = Utils.withSign(result.instantDelta.okDeltaMin) + '...'
            let btmMax = document.createElement('span')
            btmMax.innerHTML = Utils.withSign(result.instantDelta.btmDeltaMax)
            btmMax.style.color = result.instantDelta.btmMaxColor
            b.appendChild(btmMax)
            let okMax = document.createElement('span')
            okMax.innerHTML = Utils.withSign(result.instantDelta.okDeltaMax)
            okMax.style.color = result.instantDelta.okMaxColor
            o.appendChild(okMax)

            let b_min = document.getElementById('L_delta_min_minmax')
            let o_min = document.getElementById('R_delta_min_minmax')
            b_min.innerHTML = Utils.withSign(result.deltaMin.btmDeltaMin) + '...'
            o_min.innerHTML = Utils.withSign(result.deltaMin.okDeltaMin) + '...'
            let btmMax_min = document.createElement('span')
            btmMax_min.innerHTML = Utils.withSign(result.deltaMin.btmDeltaMax)
            btmMax_min.style.color = result.deltaMin.btmMaxColor
            b_min.appendChild(btmMax_min)
            let okMax_min = document.createElement('span')
            okMax_min.innerHTML = Utils.withSign(result.deltaMin.okDeltaMax)
            okMax_min.style.color = result.deltaMin.okMaxColor
            o_min.appendChild(okMax_min)

            let sRange = document.getElementById('signal-time-range')
            sRange.innerHTML = Utils.withSign(result.signalData.signalTimeMin) + '...'
            let sRangeMax = document.createElement('span')
            sRangeMax.innerHTML = Utils.withSign(result.signalData.signalTimeMax)
            // sRangeMax.style.color = result.signalData.maxColor;
            sRange.appendChild(sRangeMax)

            let sAvg = document.getElementById('signal-time-avg')
            sAvg.innerHTML = Utils.withSign(result.signalData.signalTimeAvg)
        })
        fetch('/market/timers', function (result) {
            let startSignalTimer = document.getElementById('start-signal-timer')
            startSignalTimer.innerHTML = result.startSignalTimerStr

            let deltaMinTimer = document.getElementById('delta-min-timer')
            deltaMinTimer.innerHTML = result.deltaMinTimerStr

            let bordersTimer = document.getElementById('borders-timer')
            bordersTimer.innerHTML = result.bordersTimerStr
            bordersVar.updateTableHash(result.bordersV2TableHashCode)
        })
        // markets order is opposite for deltas
        fetch('/market/deltas', returnData => {repaintDeltasAndBorders(returnData)})

        fetch('/market/states', function (returnData) {
            repaintStates(returnData)
            showPosDiff(returnData.posDiffJson)
        })
        fetch('/market/pos-corr', function (returnData) {
            repaintPosCorr(returnData)
        })

        function setOpenOrdersHeight (ordersContainer) {
            // if (ordersContainer.childNodes.length > 4) {
            //     ordersContainer.style.height = 'auto';
            // } else {
            ordersContainer.style.height = '80px'
            // }
        }

        function timestampSorter () {
            return function (a, b) {
                return ('' + b.timestamp).localeCompare(a.timestamp)
            }
        }

        fetch('/market/left/open-orders', function (returnData) {
            const myNode = document.getElementById('left-open-orders')
            while (myNode.firstChild) {
                myNode.removeChild(myNode.firstChild)
            }
            setOpenOrdersHeight(myNode)
            returnData.sort((a, b) => ('' + b.timestamp).localeCompare(a.timestamp)).forEach(function (oo) {
                // console.log(oo.timestamp);
                let existedOrder = document.getElementById('p-span-' + oo.id)
                if (existedOrder === null) {
                    let labelOrder = createElement('span', { 'id': 'p-span-' + oo.id, 'style': 'font-size:small' },
                      '#' + oo.arbId
                      + ': id=\'' + oo.id.substring(0, 9) + '...\''
                      + ',c=' + oo.currency
                      + ',t=' + oo.orderType
                      + ',s=' + oo.status
                      + ',q=' + oo.price
                      + ',a=' + oo.amount
                      + '(f=' + oo.filledAmount + ')'
                      + ',time=' + oo.timestamp
                    )
                    let move = createElement('button', { 'id': 'p-move-' + oo.id, 'title': 'Try move' }, 'mv')
                    move.addEventListener('click', function () {
                        moveOrderP(oo.id, oo.orderType)
                    }, false)
                    let cancel = createElement('button', { 'id': 'p-cancel-' + oo.id }, 'cnl')
                    cancel.addEventListener('click', function () {
                        cancelOrder(oo.id, 'left')
                    }, oo.id)

                    let openOrderDiv = createElement('div', { 'id': 'p-links' }, [labelOrder, move, cancel])
                    const ordersContainer = document.getElementById('left-open-orders')
                    ordersContainer.appendChild(openOrderDiv)
                    setOpenOrdersHeight(ordersContainer)
                }

            })
        })
        fetch('/market/right/open-orders', function (returnData) {
            const myNode = document.getElementById('right-open-orders')
            while (myNode.firstChild) {
                myNode.removeChild(myNode.firstChild)
            }
            setOpenOrdersHeight(myNode)
            returnData.sort((a, b) => {
                if (a.status === 'WAITING') {
                    return -1
                }
                return ('' + b.timestamp).localeCompare(a.timestamp)
            }).forEach(function (oo) {
                let existedOrder = document.getElementById('o-span-' + oo.id)
                if (existedOrder === null) {
                    let labelOrder = createElement('span', { 'id': 'o-span-' + oo.id, 'style': 'font-size:small' },
                      '#' + oo.arbId
                      + ': id=\'' + oo.id + '\''
                      + ',t=' + oo.orderType
                      + ',s=' + oo.status
                      + ',q=' + oo.price
                      + ',a=' + oo.amount
                      + '(f=' + oo.filledAmount + ')'
                      + ',time=' + oo.timestamp
                    )
                    let openOrderDiv
                    if (oo.status !== 'WAITING') {
                        let move = createElement('button', { 'id': 'o-move-' + oo.id, 'title': 'Try move' }, 'mv')
                        move.addEventListener('click', function () {
                            moveOrderO(oo.id, oo.orderType)
                        }, false)

                        let cancel = createElement('button', { 'id': 'o-cancel-' + oo.id }, 'cnl')
                        cancel.addEventListener('click', function () {
                            cancelOrder(oo.id, 'right')
                        }, oo.id)

                        openOrderDiv = createElement('div', { 'id': 'o-links' }, [labelOrder, move, cancel])
                    } else {
                        labelOrder.style = 'font-size:small; background-color:lightgrey'
                        openOrderDiv = createElement('div', { 'id': 'o-links', 'background-color': 'lightgrey' },
                          labelOrder)
                    }
                    const ordersContainer = document.getElementById('right-open-orders')
                    ordersContainer.appendChild(openOrderDiv)
                    setOpenOrdersHeight(ordersContainer)
                }
            })
        })

        updateCumParams()

    }
    let updateData = setInterval(updateFunction, 1000)

    function bindDumpButton () {
        if (typeof Handsontable === 'undefined') {
            return
        }

        Handsontable.Dom.addEvent(document.body, 'click', function (e) {

            var element = e.target || e.srcElement

            if (element.nodeName == 'BUTTON' && element.name == 'dump') {
                var name = element.getAttribute('data-dump')
                var instance = element.getAttribute('data-instance')
                var hot = window[instance]
                console.log('data of ' + name, hot.getData())
            }

            if (element.nodeName == 'BUTTON' && element.name == 'update') {
                // var name = element.getAttribute('example1');
                // var instance = element.getAttribute('data-instance');
                // var hot = window[name];
                // console.log('data of ' + name, hot);

                clearInterval(updateData) // stop the setInterval()
                const interval = parseInt(document.getElementById('update_interval').value)
                console.log('new interval ' + interval)
                updateData = setInterval(updateFunction, interval)
            }

            if (element.name == 'sendToSocket') {
                socket.send('test message')
            }

            if (element.id == 'update-border1') {
                let newBorderValue = document.getElementById('border1-edit').value
                let request = { border1: newBorderValue }
                let requestData = JSON.stringify(request)
                console.log(requestData)

                Http.httpAsyncPost(baseUrl + '/market/update-borders',
                  requestData,
                  function (responseData, resultElement) {
                      allSettings.currentPreset = ''
                      repaintDeltasAndBorders(responseData)
                  },
                  null
                )
            }
            if (element.id == 'update-border2') {
                let newBorderValue = document.getElementById('border2-edit').value
                let request = { border2: newBorderValue }
                let requestData = JSON.stringify(request)
                console.log(requestData)

                Http.httpAsyncPost(baseUrl + '/market/update-borders',
                  requestData,
                  function (responseData, resultElement) {
                      allSettings.currentPreset = ''
                      repaintDeltasAndBorders(responseData)
                  },
                  null
                )
            }

            if (element.id == 'update-cum-delta') {
                let newCumDeltaValue = document.getElementById('cum-delta-edit').value
                let request = { cumDelta: newCumDeltaValue }
                let requestData = JSON.stringify(request)
                console.log(requestData)

                Http.httpAsyncPost(baseUrl + '/market/update-maker-delta',
                  requestData,
                  function (responseData, resultElement) {
                      repaintDeltasAndBorders(responseData)
                  },
                  null
                )
            }

            if (element.id == 'update-cum-delta-fact') {
                let newCumDeltaFactValue = document.getElementById('cum-delta-fact-edit').value
                let request = { cumDeltaFact: newCumDeltaFactValue }
                let requestData = JSON.stringify(request)
                console.log(requestData)

                Http.httpAsyncPost(baseUrl + '/market/update-maker-delta',
                  requestData,
                  function (responseData, resultElement) {
                      repaintDeltasAndBorders(responseData)
                  },
                  null
                )
            }

            if (element.id == 'update-cum-diff-fact-br') {
                let newVal = document.getElementById('cum-diff-fact-br-edit').value
                let request = { cumDiffFactBr: newVal }
                let requestData = JSON.stringify(request)
                console.log(requestData)

                Http.httpAsyncPost(baseUrl + '/market/update-maker-delta',
                  requestData,
                  function (responseData, resultElement) {
                      repaintDeltasAndBorders(responseData)
                  },
                  null
                )
            }

            if (element.id == 'update-cum-diff2-pre') {
                let newVal = document.getElementById('cum-diff2-pre-edit').value
                let request = { cumDiff2Pre: newVal }
                let requestData = JSON.stringify(request)
                console.log(requestData)
                Http.httpAsyncPost(baseUrl + '/market/update-maker-delta',
                  requestData, function (responseData, resultElement) {
                      repaintDeltasAndBorders(responseData)
                  },
                  null
                )
            }
            if (element.id == 'update-cum-diff2-post') {
                let newVal = document.getElementById('cum-diff2-post-edit').value
                let request = { cumDiff2Post: newVal }
                let requestData = JSON.stringify(request)
                console.log(requestData)
                Http.httpAsyncPost(baseUrl + '/market/update-maker-delta',
                  requestData, function (responseData, resultElement) {
                      repaintDeltasAndBorders(responseData)
                  },
                  null
                )
            }

            if (element.id == 'update-cum-diff1') {
                let element = document.getElementById('cum-diff1-edit').value
                let request = { cumDiffFact1: element }
                let requestData = JSON.stringify(request)
                console.log(requestData)

                Http.httpAsyncPost(baseUrl + '/market/update-maker-delta',
                  requestData,
                  function (responseData, resultElement) {
                      repaintDeltasAndBorders(responseData)
                  },
                  null
                )
            }

            if (element.id == 'update-cum-diff2') {
                let element = document.getElementById('cum-diff2-edit').value
                let request = { cumDiffFact2: element }
                let requestData = JSON.stringify(request)
                console.log(requestData)

                Http.httpAsyncPost(baseUrl + '/market/update-maker-delta',
                  requestData,
                  function (responseData, resultElement) {
                      repaintDeltasAndBorders(responseData)
                  },
                  null
                )
            }

            if (element.id == 'update-cum-diff') {
                let element = document.getElementById('cum-diff-edit').value
                let request = { cumDiffFact: element }
                let requestData = JSON.stringify(request)
                console.log(requestData)

                Http.httpAsyncPost(baseUrl + '/market/update-maker-delta',
                  requestData,
                  function (responseData, resultElement) {
                      repaintDeltasAndBorders(responseData)
                  },
                  null
                )
            }

            if (element.id == 'update-cum-com1') {
                let element = document.getElementById('cum-com1-edit').value
                let request = { cumCom1: element }
                let requestData = JSON.stringify(request)
                console.log(requestData)

                Http.httpAsyncPost(baseUrl + '/market/update-maker-delta',
                  requestData,
                  function (responseData, resultElement) {
                      repaintDeltasAndBorders(responseData)
                  },
                  null
                )
            }

            if (element.id == 'update-cum-com2') {
                let element = document.getElementById('cum-com2-edit').value
                let request = { cumCom2: element }
                let requestData = JSON.stringify(request)
                console.log(requestData)

                Http.httpAsyncPost(baseUrl + '/market/update-maker-delta',
                  requestData,
                  function (responseData, resultElement) {
                      repaintDeltasAndBorders(responseData)
                  },
                  null
                )
            }

            if (element.id == 'update-cumBitmexMCom') {
                let element = document.getElementById('cumBitmexMCom-edit').value
                let request = { cumBitmexMCom: element }
                let requestData = JSON.stringify(request)
                console.log(requestData)

                Http.httpAsyncPost(baseUrl + '/market/update-maker-delta',
                  requestData,
                  function (responseData, resultElement) {
                      repaintDeltasAndBorders(responseData)
                  },
                  null
                )
            }

            if (element.id == 'update-slip') {
                let element = document.getElementById('slip-edit').value
                let request = { slip: element }
                let requestData = JSON.stringify(request)
                console.log(requestData)

                Http.httpAsyncPost(baseUrl + '/market/update-maker-delta',
                  requestData,
                  function (responseData, resultElement) {
                      repaintDeltasAndBorders(responseData)
                  },
                  null
                )
            }

            if (element.id == 'reset-all-cum') {
                let confirmation = window.confirm('Reset all cum values!\n\nAre you sure?')
                if (confirmation) {
                    let request = { resetAllCumValues: true }
                    let requestData = JSON.stringify(request)
                    console.log(requestData)

                    Http.httpAsyncPost(baseUrl + '/market/update-maker-delta',
                      requestData,
                      function (responseData, resultElement) {
                          repaintDeltasAndBorders(responseData)
                      },
                      null
                    )
                }
            }

            if (element.id == 'free-markets-states') {
                let request = { firstMarket: true, secondMarket: true }
                let requestData = JSON.stringify(request)
                console.log(requestData)

                Http.httpAsyncPost(baseUrl + '/market/free-states',
                  requestData,
                  function (responseData, resultElement) {
                      repaintStates(JSON.parse(responseData))
                  },
                  null
                )
            }

            if (element.id == 'update-count1') {
                let element = document.getElementById('count1-edit').value
                let request = { count1: element }
                let requestData = JSON.stringify(request)
                console.log(requestData)
                Http.httpAsyncPost(baseUrl + '/market/update-maker-delta',
                  requestData,
                  function (responseData, resultElement) {
                      repaintDeltasAndBorders(responseData)
                  },
                  null
                )
            }
            if (element.id == 'update-count2') {
                let element = document.getElementById('count2-edit').value
                let request = { count2: element }
                let requestData = JSON.stringify(request)
                console.log(requestData)
                Http.httpAsyncPost(baseUrl + '/market/update-maker-delta',
                  requestData,
                  function (responseData, resultElement) {
                      repaintDeltasAndBorders(responseData)
                  },
                  null
                )
            }
            if (element.id == 'update-reserveBtc1') {
                let element = document.getElementById('reserveBtc1-edit').value
                let request = { reserveBtc1: element }
                let requestData = JSON.stringify(request)
                console.log(requestData)
                Http.httpAsyncPost(baseUrl + '/market/update-maker-delta',
                  requestData,
                  function (responseData, resultElement) {
                      repaintDeltasAndBorders(responseData)
                  },
                  null
                )
            }
            if (element.id == 'update-reserveBtc2') {
                let element = document.getElementById('reserveBtc2-edit').value
                let request = { reserveBtc2: element }
                let requestData = JSON.stringify(request)
                console.log(requestData)
                Http.httpAsyncPost(baseUrl + '/market/update-maker-delta',
                  requestData,
                  function (responseData, resultElement) {
                      repaintDeltasAndBorders(responseData)
                  },
                  null
                )
            }

            if (element.id == 'print-sum-bal') {
                let request = {}
                let requestData = JSON.stringify(request)
                console.log(requestData)

                Http.httpAsyncPost(baseUrl + '/market/print-sum-bal',
                  requestData,
                  function (responseData, resultElement) {
                      repaintStates(JSON.parse(responseData))
                  },
                  null
                )
            }

            if (element.id == 'update-fundingRateFee') {
                let element = document.getElementById('fundingRateFee-edit').value
                let request = { fundingRateFee: element }
                let requestData = JSON.stringify(request)
                console.log(requestData)
                Http.httpAsyncPost(baseUrl + '/market/update-maker-delta',
                  requestData,
                  function (responseData, resultElement) {
                      repaintDeltasAndBorders(responseData)
                  },
                  null
                )
            }

            if (element.id == 'update-customSwapTime') {
                let value = document.getElementById('customSwapTime-edit').value
                let request = { command: value }
                let requestData = JSON.stringify(request)
                console.log(requestData)
                element.disabled = true
                Http.httpAsyncPost(baseUrl + '/market/left/custom-swap-time',
                  requestData, () => element.disabled = false
                )
            }

            if (element.id == 'update-timeCompareUpdating') {
                let element = document.getElementById('timeCompareUpdating-edit').value
                let request = { command: element }
                let requestData = JSON.stringify(request)
                console.log(requestData)
                Http.httpAsyncPost(baseUrl + '/market/left/update-time-compare-updating',
                  requestData,
                  function (responseData, resultElement) {
                      let timeCompareUpdating = document.getElementById('timeCompareUpdating')
                      timeCompareUpdating.innerHTML = responseData.result
                  },
                  null
                )
            }

            if (element.id == 'update-pos-corr') {
                let posCorr = document.getElementById('pos-corr').innerHTML
                if (posCorr == 'stopped') {
                    posCorr = 'enabled'
                } else {
                    posCorr = 'stopped'
                }
                let request = { status: posCorr }
                let requestData = JSON.stringify(request)
                console.log(requestData)

                Http.httpAsyncPost(baseUrl + '/market/pos-corr',
                  requestData,
                  function (responseData, resultElement) {
                      repaintPosCorr(JSON.parse(responseData))
                  },
                  null
                )
            }

            if (element.id == 'update-periodToCorrection') {
                let element = document.getElementById('periodToCorrection-edit').value
                let request = { periodToCorrection: element }
                let requestData = JSON.stringify(request)
                console.log(requestData)
                Http.httpAsyncPost(baseUrl + '/market/pos-corr',
                  requestData,
                  function (responseData, resultElement) {
                      repaintPosCorr(responseData)
                  },
                  null
                )
            }

            if (element.id == 'update-maxDiffCorr') {
                let element = document.getElementById('maxDiffCorr-edit').value
                let request = { maxDiffCorr: element }
                let requestData = JSON.stringify(request)
                console.log(requestData)
                Http.httpAsyncPost(baseUrl + '/market/pos-corr',
                  requestData,
                  function (responseData, resultElement) {
                      repaintPosCorr(responseData)
                  },
                  null
                )
            }

            if (element.id == 'right-reset-liq-info') {
                Http.httpAsyncPost(baseUrl + '/market/right/liq-info', '', function (responseData, resultElement) {},
                  null)
            }
            if (element.id == 'left-reset-liq-info') {
                Http.httpAsyncPost(baseUrl + '/market/left/liq-info', '', function (responseData, resultElement) {},
                  null)
            }
            if (element.id == 'reset-delta-minmax') {
                Http.httpAsyncPost(baseUrl + '/reset-delta-params', '', function (responseData, resultElement) {},
                  null)
            }
            if (element.id == 'reset-ob-timestamps') {
                Http.httpAsyncPost(baseUrl + '/reset-ob-timestamps', '', function (responseData, resultElement) {},
                  null)
            }
            if (element.id == 'reset-signal-time-params') {
                Http.httpAsyncPost(baseUrl + '/reset-signal-time-params', '', function (responseData, resultElement) {},
                  null)
            }
            if (element.id == 'reset-delta_min-minmax') {
                Http.httpAsyncPost(baseUrl + '/reset-delta-params-min', '', function (responseData, resultElement) {},
                  null)
            }
            if (element.id == 'reset-time-compare') {
                Http.httpAsyncPost(baseUrl + '/market/left/reset-time-compare', '',
                  function (responseData, resultElement) {
                      let timeCompare = document.getElementById('timeCompare')
                      timeCompare.innerHTML = responseData.result
                  }, null)
            }

        });
    }

    bindDumpButton();

};
