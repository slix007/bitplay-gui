var express = require('express');
var app = express();
var path = require('path');

const NODE_ENV = process.env.NODE_ENV || 'development';
const isDeveloping = NODE_ENV === 'development';
const port = 8081;

console.log('server.js ' + NODE_ENV);

if (isDeveloping) {
    const webpack = require('webpack');
    const webpackConfig = require('./webpack.config.js').getDevelopmentEnv('development');

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
    app.get('*', function response(req, res) {
        res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'output/index.html')));
        res.end();
    });
} else {
    app.use(express.static(__dirname + '/output'));
    app.get('*', function response(req, res) {
        res.sendFile(path.join(__dirname, 'output/index.html'));
    });
}

app.listen(port, '0.0.0.0', function onStart(err) {
    if (err) {
        console.log(err);
    }
    console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});