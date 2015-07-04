/**
 * Created by zyg on 15/6/22.
 */
var fs = require('fs');
var Q = require('Q');
var utils = require('./nmw_Utils');
var jsonDataHandler = require('./jsonDataHandler');

var unSupportedSource = require('../config/unSupportSource');

var dir = 'data/';
    allEpisodesJson = 'allEpisodes.json',
    destAllVideoSrcJson = 'allEpisodesVideoSrc.json',
    startIndex = 0,
    eachQueryEpisodesNum = 20;


var dataFilePostFix = '.json';

//爬取分享的flash query器
var queryDir = '../query/';
var queryVideoSrcModule = queryDir + 'queryVideoSrc';

var queryVideoSrc = require(queryVideoSrcModule);

//-------------------
var t1 = +new Date();

var queryAllVideoSrc = function(allEpisodesJson,cb){
    //动漫对象集合数组
    var allAnimationObjArr = jsonDataHandler.read({
        jsonName:allEpisodesJson
    });

    if(allAnimationObjArr){
        allAnimationObjArr = JSON.parse(allAnimationObjArr);
    }else{
        allAnimationObjArr = [];
    }

    //动漫视频源的链接集合的临时数组
    var videoSrcObjTmpArr = [];

    var animationIndex = startIndex,
        animationLen = allAnimationObjArr.length;

    /**
     * 遍历每个源，分别爬取。
     *
     * @param sources
     * @param animationName
     * @returns {promise|*|Q.promise}
     */
    function openSources(sources, animationName) {
        var d = Q.defer();

        var currentSourceIndex = 0;
        var sourceLen = sources.length;

        var videoSrcObjArr = [];

        var eachSources = function () {

            if (currentSourceIndex < sourceLen) {

                try{
                    var sourceObj = sources[currentSourceIndex];
                    var sourceName = sourceObj.sourceName;
                    var episodes = sourceObj.episodes;

                    /**
                     * pptv目前不支持分享视频
                     */
                    if(unSupportedSource[sourceName]){
                        //utils.log('s:',sourceName,' ',animationName);
                        currentSourceIndex++;
                        eachSources();

                    }else{
                        var queryPromise = queryVideoSrc.open(animationName,sourceName,episodes,t1,animationIndex);
                        /**
                         * oneSourceVideoSrcObj = {
                         *   animationName
                         *   sourceName
                         *   videoSrcObjArr = [{
                         *       sourceName
                         *       videoSrcArr
                         *   }...]
                         * }
                         */
                        queryPromise.done(function (oneSourceVideoSrcObj) {
                            videoSrcObjArr.push(oneSourceVideoSrcObj);

                            currentSourceIndex++;
                            eachSources();
                        });
                    }
                }catch (e){
                    console.log(e);

                    currentSourceIndex++;
                    eachSources();
                }


            } else {

                d.resolve(videoSrcObjArr);
            }
        };
        eachSources();

        return d.promise;
    }
    /**
     * 遍历每个动漫对象，获取其资源列
     */
    function eachAnimationObj() {
        if (animationIndex < animationLen) {

            try{

                setTimeout(function(){

                    var currentAllPromises = [];

                    var animationObj = allAnimationObjArr[animationIndex];

                    var animationName = animationObj.name;
                    var sources = animationObj.sources;

                    /**
                     * episodeObjArrLite = [{
                     *    animationName
                     *    sourceName
                     *    videoSrcObjArr = [{
                     *        sourceName
                     *        videoSrcArr
                     *    }...]
                     * }...]
                     */
                    var promise = openSources(sources, animationName);
                    promise.done(function (episodeObjArrLite) {
                        utils.log('======================================================');
                        videoSrcObjTmpArr = videoSrcObjTmpArr.concat(episodeObjArrLite);

                        animationIndex++;
                        eachAnimationObj();
                    });


                },300);

            }catch (e){
                console.log(e);

                animationIndex++;
                eachAnimationObj();
            }

        } else {

            cb(allAnimationObjArr, videoSrcObjTmpArr);
        }
    };

    eachAnimationObj();
};
/**
 * 合并所有视频链接到all
 *
 * @param allAnimationObjArr
 * @param videoSrcObjTmpArr
 *
 * videoSrcObjTmpArr = [{
                        animationName
                        sourceName
                        videoSrcObjArr = [{
                            sourceName
                            videoSrcArr
                        }...]
                      }...]
 */
var combineAllVideoSrc = function(allAnimationObjArr,videoSrcObjTmpArr){

    var allAniLen = allAnimationObjArr.length;

    function insertEpisodesInto(aniName, sName, videoSrcArr) {

        //找到‘动漫’map
        var aniFind = null;
        for (var i = 0; i < allAniLen; i++) {
            var aniObj = allAnimationObjArr[i];
            if (aniObj.name === aniName) {
                aniFind = aniObj;
                break;
            }
        }
        if (aniFind) {
            //找到‘视频源’map
            var sourceFind = null;
            var sources = aniFind.sources;
            for (var j = 0, len = sources.length; j < len; j++) {
                var sourceObj = sources[j];
                if (sourceObj.sourceName === sName) {
                    sourceFind = sourceObj;
                    break;
                }
            }
            if (sourceFind) {
                sourceFind.videos = videoSrcArr;
            }
        }
    }

    for (var i = 0, len = videoSrcObjTmpArr.length; i < len; i++) {
        var videoSrcSetObj = videoSrcObjTmpArr[i];

        var animationName = videoSrcSetObj.animationName,
            sourceName = videoSrcSetObj.sourceName,
            videoSrcArr = videoSrcSetObj.videoSrcObjArr;

        insertEpisodesInto(animationName, sourceName, videoSrcArr);
    }
};
/**
 * 保存爬到的所有动漫的剧集的视频链接
 * @param videoSrcObjTmpArr
 */
var saveAllVideoSrcJson = function (videoSrcObjTmpArr) {
    return jsonDataHandler.save({
        data:videoSrcObjTmpArr,
        jsonName:destAllVideoSrcJson
    })
};
/**
 * 保存all
 *
 * @param allAnimationObjArr
 */
var saveAllJson = function(allAnimationObjArr){
    return jsonDataHandler.save({
        data:allAnimationObjArr,
        jsonName:destAllVideoSrcJson
    })
};

module.exports = {
    /**
     * 获取flash video 链接
     * @param option
     *   srcAllEpisodes:剧集页的链接集合json文件
     *   destVideoSrcJson:视频Src集合目标集合json文件
     * @param cb
     */
    getVideoSrc:function(option,cb){
        startIndex = option.startIndex || startIndex;
        eachQueryEpisodesNum = option.eachQueryEpisodesNum || eachQueryEpisodesNum;
        allEpisodesJson = option.allEpisodesJson || allEpisodesJson;
        destAllVideoSrcJson = option.destAllVideoSrcJson || destAllVideoSrcJson;

        queryAllVideoSrc(allEpisodesJson, function (allAnimationObjArr, videoSrcObjTmpArr) {
            //utils.log(JSON.stringify(videoSrcObjTmpArr,undefined,2));
            //utils.log(saveAllVideoSrcJson(videoSrcObjTmpArr));

            combineAllVideoSrc(allAnimationObjArr, videoSrcObjTmpArr);

            saveAllJson(allAnimationObjArr);

            cb(null,videoSrcObjTmpArr.length);
        });
    }
};