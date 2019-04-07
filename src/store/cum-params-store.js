'use strict';
import {observable, toJS} from 'mobx';

export const setCumParams = function (data) {
    cumParams.cumParamsArr = data;

    console.log('cumParams: (see nextLine)');
    console.log(toJS(cumParams));
};

export const cumParams = observable({
    selectedTimeType: {
        TOTAL: 'COMMON',
        CURRENT: 'COMMON',
        VOLATILE: 'COMMON'
    },
    cumParamsArr: [],
});

export function getOneCumParams(cumParams, cumType, cumTimeType) {
    let res = {};
    for (const p of cumParams.cumParamsArr) {
        if (p.cumType === cumType && p.cumTimeType === cumTimeType) {
            // console.log('FOUND ' + p.cumType + ' ' + p.cumTimeType);
            res = p;
        }
    }
    return res;
}
