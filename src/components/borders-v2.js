'use strict';

var Handsontable = require('handsontable');

var sprintf = require('sprintf-js').sprintf;
var Utils = require('../utils');
var Http = require('../http');

var exports = module.exports = {};

exports.showBordersV2 = function (firstMarketName, secondMarketName, baseUrl) {
    const MAIN_BORDERS_URL = baseUrl + '/borders/';
    const BORDERS_TABLES_URL = baseUrl + '/borders/tables';

    let myData = Handsontable.helper.createSpreadsheetData(2, 2);

    function extractTableData(tableData, elementId) {
        return tableData
            .find(el => el.borderName === elementId)
            .borderItemList
            .map(el => Utils.objectToArray(el));
    }

    function updateTable(table, elementId, callback) {
        Http.httpAsyncGet(BORDERS_TABLES_URL, function(rawData) {
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
        Http.httpAsyncPost(BORDERS_TABLES_URL, requestData, callback);
    }

    function firstRowRenderer(instance, td, row, col, prop, value, cellProperties) {
        Handsontable.renderers.TextRenderer.apply(this, arguments);
        if (instance.getData()[row][0] === 0) {
            td.style.color = 'grey';
        }
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
            contextMenu: true,
            cells: function (row, col, prop) {
                var cellProperties = {};

                cellProperties.renderer = firstRowRenderer; // uses function directly

                return cellProperties;
            }
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

    Http.httpAsyncGet(MAIN_BORDERS_URL, function(rawData) {
        let borderData = JSON.parse(rawData);
        createVerDropdown(borderData.activeVersion, baseUrl);
        createPosModeDropdown(borderData.posMode, baseUrl);

        let tableData = borderData.bordersV2.borderTableList;
        b_br_close.loadData(extractTableData(tableData, 'b_br_close'));
        b_br_open.loadData(extractTableData(tableData, 'b_br_open'));
        o_br_close.loadData(extractTableData(tableData, 'o_br_close'));
        o_br_open.loadData(extractTableData(tableData, 'o_br_open'));
    });
};

function createVerDropdown(ver, baseUrl) {
    var container = document.getElementById("select-border-version");

    var select = document.createElement('select');
    var option1 = document.createElement('option');
    var option2 = document.createElement('option');
    option1.setAttribute("value", "V1");
    option2.setAttribute("value", "V2");
    option1.innerHTML = 'V1';
    option2.innerHTML = 'V2';
    select.appendChild(option1);
    select.appendChild(option2);
    select.addEventListener("change", onVerPick);
    select.value = ver;

    container.appendChild(select);

    function onVerPick() {
        const requestData = JSON.stringify({version: this.value});

        Http.httpAsyncPost(baseUrl + '/borders/settings',
            requestData, function(result) {
                alert('Result' + result);
            });
    }
}
function createPosModeDropdown(posMode, baseUrl) {
    var container = document.getElementById("select-border-posMode");

    var select = document.createElement('select');
    var option1 = document.createElement('option');
    var option2 = document.createElement('option');
    option1.setAttribute("value", "OK_MODE");
    option2.setAttribute("value", "BTM_MODE");
    option1.innerHTML = 'OK_MODE';
    option2.innerHTML = 'BTM_MODE';
    select.appendChild(option1);
    select.appendChild(option2);
    select.addEventListener("change", onPosModePick);
    select.value = posMode !== 'undefined' ? posMode : 'OK_MODE';

    container.appendChild(select);

    function onPosModePick() {
        const requestData = JSON.stringify({posMode: this.value});

        Http.httpAsyncPost(baseUrl + '/borders/settings',
            requestData, function(result) {
                alert('Result' + result);
            });
    }
}