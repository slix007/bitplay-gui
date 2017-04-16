'use strict';

const webpack = require('webpack');
const path = require('path');
const YAML = require('yamljs');

var babelLoader = {
    loader: 'babel-loader',
    test: /\.js?$/
};

const typescriptLoader = {
    test: /\.(ts|tsx)$/,
    loaders: ['babel-loader', 'ts-loader'],
    exclude: /(node_modules|bower_components)/
};

function getDevelopmentEnv(envName) {
    const NODE_ENV = envName;
    const myConfig = YAML.load('config.yml')[NODE_ENV];
    const baseUrl = myConfig.baseUrl;
    console.log('dev webpack.config.js NODE_ENV ' + NODE_ENV);

// module.exports = {
    return Object.assign({
                             entry: [
                                 'webpack-hot-middleware/client?reload=true',
                                 path.join(__dirname, 'src/main.js')
                             ],
                             output: {
                                 path: __dirname + '/output',
                                 filename: './bundle.js',
                                 library: 'home'
                             },
                             // watch: NODE_ENV == 'development',
                             // devtool: 'eval-source-map',

                             devtool: NODE_ENV == 'development' ? 'source-map' : 'source-map',

                             plugins: [
                                 new webpack.DefinePlugin({
                                                              'process.env': {
                                                                  NODE_ENV: JSON.stringify(NODE_ENV),
                                                                  baseUrl: JSON.stringify(baseUrl)
                                                              }
                                                          })
                             ],

                             module: {
                                 loaders: [
                                     {
                                         test: /\.css$/,
                                         use: ['style-loader', 'css-loader']
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
                                 rules: []
                             }
                         });
}

function getProductionEnv(envName) {
    const NODE_ENV = envName;
    const myConfig = YAML.load('config.yml')[NODE_ENV];
    const baseUrl = myConfig.baseUrl;
    console.log('prod webpack.config.js NODE_ENV ' + NODE_ENV);

    return Object.assign({
                             entry: './src/main.js',
                             output: {
                                 path: __dirname + '/output',
                                 filename: './bundle.js',
                                 library: 'home'
                             },
                             watch: false,
                             devtool: 'source-map',

                             plugins: [
                                 new webpack.DefinePlugin({
                                                              'process.env': {
                                                                  NODE_ENV: JSON.stringify(NODE_ENV),
                                                                  baseUrl: JSON.stringify(baseUrl)
                                                              }
                                                          })
                             ],

                             module: {
                                 loaders: [
                                     {
                                         test: /\.css$/,
                                         use: ['style-loader', 'css-loader']
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
                                 rules: []
                             }
                         });
}

module.exports.getProductionEnv = getProductionEnv;
module.exports.getDevelopmentEnv = getDevelopmentEnv;
module.exports.default = getDevelopmentEnv('development');