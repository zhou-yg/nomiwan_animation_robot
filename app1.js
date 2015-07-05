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
var queryAnimation  = require(queryDir+queryName);

var webSitesLen = 0;

var t1,t2 = 0;
//遍历当前config好的网站们
var queryAllWebSites = function(){
    var d = Q.defer();
    t1 = +new Date();

    var sourceNameArr = [];
    var siteObjArr = [];

    for(var webSiteObjKey in webSites){
        siteObjArr.push(webSites[webSiteObjKey]);
    }

    var currentIndex = 0;
        webSitesLen = siteObjArr.length;


    var eachWebSitesObj = function(){
        if( currentIndex < webSitesLen){

            var webSiteObj = siteObjArr[currentIndex];
            var address = webSiteObj.address;
            var sourceName = webSiteObj.name;

            utils.log(webSiteObj);

            if(address){

                var p = queryAnimation.open({
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
            console.log('done');
            d.resolve(sourceName);
        }
    };

    eachWebSitesObj();


    return d.promise;
};
exports.query = function(cb){
    var queryAnimationPromise = queryAllWebSites();
    queryAnimationPromise.done(function() {

        concatNewAnimation.saveConcatResult({
            saveJsonDirPath:saveJsonDirPath,
            saveAllJsonName:saveAllJsonName
        },function(){

            t2 = +new Date();
            var cost = (t2 - t1) / 1000;
            console.log('===== 爬'+webSitesLen+'个网站 总共耗时：', cost, ' 秒 ======');

            cb(true)
        });
    });
    // while query occurred accident
    queryAnimationPromise.fail(function(err){

        console.log('------ websites  fail ----');
        console.log(err);

        cb(false)
    });
};
/*
var query = function(cb){
    var queryAnimationPromise = queryAllWebSites();
    queryAnimationPromise.done(function() {

        concatNewAnimation.saveConcatResult({
            saveJsonDirPath:saveJsonDirPath,
            saveAllJsonName:saveAllJsonName
        },function(){

            t2 = +new Date();
            var cost = (t2 - t1) / 1000;
            console.log('===== 爬'+webSitesLen+'个网站 总共耗时：', cost, ' 秒 ======');

            cb(true)
        });
    });
    // while query occurred accident
    queryAnimationPromise.fail(function(err){

        console.log('------ websites  fail ----');
        console.log(err);

        cb(false)
    });
};
query(function(is){
    utils.log(is);
});
*/