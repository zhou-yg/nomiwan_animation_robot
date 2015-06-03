var fs = require('fs');
var Q = require('q');

var pageCreator = require('webpage');
var page = pageCreator.create();

var name = 'iqiyi';
var saveJsonDirPath = './db/';
var saveJsonPostFix = '.json';


var getEveryWeekUpdate = function(){
    var selector = 'div.wrapper-week div.weekline_list > div ul.site-piclist-11665 > li > div > a';
    var imgSelector = 'div img';
    var nameSelector = 'div h4';

    var allA = document.querySelectorAll(selector);

    var tmp = [];
    var i= 0,len = allA.length,
        aLink = imgDom = h4Dom = null,
        otherRegExp = /[:|：][\W\w]*/;

    for(;i<len;i++){
        aLink = allA[i];
        imgDom = aLink.querySelector(imgSelector);
        h4Dom  = aLink.querySelector(nameSelector);

        var tmpName = h4Dom.title || h4Dom.alt;
        tmpName = tmpName.replace(otherRegExp,'');

        tmp.push({
            name:tmpName,
            href:aLink.href,
            img:imgDom.src
        });
    }

    return tmp;
};

var saveJson = function(animationArr){
    var fileFullName = saveJsonDirPath+name+saveJsonPostFix;
    var contents = JSON.stringify({
        source:name,
        animationArr:animationArr
    });

    fs.write(fileFullName,contents,'w');
};

exports.openCb = function(option){

    var deferred = Q.defer();

    if(!(option.address && option.saveJsonDirPath)){
        return;
    }

    address = option.address;
    saveJsonDirPath = option.saveJsonDirPath || saveJsonDirPath;

    page.settings.resourceTimeout = 2000;

    page.onResourceTimeout = function(req){
        //console.log(JSON.stringify(req,undefined,2));
        //console.log('===============================');
    };
    page.onConsoleMessage = function(msg, lineNum, sourceId) {
        console.log('CONSOLE: ' + msg);
    };
    page.open(address,function(status){

        var iqiyiNewAnimationArr = page.evaluate(getEveryWeekUpdate);
        //console.log(JSON.stringify(tudouNewAnimationArr,undefined,4));
        console.log('--------------'+name+' query done ------------------');
        saveJson(iqiyiNewAnimationArr);

        deferred.resolve(name);
    });

    return deferred.promise
};