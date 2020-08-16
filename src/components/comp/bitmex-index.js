'use strict'
import * as mobx from 'mobx'
import $ from 'jquery'
import Http from '../../http'
import Utils from '../../utils'
import { allSettings, mobxStore } from '../../store/settings-store'
import moment from 'moment'

export { fillComponents, createDelivery }

const ind = document.createElement('span')
const label = document.createElement('div')
const label2 = document.createElement('div')

let fillComponents = function (futureIndex, baseUrl) {
    URL = baseUrl + '/settings/all'

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

        const $limitsLeft = $('#left-limits-status')
        $limitsLeft.append($('<span>').text('Bitmex:'))
        $limitsLeft.append($('<span>', { 'id': 'bitmex-limits-status' }).text('...'))
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
    const b_sam = $('<span>').prop('title', 'left_best_sam - left_index').appendTo($cont);
    $('<span>').text('; ').appendTo($cont);
    const o_sam = $('<span>').prop('title', 'right_best_sam - right_index').appendTo($cont);

    mobx.autorun(r => {
        $('#index-diff').text(mobxStore.marketStates.twoMarketsIndexDiff)
        // left_best_sam = (b_ask[1] + b_bid[1]) / 2;
        // right_best_sam = (o_ask[1] + o_bid[1]) / 2;
        const left_best_sam = mobxStore.left_best_sam;
        const right_best_sam = mobxStore.right_best_sam;

        const ind_b = (left_best_sam - mobxStore.futureIndex.b_index);
        const ind_o = right_best_sam - mobxStore.futureIndex.o_index;
        b_sam.text(ind_b.toFixed(2))
        .prop('title', 'left_best_sam - left_index\n' + sprintf('%s - %s', left_best_sam, mobxStore.futureIndex.b_index));
        o_sam.text(ind_o.toFixed(2))
        .prop('title', 'right_best_sam - right_index\n' + sprintf('%s - %s', right_best_sam, mobxStore.futureIndex.o_index));
    });
}

function createDelivery() {
    const $cont = $('#delivery').addClass('blueText');
    if ($($cont).children().length !== 0) {
            return
    }

    // // Delivery: etm_b_delta = n; etm_o_delta = k; delivery_diff = i;
    // Delivery: b_index (n) - o_delivery (k) = i; j; l
    // n = значение b_index, k = значение o_delivery, j = etm_b_delta, l = etm_o_delta.
    const lb1 = $('<span>').appendTo($cont)
    const b_index_lb = $('<span>').text('n').appendTo($cont);
    const lb2 = $('<span>').appendTo($cont)
    lb1.text('Delivery: L_index (')
    lb2.text(') - R_delivery (')
    const o_delivery_lb = $('<span>').text('k').appendTo($cont);
    $('<span>').text(') = ').appendTo($cont);
    const delivery_diff_lb = $('<span>').text('i').appendTo($cont);
    $('<span>').text('; ').appendTo($cont);
    const etm_b_delta_lb = $('<span>').text('j').appendTo($cont);
    $('<span>').text('; ').appendTo($cont);
    const etm_o_delta_lb = $('<span>').text('l').appendTo($cont);

    mobx.autorun(r => {
        // only Bitmex XBTUSD_Perpetual, ETHUSD_Perpetual
        const leftCt = allSettings.contractModeCurrent.left
        const rightCt = allSettings.contractModeCurrent.right
        const validLeft = leftCt === 'BTC_ThisWeek' || leftCt === 'ETH_ThisWeek'
        const validRight = rightCt === 'BTC_ThisWeek' || rightCt === 'ETH_ThisWeek'
        const validMode = validLeft || validRight

        let showDeliveryTime = moment().day("Friday")
        .utc(true)
        .set('hour', 5)
        .set('minute', 0)
        .set('second', 0)
        .set('millisecond', 0);
        let deliveryTime = moment().day("Friday")
        .utc(true)
        .set('hour', 8)
        .set('minute', 0)
        .set('second', 0)
        .set('millisecond', 0);
        let currDate = moment();
        const isAfterThreeHours = moment(currDate).isAfter(moment(showDeliveryTime));
        const isBeforeDelivery = moment(currDate).isBefore(moment(deliveryTime));

        // console.log(validLeft)
        // console.log(validRight)
        if (validMode && isAfterThreeHours && isBeforeDelivery) { // it could be 0.000
        // if (true) { // it could be 0.000
            $cont.show();
            if (validRight) {
                lb1.text('Delivery: L_index (')
                lb2.text(') - R_delivery (')

                const delivery_diff = (mobxStore.futureIndex.b_index - mobxStore.o_delivery).toFixed(2);
                const etm_b_delta = (mobxStore.b_bid_1 - mobxStore.o_delivery).toFixed(2);
                const etm_o_delta = (mobxStore.o_delivery - mobxStore.b_ask_1).toFixed(2);


                b_index_lb.text(mobxStore.futureIndex.b_index);
                o_delivery_lb.text(mobxStore.o_delivery);

                delivery_diff_lb.text(delivery_diff)
                .prop('title', 'L_index - R_delivery\n' + sprintf('%s - %s', mobxStore.futureIndex.b_index, mobxStore.o_delivery));

                etm_b_delta_lb.text(etm_b_delta)
                .prop('title', 'etm_L_delta = L_bid[1] - R_delivery\n' + sprintf('%s - %s', mobxStore.b_bid_1, mobxStore.o_delivery));
                etm_o_delta_lb.text(etm_o_delta)
                .prop('title', 'etm_R_delta = R_delivery - L_ask[1]\n' + sprintf('%s - %s', mobxStore.o_delivery, mobxStore.b_ask_1));
            } else { // validLeft
                lb1.text('Delivery: R_index (')
                lb2.text(') - L_delivery (')

                // console.log(mobxStore.b_ask_1)
                // console.log(mobxStore.b_bid_1)
                // console.log(mobxStore.o_ask_1)
                // console.log(mobxStore.o_bid_1)
                // console.log(mobxStore.b_delivery)
                // console.log(mobxStore.o_delivery)
                const delivery_diff = (mobxStore.futureIndex.o_index - mobxStore.b_delivery).toFixed(2);
                const etm_b_delta = (mobxStore.o_bid_1 - mobxStore.b_delivery).toFixed(2);
                const etm_o_delta = (mobxStore.b_delivery - mobxStore.o_ask_1).toFixed(2);


                b_index_lb.text(mobxStore.futureIndex.o_index);
                o_delivery_lb.text(mobxStore.b_delivery);

                delivery_diff_lb.text(delivery_diff)
                .prop('title', 'R_index - L_delivery\n' + sprintf('%s - %s', mobxStore.futureIndex.o_index, mobxStore.b_delivery));

                etm_b_delta_lb.text(etm_b_delta)
                .prop('title', 'etm_R_delta = R_bid[1] - L_delivery\n' + sprintf('%s - %s', mobxStore.o_bid_1, mobxStore.b_delivery));
                etm_o_delta_lb.text(etm_o_delta)
                .prop('title', 'etm_L_delta = L_delivery - R_ask[1]\n' + sprintf('%s - %s', mobxStore.b_delivery, mobxStore.o_ask_1));
            }
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
    let today = new Date();
    let date = today.getFullYear()+'-'+('0' + (today.getMonth()+1)).slice(-2)+'-'+('0' + today.getDate()).slice(-2);
    document.getElementById('customSwapTime').innerText = date + 'T' + futureIndex.swapTime

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
