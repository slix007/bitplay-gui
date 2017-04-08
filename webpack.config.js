'use strict';

const NODE_ENV = process.env.NODE_ENV || 'development';
const webpack = require('webpack');
const path = require('path');

var babelLoader = {
    loader: 'babel-loader',
    test: /\.js?$/
};

const typescriptLoader = {
    test: /\.(ts|tsx)$/,
    loaders: ['babel-loader', 'ts-loader'],
    exclude: /(node_modules|bower_components)/
};

module.exports = {

    entry: './main.js',
    output: {
        path: __dirname + '/output',
        filename: './bundle.js',
        library: 'home'
    },
    watch: NODE_ENV == 'development',

    devtool: NODE_ENV == 'development' ? 'source-map' : null,

    plugins: [
        new webpack.DefinePlugin({NODE_ENV: JSON.stringify(NODE_ENV)})
    ],

    module: {
        loaders: [
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: ['env'],
                    plugins: ['transform-runtime']
                }
            }
        ],
        rules: [


        ]
    }
};

