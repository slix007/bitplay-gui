'use strict';

let $ = require('jquery');
let sprintf = require('sprintf-js').sprintf;

let userInfo = require('./userInfo');
let tableVar = require('./table');
let httpVar = require('./http');
let bordersVar = require('./components/borders-v2');
let swapVar = require('./components/swap-v2');
let settingsVar = require('./components/settings');
let orderActionVar = require('./components/order-actions');
let placingBlocksVar = require('./components/placing-blocks');
let corrReset = require('./components/correction');
let deltaLogsPage = require('./deltaLogsPage');

// let firstMarketName = document.getElementById('first-market-name');
// var firstMarketName = document.getElementsByTagName("title")[0];

let portNumber = "4031";
//TODO
// if (firstMarketName !== null) {
//     portNumber = "4031";
// }

// let baseUrlWithPort = sprintf('%s:%s', process.env.baseUrl, portNumber);
// let baseUrlWithPort = 'http://664-vuld.fplay.io:4031';
let baseUrlWithPort = sprintf('http://%s:%s', window.location.hostname, portNumber);
let theUrl = sprintf('%s/market/list', baseUrlWithPort);
console.log('baseUrlWithPort:' + baseUrlWithPort);
console.log('theUrl:' + theUrl);
console.log('NODE_ENV ' + process.env.NODE_ENV);


function getCurrentTabName() {
    const hash = window.location.hash;
    let tabName = '#tab1';
    if (hash.length > 1) {
        tabName = hash;
    }
    return tabName;
}

const afterLoginFunc = function (isAuthorized) {
    // baseUrl = baseUrlWithPort;
    if (isAuthorized) {
        httpVar.httpAsyncGet(theUrl, function (response) {
            console.log(response);
            let parsedResp = JSON.parse(response);
            console.log('first market=' + parsedResp.first);

            function fillMainPage(parsedResp) {
                $('#bitmex-contract-type-label').text(sprintf('(1 contract = $1)[%s]', parsedResp.firstFutureContractName));
                const okCt = parsedResp.secondFutureContractName;

                $('#okex-contract-type-label').text(sprintf('(1 contract = $%s)[%s]',
                        okCt.startsWith('BTC') ? '100' : '10',
                        okCt));

                tableVar.showMainInfo(parsedResp.first, parsedResp.second, baseUrlWithPort);
                settingsVar.showArbVersion(parsedResp.first, parsedResp.second, baseUrlWithPort);
                bordersVar.showBordersV2(baseUrlWithPort);
                swapVar.showSwapV2(parsedResp.first, parsedResp.second, baseUrlWithPort);
                orderActionVar.showOrderActions(parsedResp.first, parsedResp.second, baseUrlWithPort);
            }

            function fillDeltaLogPage(parsedResp) {
                deltaLogsPage.showDeltaLogs(parsedResp.first, parsedResp.second, baseUrlWithPort);
            }

            fillMainPage(parsedResp);
            fillDeltaLogPage(parsedResp);
        }, function (errorResp) {
            console.log(errorResp);

        });

        if (process.env.NODE_ENV == 'development') {
            console.log('Hello from Webpack');
        }
    }
};

const registerRoutes = function pages(e) {
        'use strict';

        function showPage(el) {
            var tab = document.querySelector(el.getAttribute('href'));

            // remove "act" class
            document.querySelector('#tabNav .act').classList.remove('act');
            document.querySelector('#tabsWrap .act').classList.remove('act');

            // set "act"
            el.classList.add('act');
            tab.classList.add('act');
        }

        function tabListeners() {
            var list = document.querySelectorAll('#tabNav a');
            list = Array.prototype.slice.call(list, 0); // convert nodeList to Array
            list.forEach(function (el, i, ar) {
                el.addEventListener('click', function (event) {
                    e.preventDefault();
                    showPage(el);
                });
            });
        }

        function showCurrentPage() {
            const tabName = getCurrentTabName();
            const selector = '#tabNav a[href="' + tabName + '"]';
            let el = document.querySelector(selector);
            showPage(el);
        }

        tabListeners();
        showCurrentPage();
    // });
};

// $(document).ready(function (e) {
document.addEventListener('DOMContentLoaded', function (e) {


    placingBlocksVar.showPlacingBlocksVersion(baseUrlWithPort);
    corrReset.showCorr(baseUrlWithPort);


    registerRoutes(e);

    userInfo.fillUserInfo(baseUrlWithPort, afterLoginFunc);

});