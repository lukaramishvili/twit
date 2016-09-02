
// // sudo npm install -g phantomjs-prebuilt
//wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-1.9.7-macosx.zip && unzip phantomjs-*
//or
//wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-1.9.7-linux-x86_64.tar.bz2 && tar -jxvf phantomjs-*
//export PHANTOMJS_EXECUTABLE=/projects/twit/phantomjs-1.9.7-macosx/bin/phantomjs
//sudo npm install -g casperjs

//casperjs --ignore-ssl-errors=true --ssl-protocol=any casper.js --tweet='TWEET_TEXT' --cookies='COOKIES' --username='USERNAME' --password='PASSWORD'

var dir = "/projects/twit/";
var nWaitTimeout = 5000;//same as default

var casper = require('casper').create({
    remoteScripts :  [
//not working; halts casperjs execution
//        'https://code.jquery.com/jquery-3.1.0.min.js'
    ],
    clientScripts :  [
        'jquery-3.1.0.min.js'      // These two scripts will be injected in remote
    ],
    exitOnError : false,
    pageSettings : {
        loadImages  :  false,        // The WebPage instance used by Casper will
        loadPlugins : false,         // use these settings
	userAgent   : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36'
    },
//    stepTimeout : 15000,
    logLevel : "debug",              // Only "info" level messages will be logged
    verbose : true                  // log messages will be printed out to the console
});
var mouse = require("mouse").create(casper);
var utils = require('utils');
var fs = require('fs');

function isset(x){
    return typeof(x) !== "undefined";
};

var username = casper.cli.get('username');
var password = casper.cli.get('password');
var tweet = casper.cli.get('tweet');
var cookies = casper.cli.get('cookies');
//var cookies = username.replace(new RegExp("[^A-Za-z.\\-_]", "gi"), "")

if(!(isset(tweet) && isset(cookies) &&
     //if the cookies file doesn't exist yet, then username/password is required
     (fs.exists(cookies) || isset(username) && isset(password)))){
    console.log("please enter valid --username='', --password='', --tweet='' and --cookies=''");
    casper.exit();
}
if(tweet.length > 140){
    tweet = tweet.substring(0,137) + "...";
}

phantom.cookiesEnabled = true;
if(fs.exists(cookies)){
    console.log('restoring cookies from ' + cookies);
    var restoredCookiesData = fs.read(cookies);
    phantom.cookies = JSON.parse(restoredCookiesData);
    console.log('finished restoring cookies from ' + cookies);
    casper.start();
} else {

    casper.start('https://mobile.twitter.com/login', function() {
	this.capture(dir + "1-frontpage.jpg");
	this.fill('form.signin-form', {
	    "session[username_or_email]" : username,
	    "session[password]" : password
	}, true);
    });
    
    casper.waitFor(function check() {
	return this.evaluate(function() {
            return document.querySelectorAll('main[role="main"]').length > 0;
	});
    }, function then() {
	// now we see dashboard
	this.capture(dir + "2-logged-in.jpg");
    },  function timeout() {
	//timed out
    }, nWaitTimeout);
}//end if cookies file exists else

casper.thenOpen('https://mobile.twitter.com/compose/tweet');

