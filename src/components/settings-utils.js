'use strict';

import {allSettings} from "../store/settings-store";

export {decorate_b_border, decorate_o_border};

let decorate_b_border = function (lb) {
    decorate_border(lb, allSettings.settingsVolatileMode.baddBorder > 0);
};
let decorate_o_border = function (lb) {
    decorate_border(lb, allSettings.settingsVolatileMode.oaddBorder > 0);
};
let decorate_border = function (lb, isActiveBorder) {
    const isActive = allSettings.tradingModeState.tradingMode === 'VOLATILE'
            && isActiveBorder;
    if (isActive) {
        lb.css('font-weight', 'bold').prop('title', 'Activated VOLATILE mode');
    } else {
        lb.css('font-weight', 'normal').prop('title', '');
    }

};
