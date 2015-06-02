var Q = require('q');
var webSites = require('./config/animationWebsites.js');

var queryDir = './query/';
var querySuffix = 'Query';

var promiseArr = [];

for(var webSiteObjKey in webSites){
    (function(webSiteObjKey){
        var webSiteObj = webSites[webSiteObjKey];
        var address = webSiteObj.address;

        if(address){

            var queryPreName = webSiteObj.query || webSiteObjKey;
            var queryName = queryPreName+querySuffix;
            var query  = require(queryDir+queryName);

            if(query.openCb){

                var p = query.openCb(address);

                promiseArr.push(p);

            }else{
                console.log(queryName,' hasnt cb')
            }
        }

    })(webSiteObjKey);
}

Q.all(promiseArr).done(function() {
    console.log('phantom.exit()');
    phantom.exit();
});