var page = require('webpage').create();

page.onConsoleMessage = function(msg){
    console.log('console log:',msg);
};
page.onResourceRequested = function(request) {
    console.log('Request ' + JSON.stringify(request, undefined, 4));
};
page.onResourceReceived = function(response) {
    console.log('Receive ' + JSON.stringify(response, undefined, 4));
};
page.open('http://baidu.com', function(status) {
    page.evaluate(function(){
        console.log(document.title);
    });

    phantom.exit();
});