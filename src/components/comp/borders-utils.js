'use strict';

let Http = require('../../http');

export function saveBordersSettings(BORDERS_SETTINGS_URL, key, value, el) {
    let reqObj = {};
    reqObj[key] = value;
    const requestData = JSON.stringify(reqObj);

    Http.httpAsyncPost(BORDERS_SETTINGS_URL,
            requestData, function (result) {
                // alert('Result' + result);
                el.disabled = false;
            });
}

export function saveParamAsNumber(BORDERS_SETTINGS_V2_URL, key, value, el, setBtn) {
    let reqObj = {};
    reqObj[key] = Number(value);
    const requestData = JSON.stringify(reqObj);
    Http.httpAsyncPost(BORDERS_SETTINGS_V2_URL,
            requestData, function (rawRes) {
                const res = JSON.parse(rawRes);
                el.innerHTML = res.result;
                setBtn.disabled = false;
                //alert('Result' + result);
            });
}