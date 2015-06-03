var Q = require('q');

var webSites = require('./config/animationWebsites.js');

var concatNewAnimation = require('./lib/concatNewAnimation.js');

var queryDir = './query/';
var querySuffix = 'Query';

var saveJsonDirPath = './db/';

var queryAllWebSites = function(){
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

                    var p = query.openCb({
                        address:address,
                        saveJsonDirPath:saveJsonDirPath
                    });

                    promiseArr.push(p);

                }else{
                    console.log(queryName,' hasnt cb')
                }
            }

        })(webSiteObjKey);
    }

    return promiseArr;
};

// when query all websites done
/*
Q.all(queryAllWebSites()).done(function() {
    console.log('phantom.exit()');

    concatNewAnimation.saveConcatResult({
        saveJsonDirPath:saveJsonDirPath
    });

    phantom.exit();
});
    */
concatNewAnimation.saveConcatResult({
    saveJsonDirPath:saveJsonDirPath
});

phantom.exit();
