'use strict';

import {allSettings, setAllSettingsRaw} from "../../store/settings-store";

const $ = require('jquery');
const Http = require('../../http');
const mobx = require('mobx');

export {showBitmexOrderBookType};

let showBitmexOrderBookType = function () {
    // var arbModArr = [
    //     {val: 'MODE1_SET_BU11', txt: 'M10: set_bu11', info: set_bu11, mod: "M10", mainSet: "set_bu11"},
    //     {val: 'MODE2_SET_BU12', txt: 'M11: set_bu12', info: set_bu12, mod: "M11", mainSet: "set_bu12"},
    //     {val: 'MODE3_SET_BU23', txt: 'M20: set_bu23', info: set_bu23, mod: "M20", mainSet: "set_bu23"},
    //     {val: 'MODE_TMP', txt: 'set_tmp', info: set_tmp, mod: "TMP", mainSet: "set_tmp"},
    //     {val: 'MODE4_SET_BU10_SET_EU11', txt: 'M21: set_bu10 + set_eu11', info: set_bu10_set_eu11, mod: "M21", mainSet: "set_eu11"},
    //     {val: 'MODE5_SET_BU10_SET_EU12', txt: 'M22: set_bu10 + set_eu12', info: set_bu10_set_eu12, mod: "M22", mainSet: "set_eu12"},
    // ];

    const arr = [
        {value: 'TRADITIONAL_10', text: 'Traditional_20'},
        {value: 'INCREMENTAL_25', text: 'Incremental_50'},
        {value: 'INCREMENTAL_FULL', text: 'Incremental_full'},
    ];
    const label = $('<span/>', {title: ''}).html('Bitmex orderBook type: ');
    const select = $('<select/>').html($.map(arr, function (item) {
        return $('<option/>', item);
    }));
    select.on('change', onChangeVal);

    const warnLabel = $('<span/>').css('color', 'red');

    mobx.autorun(r => {
        select.val(allSettings.bitmexObType);

        warnLabel.html(allSettings.bitmexObType === allSettings.bitmexObTypeCurrent ? ''
                : ' warning: to apply the changes resubscribe is needed');
    });

    $("#bitmex-orderbook-type").append(label).append(select).append(warnLabel);

    function onChangeVal() {
        const requestData = JSON.stringify({bitmexObType: this.value});
        console.log(requestData);
        select.attr('disabled', true);
        Http.httpAsyncPost(allSettings.SETTINGS_URL, requestData,
                function (result) {
                    setAllSettingsRaw(result);
                    select.attr('disabled', false);
                });
    }

};