var easyFacebook=function(init,loginEl){
	this.url='';
	this.user=0;
	this.fbLoginOptions={scope:'email'};
	this.classLoggedIn='logged-in';
	this.loginEl=loginEl ? loginEl : 'a.fb-login';
	this.textLoggedIn='Logged in with Facebook';
	if (init){
		this.onClickLogin();
		this.getLoginStatus();
	}
};
easyFacebook.prototype.onClickLogin=function(){
	$(document).on('click',this.loginEl,{self:this},this.clickLoginEvent);
};
easyFacebook.prototype.clickLogin=function($link){
	$link.click({self:this},this.clickLoginEvent);
};
easyFacebook.prototype.clickLoginEvent=function(e){
	e.preventDefault();
	$(this).html('Connecting to Facebook&hellip;');
	e.data.self.fbLogin($(this));
};
easyFacebook.prototype.dialog=function(request,callback){
	var self=this;
	FB.ui(request,function(response){
		callback.call(self,response);
	});
};
easyFacebook.prototype.fbLogin=function($link){
	var self=this;
	FB.login(function(response){
		if (response.status=='connected'){
			self.userLoggedIn($link);
		}
		else {
			self.userNotLoggedIn($link);
		}
	},this.fbLoginOptions);
};
easyFacebook.prototype.friendRequest=function(details,callback){
	// message
	details=$.extend(this.requestDefaults,details);
	details.method='apprequests';
	this.dialog(details,callback);
};
easyFacebook.prototype.getLoginStatus=function(){
	var self=this;
	FB.getLoginStatus(function(response){
		if (response.status==='connected'){
			FB.api('me/permissions',function(response){
				var perms=self.fbLoginOptions.scope.split(',');
				var allPerms=true;
				for (i=0;i<perms.length;i++){
					if (!response.data[0][perms[i]]){
						allPerms=false;
					}
				}
				if (!allPerms){
					self.fbLogin();
				}
				else {
					self.userLoggedIn();
				}
			});
		}
	});
};
easyFacebook.prototype.share=function(url,callback){
	var params={
		href:url,
		method:'share'
	}
	this.dialog(params,callback);
};
// DEPRECATED
easyFacebook.prototype.postToFeed=function(post,callback){
	this.share(post,callback);
};
easyFacebook.prototype.userLoggedIn=function(){
	$(this.loginEl).parent().html(this.textLoggedIn).addClass(this.classLoggedIn);
	$('.fb-app').fadeIn().trigger('fb-login');
};
easyFacebook.prototype.userNotLoggedIn=function($link){
	$link.text('Please try again');
};

/* HOW TO USE

var fbYourApp=function(){
	easyFacebook.call(this,true);
};
fbYourApp.prototype=new easyFacebook();
fbYourApp.prototype.constructor=fbYourApp;

// Alter the .prototype.userLoggedIn and .prototype.userNotLoggedIn functions to change log in

fbFunctionQ.push(function(){
	if (!window.fbYourAppObject){
		window.fbYourAppObject=new fbYourApp();
	}
});
*/