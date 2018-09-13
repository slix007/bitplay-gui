// var exports = module.exports = {};
var sprintf = require('sprintf-js').sprintf;
var Http = require('./http');


exports.addRestartButton = function () {
    console.log("Add restart button");

    // 1. Create the button
    let button = document.createElement('button');
    button.style.background = 'DarkRed';
    button.style.color = 'White';
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
    console.log("Add reconnect button");

    // 1. Create the button
    let button = document.createElement('button');
    button.style.background = 'darkgoldenrod';
    button.style.color = 'White';
    button.innerHTML = 'reconnect';

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
            });
        }
    });
};

