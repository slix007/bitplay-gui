'use strict';

var Handsontable = require('handsontable');

var sprintf = require('sprintf-js').sprintf;
var Utils = require('../utils');
var Http = require('../http');

var exports = module.exports = {};

exports.showBordersV2 = function (firstMarketName, secondMarketName, baseUrl) {
    const MAIN_BORDERS_URL = baseUrl + '/borders/';
    const BORDERS_TABLES_URL = baseUrl + '/borders/tables';
    const BORDERS_SETTINGS_URL = baseUrl + '/borders/settings';
    const BORDERS_SETTINGS_V2_URL = baseUrl + '/borders/settingsV2';

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
        createVerDropdown(borderData.activeVersion, BORDERS_SETTINGS_URL);
        createPeriodSec(borderData, BORDERS_SETTINGS_URL);

        // BorderV1
        var container = document.getElementById("borders-v1");
        var label1 = document.createElement('div');
        if (borderData.activeVersion === 'V1') label1.style.fontWeight = 'bold';
        label1.innerHTML = 'BordersV1';
        container.appendChild(label1);
        createBorderV1SumDelta(container, borderData, BORDERS_SETTINGS_URL);

        // BorderV2
        var container = document.getElementById("borders-v2-params");
        var label2 = document.createElement('div');
        if (borderData.activeVersion === 'V2') label2.style.fontWeight = 'bold';
        label2.innerHTML = 'BordersV2:';
        container.appendChild(label2);

        createPosModeDropdown(container, borderData.posMode, BORDERS_SETTINGS_URL);

        createNumberParam(container, borderData.bordersV2, BORDERS_SETTINGS_V2_URL, 'maxLvl');
        createNumberParam(container, borderData.bordersV2, BORDERS_SETTINGS_V2_URL, 'baseLvlCnt');
        createBaseLvlTypeDropdown(container, borderData.bordersV2, BORDERS_SETTINGS_V2_URL, 'baseLvlType');
        createNumberParam(container, borderData.bordersV2, BORDERS_SETTINGS_V2_URL, 'step');
        createNumberParam(container, borderData.bordersV2, BORDERS_SETTINGS_V2_URL, 'gapStep');
        createNumberParam(container, borderData.bordersV2, BORDERS_SETTINGS_V2_URL, 'bAddDelta');
        createNumberParam(container, borderData.bordersV2, BORDERS_SETTINGS_V2_URL, 'okAddDelta');

        container.appendChild(document.createElement('br'));

        let tableData = borderData.bordersV2.borderTableList;
        b_br_close.loadData(extractTableData(tableData, 'b_br_close'));
        b_br_open.loadData(extractTableData(tableData, 'b_br_open'));
        o_br_close.loadData(extractTableData(tableData, 'o_br_close'));
        o_br_open.loadData(extractTableData(tableData, 'o_br_open'));
    });
};

function saveBordersSettings(BORDERS_SETTINGS_URL, key, value, el) {
    let reqObj = {};
    reqObj[key] = value;
    const requestData = JSON.stringify(reqObj);

    Http.httpAsyncPost(BORDERS_SETTINGS_URL,
                       requestData, function (result) {
            alert('Result' + result);
            el.disabled = false;
        });
}

function saveParamAsNumber(BORDERS_SETTINGS_V2_URL, key, value, el, setBtn) {
    let reqObj = {};
    reqObj[key] = Number(value);
    const requestData = JSON.stringify(reqObj);
    Http.httpAsyncPost(BORDERS_SETTINGS_V2_URL,
                       requestData, function (rawRes) {
            const res = JSON.parse(rawRes);
            el.innerHTML = res.result;
            setBtn.disabled = false;
            //alert('Result' + result);
        });
}

function saveParam(BORDERS_SETTINGS_V2_URL, key, value, el) {
    let reqObj = {};
    reqObj[key] = value;
    const requestData = JSON.stringify(reqObj);
    Http.httpAsyncPost(BORDERS_SETTINGS_V2_URL,
                       requestData, function (rawRes) {
            const res = JSON.parse(rawRes);
            el.value = res.result;
            el.disabled = false;
        });
}

function createVerDropdown(ver, BORDERS_SETTINGS_URL) {
    var container = document.getElementById("border-select-version");
    var label = document.createElement('span');
    label.innerHTML = 'Borders version';
    container.appendChild(label);

    var select = document.createElement('select');
    var option1 = document.createElement('option');
    var option2 = document.createElement('option');
    option1.setAttribute("value", "V1");
    option2.setAttribute("value", "V2");
    option1.innerHTML = 'V1';
    option2.innerHTML = 'V2';
    select.appendChild(option1);
    select.appendChild(option2);
    select.addEventListener("change", function () {
        select.disabled = true;
        saveBordersSettings(BORDERS_SETTINGS_URL, 'version', this.value, select);
    });
    select.value = ver;

    container.appendChild(select);
}

