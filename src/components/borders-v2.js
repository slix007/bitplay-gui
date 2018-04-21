'use strict';

var Handsontable = require('handsontable');

var sprintf = require('sprintf-js').sprintf;
var Utils = require('../utils');
var Http = require('../http');
let bordersUtils = require('./comp/borders-utils');
let bordersMainSettingsComp = require('./comp/borders-main-settings');

let borderTableHashCode = 0;
let BASE_URL = '';
let b_br_close;
let b_br_open;
let o_br_close;
let o_br_open;

var exports = module.exports = {};

exports.updateTableHash = function (newHashCode) {
    if (newHashCode != borderTableHashCode) {
        borderTableHashCode = newHashCode;

        // update tables
        const BORDERS_TABLES_URL = BASE_URL + '/borders/tables';
        updateAllTables(BORDERS_TABLES_URL, function(result) {
            console.log('updated' + result.reduce((sum,item) => sum + item.borderName + ',', ' '));
        });
        updateAutoBaseLvl();
    }
};

function updateAutoBaseLvl() {
    const MAIN_BORDERS_URL = BASE_URL + '/borders/';

    Http.httpAsyncGet(MAIN_BORDERS_URL, function (rawData) {
        let borderParams = JSON.parse(rawData);
        document.getElementById('autoBaseLvl').checked = borderParams.bordersV2.autoBaseLvl;
        document.getElementById('baseLvlCnt-span').innerHTML = borderParams.bordersV2.baseLvlCnt;
        document.getElementById('baseLvlType-select').value = borderParams.bordersV2.baseLvlType;

        console.log('borderParams.bordersV2');
        console.log(borderParams.bordersV2);
    });
}

function updateAllTables(BORDERS_TABLES_URL, callback) {
    Http.httpAsyncGet(BORDERS_TABLES_URL, function(rawData) {
        let tableData = JSON.parse(rawData);

        b_br_close.loadData(extractTableData(tableData, 'b_br_close'));
        b_br_open.loadData(extractTableData(tableData, 'b_br_open'));
        o_br_close.loadData(extractTableData(tableData, 'o_br_close'));
        o_br_open.loadData(extractTableData(tableData, 'o_br_open'));

        callback(tableData);
    });
}

function extractTableData(tableData, elementId) {
    return tableData
        .find(el => el.borderName === elementId)
        .borderItemList
        .map(el => Utils.objectToArray(el));
}

exports.showBordersV2 = function (baseUrl) {
    BASE_URL = baseUrl;
    const MAIN_BORDERS_URL = baseUrl + '/borders/';
    const BORDERS_TABLES_URL = baseUrl + '/borders/tables';
    const BORDERS_SETTINGS_URL = baseUrl + '/borders/settings';
    const BORDERS_SETTINGS_V2_URL = baseUrl + '/borders/settingsV2';

    let myData = Handsontable.helper.createSpreadsheetData(2, 2);

    function saveAllTables(callback) {
        function generateRequest(data, elementId) {
            let borderItemList = data.map(el => {
                let item = {};
                item.id = el[0];
                item.value = el[1];
                item.posLongLimit = el[2];
                item.posShortLimit = el[3];
                return item;
            });
            return {
                borderName: elementId,
                borderItemList: borderItemList
            };
        }

        const b_br_closeData = generateRequest(b_br_close.getData(), 'b_br_close');
        const b_br_openData = generateRequest(b_br_open.getData(), 'b_br_open');
        const o_br_closeData = generateRequest(o_br_close.getData(), 'o_br_close');
        const o_br_openData = generateRequest(o_br_open.getData(), 'o_br_open');
        const requestData = JSON.stringify([b_br_closeData, b_br_openData, o_br_closeData, o_br_openData]);

        // console.log(requestData);
        Http.httpAsyncPost(BORDERS_TABLES_URL, requestData, callback);
    }

    let updateSaveButtons = function () {
        const showResult = function (result) {
            alert('Result: ' + result);
        };

        var updateBtn = document.createElement('button');
        updateBtn.innerHTML = 'reload all tables';
        updateBtn.onclick = function () {
            // update tables
            updateAllTables(BORDERS_TABLES_URL, function (result) {
                console.log('reload:');
                console.log(result);
            });
        };

        var saveBtn = document.createElement('button');
        saveBtn.innerHTML = 'save all tables';
        saveBtn.onclick = function () {
            saveAllTables(showResult);
        };

        var container = document.getElementById('border-buttons');
        container.appendChild(updateBtn);
        container.appendChild(saveBtn);
    };
    updateSaveButtons();

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

        var container = document.getElementById(elementId);

        var label = document.createElement('div');
        label.innerHTML = elementId;
        container.appendChild(label);
        container.appendChild(table);

        return theTableRef;
    }

    b_br_close = createBorderTable('b_br_close');
    b_br_open = createBorderTable('b_br_open');
    o_br_close = createBorderTable('o_br_close');
    o_br_open = createBorderTable('o_br_open');

    Http.httpAsyncGet(MAIN_BORDERS_URL, function(rawData) {
        let borderData = JSON.parse(rawData);
        borderTableHashCode = borderData.bordersV2.borderTableHashCode;

        bordersMainSettingsComp.repaint(borderData, BORDERS_SETTINGS_URL);


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

        container.appendChild(document.createElement('br'));
        container.appendChild(document.createElement('br'));
        const label4 = document.createElement('div');
        label4.innerHTML = 'recalc params:';
        container.appendChild(label4);

        createNumberParam(container, borderData.bordersV2, BORDERS_SETTINGS_V2_URL, 'step');
        createNumberParam(container, borderData.bordersV2, BORDERS_SETTINGS_V2_URL, 'gapStep');
        createNumberParam(container, borderData.bordersV2, BORDERS_SETTINGS_V2_URL, 'maxLvl');
        createNumberParam(container, borderData.bordersV2, BORDERS_SETTINGS_V2_URL, 'bAddDelta');
        createNumberParam(container, borderData.bordersV2, BORDERS_SETTINGS_V2_URL, 'okAddDelta');

        // --- autoBaseLvl
        const autoContainer = document.createElement('div');
        autoContainer.style.border = "solid #555555";
        container.appendChild(autoContainer);
        createCheckBox(autoContainer, borderData.bordersV2, BORDERS_SETTINGS_V2_URL, 'auto');
        createNumberParam(autoContainer, borderData.bordersV2, BORDERS_SETTINGS_V2_URL, 'baseLvlCnt');
        createBaseLvlTypeDropdown(autoContainer, borderData.bordersV2, BORDERS_SETTINGS_V2_URL, 'baseLvlType');
        autoBaseLvlChanged();
        // autoBaseLvl ---

        container.appendChild(document.createElement('br'));

        let tableData = borderData.bordersV2.borderTableList;
        b_br_close.loadData(extractTableData(tableData, 'b_br_close'));
        b_br_open.loadData(extractTableData(tableData, 'b_br_open'));
        o_br_close.loadData(extractTableData(tableData, 'o_br_close'));
        o_br_open.loadData(extractTableData(tableData, 'o_br_open'));
    });
};

