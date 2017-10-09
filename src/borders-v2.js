'use strict';

var Handsontable = require('handsontable');

var sprintf = require('sprintf-js').sprintf;
var Utils = require('./utils');
var Http = require('./http');

var exports = module.exports = {};

exports.showBordersV2 = function (firstMarketName, secondMarketName, baseUrl) {
    const BORDERS_URL = baseUrl + '/borders/tables';

    let myData = Handsontable.helper.createSpreadsheetData(2, 2);

    function extractTableData(tableData, elementId) {
        return tableData
            .find(el => el.borderName === elementId)
            .borderItemList
            .map(el => Utils.objectToArray(el));
    }

    function updateTable(table, elementId, callback) {
        Http.httpAsyncGet(BORDERS_URL, function(rawData) {
            let tableData = JSON.parse(rawData);
            let updatedData = extractTableData(tableData, elementId);
            table.loadData(updatedData);
            callback(updatedData);
        });
    }

    function saveTable(table, elementId, callback) {
        function generateRequest(data) {
            let borderItemList = data.map(el => {
                let item = {};
                item.id = el[0];
                item.value = el[1];
                item.posLongLimit = el[2];
                item.posShortLimit = el[3];
                return item;
            });
            return [{
                borderName: elementId,
                borderItemList: borderItemList
            }];

        }
        let data = table.getData();
        const requestData = JSON.stringify(generateRequest(data));
        // console.log(requestData);
        Http.httpAsyncPost(BORDERS_URL, requestData, callback);
    }

    function createTable(container, dataUrl, dataPartName) {
        return new Handsontable(container, {
            data: myData, //fetchBorderTables(dataUrl, dataPartName),
            colWidths: [40, 40, 110, 110],
            rowHeaders: false,
            colHeaders: ['id', 'value', 'pos_long_limit', 'pos_short_limit'],
            fixedRowsTop: 1,
            fixedColumnsLeft: 1,
            fixedRowsBottom: 1,
            manualColumnResize: true,
            columnSorting: true,
            sortIndicator: true,
            autoColumnSize: {
                samplingRatio: 23
            },
            contextMenu: true
        });
    }

    function createBorderTable(elementId) {
        var table = document.createElement('div');
        var theTableRef = createTable(table, baseUrl + '/borders/list', elementId);

        var updateBtn = document.createElement('button');
        updateBtn.setAttribute('id', 'update_' + elementId);
        updateBtn.innerHTML = 'update ' + elementId;
        updateBtn.onclick = function() {
            updateTable(theTableRef, elementId, function(result) {
                alert('Result: ' + result);
            });
        };

        var saveBtn = document.createElement('button');
        saveBtn.setAttribute('id', 'save_' + elementId);
        saveBtn.innerHTML = 'save ' + elementId;
        saveBtn.onclick = function() {
            saveTable(theTableRef, elementId, function(result) {
                alert('Result: ' + result);
            });
        };

        var container = document.getElementById(elementId);
        container.appendChild(updateBtn);
        container.appendChild(saveBtn);
        container.appendChild(table);

        return theTableRef;
    }

    var b_br_close = createBorderTable('b_br_close');
    var b_br_open = createBorderTable('b_br_open');
    var o_br_close = createBorderTable('o_br_close');
    var o_br_open = createBorderTable('o_br_open');

    Http.httpAsyncGet(BORDERS_URL, function(rawData) {
        let tableData = JSON.parse(rawData);
        b_br_close.loadData(extractTableData(tableData, 'b_br_close'));
        b_br_open.loadData(extractTableData(tableData, 'b_br_open'));
        o_br_close.loadData(extractTableData(tableData, 'o_br_close'));
        o_br_open.loadData(extractTableData(tableData, 'o_br_open'));
    });
};
