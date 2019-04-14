'use strict';

import Http from "../http";
import $ from "jquery";

export {createCloseAllPos};

let createCloseAllPos = function (baseUrl) {

    bitmexCloseAllPos(baseUrl);

    okexCloseAllPos(baseUrl, 'long', 'SELL');
    okexCloseAllPos(baseUrl, 'short', 'BUY');

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

function okexCloseAllPos(baseUrl, name, orderType) {
    const URL_CLOSE_ALL_POS = baseUrl + '/market/okcoin/close-all-pos';

    const cont = $('#okex-close-all-pos');
    const checkbox = $('<input>').css('margin-left', '10px').attr('type', 'checkbox').appendTo(cont);
    const lbInfo = $('<span>').text('close all ' + name + ' ').appendTo(cont);
    const btn = $('<button>').text('mkt').appendTo(cont);
    const lb = $('<span>').appendTo(cont);

    lbInfo.css('color', 'grey');
    btn.prop('disabled', true);

    btn.click(() => {
        let confirmation = window.confirm('Okex: close all ' + name + ' positions\n\nAre you sure?');
        if (confirmation) {
            // console.log('request to ' + URL_CLOSE_ALL_POS);
            btn.prop('disabled', true);
            lb.text('in progress');

            const requestData = JSON.stringify({type: orderType});

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