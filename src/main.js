'use strict';

import { allSettings } from './store/settings-store'

let $ = require('jquery');
let sprintf = require('sprintf-js').sprintf;
var Utils = require('./utils');

let userInfo = require('./userInfo');
let tableVar = require('./table');
let httpVar = require('./http');
let bordersVar = require('./components/borders-v2');
let swapVar = require('./components/swap-v2');
let settingsVar = require('./components/settings');
let orderActionVar = require('./components/order-actions');
let placingBlocksVar = require('./components/placing-blocks');
let posAdjustmentVar = require('./components/pos-adjustment');
let corrReset = require('./components/correction');
let deltaLogsPage = require('./deltaLogsPage');
let settingsStore = require('./store/settings-store');
let settingsPreset = require('./components/settings-preset');
let cumParams = require('./components/cum-params');
let closeAllPos = require('./components/close-all-pos');
let createRecoveryNtUsd = require('./components/recovery-nt-usd');
let marketStates = require('./components/comp/market-states');
let balanceInfo = require('./components/comp/balance-info')

// let portNumber = "4031";

console.log('NODE_ENV=' + process.env.NODE_ENV);
console.log('backendUrl=' + process.env.backendUrl);

// let baseUrlWithPort = sprintf('http://%s:%s', window.location.hostname, portNumber);
let baseUrlWithPort = process.env.backendUrl === 'use-window.location.hostname'
        ? sprintf('http://%s:%s', window.location.hostname, process.env.portNumber)
        : process.env.backendUrl;
let marketsUrl = sprintf('%s/market/list', baseUrlWithPort);
console.log('baseUrlWithPort:' + baseUrlWithPort);
allSettings.SETTINGS_URL = baseUrlWithPort + '/settings/all';


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
        httpVar.httpAsyncGet(marketsUrl, function (response) {
            let parsedResp = JSON.parse(response);
            // $('#left-market-name').text(parsedResp.left);
            // $('#right-market-name').text(parsedResp.right);
            settingsStore.allSettings.marketList = parsedResp

            function fillMainPage(parsedResp) {
                const leftCt = parsedResp.leftFutureContractName
                const rightCt = parsedResp.rightFutureContractName
                // $('#left-contract-type-label').text(leftCt);
                // $('#right-contract-type-label').text(rightCt);
                // $('#left-contract-usd').text(sprintf('(1 contract = $%s)', leftCt.startsWith('BTC') ? '100' : '10'))
                // $('#right-contract-usd').text(sprintf('(1 contract = $%s)', rightCt.startsWith('BTC') ? '100' : '10'))

                tableVar.showMainInfo(baseUrlWithPort);
                settingsVar.showArbVersion(baseUrlWithPort);
                bordersVar.showBordersV2(baseUrlWithPort);
                swapVar.showSwapV2(baseUrlWithPort);
                orderActionVar.showOrderActions(baseUrlWithPort, parsedResp.eth);
                if (!parsedResp.eth) {
                    document.getElementById('left-order-actions-ETH-XBTUSD').style.display = 'none';
                    document.getElementById('right-order-actions-ETH-XBTUSD').style.display = 'none';
                }
            }

            function fillDeltaLogPage () {
                deltaLogsPage.showDeltaLogs(baseUrlWithPort);
            }

            fillMainPage(parsedResp);
            fillDeltaLogPage();
        }, function (errorResp) {
            console.log(errorResp);

        });

        // if (process.env.NODE_ENV == 'development') {
        // console.log('Hello from Webpack');
        // }
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
    Utils.setDocumentTitle();

    placingBlocksVar.showPlacingBlocksVersion(baseUrlWithPort);
    corrReset.showCorr(baseUrlWithPort);
    posAdjustmentVar.show(baseUrlWithPort);
    cumParams.showCumParams(baseUrlWithPort);
    closeAllPos.createCloseAllPos(baseUrlWithPort);
    createRecoveryNtUsd.createRecoveryNtUsd(baseUrlWithPort)
    marketStates.createDqlState()
    marketStates.createSeBestState()
    balanceInfo.showCloseAllPosExtraInfo()

    registerRoutes(e);

    userInfo.fillUserInfo(baseUrlWithPort, afterLoginFunc);

    settingsStore.allSettings.BASE_URL = baseUrlWithPort;
    settingsPreset.showPresets(baseUrlWithPort);
});
