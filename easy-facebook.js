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
			_getLoginStatus();
		}
	}

	function _onClickLogin(){
		$(document).on('click', _loginEl, _click_LoginEvent);
	}

	function _clickLogin($link){
		$link.click(_click_LoginEvent);
	}

	function _click_LoginEvent(event){
		event.preventDefault();
		$(this).html('Connecting to Facebook&hellip;');
		_fbLogin($(this));
	}

	function _fbLogin($link){
		FB.login(function(response){
			if (response.status=='connected'){
				singleton.userLoggedIn(response.authResponse.accessToken, $link);
			}
			else {
				singleton.userNotLoggedIn(response.status, $link);
			}
		}, _fbLoginOptions);
	}

	function _dialog(request, callback){
		FB.ui(request, function(response){
			callback && callback.call(null, response);
		});
	}

	function _getLoginStatus(){
		FB.getLoginStatus(function(response){
			if (response.status!=='connected'){
				return false;
			}
			FB.api('me/permissions',function(response){
				var perms = _fbLoginOptions.scope
					,perm;
				for (var i=0; i<response.data.length; i++){
					perm = response.data[i];
					if (perm.status=='granted'){
						perms = perms.replace(perm.permission,'');
					}
				}
				if (perms.replace(/,/g,'').length>0){
					_fbLogin();
				}
				else {
					singleton.userLoggedIn(FB.getAccessToken());
				}
			});
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
			,caption: null
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

	singleton = {
		scope: _fbLoginOptions.scope
		,init: _init
		,setLoginEl: _setLoginEl
		,setInit: _setInit
		,clickLogin: _clickLogin
		,click_Event: _click_LoginEvent
		,dialog: _dialog
		,feed: _feed
		,send: _send
		,share: _share
		,userLoggedIn: function(token, $link){

		}
		,userNotLoggedIn: function(status, $link){

		}
		,friendRequest: function(){
			throw "The friendRequest method is no longer available";
		}
	};

	return singleton;
})();
