'use strict';

let welcome = require('./welcome');
var sprintf = require('sprintf-js').sprintf;

let tableVar = require('./table');
let httpVar = require('./http');

welcome('home');

httpVar.httpAsyncGet(sprintf('%s:4030/market/list', process.env.baseUrl), function (response) {
    console.log(response);
    let parsed = JSON.parse(response);
    console.log('first market=' + parsed.first);

    if (parsed.first=='poloniex') {
        tableVar.onDomLoadedFunc(parsed.first, parsed.second, process.env.baseUrl + ':4030');
    } else if (parsed.first=='bitmex') {
        tableVar.onDomLoadedFunc(parsed.first, parsed.second, process.env.baseUrl + ':4031');
    }
});

if (process.env.NODE_ENV == 'development') {
    console.log('Hello from Webpack');
}

console.log('baseUrl ' + process.env.baseUrl);
console.log('NODE_ENV ' + process.env.NODE_ENV);


exports.welcome = welcome;