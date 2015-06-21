var Q = require('q');

var webSites = require('./config/animationWebsites.js');

var concatNewAnimation = require('./lib/concatNewAnimation.js');
//------------------------
var queryDir = './query/';
var queryPostfix = 'Query';

var saveAllJsonName = 'all.json';
var saveJsonDirPath = './data/';
//------------------------
var queryEpisodesDir = './queryEpisodes/';
var queryEpisodesPostfix = 'Episodes';


var queryAllWebSites = function(){
    var promiseArr = [];

    for(var webSiteObjKey in webSites){
        (function(webSiteObjKey){
            var webSiteObj = webSites[webSiteObjKey];
            var address = webSiteObj.address;
            var sourceName = webSiteObj.name;
            if(address){

                var queryPreName = webSiteObj.query || webSiteObjKey;
                var queryName = 'queryAnimation';
                var query  = require(queryDir+queryName);

                if(query.open){
                    var p = query.open({
                        sourceName:sourceName,
                        href:address,
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
Q.all(promiseArr).done(function() {

    concatNewAnimation.saveConcatResult({
        saveJsonDirPath:saveJsonDirPath,
        saveAllJsonName:saveAllJsonName
    },function(){

        console.log('phantom.exit()');

        phantom.exit();
    });
});