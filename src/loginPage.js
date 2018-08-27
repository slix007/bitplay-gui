let $ = require('jquery');
let http = require('./http');
let userInfoVar = require('./userInfo');

var exports = module.exports = {};

let baseUrl = '';

exports.loginPage = `
    <div class="login" id="login-form-container">
        <link type="text/css" rel="stylesheet" href="./login.css">
    
        <form class="login" id="login-form">
        
            <div class="box login">
                <h3 class="login">Login is required</h3>
                
                <input id="login-edit" onkeyup="onLoginKeyUp(this)" type="text" value="" placeholder="login" />
                  
                <input id="password-edit" onkeyup="onLoginKeyUp(this)" type="password" value="" placeholder="password" />
                
                <div id="login-error-label"></div>
                  
                <!--<a href="#" onclick="document.getElementById('login-form').submit()"><div class="btn">Sign In</div></a> &lt;!&ndash; End Btn &ndash;&gt;-->
                <!--<a href="#" onclick="onLoginSubmit()"><div class="btn">Sign In</div></a>-->
                <button onclick="onLoginSubmit()" class="btn">Sign In</button>
                
                
            </div> <!-- End Box -->
              
        </form>
        
    </div>
`;

exports.logoutButton = `<button style="float: right;" onclick="onLogout()">Sign out</button>`;

onLoginKeyUp = function () {
    event.preventDefault();
    if (event.keyCode === 13) { // Number 13 is the "Enter" key on the keyboard
        console.log('enter');
        onLoginSubmit();
    }
};

onLogout = function () {
    http.clearAuthCookie();
    window.location.reload(false);
};


onLoginSubmit = function () {
    event.preventDefault();
    const login = $('#login-edit');
    const password = $('#password-edit');

    console.log('on login ' + login.val() + ':' + password.val());

    const URL = baseUrl + '/api/auth';
    data = {
        'username': login.val(),
        'password': password.val()
    };

    console.log(data);
    const requestData = JSON.stringify(data);

    http.httpAsyncPost(URL, requestData, function (rawResp) {
        const resp = JSON.parse(rawResp);
        console.log(resp);

        http.setAuthCookie(resp.xAuthString);

        hideCover();

        window.location.reload(false);
    });

};

exports.showLoginPage = function (baseUrlVar) {
    baseUrl = baseUrlVar;

    showCover();

    var container = document.getElementById('login-form-container');
    container.style.display = 'block';
    document.getElementById('login-edit').focus();
};

function showCover() {
    var coverDiv = document.createElement('div');
    coverDiv.id = 'cover-div';
    document.body.appendChild(coverDiv);
}

function hideCover() {
    document.body.removeChild(document.getElementById('cover-div'));
}
