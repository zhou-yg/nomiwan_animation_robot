var fs = require('fs');
var utils = require('./nmw_Utils.js');
var jsonDataHandler = require('../lib/jsonDataHandler');

var saveAllJsonName = 'all.json';
var dataFilePostFix = '.json';

var listJsonFiles = function(dirPath){
    return [
        'youku.json',
        'tudou.json',
        'pptv.json',
        'iqiyi.json'
    ];
};

var readFileToObj = function(saveJsonDirPath){

    var dirPath = saveJsonDirPath;


    return function (fileArr) {
        var i = 0, len = fileArr.length,
            tmp = [];

        for (; i < len; i++) {
            var fileName = fileArr[i];
            var fullFileName = dirPath+fileName;

            if (fs.isFile(fullFileName)) {
                var jsonStr = fs.read(fullFileName);
                tmp.push(JSON.parse(jsonStr));
            }
        }

        return tmp;
    };
};
/*
{
  name:''
  imgs:[],
  sources:[{
     sourceName:''
     href:''
  }]
}
 */
var concatJsonObj = function(jsonObjArr){
    var tmp  = [],
        i= j = 0,
        len = jsonObjArr.length,
        animationArrLen = 0;

    function isAnimationExist(arr,obj){
        var name = typeof obj == 'object' ? obj.name:obj;
        var i= 0,
            len = arr.length,
            find = null;

        for(;i<len;i++){
            var animationObj = arr[i];
            if(animationObj.name == name){
                find = animationObj;
                break;
            }
        }
        return find;
    }

    for(;i<len;i++){
        
        var jsonFileObj = jsonObjArr[i];
        var animationArr = jsonFileObj.animationArr;

        var sourceName = jsonFileObj.source;

        for(j=0,animationArrLen = animationArr.length;j<animationArrLen;j++){
            var animationObj = animationArr[j];

            var rebuildAnimationObj = isAnimationExist(tmp,animationObj);
            if(rebuildAnimationObj){
                rebuildAnimationObj.images.push(animationObj.img);
                rebuildAnimationObj.sources.push({
                    sourceName:sourceName,
                    href:animationObj.href
                })
            }else{
                rebuildAnimationObj = {
                    name:animationObj.name,
                    images:[animationObj.img],
                    sources:[{
                        sourceName:sourceName,
                        href:animationObj.href
                    }]
                };
                tmp.push(rebuildAnimationObj);
            }
        }
    }

    return tmp;
};

var saveIntoJson = function(allAnimationObjArr){


    return jsonDataHandler.save({
        data:allAnimationObjArr,
        jsonName:saveAllJsonName
    });
};

module.exports = {
    /*
     * option
     *   saveJsonDirPath:存的位置
     *   saveAllJsonName:存的文件名
     *
     * */
    saveConcatResult:function(option,cb){
        var saveJsonDirPath = option.saveJsonDirPath || '';
        saveAllJsonName = option.saveAllJsonName || saveAllJsonName;

        if(!saveJsonDirPath){
            return;
        }
        //------- param init --------

        try{
            var jsonFileArr = listJsonFiles(saveJsonDirPath);

            var jsonObjArr = readFileToObj(saveJsonDirPath)(jsonFileArr);

            var allAnimationObjArr = concatJsonObj(jsonObjArr);

            var saveResult = saveIntoJson(allAnimationObjArr);

        }catch(e){
            utils.log(e);
        }

        cb(saveResult);
    }
};