// var exports = module.exports = {};
// import {updateAllSettings} from "./components/settings";

var sprintf = require('sprintf-js').sprintf;
var Http = require('./http');

const {updateAllSettings} = require('./components/settings');


exports.addRestartButton = function () {
    // console.log("Add restart button");

    // 1. Create the button
    let button = document.createElement('button');
    button.classList.add("redBtn");
    button.innerHTML = 'Full Restart';

    // 2. Append somewhere
    let block = document.getElementById("full-restart");
    block.appendChild(button);

    // 3. Add event handler
    button.addEventListener("click", function () {
        let confirmation = window.confirm("Full Restart!\n\nAre you sure?");
        if (confirmation) {
            let theUrl = sprintf('http://%s:4031/full-restart', window.location.hostname);
            Http.httpAsyncGet(theUrl, function (responseData) {
                alert('Response: ' + responseData);
            });
        }
    });
};

exports.addReconnectButton = function () {
    // console.log("Add reconnect button");

    // 1. Create the button
    let button = document.createElement('button');
    button.style.background = 'darkgoldenrod';
    button.style.color = 'White';
    button.innerHTML = 'Bitmex reconnect';

    // 2. Append somewhere
    let block = document.getElementById("bitmex-reconnect");
    block.appendChild(button);

    // 3. Add event handler
    button.addEventListener("click", function () {
        let confirmation = window.confirm("bitmex-reconnect!\n\nAre you sure?");
        if (confirmation) {
            let theUrl = sprintf('http://%s:4031/bitmex-reconnect', window.location.hostname);
            Http.httpAsyncGet(theUrl, function (responseData) {
                alert('Response: ' + responseData);
                updateAllSettings();
            });
        }
    });
};

exports.addResubscribeButton = function () {
    // console.log("Add resubscribe button");

    // 1. Create the button
    let button = document.createElement('button');
    button.style.background = 'darkgoldenrod';
    button.style.color = 'White';
    button.innerHTML = 'Bitmex resubscribe OrderBooks';

    // 2. Append somewhere
    let block = document.getElementById("bitmex-ob-resubscribe");
    block.appendChild(button);

    // 3. Add event handler
    button.addEventListener("click", function () {
        let confirmation = window.confirm("bitmex-ob-resubscribe!\n\nAre you sure?");
        if (confirmation) {
            let theUrl = sprintf('http://%s:4031/bitmex-ob-resubscribe', window.location.hostname);
            Http.httpAsyncGet(theUrl, function (responseData) {
                alert('Response: ' + responseData);
                updateAllSettings();
            });
        }
    });
};

