'use strict';

import {allSettings, setAllSettingsRaw} from "../../store/settings-store";

const $ = require('jquery');
const Http = require('../../http');
const mobx = require('mobx');

export {showPreSignalObReFetch};

let showPreSignalObReFetch = function () {
    const label = $('<span/>', {title: ''}).html('Pre-signal recheck orderBook: ');
    const checkbox = $('<input>').attr('type', 'checkbox');
    checkbox.click(onChangeVal());

    mobx.autorun(r => {
        checkbox.val(allSettings.preSignalObReFetch);
        checkbox.attr('title', allSettings.preSignalObReFetch ? 'enabled' : 'disabled');
    });

    $("#pre-signal-ob-recheck").append(label).append(checkbox);

    function onChangeVal() {
        const requestData = JSON.stringify({preSignalObReFetch: checkbox.prop('checked')});
        console.log(requestData);
        checkbox.attr('disabled', true);
        Http.httpAsyncPost(allSettings.SETTINGS_URL, requestData,
                function (result) {
                    setAllSettingsRaw(result);
                    checkbox.attr('disabled', false);
                });
    }

};