/**
 * Created by zyg on 15/7/3.
 */
var fs = require('fs');
var utils = require('./nmw_Utils');

var jsonDataDir = fs.workingDirectory+'/data/',
    dataFilePostFix = '.json';


var saveFile = function(data,jsonName){
    jsonName = jsonDataDir + jsonName;

    var destJsonNameBackup = jsonName.replace(utils.jsonBackupRegExp,
        utils.getNow()+dataFilePostFix);

    if(fs.exists(jsonName)){
        console.log(jsonName,' exist');
        try{
            fs.copy(jsonName,destJsonNameBackup);
        }catch (e){
            utils.log(e);
        }
    }
    var contents = JSON.stringify(data);

    fs.write(jsonName,contents,'w');

    return jsonName;
};

var validatePath = function(jsonFileName){
    return !!(jsonFileName.indexOf('data/') === -1);
};

module.exports = {
    save : function(option){
        var data = option.data,
            jsonName = option.jsonName;

        var result = {
            error:null,
            message:null
        };

        utils.log(jsonName);

        //data必须是Array或Object
        if(typeof data !== 'object'){
            result = {
                error:'data is not object or array'
            };
        }
        if(!jsonName || !validatePath(jsonName)){
            result = {
                error:'data can not include path / '
            };
        }
        if(!result.error){
            result.message = saveFile(data,jsonName);
        }

        return result;
    },
    read : function(option){
        var targetJsonName = option.jsonName,
            result = '';

        if(validatePath(targetJsonName)){
            targetJsonName = jsonDataDir + targetJsonName;
            result = fs.read(targetJsonName);
        }
        return result;
    }
};