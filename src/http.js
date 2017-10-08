'use strict';

var exports = module.exports = {};

exports.httpGet = function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

exports.httpAsyncGet = function httpAsyncGet(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, true); // false for synchronous request
    xmlHttp.send(null);
    // return xmlHttp.responseText;

    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4) {
            if (xmlHttp.status == 200) {
                callback(xmlHttp.responseText);
            }
        }
    };
};

exports.httpAsyncPost = function httpAsyncPost(theUrl, data, callback, resultElement) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", theUrl, true); // false for synchronous request
    xmlHttp.setRequestHeader("Content-type", "application/json");
    xmlHttp.send(data);

    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4) {
            if (xmlHttp.status == 200) {
                callback(xmlHttp.responseText, resultElement);
            }
        }
    };
};

