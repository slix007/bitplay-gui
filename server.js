var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');

const NODE_ENV = process.env.NODE_ENV || 'development';
const isDeveloping = NODE_ENV === 'development';
const port = 8081;

console.log('server.js ' + NODE_ENV);

if (isDeveloping) {
    const webpack = require('webpack');
    const webpackConfig = require('./webpack.config.js').getDevelopmentEnv('development');
    webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin())

    const webpackMiddleware = require('webpack-dev-middleware');
    const webpackHotMiddleware = require('webpack-hot-middleware');

    const compiler = webpack(webpackConfig);
    const middleware = webpackMiddleware(compiler, {
        publicPath: webpackConfig.output.publicPath,
        contentBase: 'src',
        stats: {
            colors: true,
            hash: false,
            timings: true,
            chunks: false,
            chunkModules: false,
            modules: false
        }
    });

    app.use(middleware);
    app.use(webpackHotMiddleware(compiler));
    app.get('/', function response(req, res,next) {
        if(req.url == '/') {
            res.sendFile(path.join(__dirname,'output/index.html'));
            return;
        }
        if(req.url == '/index2.html') {
            res.sendFile(path.join(__dirname,'output/index2.html'));
            return;
        }
        next();
    });
    app.use(express.static(__dirname + '/output'));

    // app.get('*', function response(req, res) {
    //     res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'output/index.html')));
    //     res.end();
    // });
} else {
    app.use(express.static(__dirname + '/output'));
    app.get('/', function response(req, res) {
        res.sendFile(path.join(__dirname, 'output/index.html'));
    });
    app.get('/index2.html', function response(req, res) {
        res.sendFile(path.join(__dirname, 'output/index2.html'));
    });
}

app.listen(port, '0.0.0.0', function onStart(err) {
    if (err) {
        console.log(err);
    }
    console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});