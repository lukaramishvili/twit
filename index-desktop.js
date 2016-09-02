var phantom = require('phantom');

var linkJquery = "https://code.jquery.com/jquery-3.1.0.min.js";
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
        return argpage.open('https://twitter.com/');
    })
    .then(status => {
        //console.log(status);
//
        return page.property('content');
    })
    .then(content => {
	page.injectJs(linkJquery).then(function(){
	    page.render(dir + "/1-frontpage.jpg");
	    page.evaluate(function() {
		var $form = $(".front-signin form");
		$form.find("#signin-email").val("luka.ramishvili@gmail.com");
		$form.find("#signin-password").val("tomtailorfiddle1");
		$form.find("button[type='submit']").click();
	    }).then(function(){
		page.render(dir + "/2-fillform.jpg");
		var step = 1;
		//steps: 1 - login page; 2 - logged in; step 3 = tweet;
		var waitForStep2 = setInterval(function(){
		    page.evaluate(function() {
			return "undefined"!==typeof(jQuery) && jQuery(".dashboard-right").length > 0;
		    }).then(step2Ready => {
			if(step2Ready){
			    clearInterval(waitForStep2);
			    step = 2;
			    page.render(dir + "/3-logged-in.jpg");
			    //TODO: step 3 - tweet
			    //page.injectJs(linkJquery)
			    //.then(function(){
			    //fill tweet text
			    page.evaluate(function() {
				$("#tweet-box-home-timeline").focus();
				$("#tweet-box-home-timeline").click();
				$("#tweet-box-home-timeline").focus();
				$("#tweet-box-home-timeline").click();
			    }).then(function(){
				//page.sendEvent('keypress', page.event.key.A, null, null, 0x02000000 | 0x08000000);
				page.evaluate(function() {
				    return $("#tweet-box-home-timeline").offset();
				}).then(offset => {
				    page.sendEvent('mousedown', offset.left + 5, offset.top + 5, 'left');
				    page.sendEvent('mouseup', offset.left + 5, offset.top + 5, 'left');
				    page.sendEvent('click', offset.left + 5, offset.top + 5, 'left');
				    ////
var element = document.querySelector( '.home-tweet-box textarea' );
 
    // create a mouse click event
    var event = document.createEvent( 'MouseEvents' );
    event.initMouseEvent( 'click', true, true, window, 1, 0, 0 );
 
    // send click to element
    element.dispatchEvent( event );
var element = document.querySelector( '#tweet-box-home-timeline div' );
 
    // create a mouse click event
    var event = document.createEvent( 'MouseEvents' );
    event.initMouseEvent( 'click', true, true, window, 1, 0, 0 );
 
    // send click to element
    element.dispatchEvent( event );
				    ////
				});
			    }).then(function(){
				page.evaluate(function() { return $("#tweet-box-home-timeline").html(); }).then(arg => { console.log(arg); });
				page.evaluate(function() {
				    $("#tweet-box-home-timeline div")
					.text("Test tweet text");
				    $(".timeline-tweet-box button.tweet-btn")
					.click();
				});
				//end of inside-timeline browser javascript
			    }).then(function(){
				page.render(dir + "/4-tweetform.jpg");
				//TODO: reliable check of successful tweet
				setTimeout(function(){
				    page.render(dir + "/5-tweeted.jpg");
				}, 5000);
			    });
			    //});
			}
		    });
		}, 1000);
	    });
	    //end of after-jquery block
	});
	//page.evaluate(function() { return document.title; }).then(arg => { console.log(arg); });
		
	//delay exiting so that our code can have time to execute
        setTimeout(function(){
	    page.close();
            phInstance.exit();
	}, 15000);
    })
    .catch(error => {
        console.log(error);
        phInstance.exit();
    });
