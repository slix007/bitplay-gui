'use strict';

import Http from "../http";
import $ from "jquery";
import * as mobx from "mobx";
import {mobxStore} from "../store/settings-store";

export {createCloseAllPos};

let createCloseAllPos = function (baseUrl) {

    bitmexCloseAllPos(baseUrl);

    okexCloseAllPos(baseUrl);
};

function bitmexCloseAllPos(baseUrl) {
    const URL_CLOSE_ALL_POS = baseUrl + '/market/bitmex/close-all-pos';

    const cont = $('#bitmex-close-all-pos');
    const checkbox = $('<input>').css('margin-left', '10px').attr('type', 'checkbox').appendTo(cont);
    const lbInfo = $('<span>').text('close all pos ').appendTo(cont);
    const btn = $('<button>').text('mkt').appendTo(cont);
    const lb = $('<span>').appendTo(cont);

    lbInfo.css('color', 'grey');
    btn.prop('disabled', true);

    btn.click(() => {
        let confirmation = window.confirm("Bitmex: close all positions\n\nAre you sure?");
        if (confirmation) {
            // console.log('request to ' + URL_CLOSE_ALL_POS);
            btn.prop('disabled', true);
            lb.text('in progress');

            Http.httpAsyncPost(URL_CLOSE_ALL_POS,
                    "", function (rawData) {
                        const result = JSON.parse(rawData);
                        if (result.orderId && result.orderId.length > 0) {
                            lb.text('orderId: ' + result.orderId + ' ' + result.details);
                        } else {
                            lb.text('Error: ' + result.details);
                        }
                        btn.prop('disabled', false);
                    });
        }
    });

    checkbox.click(function () {
        if (checkbox.prop('checked')) {
            lbInfo.css('color', 'black');
            btn.prop('disabled', false);
            btn.addClass('redBtn');
        } else {
            lbInfo.css('color', 'grey');
            btn.prop('disabled', true);
            btn.removeClass('redBtn');
        }
    });
}

function okexCloseAllPos(baseUrl) {
    const URL_CLOSE_ALL_POS = baseUrl + '/market/okcoin/close-all-pos';

    const cont = $('#okex-close-all-pos');
    const checkbox = $('<input>').css('margin-left', '10px').attr('type', 'checkbox').appendTo(cont);
    const lbInfo = $('<span>').text('close all pos ').appendTo(cont);
    const btn = $('<button>').text('mkt').appendTo(cont);
    const lb = $('<span>').appendTo(cont);

    lbInfo.css('color', 'grey');
    btn.prop('disabled', true);

    btn.click(() => {
        let confirmation = window.confirm('Okex: close the bigger position.\n\nAre you sure?');
        if (confirmation) {
            // console.log('request to ' + URL_CLOSE_ALL_POS);
            btn.prop('disabled', true);
            lb.text('in progress');

            const requestData = "";

            Http.httpAsyncPost(URL_CLOSE_ALL_POS, requestData, function (rawData) {
                const result = JSON.parse(rawData);
                if (result.orderId && result.orderId.length > 0) {
                    lb.text('orderId: ' + result.orderId + ' ' + result.details);
                } else {
                    lb.text('Error: ' + result.details);
                }
                btn.prop('disabled', false);
            });
        }
    });

    function decorateBtn(mobxStore) {
        const secondMarketAccount = mobxStore.secondMarketAccount;
        if (mobxStore.okexMktActive) {
            lbInfo.css('color', 'black');
            btn.prop('disabled', false);

            let posLong = secondMarketAccount.positionStr.split('-')[0].substring(1);
            const posShort = secondMarketAccount.positionStr.split('-')[1];
            const fullAvailable = posLong === secondMarketAccount.longAvailToClose
                    && posShort === secondMarketAccount.shortAvailToClose;

            if (fullAvailable) {
                btn.addClass('redBtn');
            } else {
                btn.addClass('yellowBtn');
            }
        } else {
            lbInfo.css('color', 'grey');
            btn.prop('disabled', true);
            btn.removeClass('redBtn');
            btn.removeClass('yellowBtn');
        }
    }

    checkbox.click(function () {
        mobxStore.okexMktActive = checkbox.prop('checked');
    });

    mobx.autorun(r => {
        decorateBtn(mobxStore);
    });
}