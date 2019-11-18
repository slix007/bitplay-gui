'use strict';

import Http from "../http";
import $ from "jquery";
import * as mobx from "mobx";
import {mobxStore} from "../store/settings-store";

export {createRecoveryNtUsd};

let createRecoveryNtUsd = function (baseUrl) {

    recovery(baseUrl);

};

function recovery(baseUrl) {
    const URL_ACTION = baseUrl + '/market/recovery-nt-usd';

    const cont = $('#recovery-nt-usd');
    const checkbox = $('<input>').css('margin-left', '10px').attr('type', 'checkbox').appendTo(cont);
    const lbInfo = $('<span>').text('enable ').appendTo(cont);
    const btn = $('<button>').text('recovery nt_usd').appendTo(cont);
    const lb = $('<span>').appendTo(cont);

    lbInfo.css('color', 'grey');
    btn.prop('disabled', true);

    btn.click(() => {
        // let confirmation = window.confirm("Bitmex: close all positions\n\nAre you sure?");
        // if (confirmation)
        {
            // console.log('request to ' + URL_ACTION);
            btn.prop('disabled', true);
            lb.text('in progress');

            Http.httpAsyncPost(URL_ACTION,
                    "", function (rawData) {
                        const result = JSON.parse(rawData);
                  lb.text(rawData);
                        // if (result.orderId && result.orderId.length > 0) {
                        //     lb.text('orderId: ' + result.orderId + ' ' + result.details);
                        // } else {
                        //     lb.text('Error: ' + result.details);
                        // }
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

