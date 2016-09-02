// testscript.js
var webpage = require('webpage'),
system = require('system'),
fname;

if (system.args.length !== 2) {
    console.log('Usage: uploadtest.js filename');
    phantom.exit(1);
} else {
    fname = system.args[1];
    var page = webpage.create();

    page.onConsoleMessage = function(msg) {
        console.log(msg);
    };

    page.open("https://encodable.com/uploaddemo/", function (status) {
        console.log("Page opened, ready to upload file.  Status is", status);
        page.uploadFile('input[name=uploadname1]', fname);
        page.evaluate(function () {
            document.forms[0].submit();
        });
        window.setTimeout(function () {
            phantom.exit();
        }, 3000);
    });
}
