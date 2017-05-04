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

httpVar.httpAsyncGet(sprintf('%s:%s/market/list', process.env.baseUrl, portNumber), function (response) {
    console.log(response);
    let parsed = JSON.parse(response);
    console.log('first market=' + parsed.first);
    tableVar.onDomLoadedFunc(parsed.first, parsed.second, sprintf('%s:%s', process.env.baseUrl, portNumber));
});

if (process.env.NODE_ENV == 'development') {
    console.log('Hello from Webpack');
}

console.log('baseUrl ' + process.env.baseUrl);
console.log('NODE_ENV ' + process.env.NODE_ENV);


exports.welcome = welcome;