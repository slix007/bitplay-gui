'use strict';

let welcome = require('./welcome');

let tableVar = require('./table');

welcome('home');

if (process.env.NODE_ENV == 'development') {
    console.log('Hello from Webpack');
}

console.log('baseUrl ' + process.env.baseUrl);
console.log('NODE_ENV ' + process.env.NODE_ENV);


exports.welcome = welcome;