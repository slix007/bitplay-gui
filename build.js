'use strict';

const
  clc = require('cli-color'),
  webpack = require('webpack'),
  argv = require('yargs').argv,
  envName = argv._[0] || 'production',
  config = require('./webpack.config.js').getProductionEnv(envName);
  // config = require('./webpack.config.js').getDevelopmentEnv(envName);

console.log(clc.bold('BUILD ', clc.green(envName)));
// console.table(APP_CONFIG);

webpack(config).run((err, stats)=>{
  if (!err){
    console.log(stats.toString({
      colors: true,
      assets: false,
      chunks: true,
      chunkModules: false
    }))
  }

  if (err || stats.hasErrors()) {
    throw "webpack build failed";
  }
});
