// var exports = module.exports = {};
var sprintf = require('sprintf-js').sprintf;
var Http = require('./http');

exports.toUsd = function(btc, quAvg) {

    return (btc * quAvg).toFixed(2);
};

exports.scaleBitmexDownByLotSize = function (value) {
    const lotSize = 100;
    const reminder = Number(value/lotSize).toFixed(0)
    return Number(reminder * lotSize).toFixed(0)
}

exports.btmUsdToContPure = function (usd, isEth, cm) {
    // const cv = 100 / cm;
    let num = isEth
            ? (usd * cm / 10)
            : this.scaleBitmexDownByLotSize((usd * cm / 100));
    return Number(num).toFixed(0)
};

const okUsdToCont = function (usd, isEth) {
    let num = isEth
            ? (usd / 10)
            : (usd / 100);
    return Number(num).toFixed(0);
};
exports.okUsdToCont = okUsdToCont;

exports.btmUsdToCont = function (usd, isEth, cm) {
    const okCont = okUsdToCont(usd, isEth);
    const cv = 100 / cm;
    let num = isEth
            ? (okCont * cm)
            : this.scaleBitmexDownByLotSize((okCont * 100) / cv);
    return Number(num).toFixed(0)
};

exports.ethToBtc = function(eth, qu) {
    return (eth * qu).toFixed(8);
};

exports.withSign = function(value) {
    if (value == null) {return 'null'}
    return (value < 0) ? (value) : ('+' + value);
};

exports.fillLinksToLogs = function () {
    // console.log("Fill links");
    // console.log(window.location.host);
    // console.log(window.location.hostname);

    addLink('/market/trade-log/left');
    addLink('/market/trade-log/right');
    addLink('/market/deltas-log');
    addLink('/market/warning-log');
    addLink('/market/trade-log/left?date=2017-08-29');
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

exports.setDocumentTitle = function documentTitle(modName) {
    const modPart = modName !== undefined ? modName + '-' : '';
    let hostPart;
    let hName = ''
    if (process.env.backendUrl === 'use-window.location.hostname') {
        hName = window.location.hostname;
    } else {
        hName = process.env.backendUrl.slice(7, 13); // http://658-.....
    }
    if (hName.startsWith('local')) {
        hostPart = 'local'
    } else if (hName.split('-').length > 1) {
        hostPart = hName.split('-')[0]
    } else {
        hostPart = hName.slice(0, 3)
    }
    document.title = modPart + hostPart;
};

function getHostShortName() {
    const hName = window.location.hostname;
    return hName.startsWith('local') ? 'local' : hName.slice(0, 3);
}

function isProdHost() {
    const host = getHostShortName();
    return host === '659'
            || host === '662'
            || host === '667'
            || host === '668'
            || host === '669';
}

exports.isProdHost = isProdHost;
exports.isNonProdHost = () => !isProdHost();
