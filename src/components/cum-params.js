'use strict';

import * as mobx from "mobx";
import {cumParams, getOneCumParams, setCumParams} from "../store/cum-params-store";
import Http from "../http";
import $ from "jquery";

let URL_RESET;
let URL_UPDATE;

export function showCumParams(baseUrl) {
    const URL = baseUrl + '/market/cum-params';
    URL_RESET = baseUrl + '/market/cum-params/reset';
    URL_UPDATE = baseUrl + '/market/cum-params/update';

    const cumParamsCont = $('#cum-params-block');
    createCumParamsBlock(cumParamsCont);

    Http.httpAsyncGet(URL, function (rawData) {
        let data = JSON.parse(rawData);
        setCumParams(data);
    });

}

function createCumParamsBlock(cumParamsCont) {
    cumParamsCont.css('display', 'flex');
    const cont1 = $('<div>').addClass('cumParamsBlock').appendTo(cumParamsCont);
    const cont2 = $('<div>').addClass('cumParamsBlock').appendTo(cumParamsCont);
    const cont3 = $('<div>').addClass('cumParamsBlock').appendTo(cumParamsCont);
    createCumParams(cont1, 'TOTAL');
    createCumParams(cont2, 'CURRENT');
    createCumParams(cont3, 'VOLATILE');

    $('<div>').appendTo(cumParamsCont);
    $('<div>').appendTo(cumParamsCont);
}

function createCumParams(cont, cumType) {
    $('<div>').text(cumType).appendTo(cont);
    let select = $('<select>').appendTo(cont);
    select.append($('<option>').val('COMMON').text('COMMON'));
    select.append($('<option>').val('EXTENDED').text('EXTENDED'));
    select.on('change', function () {
        cumParams.selectedTimeType[cumType] = select.val();
    });

    function createParam(label) {
        const c = $('<div>').appendTo(cont);
        $('<span>').text(label + ' ').appendTo(c);
        // $('<input>').appendTo(c);
        // const btnUpdate = $('<button>').text('set').appendTo(c);
        // btnReset.click(() => {
        //     const requestData = JSON.stringify({cumType: cumType, cumTimeType: cumParams.selectedTimeType[cumType]});
        //     btnReset.prop('disabled', true);
        //     Http.httpAsyncPost(URL_RESET, requestData, function (rawData) {
        //         let data = JSON.parse(rawData);
        //         setCumParams(data);
        //         btnReset.prop('disabled', false);
        //     });
        // });
        return $('<span>').appendTo(c);
    }

    const cum_delta_ast = createParam('cum_delta/ast:');
    const cum_delta_fact_ast = createParam('cum_delta_fact/ast:');
    const cum_diff_fact_br = createParam('cum_diff_fact_br:');
    const cum_diff1_ast = createParam('cum_diff1/ast:');
    const cum_diff2_ast = createParam('cum_diff2/ast:');
    const cum_diff2_pre = createParam('cum_diff2_pre:');
    const cum_diff2_post = createParam('cum_diff2_post:');
    const cum_diff_ast = createParam('cum_diff_ast:');
    const cum_com1_ast = createParam('cum_com1/ast:');
    const cum_com2_ast = createParam('cum_com2/ast:');
    const cum_bitmex_m_com_ast = createParam('cum_bitmex_M_com/ast:');
    const slip = createParam('slip_br/slip:');
    const count1 = createParam('CompletedCount1/Count1:');
    const count2 = createParam('CompletedCount2/Count2:');

    const btnReset = $('<button>').text('Reset cum values').appendTo(cont);
    btnReset.click(() => {
        const requestData = JSON.stringify({cumType: cumType, cumTimeType: cumParams.selectedTimeType[cumType]});
        btnReset.prop('disabled', true);
        Http.httpAsyncPost(URL_RESET, requestData, function (rawData) {
            let data = JSON.parse(rawData);
            setCumParams(data);
            btnReset.prop('disabled', false);
        });
    });

    function updateCumValues(p) {
        const cumAstDelta = (p.cumAstDelta1 + p.cumAstDelta2).toFixed(4);
        cum_delta_ast.text(sprintf('%s/%s', p.cumDelta, cumAstDelta));
        const cumAstDeltaFact = (p.cumAstDeltaFact1 + p.cumAstDeltaFact2).toFixed(4);
        cum_delta_fact_ast.text(sprintf('%s/%s', p.cumDeltaFact, cumAstDeltaFact));
        cum_diff_fact_br.text(sprintf('%s', p.cumDiffFactBr));
        cum_diff1_ast.text(sprintf('%s/%s', p.cumDiffFact1, p.cumAstDiffFact1));
        cum_diff2_ast.text(sprintf('%s/%s', p.cumDiffFact2, p.cumAstDiffFact2));
        cum_diff2_pre.text(sprintf('%s', p.cumDiff2Pre));
        cum_diff2_post.text(sprintf('%s', p.cumDiff2Post));
        cum_diff_ast.text(sprintf('%s/%s', p.cumDiffFact, p.cumAstDiffFact));
        cum_com1_ast.text(sprintf('%s/%s', p.cumCom1, p.cumAstCom1));
        cum_com2_ast.text(sprintf('%s/%s', p.cumCom2, p.cumAstCom2));
        cum_bitmex_m_com_ast.text(sprintf('%s/%s', p.cumBitmexMCom, p.cumAstBitmexMCom));
        slip.text(sprintf('%s/%s', p.slipBr, p.slip));
        count1.text(sprintf('%s/%s', p.completedCounter1, p.counter1));
        count2.text(sprintf('%s/%s', p.completedCounter2, p.counter2));
    }

    mobx.autorun(r => {
        const p = getOneCumParams(cumParams, cumType, cumParams.selectedTimeType[cumType]);
        updateCumValues(p);
    });
}

