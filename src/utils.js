// var exports = module.exports = {};

exports.toUsd = function(btc, quAvg) {

    return (btc * quAvg).toFixed(2);
};

exports.withSign = function(value) {
    return (value < 0) ? (value) : ('+' + value);
};


function round(number, precision) {
    var pair = (number + 'e').split('e')
    var value = Math.round(pair[0] + 'e' + (+pair[1] + precision))
    pair = (value + 'e').split('e')
    return +(pair[0] + 'e' + (+pair[1] - precision))
}