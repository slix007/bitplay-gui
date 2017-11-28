'use strict';

var Http = require('./http');

var exports = module.exports = {};

exports.showArbVersion = function (firstMarketName, secondMarketName, baseUrl) {
    const ARB_SETTINGS_URL = baseUrl + '/settings/arb-scheme';
    Http.httpAsyncGet(ARB_SETTINGS_URL, function(rawData) {
        let arbData = JSON.parse(rawData);
        createVerDropdown(arbData.schemeName, ARB_SETTINGS_URL);
    });
};

function createVerDropdown(ver, ARB_SETTINGS_URL) {
    var container = document.getElementById("select-arb-version");

    var select = document.createElement('select');
    var option1 = document.createElement('option');
    var option2 = document.createElement('option');
    var option3 = document.createElement('option');
    option1.setAttribute("value", "MT");
    option2.setAttribute("value", "MT2");
    option3.setAttribute("value", "TT");
    option1.innerHTML = 'MT';
    option2.innerHTML = 'MT2';
    option3.innerHTML = 'TT';
    select.appendChild(option1);
    select.appendChild(option2);
    select.appendChild(option3);
    select.addEventListener("change", onVerPick);
    select.value = ver;

    container.appendChild(select);

    function onVerPick() {
        const requestData = JSON.stringify({schemeName: this.value});

        Http.httpAsyncPost(ARB_SETTINGS_URL,
            requestData, function(result) {
                alert('Result' + result);
            });
    }
}