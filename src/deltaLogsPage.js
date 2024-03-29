var $ = require('jquery');
global.jQuery = require('jquery');
var $Tree = require('jquery-treetable');
var Handsontable = require('handsontable');
var sprintf = require('sprintf-js').sprintf;
var Utils = require('./utils');
var Http = require('./http');

var exports = module.exports = {};

function getCurrentDate() {
    var today = new Date();
    return convertDate(today);
}

function getTomorrowDate() {
    var date = new Date();
    date.setDate(date.getDate() + 1);
    return convertDate(date);
}

function convertDate(today) {
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }

    today = sprintf('%s-%s-%s', yyyy, mm, dd);
    return today;
}

exports.showDeltaLogs = function (baseUrl) {

    const URL = sprintf('%s/trade/list', baseUrl)

    const mainContainer = $('div[data-name="deltalogs-page"]')

    // jquery-treetable experiment
    function reCreateTable (trades) {

        $('#logs-table').remove()

        // let $table = $('#logs-table');
        let $table = $('<table/>')
        $table.prop('id', 'logs-table')
        $table.addClass('treetable')

        const $caption = $('<caption/>')
        $table.append($caption)
        $caption.append($('<a/>').text('Expand all').attr('href', window.location.hash).click(function () {
            this.href = window.location.hash;
            $table.treetable('expandAll');
        }));
        $caption.append($('<span/>').text(' '));
        $caption.append($('<a/>').text('Collapse all').attr('href', window.location.hash).click(function () {
            this.href = window.location.hash;
            $table.treetable('collapseAll');
        }));

        const $thead = $('<thead/>');
        $table.append($thead);
        $thead.append('<tr>'
                + '<td>counterName</td>'
                + '<td>logLevel</td>'
                + '<td>timestamp</td>'
                + '<td>theLog</td>'
                + '</tr>');

        const $tbody = $('<tbody/>');
        $tbody.prop('id', 'logs-table-tbody');
        $table.append($tbody);

        mainContainer.append($table);

        let rowNum = 0;

        function getTradingModeStr(tradingMode) {
            if (tradingMode && tradingMode !== 'CURRENT') {
                return ', TradingMode=' +
                        (tradingMode === 'CURRENT_VOLATILE' ? 'current-volatile' : 'volatile');
            }
            return '';
        }

        for (let i = 0; i < trades.length; i++) {
            const trade = trades[i];

            const logsCount = trade.deltaLog.length;
            // const logsStr = JSON.stringify(trade.deltaLog);
            let hasCorr = false;
            let hasAdj = false;
            for (let j = 0; j < logsCount; j++) {
                const theLog = trade.deltaLog[j];
                if (!hasCorr && theLog.theLog.indexOf('_corr') !== -1) {
                    hasCorr = true;
                }
                if (!hasAdj && theLog.theLog.indexOf('_adj') !== -1) {
                    hasAdj = true;
                }
            }
            let corrAdjStr = hasCorr ? ', with corr' : '';
            corrAdjStr += hasAdj ? ', with adj' : '';
            const tradingModeStr = getTradingModeStr(trade.tradingMode);
            $tbody.append(sprintf(
                    '<tr data-tt-id="%s"><td title="trade_id=%s">%s</td><td>%s</td><td>%s</td><td>logs(%s); delta=%s; s=%s(b=%s,o=%s); ct(b=%s,o=%s); placingMaxMs(b=%s,o=%s); %s %s</td></tr>',
                    rowNum,
                    trade.id,
                    trade.counterName,
                    '',
                    trade.startTimestamp,
                    logsCount,
                    trade.deltaName,
                    trade.tradeStatus,
                    !trade.bitmexStatus ? '' : trade.bitmexStatus.toLowerCase(),
                    !trade.okexStatus ? '' : trade.okexStatus.toLowerCase(),
                    trade.bitmexContractType,
                    trade.okexContractType,
                    !trade.fplayTradeMon ? '' : trade.fplayTradeMon.bitmexPlacingMaxMs,
                    !trade.fplayTradeMon ? '' : trade.fplayTradeMon.okexPlacingMaxMs,
                    corrAdjStr,
                    tradingModeStr,
            ));

            let parId = rowNum;
            rowNum++;
            for (let j = 0; j < logsCount; j++) {
                const theLog = trade.deltaLog[j];

                $tbody.append(sprintf('<tr data-tt-id="%s" data-tt-parent-id="%s"><td title="trade_id=%s">%s</td><td>%s</td><td>%s</td><td>%s</td></tr>',
                        rowNum,
                        parId,
                        trade.id,
                        trade.counterName,
                        theLog.logLevel,
                        theLog.timestamp,
                        theLog.theLog
                ));

                rowNum++;
            }
        }

        $table.treetable({expandable: true});
    }

    function refreshTable(from, to) {
        let refreshUrl = URL + '?';
        if (from && from.length > 0) {
            refreshUrl += '&from=' + from;
        }
        if (to && to.length > 0) {
            refreshUrl += '&to=' + to;
        }

        Http.httpAsyncGet(refreshUrl, function (rawData) {
            const jsonData = JSON.parse(rawData);
            reCreateTable(jsonData);
        });
    }

    function createRefreshDiv() {
        const $refreshDiv = $('<div/>');
        $refreshDiv.append($('<span/>').text('From: '));
        const from = $('<input/>').attr('placeholder', 'yyyy-MM-dd').val(getCurrentDate());
        $refreshDiv.append(from);
        $refreshDiv.append($('<span/>').text('To: '));
        const to = $('<input/>').attr('placeholder', 'yyyy-MM-dd').val(getTomorrowDate());

        $refreshDiv.append(to);

        const $refreshBtn = $('<button/>').text('Refresh').click(() =>
                refreshTable(from.val(), to.val()));
        $refreshDiv.append($refreshBtn);

        // refreshTable(from.val(), to.val());

        return $refreshDiv;
    }

    mainContainer.append(createRefreshDiv());


};
