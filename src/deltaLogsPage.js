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

exports.showDeltaLogs = function (firstMarketName, secondMarketName, baseUrl) {

    const URL = sprintf('%s/trade/list', baseUrl);

    const mainContainer = $('div[data-name="deltalogs-page"]');
    // const mainCont = mainContainer.get()[0];
    // let fetchTradeLogs = function (dataUrl) {
    //     let inputData = JSON.parse(Http.httpGet(dataUrl));
    //     return inputData.map(item => item.deltaLog)[0];
    // };
    //
    // function createTable(container, dataUrl) {
    //     return new Handsontable(container, {
    //         data: fetchTradeLogs(dataUrl),
    //         colWidths: [100, 140, 300],
    //         rowHeaders: true,
    //         colHeaders: ['level', 'time', 'details'],
    //         fixedRowsTop: 1,
    //         fixedColumnsLeft: 1,
    //         fixedRowsBottom: 1,
    //         manualColumnResize: true,
    //         columnSorting: true,
    //         sortIndicator: true,
    //         stretchH: 'last',
    //         autoColumnSize: {
    //             samplingRatio: 23
    //         }
    //     });
    // }
    // let tradeTable = createTable(mainCont, URL);
    // tradeTable.loadData(logs);

    // jquery-treetable experiment
    function reCreateTable(trades) {

        $("#logs-table").remove();

        // let $table = $('#logs-table');
        let $table = $('<table/>');
        $table.prop('id', 'logs-table');
        $table.addClass('treetable');

        const $caption = $('<caption/>');
        $table.append($caption);
        $caption.append($('<a/>').text('Expand all').attr('href', window.location.hash).click(function () {
            $table.treetable('expandAll');
        }));
        $caption.append($('<span/>').text(' '));
        $caption.append($('<a/>').text('Collapse all').attr('href', window.location.hash).click(function () {
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
        for (let i = 0; i < trades.length; i++) {
            const trade = trades[i];

            const logsCount = trade.deltaLog.length;
            // const logsStr = JSON.stringify(trade.deltaLog);
            $tbody.append(sprintf('<tr data-tt-id="%s"><td title="trade_id=%s">%s</td><td>%s</td><td>%s</td><td>logs(%s); delta=%s; status=%s</td></tr>',
                    rowNum,
                    trade.id,
                    trade.counterName,
                    '',
                    trade.startTimestamp,
                    logsCount,
                    trade.deltaName,
                    trade.tradeStatus
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

        refreshTable(from.val(), to.val());

        return $refreshDiv;
    }

    mainContainer.append(createRefreshDiv());


};