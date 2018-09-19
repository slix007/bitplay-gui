// var exports = module.exports = {};
var sprintf = require('sprintf-js').sprintf;
var Http = require('./http');

exports.toUsd = function(btc, quAvg) {

    return (btc * quAvg).toFixed(2);
};

exports.ethToBtc = function(eth, qu) {
    return (eth * qu).toFixed(8);
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
    addLink('/deltas/B_DELTA?lastCount=10');
    addLink('/deltas/O_DELTA?lastCount=10');
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

exports.disableElements = function disableElements(el) {      // Utils.disableElements($("#e-best-min"));
    for (var i = 0; i < el.length; i++) {
        el[i].disabled = true;

        disableElements(el[i].children);
    }
};

exports.enableElements = function enableElements(el) {
    for (var i = 0; i < el.length; i++) {
        el[i].disabled = false;

        enableElements(el[i].children);
    }
};

exports.disableChildren = function disableChildren(obj) { // Utils.disableChildren(document.getElementById("e-best-min"));
    obj.childNodes.forEach(function (val) {
        // val.style.color = 'grey';
        val.disabled = true;
    });
};

exports.enableChildren = function enableChildren(obj) {
    obj.childNodes.forEach(function (val) {
        // val.style.color = 'black';
        val.disabled = false;
    });
};

