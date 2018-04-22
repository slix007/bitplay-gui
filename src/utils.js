// var exports = module.exports = {};
var sprintf = require('sprintf-js').sprintf;
var Http = require('./http');

exports.toUsd = function(btc, quAvg) {

    return (btc * quAvg).toFixed(2);
};

exports.withSign = function(value) {
    return (value < 0) ? (value) : ('+' + value);
};

exports.fillLinksToLogs = function () {
    console.log("Fill links");
    console.log(window.location.host);
    console.log(window.location.hostname);

    addLink('/market/trade-log/bitmex');
    addLink('/market/trade-log/okcoin');
    addLink('/market/deltas-log');
    addLink('/market/warning-log');
    addLink('/market/trade-log/bitmex?date=2017-08-29');
    addLink('/chart.html');
    addLink('/deltas?lastCount=10');
};

function addLink(urlPath) {
    let a = document.createElement('a');
    let linkText = document.createTextNode(urlPath);
    a.appendChild(linkText);
    a.href = sprintf('http://%s:4031%s', window.location.hostname, urlPath);

    let links = document.getElementById("links-to-logs");
    links.appendChild(a);
    links.appendChild(document.createElement('br'));
}

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

exports.objectToArray = function(obj) {
    var arr =[];
    for(let o in obj) {
        if (obj.hasOwnProperty(o)) {
            arr.push(obj[o]);
        }
    }
    return arr;
};

exports.camelToUnderscore = function (str) {
    return str.split(/(?=[A-Z])/).join('_').toLowerCase();
};