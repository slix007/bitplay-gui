'use strict';
import * as mobx from "mobx";
import $ from "jquery";
import Http from "../../http";
import Utils from "../../utils";
import {mobxStore} from "../../store/settings-store";

export {fillComponents};

const ind = document.createElement('span');
const label = document.createElement('div');
const label2 = document.createElement('div');

let fillComponents = function (futureIndex, baseUrl) {
    URL = baseUrl + '/settings/all';

    ind.innerHTML = 'Index/Mark: ' + futureIndex.index + ', timestamp=' + futureIndex.timestamp + ', ';
    $('#index-diff').html(futureIndex.twoMarketsIndexDiff);

    const indexCont = $('#bitmex-future-index');
    const indexCont2 = $('#bitmex-future-index2');
    if ($(indexCont).children().length === 0) {
        indexCont.append(ind);

        const limitPrice = document.createElement('div');
        indexCont2.append(limitPrice);
        createLimitPrice(limitPrice, futureIndex.limits.limitPrice, URL);
        indexCont2.append(label);
        indexCont2.append(label2);
    }

    if (futureIndex.limits != null) {
        updateLimits(futureIndex.limits);
    }

    fillBitmexFunding(futureIndex);
};

function countFCostUsd(mobxStore, fRate, pos_bitmex_cont) {
    let fcost_USD;
    if (mobxStore.isEth) {
// для ETHUSD (m21, m22): fcost_USD= -(fRate /100 * eth_mark_price * 0.000001 * .BXBT_price * pos_bitmex_cont);
// Упрощенная формула для ETH: fcost_USD = -(fRate /100 * (10 / cm * pos_bitmex));
        // let eth_mark_price = ???
        // let BXBT_price = mobxStore.bxbtBal;
        let cm = mobxStore.cm;
        fcost_USD = (-(fRate / 100 * (10 / cm * pos_bitmex_cont))).toFixed(2);
    } else {
// для XBTUSD (m10, m11, m20): fcost_USD = -(fRate /100 * pos_bitmex_cont);
        fcost_USD = (-(fRate / 100 * pos_bitmex_cont)).toFixed(2);
    }
    return fcost_USD;
}

function countFCostPts(mobxStore, fRate) {
    if (!mobxStore.b_bid_1 || !mobxStore.b_ask_1) {
        return '?';
    }
//для XBTUSD, ETHUSD: fcost_Pts = fRate / 100 b_avg_price;
// b_avg_price = (b_bid[1] + b_ask[1]) / 2;
    let b_avg_price = (mobxStore.b_bid_1 + mobxStore.b_ask_1) / 2;
    const fcost_Pts = (fRate / 100 * b_avg_price);
    return fcost_Pts.toFixed(2);
}

function fillBitmexFunding(futureIndex) {
    let fund = document.getElementById('bitmex-future-index-funding');
    if (futureIndex.swapType === 'noSwap') {
        fund.style.color = "#008f00";
    } else {
        fund.style.color = "#bf0000";
    }
    mobx.autorun(r => {
        let fCostUsd = countFCostUsd(mobxStore, futureIndex.fundingRate, futureIndex.position);
        let fcost_Pts = countFCostPts(mobxStore, futureIndex.fundingRate);
        fund.innerHTML = 'fRate' + futureIndex.fundingRate + '%'
                + ' fCost' + futureIndex.fundingCost + 'XBT'
                + ' (' + fCostUsd + 'usd)'
                + ' (' + fcost_Pts + 'pts)'
                + ' p' + Utils.withSign(futureIndex.position)
                + '(' + futureIndex.swapType + ')';
        // fund.setAttribute('title', mobxStore.b_bid_1 + ', ' + mobxStore.b_ask_1);
    });

    let fundTime = document.getElementById('bitmex-future-index-funding-time');
    fundTime.innerHTML = ', timeToSwap=' + futureIndex.timeToSwap
            + ', swapTime=' + futureIndex.swapTime
            + ', ';
    let timeCompare = document.getElementById('timeCompare');
    timeCompare.innerHTML = futureIndex.timeCompareString;
    let timeCompareUpdating = document.getElementById('timeCompareUpdating');
    timeCompareUpdating.innerHTML = futureIndex.timeCompareUpdating;
}

function createLimitPrice(container, value, URL) {
    var label = document.createElement('span');
    label.innerHTML = 'Limit price, % ';
    var edit = document.createElement('input');
    edit.style.width = '80px';
    var setBtn = document.createElement('button');
    var valueLabel = document.createElement('span');
    valueLabel.innerHTML = ' ' + value + '%';

    setBtn.onclick = function () {
        setBtn.disabled = true;
        let requestObj = {limits: {bitmexLimitPrice: edit.value}};
        const requestData = JSON.stringify(requestObj);
        // console.log(requestData);
        Http.httpAsyncPost(URL, requestData, function (rawRes) {
            const res = JSON.parse(rawRes);
            // console.log(res);
            valueLabel.innerHTML = ' ' + res.limits.bitmexLimitPrice + '%';
            setBtn.disabled = false;
        });
    };
    setBtn.innerHTML = 'set';

    container.append(label);
    container.append(edit);
    container.append(setBtn);
    container.append(valueLabel);
}

function updateLimits(limits) {
    label.innerHTML = 'Limit ask / Max price = ' + limits.limitAsk + ' / ' + limits.maxPrice;
    label2.innerHTML = 'Limit bid / Min price = ' + limits.limitBid + ' / ' + limits.minPrice;

    if (limits.insideLimits) {
        $('#bitmex-limits-status').css('color', 'green').html('Inside limits');
    } else {
        $('#bitmex-limits-status').css('color', 'red').html('Outside limits');
    }
}
