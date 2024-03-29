'use strict';
var $ = require('jquery');

var exports = module.exports = {};

let eBestMin = document.createElement('span');
let responseLabel = document.createElement('span');

exports.fillComponents = function (resultJson) {

    $("#cold-storage-btc-label").html('Cold Storage(btc)=' + resultJson.cold_storage_btc);
    if (resultJson.cold_storage_eth) {
        $("#cold-storage-eth-label").html('Cold Storage(eth, or other quanto)=' + resultJson.cold_storage_eth);
    }
    $("#s_e_best_min_time_to_forbidden").html('Forbidden in ' + resultJson.s_e_best_min_time_to_forbidden + ' sec');

    let eBestMinDiv = document.getElementById("s_e_best_min");

    eBestMin.innerHTML = ', s_e_best_min=' + resultJson.s_e_best_min + ' usd. ';
    responseLabel.innerHTML = '';

    if ($(eBestMinDiv).children().length === 0) {

        eBestMinDiv.appendChild(eBestMin);
        eBestMinDiv.appendChild(responseLabel);

        eBestMinDiv.appendChild(eBestMin);
        eBestMinDiv.appendChild(responseLabel);

    }


};

