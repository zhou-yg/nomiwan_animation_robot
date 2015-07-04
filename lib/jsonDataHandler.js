/**
 * Created by zyg on 15/7/3.
 */
var fs = require('fs');
var utils = require('./nmw_Utils');

var jsonDataDir = fs.workingDirectory+'/data/',
    dataFilePostFix = '.json';


var saveFile = function(data,destJsonName){
    destJsonName = jsonDataDir + destJsonName;

    var destJsonNameBackup = destJsonName.replace(utils.jsonBackupRegExp,
        utils.getNow()+dataFilePostFix);

    if(fs.exists(destJsonName)){
        console.log(destJsonName,' exist');
        try{
            fs.copy(destJsonName,destJsonNameBackup);
        }catch (e){
            utils.log(e);
        }
    }
    var contents = JSON.stringify(data);

    fs.write(destJsonName,contents,'w');

    return destJsonName;
};

var validatePath = function(jsonFileName){
    return !!(jsonFileName.indexOf('data/') === -1);
};

module.exports = {
    save : function(option){
        var data = option.data,
            destJsonName = option.jsonName;

        var result = {
            error:null,
            message:null
        };
        //data必须是Array或Object
        if(typeof data !== 'object'){
            result = {
                error:'data is not object or array'
            };
        }
        if(!destJsonName || !validatePath(destJsonName)){
            result = {
                error:'data can not include path / '
            };
        }
        if(!result.error){
            result.message = saveFile(data,destJsonName);
        }

        return result;
    },
    read : function(option){
        var targetJsonName = option.jsonName,
            result = '';

        utils.log(targetJsonName);
        if(validatePath(targetJsonName)){
            targetJsonName = jsonDataDir + targetJsonName;
            result = fs.read(targetJsonName);
        }
        return result;
    }
};