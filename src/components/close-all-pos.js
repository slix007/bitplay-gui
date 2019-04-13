'use strict';

import Http from "../http";
import $ from "jquery";

export {createCloseAllPos};

let createCloseAllPos = function (baseUrl) {
    const URL_CLOSE_ALL_POS = baseUrl + '/market/bitmex/close-all-pos';

    const cont = $('#bitmex-close-all-pos');
    const checkbox = $('<input>').attr('type', 'checkbox').appendTo(cont);
    const btn = $('<button>').text('mkt').appendTo(cont);
    const lb = $('<span>').appendTo(cont);

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
            btn.prop('disabled', false);
            btn.addClass('redBtn');
        } else {
            btn.prop('disabled', true);
            btn.removeClass('redBtn');
        }
    });

};