casper.waitFor(function check() {
    return this.evaluate(function() {
        return document.querySelectorAll('textarea').length > 0;
    });
}, function then() {
    // now we see dashboard
    this.capture(dir + "/3-tweetform-empty.jpg");
    var textareaOffset = this.evaluate(function(){
	return $("textarea").css("color","#fff").offset();
    });
    //this.mouse.click(textareaOffset.left + 3, textareaOffset.top + 3);
    //this.click("textarea");
    this.sendKeys('textarea', tweet);
    
/*
    //this.sendKeys('input[type="file"]', '/projects/twit/upload.jpg');
    var fileInputName = this.evaluate(function(){
	document.querySelector('input[type="file"]').name = "uploadInput";
	return document.querySelector('input[type="file"]').name;
    });
    console.log("name is " + fileInputName);
    this.evaluate(function(){
	//document.querySelector('input[type="file"]').className = "";
	document.querySelector('input[type="file"]').style.opacity = "1";
	document.querySelector('input[type="file"]').style.width="400px";
	document.querySelector('input[type="file"]').style.color="#ff0000";
    });
    // console.log(this.fill('div[aria-label]', {
    // 	'asd' : '/projects/twit/upload.jpg'
    // }));
    //this.evaluate(function(fileName) {document.querySelector('input[type="file"]').setAttribute('value',fileName)},{fileName:'/projects/twit/upload1.jpg'});

    // this.page.uploadFile("input[type='file']", [
    // 	'/projects/twit/upload1.jpg',
    // 	'/projects/twit/upload2.jpg'
    // ]);
    //this.page.uploadFile("." + fileInputName, '/projects/twit/upload1.jpg');
    this.evaluate(function(){
	$("input[type='file']").wrap("<form class='uploadForm'></form>");
    });
    this.page.uploadFile('input[type="file"]', '/projects/twit/upload1.jpg');
    this.fillSelectors('form.uploadForm', {
     	"input[type='file']" : '/projects/twit/upload1.jpg'
    }, false);
    this.echo("asq" + this.evaluate(function(fileName) {
	var inp = document.querySelector('input[type="file"]');
	var ret = "found element: ." + inp.className + ";";
	ret += "converting to text;";
	inp.setAttribute('type','text');
	ret += "set value to " + fileName + ";";
	inp.setAttribute('value', fileName);
	ret += "current value: "+inp.value+";";
	ret += "set value using jquery;";
	inp.value = "/projects/twit/upload1.jpg";
	ret += "current (jQuery) value: " + inp.value + ";";
	ret += "setting type to file;";
	inp.setAttribute('type','file');
	ret += "current type:"+inp.getAttribute("type") + ",value: " + inp.value + ";";
	//
	if ("createEvent" in document) {
	    var evtChange = document.createEvent("HTMLEvents");
	    evtChange.initEvent("change", false, true);
	    inp.dispatchEvent(evtChange);
	    var evtClick = document.createEvent("HTMLEvents");
	    evtClick.initEvent("click", false, true);
	    inp.dispatchEvent(evtClick);
	}
	else {
	    inp.fireEvent("onchange");
	    inp.fireEvent("onclick");
	}
	//$(inp).trigger('change');
	//
	ret += "current value (after change): "+inp.value+";";
	return ret;
    }, {fileName:'/projects/twit/upload1.jpg'}));
    // this.fill('div[aria-label]', {
    //  	fileInputName : '/projects/twit/upload1.jpg'
    // });
    //this.click("input[type='file']");

    // var inputfileOffset = this.evaluate(function(){
    // 	return $("input[type='file']").offset();
    // });
    // this.click("input[type='file']");
    // this.sendKeys("input[type='file']", casper.page.event.key.Enter , {keepFocus: true});
    //this.echo(inputfileOffset.left+"/"+inputfileOffset.top);
*/

    // this.page.onFilePicker(function(oldFile){
    // 	return "/projects/twit/upload2.jpg";
    //  });
    // this.page.uploadFile('input[type="file"]', '/projects/twit/upload1.jpg');
    // this.click("input[type='file']");
    // this.sendKeys("input[type='file']", casper.page.event.key.Enter , {keepFocus: true});
    this.click("input[type='file']");
    
    this.capture(dir + "/4-tweetform-filled.jpg");
    this.wait(2000, function() {
	this.click("button[type='button'][data-testid='tweet-button']");
    });
},  function timeout() {
    //timed out
}, nWaitTimeout);



casper.waitFor(function check() {
    return this.evaluate(function() {
        return document.querySelectorAll('div[role="rowgroup"]').length > 0;
    });
}, function then() {
    // now, after tweeting, we see the tweet list with our newly posted tweet on top
    this.evaluate(function() {
        $("div[role='article'] span").css("color", "#fff");
    });
    this.capture(dir + "/5-tweeted.jpg");
},  function timeout() {
    //timed out
}, nWaitTimeout);

//casper.then(function() {
//});

casper.run(function() {
    // echo results in some pretty fashion
    //this.sendKeys('textarea', 'asdasd', {modifiers: 'ctrl+alt'});
    //this.captureSelector('yoursitelist.png', 'ul.your-list');

    var currentCookiesData = JSON.stringify(phantom.cookies);
    fs.write(cookies, currentCookiesData, 644);

    this.echo('execute finished');
    this.exit();
});
