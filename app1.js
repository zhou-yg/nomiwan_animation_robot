var Q = require('q');
var utils = require('./lib/nmw_Utils.js');

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

var query  = require(queryDir+queryName);

//遍历当前config好的网站们
var queryAllWebSites = function(){
    var d = Q.defer();

    var sourceNameArr = [];
    var siteObjArr = [];

    for(var webSiteObjKey in webSites){
        siteObjArr.push(webSites[webSiteObjKey]);
    }

    var currentIndex = 0,
        webSitesLen = siteObjArr.length;

    var eachWebSitesObj = function(){
        console.log(currentIndex);
        if( currentIndex < webSitesLen){

            var webSiteObj = siteObjArr[currentIndex];
            var address = webSiteObj.address;
            var sourceName = webSiteObj.name;

            utils.log(webSiteObj);

            if(address){

                var p = query.open({
                    sourceName: sourceName,
                    address: address,
                    saveJsonDirPath: saveJsonDirPath
                });

                p.done(function (sourceName) {
                    currentIndex++;
                    sourceNameArr.push(sourceName);

                    eachWebSitesObj();
                });
            }

        }else{

            d.resolve(sourceName);
        }
    };

    eachWebSitesObj();


    return d.promise;
};
var queryAnimationPromise = queryAllWebSites();
// when query all websites done
queryAnimationPromise.done(function() {

    concatNewAnimation.saveConcatResult({
        saveJsonDirPath:saveJsonDirPath,
        saveAllJsonName:saveAllJsonName
    },function(){

        console.log('phantom.exit()');

        phantom.exit();
    });
});
// while query occurred accident
queryAnimationPromise.fail(function(err){

    console.log('fail',err);

    phantom.exit();
});