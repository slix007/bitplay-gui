'use strict';

let welcome = require('./welcome');

let tableVar = require('./table');
let httpVar = require('./http');

welcome('home');

httpVar.httpAsyncGet(process.env.baseUrl + '/market/list', function (response) {
    console.log(response);
    let parsed = JSON.parse(response);
    // document.addEventListener("DOMContentLoaded", function() {
        tableVar.onDomLoadedFunc(parsed.first, parsed.second);
    // });

    if (parsed.first=='bitmex') {
        console.log('first market=' + parsed.first);
    } else {
        console.log(response);
    }
});

if (process.env.NODE_ENV == 'development') {
    console.log('Hello from Webpack');
}

console.log('baseUrl ' + process.env.baseUrl);
console.log('NODE_ENV ' + process.env.NODE_ENV);


exports.welcome = welcome;