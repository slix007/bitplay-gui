'use strict';

var sprintf = require('sprintf-js').sprintf;

let tableVar = require('./table');
let httpVar = require('./http');
let bordersVar = require('./borders-v2');
let swapVar = require('./swap-v2');
let arbVar = require('./arb-version');

// let firstMarketName = document.getElementById('first-market-name');
// var firstMarketName = document.getElementsByTagName("title")[0];

let portNumber = "4031";
//TODO
// if (firstMarketName !== null) {
//     portNumber = "4031";
// }

//let baseUrlWithPort = sprintf('%s:%s', process.env.baseUrl, portNumber);
let baseUrlWithPort = sprintf('http://%s:%s', window.location.hostname, portNumber);
let theUrl = sprintf('%s/market/list', baseUrlWithPort);
console.log('baseUrlWithPort:' + baseUrlWithPort);
console.log('theUrl:' + theUrl);
console.log('NODE_ENV ' + process.env.NODE_ENV);

httpVar.httpAsyncGet(theUrl, function (response) {
    console.log(response);
    let parsed = JSON.parse(response);
    console.log('first market=' + parsed.first);
    tableVar.onDomLoadedFunc(parsed.first, parsed.second, baseUrlWithPort);
    arbVar.showArbVersion(parsed.first, parsed.second, baseUrlWithPort);
    bordersVar.showBordersV2(parsed.first, parsed.second, baseUrlWithPort);
    swapVar.showSwapV2(parsed.first, parsed.second, baseUrlWithPort);
});

if (process.env.NODE_ENV == 'development') {
    console.log('Hello from Webpack');
}
