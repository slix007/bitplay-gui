'use strict';

let welcome = require('./welcome');

let tableVar = require('./table');

welcome('home');

if (process.env.NODE_ENV == 'development') {
    console.log('Hello from Webpack');
}

console.log(process.env.USER);

exports.welcome = welcome;