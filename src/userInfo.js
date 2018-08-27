let loginPage = require('./loginPage');
let http = require('./http');

var exports = module.exports = {};

let logoutPage = '';
let homePage = '';
const HTTP_ERROR = 'HTTP_ERROR';

userInfo = {
    xAuthString: '',
    user: '',
    roles: [],
    details: '',
    isAuthorized: function () {
        return this.user !== undefined
                && this.user.length > 0
                && this.roles.length > 0
                && this.user !== 'unauthorized';
    },
    update: function (anUpdate) {
        this.user = anUpdate.user;
        this.roles = anUpdate.roles;
        this.details = anUpdate.details;
    }
};

exports.fillUserInfo = function (baseUrl, afterLoginFunc) {

    const handleUserInfo = function (resp) {
        let contentDiv = document.getElementById("user-info-div");
        if (resp === HTTP_ERROR || resp.user === 'unauthorized') {
            http.clearAuthCookie();
            contentDiv.innerHTML = loginPage.loginPage; // userInfo[window.location.hash];
            loginPage.showLoginPage(baseUrl);

        } else {
            userInfo.update(resp);
            contentDiv.innerHTML = userInfo.user
                    + ':' + userInfo.roles
                    + loginPage.logoutButton;
            afterLoginFunc(true);
        }
    };

    getUserInfo(baseUrl, handleUserInfo);

};

function getUserInfo(baseUrl, callback) {
    const URL = baseUrl + '/api/user';

    http.httpAsyncGet(URL, function (rawResp) {
        const resp = JSON.parse(rawResp);
        console.log(resp);
        callback(resp);
    }, function (errorHttp) {
        console.log(errorHttp);
        console.log('http response status=' + errorHttp.status + '. Clear credentials');
        callback(HTTP_ERROR);
    });
};
