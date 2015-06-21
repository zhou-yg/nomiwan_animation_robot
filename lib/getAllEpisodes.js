/**
 * Created by zyg on 15/6/21.
 */
var fs = require('fs');
var Q = require('Q');

var dir = 'data/';
var srcAllJson = dir+'all.json';
var destEpisodesJson = dir+'allEpisodes.json';

//剧集页
var queryDir = './query/';
var queryEpisodesPostfix = 'QueryEpisodes';

var queryAllEpisodeUrls = function(srcAllJson){
    var promiseAll = [];

    var all = JSON.parse(fs.read(srcAllJson));

    for(var i= 0,len=all.length;i<len;i++){
        (function(i){

            var animationObj = all[i];
            var sources = animationObj.sources;

            for(var j= 0,sourceLen = sources.length;j<sourceLen;j++){
                (function(j){

                    var sourceObj = sources[j];
                    var sourceName = sourceObj.sourceName;
                    var href = sourceObj.href;

                    var queryName = sourceName+queryEpisodesPostfix;
                    var query = require(queryDir+queryName);

                    var promise = query.getEpisodeUrls({
                        href:href
                    });

                    promiseAll.push(promise);
                })(j)
            }
        })(i);
    }
};













module.exports = {
    /*
    *
    * option =
    *  srcAllJson:读取源json
    *  destEpisodesJson:存剧集链接的json
    * */
    getEpisodeUrls:function(option,cb){
        var srcAllJson = option.srcAllJson || srcAllJson;
        var destEpisodesJson = option.destEpisodesJson || destEpisodesJson;

        var isExists = fs.exists(srcAllJson);
        var err = null;

        if(!isExists){
            err = {
                msg:'not exist'
            };
        }
        if(err){
           cb(err)
        }else{
            var allEpisodeUrl = queryAllEpisodeUrls(srcAllJson);


            cb()
        }
    }
};
