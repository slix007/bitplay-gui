// var exports = module.exports = {};
var sprintf = require('sprintf-js').sprintf;

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
    addLink('/market/trade-log/bitmex?date=2017-07-02');
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

function round(number, precision) {
    var pair = (number + 'e').split('e');
    var value = Math.round(pair[0] + 'e' + (+pair[1] + precision));
    pair = (value + 'e').split('e');
    return +(pair[0] + 'e' + (+pair[1] - precision))
}