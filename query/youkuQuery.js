var fs = require('fs');

var pageCreator = require('webpage');
var page = pageCreator.create();

var name = 'youku';
var saveJsonPath = './db/';
var saveJsonPostFix = '.json';

//获取‘重磅推荐’
var getRecommend = function(){
    var selector = 'table.tt tbody tr td > a';
    var recommendArr = document.querySelectorAll(selector);

    var tmp = [];
    var i= 0,len=recommendArr.length;
    for(;i<len;i++){
        var aDomObj = recommendArr[i];
        var imgDomObj = aDomObj.querySelector('img');
        if(imgDomObj){
            tmp.push({
                name:imgDomObj.alt,
                img:imgDomObj.src,
                href:aDomObj.href
            })
        }
    }
    return tmp;
};
//获取’本季必看，漫改动画，续作系列，其它改编‘
var getOtherList = function(){
    var selector = 'div.yk-body > .yk-row';
    var selectorImg = selector + ' .v img';
    var selectorA = selector + ' .v .v-link a';

    var imgDomArr = document.querySelectorAll(selectorImg);
    var aDomArr = document.querySelectorAll(selectorA);

    var tmp = [];
    if(imgDomArr.length == aDomArr.length){
        var i= 0,len = imgDomArr.length;
        for(;i<len;i++){
            tmp.push({
                name:imgDomArr[i].alt,
                img:imgDomArr[i].src,
                href:aDomArr[i].href
            })
        }
    }
    return tmp;
};

var saveJson = function(animationArr){
    var fileFullName = saveJsonPath+name+saveJsonPostFix;
    var contents = JSON.stringify({
        source:name,
        animationArr:animationArr
    });

    fs.write(fileFullName,contents,'w');
};

exports.openCb = function(address){

    page.settings.resourceTimeout = 2000;

    page.onResourceTimeout = function(req){
        //console.log(JSON.stringify(req,undefined,2));
        //console.log('===============================');
    };
    page.onConsoleMessage = function(msg, lineNum, sourceId) {
        console.log('CONSOLE: ' + msg);
    };
    page.open(address,function(status){

        var recommendArr = page.evaluate(getRecommend);
//        console.log(JSON.stringify(recommendArr,undefined,4));
        console.log('***************************************');
        var inSeasonArr = page.evaluate(getOtherList);
//        console.log(JSON.stringify(inSeasonArr,undefined,4));
        console.log('***************************************');

        var youkuAnimationObjArr = recommendArr.concat(inSeasonArr);

        saveJson(youkuAnimationObjArr);

        phantom.exit();
    });
};