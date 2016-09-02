var phantom = require('phantom');

var linkJquery = "https://code.jquery.com/jquery-3.1.0.min.js";
var pathJquery = "jquery-3.1.0.min.js";
var dir = "/projects/twit";

var page = null;
var phInstance = null;
phantom.create()
    .then(instance => {
        phInstance = instance;
        return instance.createPage();
    })
    .then(argpage => {
        page = argpage;
	//argpage.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36';
page.setting('userAgent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36');
        return argpage.open('https://mobile.twitter.com/login');
    })
    .then(status => {
        //console.log(status);
//
        return page.property('content');
    })
    .then(content => {
	page.render(dir + "/1-frontpage.jpg");
//page.evaluate(function() { return document.querySelectorAll("input")[4].name; }).then(arg => { console.log(arg); });
	page.evaluate(function() {
	    document.querySelectorAll("input")[4].value="luka.ramishvili@gmail.com";
	    document.querySelectorAll("input")[5].value="tomtailorfiddle1";
	}).then(function(){
	    page.render(dir + "/2-fillform.jpg");
	}).then(function(){
	    page.evaluate(function() {
		document.querySelector("button").click();
	    });
	}).then(function(){
	    var step = 1;
	    //steps: 1 - login page; 2 - logged in; step 3 = tweet;
	    var waitForStep2 = setInterval(function(){
		page.evaluate(function() {
		    return !!document.querySelector("a[href='/compose/tweet']");
		}).then(step2Ready => {
		    if(step2Ready){
			clearInterval(waitForStep2);
			step = 2;
			page.render(dir + "/3-logged-in.jpg");
			page.evaluate(function() {
			    document.querySelector("a[href='/compose/tweet']").click();
			});
			var waitForStep3 = setInterval(function(){
			    page.evaluate(function() {
				return !!document.querySelector("textarea");
			    }).then(step3Ready => {
				if(step3Ready){
				    clearInterval(waitForStep3);
				    step = 3;
				    page.render(dir + "/4-tweetform-empty.jpg");
				    page.injectJs(pathJquery).then(function(){
					page.evaluate(function() {
					    var textarea = document.querySelector("textarea");
					    textarea.value = "Test tweet asdas dasd asd asd asd asd asd";
					    textarea.style.color = "#fff";
					    textarea.focus();
$("textarea").trigger('keydown');
$("textarea").trigger('keypress');
$("textarea").trigger('keyup');
//					}).then(function(){
//page.sendEvent('keypress', page.event.key.A, null, null, 0);
					}).then(function(){
					    page.render(dir+"/5-tweetform-filled.jpg");
					    page.evaluate(function(){
document.querySelector("button[data-testid='tweet-button']").click();
});
					}).then(function(){
					    //TODO: reliable check of successful tweet
					    setTimeout(function(){console.log(6);
						page.render(dir + "/6-tweeted.jpg");
					    }, 3000);
					});
					//end inject jquery block in tweet form page
				    });
				}
			    });
			}, 1000);
		    }
		});
	    }, 1000);
	    //end of steps block
	});
	//page.evaluate(function() { return document.title; }).then(arg => { console.log(arg); });
	
	//delay exiting so that our code can have time to execute
        setTimeout(function(){
	    page.close();
            phInstance.exit();
	}, 20000);
    })
    .catch(error => {
        console.log(error);
        phInstance.exit();
    });