function createPeriodSec(borderData, BORDERS_SETTINGS_URL) {
    var container = document.getElementById("border-period-sec");
    var label = document.createElement('span');
    label.innerHTML = 'Recalc period sec';
    container.appendChild(label);
    var edit = document.createElement('input');
    edit.style.width = '80px';
    edit.innerHTML = '';
    var resultLabel = document.createElement('span');
    resultLabel.innerHTML = borderData.recalcPeriodSec;
    var setBtn = document.createElement('button');
    setBtn.onclick = function () {
        setBtn.disabled = true;
        saveParamAsNumber(BORDERS_SETTINGS_URL, 'recalcPeriodSec', edit.value, resultLabel, setBtn);
    };
    setBtn.innerHTML = 'set';

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(setBtn);
    container.appendChild(resultLabel);
}

function createBorderV1SumDelta(container, borderData, BORDERS_SETTINGS_URL) {
    var label = document.createElement('span');
    label.innerHTML = 'sum_delta';
    container.appendChild(label);
    var edit = document.createElement('input');
    edit.style.width = '80px';
    edit.innerHTML = '';
    var resultLabel = document.createElement('span');
    resultLabel.innerHTML = borderData.bordersV1.sumDelta;
    var setBtn = document.createElement('button');
    setBtn.onclick = function () {
        setBtn.disabled = true;
        saveParamAsNumber(BORDERS_SETTINGS_URL, 'borderV1SumDelta', edit.value, resultLabel, setBtn);
    };
    setBtn.innerHTML = 'set';

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(setBtn);
    container.appendChild(resultLabel);
}

function createPosModeDropdown(container, posMode, BORDERS_SETTINGS_URL) {
    var label = document.createElement('span');
    label.innerHTML = 'pos_mode';


    var select = document.createElement('select');
    var option1 = document.createElement('option');
    var option2 = document.createElement('option');
    option1.setAttribute("value", "OK_MODE");
    option2.setAttribute("value", "BTM_MODE");
    option1.innerHTML = 'OK_MODE';
    option2.innerHTML = 'BTM_MODE';
    select.appendChild(option1);
    select.appendChild(option2);
    select.addEventListener("change", function () {
        select.disabled = true;
        saveBordersSettings(BORDERS_SETTINGS_URL, 'posMode', this.value, select);
    });
    select.value = posMode !== 'undefined' ? posMode : 'OK_MODE';

    container.appendChild(label);
    container.appendChild(select);
}

function createNumberParam(mainContainer, bordersV2, BORDERS_SETTINGS_V2_URL, elName) {
    var container = document.createElement('div');
    mainContainer.appendChild(container);

    var label = document.createElement('span');
    label.innerHTML = Utils.camelToUnderscore(elName);
    var edit = document.createElement('input');
    edit.style.width = '80px';
    edit.innerHTML = '';
    var resultLabel = document.createElement('span');
    resultLabel.innerHTML = bordersV2[elName];
    var setBtn = document.createElement('button');
    setBtn.onclick = function () {
        setBtn.disabled = true;
        saveParamAsNumber(BORDERS_SETTINGS_V2_URL, elName, edit.value, resultLabel, setBtn);
    };
    setBtn.innerHTML = 'set';

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(setBtn);
    container.appendChild(resultLabel);
}

function createBaseLvlTypeDropdown(mainContainer, bordersV2, BORDERS_SETTINGS_V2_URL, elName) {
    var container = document.createElement('div');
    mainContainer.appendChild(container);

    var label = document.createElement('span');
    label.innerHTML = Utils.camelToUnderscore(elName);

    var select = document.createElement('select');
    var option1 = document.createElement('option');
    var option2 = document.createElement('option');
    option1.setAttribute("value", "B_OPEN");
    option2.setAttribute("value", "OK_OPEN");
    option1.innerHTML = 'B_OPEN';
    option2.innerHTML = 'OK_OPEN';
    select.appendChild(option1);
    select.appendChild(option2);
    select.addEventListener("change", function () {
        select.disabled = true;
        saveParam(BORDERS_SETTINGS_V2_URL, 'baseLvlType', this.value, select);
    });
    select.value = bordersV2.baseLvlType; // bordersV2.baseLvlType !== 'undefined' ? bordersV2.baseLvlType : 'B_OPEN';

    container.appendChild(label);
    container.appendChild(select);
}