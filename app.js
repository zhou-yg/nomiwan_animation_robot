var Q = require('q');

var webSites = require('./config/animationWebsites.js');

var concatNewAnimation = require('./lib/concatNewAnimation.js');
//------------------------
var queryDir = './query/';
var queryName = 'queryAnimation';

var saveAllJsonName = 'all.json';
var saveJsonDirPath = './data/';
//------------------------
var queryEpisodesDir = './queryEpisodes/';
var queryEpisodesPostfix = 'Episodes';

//遍历当前config好的网站们
var queryAllWebSites = function(){
    var promiseArr = [];

    for(var webSiteObjKey in webSites){
        (function(webSiteObjKey){
            var webSiteObj = webSites[webSiteObjKey];
            var address = webSiteObj.address;
            var sourceName = webSiteObj.name;

            if(address){

                var query  = require(queryDir+queryName);

                if(query.open){
                    var p = query.open({
                        sourceName:sourceName,
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
var promiseArr = queryAllWebSites();
// when query all websites done
var allPromises = Q.all(promiseArr);

allPromises.done(function() {

    concatNewAnimation.saveConcatResult({
        saveJsonDirPath:saveJsonDirPath,
        saveAllJsonName:saveAllJsonName
    },function(){

        console.log('phantom.exit()');

        phantom.exit();
    });
});
// while query occurred accident
allPromises.fail(function(err){

    console.log('fail',err);

    phantom.exit();
});