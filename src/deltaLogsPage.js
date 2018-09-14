var $ = require('jquery');
global.jQuery = require('jquery');
var $Tree = require('jquery-treetable');
var Handsontable = require('handsontable');
var sprintf = require('sprintf-js').sprintf;
var Utils = require('./utils');
var Http = require('./http');

var exports = module.exports = {};

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

        let $table = $('#logs-table');
        $table = $('<table/>');
        $table.prop('id', 'logs-table');
        $table.addClass('treetable');

        const $caption = $('<caption/>');
        $table.append($caption);
        $caption.append($('<a/>').text('Expand all')
        // .css("fontSize", "14px")
        .attr('href', window.location.hash)
        .click(function () {
            $table.treetable('expandAll');
        }));
        $caption.append($('<span/>').text(' '));
        $caption.append($('<a/>').text('Collapse all')
        .css("fontSize", "14px")
        .attr('href', window.location.hash)
        .click(function () {
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
            $tbody.append(sprintf('<tr data-tt-id="%s"><td>%s</td><td>%s</td><td>%s</td><td>logs(%s); delta=%s; status=%s</td></tr>',
                    rowNum,
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

                $tbody.append(sprintf('<tr data-tt-id="%s" data-tt-parent-id="%s"><td title="%s">%s</td><td>%s</td><td>%s</td><td>%s</td></tr>',
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

    function refreshTable() {
        Http.httpAsyncGet(URL, function (rawData) {
            const jsonData = JSON.parse(rawData);
            reCreateTable(jsonData);
        });
    }

    const $refreshBtn = $('<button/>').text('Refresh').click(() => refreshTable());
    mainContainer.append($refreshBtn);

    refreshTable();

};