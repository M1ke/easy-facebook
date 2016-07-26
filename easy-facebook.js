// DEV we need to upgrade this to function() scope, remove use of prototype and use as singleton object
/* @include ../js-utils/function-q.js */

var easyFacebook = (function(){
	var singleton = {};

	var _url = ''
		,_user = 0
		,_fbLoginOptions = {scope:'email'}
		,_classLoggedIn = 'logged-in'
		,_loginEl = 'a.fb-login'
		,_textLoggedIn = 'Logged in with Facebook'
		,_loginOnInit = false
		,_initFunctions = new functionQ;

	function _setLoginEl(setLoginEl){
		_loginEl = setLoginEl;
	}

	function _setInit(init){
		_loginOnInit = init;
	}

	function _addToInit(fn){
		_initFunctions.wrap(fn, singleton);
	}

	function _init(){
		_initFunctions.run();
		if (_loginOnInit){
			_onClickLogin();
			_getLogin();
		}
	}

	function _onClickLogin(el){
		el || (el = _loginEl);
		$('body').on('click', el, _click_LoginEvent);
	}

	function _clickLogin($link){
		$link.click(_click_LoginEvent);
	}

	function _click_LoginEvent(event){
		event.preventDefault();
		$(this).html('Connecting&hellip;');
		_fbLogin($(this));
	}

	function _fbLogin($link, rerequest){
		_fbLoginBase(singleton.userLoggedIn, singleton.userNotLoggedIn, $link, rerequest);
	}

	function _fbLoginBase(done, fail, $link, rerequest){
		var options = _fbLoginOptions;
		if (rerequest){
			// set auth_type as string rerequest to indicate that re-asking user for (what may be) previously declined permissions
			options.auth_type = 'rerequest';
		}
		FB && FB.login(function(response){
			if (response.status=='connected'){
				done(response.authResponse.accessToken, $link);
			}
			else {
				fail(response.status, $link);
			}
		}, options);
	}

	function _dialog(request, callback){
		FB && FB.ui(request, function(response){
			callback && callback.call(null, response);
		});
	}

	function _getLoginStatus(opts){
		opts.scope || (opts.scope = _fbLoginOptions.scope);
		FB && FB.getLoginStatus(function(response){
			if (response.status!=='connected'){
				opts.fail && opts.fail();
				return false;
			}
			_checkPermissions(opts);
		});
	}

	function _getLogin(){
		_getLoginStatus({
			done: singleton.userLoggedIn
			,fail: _fbLogin
		});
	}

	function _checkPermissions(opts){
		var scope = opts.scope;
		FB && FB.api('me/permissions', function(response){
			var item;
			for (var i=0; i<response.data.length; i++){
				item = response.data[i];
				if (item.status=='granted'){
					scope = scope.replace(item.permission, '');
				}
			}
			if (scope.replace(/,/g, '').length>0){
				opts.fail();
			}
			else {
				opts.done(FB.getAccessToken());
			}
		});
	}

	function _feed(link, caption, paramsOrCallback, callback){
		switch (typeof paramsOrCallback){
			case 'function':
				callback = paramsOrCallback;
				params = {};
			break;
			case 'object':
				params = paramsOrCallback;
			break;
			default:
				params = {};
		}
		params = $.extend({
			method: 'feed'
			,link: link
			,caption: caption
			,picture: null
			,source: null
			,name: null
			,description: null
			,properties: null
			,actions: null
			,ref: null
		}, params);
		_dialog(params, callback);
	}

	function _send(link, callback){
		var params = {
			method: 'send'
			,link: link
		}
		_dialog(params, callback);
	}

	function _share(href, callback){
		var params = {
			method: 'share'
			,href: href
		}
		_dialog(params, callback);
	}

	function _setScope(scope){
		if (typeof scope!='string'){
			scope = scope.join(',');
		}
		_fbLoginOptions.scope = scope;
	}

	function _appendScope(scope){
		if (typeof scope!='string'){
			scope = scope.join(',');
		}
		if (scope[0]!==','){
			scope = ','+scope;
		}
		_fbLoginOptions.scope += scope;
	}

	function _getScope(){
		return _fbLoginOptions.scope;
	}

	singleton = {
		getScope: _getScope
		,setScope: _setScope
		,appendScope: _appendScope
		,init: _init
		,setLoginEl: _setLoginEl
		,setInit: _setInit
		,clickLogin: _clickLogin
		,click_Event: _click_LoginEvent
		,dialog: _dialog
		,feed: _feed
		,send: _send
		,share: _share
		,getLogin: _getLoginStatus
		,login: _fbLogin
		,loginBase: _fbLoginBase
		,onClickLogin: _onClickLogin
		,userLoggedIn: function(token, $link){

		}
		,userNotLoggedIn: function(status, $link){

		}
		,friendRequest: function(){
			throw "The friendRequest method is no longer available";
		}
		,loginEl: _loginEl
	};

	return singleton;
})();
