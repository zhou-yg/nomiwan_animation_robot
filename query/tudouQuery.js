var fs = require('fs');
var Q = require('q');

var pageCreator = require('webpage');
var page = pageCreator.create();

var name = 'tudou';
var saveJsonPath = './db/';
var saveJsonPostFix = '.json';


var getNewAnimation = function(){
    var selector = 'div.box .ani_part02 .part02_list > ul > li';
    var getNewAnimationHooks = function(liArr){
        var i,
            len = liArr.length,
            liOne = null,
            children = null,
            p = null;

        // p
        for(i= 0;i<len;i++){
            liOne = liArr[i];
            children = liOne.children;
            if(children.length == 1){

            }else if(children.length == 2){
                p = children[1];
                children[0].appendChild(p);
            }
        }
        // p.a
        for(i=0;i<len;i++){
            liOne = liArr[i];
            children = liOne.children[0].children;
            if(children[1].children.length>0){
                children[1].innerText = children[1].children[0].innerText;
            }
        }
        return liArr;
    };

    var ul = document.querySelectorAll(selector);
    ul = getNewAnimationHooks(ul);

    var tmp = [];
    var i= 0,len = ul.length;

    for(;i<len;i++){
        var liOne = ul[i];

        var a = liOne.children[0];

        tmp.push({
            name: a.innerText.replace(/\n/g,''),
            img:  a.children[0].src,
            href: a.href
        })
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

    var deferred = Q.defer();

    page.settings.resourceTimeout = 2000;

    page.onResourceTimeout = function(req){
        //console.log(JSON.stringify(req,undefined,2));
        //console.log('===============================');
    };
    page.onConsoleMessage = function(msg, lineNum, sourceId) {
        console.log('CONSOLE: ' + msg);
    };
    page.open(address,function(status){

        var tudouNewAnimationArr = page.evaluate(getNewAnimation);
        //console.log(JSON.stringify(tudouNewAnimationArr,undefined,4));
        console.log('***********************************');
        saveJson(tudouNewAnimationArr);

        deferred.resolve(name);
    });

    return deferred.promise
};