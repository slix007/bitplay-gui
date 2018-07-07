'use strict';
var $ = require('jquery');
var Http = require('../../http');

var exports = module.exports = {};

let eBestMin = document.createElement('span');
let button = document.createElement('button');
let responseLabel = document.createElement('span');

exports.fillComponents = function (resultJson, baseUrl) {

    let eBestMinDiv = document.getElementById("s_e_best_min");

    let reloadURL = baseUrl + '/settings/reload-e-best-min';

    eBestMin.innerHTML = 's_e_best_min=' + resultJson.s_e_best_min + ' usd';
    responseLabel.innerHTML = '';

    if ($(eBestMinDiv).children().length === 0) {

        button.innerHTML = 'Reload';
        eBestMinDiv.appendChild(eBestMin);
        eBestMinDiv.appendChild(button);
        eBestMinDiv.appendChild(responseLabel);
        button.addEventListener("click", function () {
            button.disabled = true;
            console.log('POST to ' + reloadURL);
            responseLabel.innerHTML = '...';
            Http.httpAsyncPost(reloadURL, '', function (responseData) {
                responseLabel.innerHTML = responseData;
                button.disabled = false;
            });
        });

        eBestMinDiv.appendChild(eBestMin);
        eBestMinDiv.appendChild(button);
        eBestMinDiv.appendChild(responseLabel);

    }


};

