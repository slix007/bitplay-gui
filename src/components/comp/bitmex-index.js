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

    const indexCont = $('#bitmex-future-index');
    const indexCont2 = $('#bitmex-future-index2');
    if ($(indexCont).children().length === 0) {
        indexCont.append(ind);

        const limitPrice = document.createElement('div');
        indexCont2.append(limitPrice);
        createLimitPrice(limitPrice, futureIndex.limits.limitPrice, URL);
        indexCont2.append(label);
        indexCont2.append(label2);

        createIndexDiff();
        createDelivery();
    }

    if (futureIndex.limits != null) {
        updateLimits(futureIndex.limits);
    }

    fillBitmexFunding(futureIndex);
};

function createIndexDiff() {
    // indexDiff
    const $cont = $('#index-best-sam');
    $('<span>').text('; ').appendTo($cont);
    const b_sam = $('<span>').prop('title', 'b_best_sam - b_index').appendTo($cont);
    $('<span>').text('; ').appendTo($cont);
    const o_sam = $('<span>').prop('title', 'o_best_sam - o_index').appendTo($cont);

    mobx.autorun(r => {
        $('#index-diff').text(mobxStore.futureIndex.twoMarketsIndexDiff);
        // b_best_sam = (b_ask[1] + b_bid[1]) / 2;
        // o_best_sam = (o_ask[1] + o_bid[1]) / 2;
        const b_best_sam = ((mobxStore.b_ask_1 + mobxStore.b_bid_1) / 2).toFixed(3);
        const o_best_sam = ((mobxStore.o_ask_1 + mobxStore.o_bid_1) / 2).toFixed(3);

        const ind_b = (b_best_sam - mobxStore.futureIndex.b_index);
        const ind_o = o_best_sam - mobxStore.futureIndex.o_index;
        b_sam.text(ind_b.toFixed(2))
        .prop('title', 'b_best_sam - b_index\n' + sprintf('%s - %s', b_best_sam, mobxStore.futureIndex.b_index));
        o_sam.text(ind_o.toFixed(2))
        .prop('title', 'o_best_sam - o_index\n' + sprintf('%s - %s', o_best_sam, mobxStore.futureIndex.o_index));
    });
}

function createDelivery() {
    const $cont = $('#delivery').addClass('blueText');

    // Delivery: etm_b_delta = n; etm_o_delta = k; delivery_diff = i;
    $('<span>').text('Delivery: etm_b_delta = ').appendTo($cont);
    const etm_b_delta_lb = $('<span>').text('n').appendTo($cont);
    $('<span>').text('; etm_o_delta = ').appendTo($cont);
    const etm_o_delta_lb = $('<span>').text('k').appendTo($cont);
    $('<span>').text('; delivery_diff = ').appendTo($cont);
    const delivery_diff_lb = $('<span>').text('i').appendTo($cont);

    mobx.autorun(r => {
        // only m10, m21
        const rightMod = mobxStore.arbMod.mod === 'M10' || mobxStore.arbMod.mod === 'M21';
        // noinspection EqualityComparisonWithCoercionJS
        if (rightMod && mobxStore.o_delivery != 0) { // it could be 0.000
            $cont.show();
            const etm_b_delta = (mobxStore.b_bid_1 - mobxStore.o_delivery).toFixed(mobxStore.o_delivery_round);;
            const etm_o_delta = (mobxStore.o_delivery - mobxStore.b_ask_1).toFixed(mobxStore.o_delivery_round);;
            const delivery_diff = (mobxStore.futureIndex.b_index - mobxStore.o_delivery).toFixed(mobxStore.o_delivery_round);;

            etm_b_delta_lb.text(etm_b_delta)
            .prop('title', 'b_bid[1] - o_delivery\n' + sprintf('%s - %s', mobxStore.b_bid_1, mobxStore.o_delivery));
            etm_o_delta_lb.text(etm_o_delta)
            .prop('title', 'o_delivery - b_ask[1]\n' + sprintf('%s - %s', mobxStore.o_delivery, mobxStore.b_ask_1));
            delivery_diff_lb.text(delivery_diff)
            .prop('title', 'b_index - o_delivery\n' + sprintf('%s - %s', mobxStore.futureIndex.b_index, mobxStore.o_delivery));
        } else {
            $cont.hide();
        }
    });
}

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
