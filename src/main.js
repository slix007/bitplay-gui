'use strict';

let welcome = require('./welcome');
var sprintf = require('sprintf-js').sprintf;

let tableVar = require('./table');
let httpVar = require('./http');

welcome('home');

let firstMarketName = document.getElementById('first-market-name');
// var firstMarketName = document.getElementsByTagName("title")[0];

let portNumber = "4030";
//TODO
if (firstMarketName !== null) {
    portNumber = "4031";
}

// let baseUrlWithPort = sprintf('%s:%s', process.env.baseUrl, portNumber);
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
});

if (process.env.NODE_ENV == 'development') {
    console.log('Hello from Webpack');
}

exports.welcome = welcome;