function createCheckBox(container, bordersV2, BORDERS_SETTINGS_V2_URL) {
    let checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.checked = bordersV2.autoBaseLvl;
    checkbox.id = "autoBaseLvl";
    checkbox.onchange = function (ev) {
        container.disabled = true;
        saveParamAsBoolean(BORDERS_SETTINGS_V2_URL, 'autoBaseLvl', checkbox.checked, autoBaseLvlChanged);
    };

    let label = document.createElement('label');
    label.appendChild(document.createTextNode('auto'));

    container.appendChild(checkbox);
    container.appendChild(label);
}

function autoBaseLvlChanged() {
    function disableChildren(obj) {
        obj.childNodes.forEach(function(val) {
            // val.style.color = 'grey';
            val.disabled = true;
        });
    }
    function enableChildren(obj) {
        obj.childNodes.forEach(function(val) {
            // val.style.color = 'black';
            val.disabled = false;
        });
    }
    if (document.getElementById('autoBaseLvl').checked) {
        disableChildren(document.getElementById('baseLvlCnt'));
        disableChildren(document.getElementById('baseLvlType'));
    } else {
        enableChildren(document.getElementById('baseLvlCnt'));
        enableChildren(document.getElementById('baseLvlType'));
    }
}


function saveParamAsBoolean(BORDERS_SETTINGS_V2_URL, key, value, callback) {
    let reqObj = {};
    reqObj[key] = value;
    const requestData = JSON.stringify(reqObj);
    Http.httpAsyncPost(BORDERS_SETTINGS_V2_URL,
                       requestData, function (rawRes) {
            // const res = JSON.parse(rawRes);
            console.log(rawRes);
            callback();
            // alert(rawRes);
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
        bordersUtils.saveParamAsNumber(BORDERS_SETTINGS_URL, 'borderV1SumDelta', edit.value, resultLabel, setBtn);
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
        bordersUtils.saveBordersSettings(BORDERS_SETTINGS_URL, 'posMode', this.value, select);
    });
    select.value = posMode !== 'undefined' ? posMode : 'OK_MODE';

    container.appendChild(label);
    container.appendChild(select);
}

function createNumberParam(mainContainer, bordersV2, BORDERS_SETTINGS_V2_URL, elName) {
    var container = document.createElement('div');
    container.setAttribute("id", elName);
    mainContainer.appendChild(container);

    var label = document.createElement('span');
    label.innerHTML = Utils.camelToUnderscore(elName);
    var edit = document.createElement('input');
    edit.style.width = '80px';
    edit.innerHTML = '';
    var resultLabel = document.createElement('span');
    resultLabel.id = elName + '-span';
    resultLabel.innerHTML = bordersV2[elName];
    var setBtn = document.createElement('button');
    setBtn.onclick = function () {
        setBtn.disabled = true;
        bordersUtils.saveParamAsNumber(BORDERS_SETTINGS_V2_URL, elName, edit.value, resultLabel, setBtn);
    };
    setBtn.innerHTML = 'set';

    container.appendChild(label);
    container.appendChild(edit);
    container.appendChild(setBtn);
    container.appendChild(resultLabel);
}

function createBaseLvlTypeDropdown(mainContainer, bordersV2, BORDERS_SETTINGS_V2_URL, elName) {
    var container = document.createElement('div');
    container.setAttribute("id", elName);
    mainContainer.appendChild(container);

    var label = document.createElement('span');
    label.innerHTML = Utils.camelToUnderscore(elName);

    var select = document.createElement('select');
    select.id = 'baseLvlType-select';
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