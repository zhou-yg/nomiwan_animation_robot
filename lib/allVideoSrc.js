/**
 * Created by zyg on 15/6/22.
 */
var fs = require('fs');
var Q = require('Q');
var utils = require('./nmw_Utils');

var unSupportedSource = require('../config/unSupportSource');

var dir = 'data/';
    allEpisodesJson = dir + 'allEpisodes.json',
    destAllVideoSrcJson = dir + 'allEpisodesVideoSrc.json',
    startIndex = 0,
    eachQueryEpisodesNum = 20;


var dataFilePostFix = '.json';

//爬取分享的flash query器
var queryDir = '../query/';
var queryVideoSrcModule = queryDir + 'queryVideoSrc';

var queryVideoSrc = require(queryVideoSrcModule);

var queryAllVideoSrc = function(allEpisodesJson,cb){
    //动漫对象集合数组
    var allAnimationObjArr = JSON.parse(fs.read(allEpisodesJson));

    //动漫视频源的链接集合的临时数组
    var videoSrcObjTmpArr = [];

    var animationIndex = startIndex,
        animationLen = allAnimationObjArr.length;

    //如果 开始处 加 每次爬取数量 小于 总长度，那么缩小总长度
    if(animationIndex+eachQueryEpisodesNum < animationLen){
        animationLen = animationIndex+eachQueryEpisodesNum;
    }else{
        eachQueryEpisodesNum = animationLen - animationIndex;
    }
    /**
     * 开始爬取每个动漫的每个源的每个剧集的每个视频链接
     *
     * @param animationName
     * @param sourceName
     * @param episodes
     * @returns {promise|*|Q.promise}
     */
    function open(animationName,sourceName,episodes){
        var d = Q.defer();

        var currentEpisodesIndex = 0,
            episodesLen = episodes.length;

        var oneSourceVideoSrcObj = {
            animationName:animationName,
            sourceName:sourceName,
            videoSrcObjArr:[]
        };

        var queryEachEpisodes = function () {

            if(currentEpisodesIndex<episodesLen){

                try{

                    var videoSiteHref = episodes[currentEpisodesIndex];

                    var queryVideoSrcPromise = queryVideoSrc.open({
                        sourceName: sourceName,
                        videoSiteHref: videoSiteHref
                    });
                    /**
                     * videoSrcObj = {
                     *   sourceName
                     *   videoSrcArr
                     * }
                     */
                    queryVideoSrcPromise.done(function (videoSrcObj) {
                        console.log(currentEpisodesIndex+'.',animationName,JSON.stringify(videoSrcObj,undefined,1));
                        oneSourceVideoSrcObj.videoSrcObjArr.push(videoSrcObj);

                        currentEpisodesIndex++;
                        queryEachEpisodes();
                    });
                    queryVideoSrcPromise.fail(function (errObj) {
                        utils.log(errObj);

                        currentEpisodesIndex++;
                        queryEachEpisodes();
                    })


                }catch (e){
                    utils.log(e);

                    currentEpisodesIndex++;
                    queryEachEpisodes();
                }
            }else{
                d.resolve(oneSourceVideoSrcObj);
            }
        };
        queryEachEpisodes();

        return d.promise;
    }
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
                        //console.log('s:',sourceName,' ',animationName);
                        currentSourceIndex++;
                        eachSources();

                    }else{
                        var queryPromise = open(animationName,sourceName,episodes);
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
                            console.log(currentSourceIndex+'.',animationName,JSON.stringify(oneSourceVideoSrcObj,undefined,1));
                            videoSrcObjArr.push(oneSourceVideoSrcObj);

                            currentSourceIndex++;
                            eachSources();
                        });
                    }
                }catch (e){
                    utils.log(e)

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
                        console.log('======================================================');
                        console.log(animationIndex,'. ',JSON.stringify(episodeObjArrLite,undefined,1));
                        videoSrcObjTmpArr = videoSrcObjTmpArr.concat(episodeObjArrLite);

                        animationIndex++;
                        eachAnimationObj();
                    });


                },300);

            }catch (e){
                utils.log(e);

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
    var fileFullName = destAllVideoSrcJson;
    var backupsFileFullName = fileFullName.replace(utils.jsonBackupRegExp,
                                                   utils.getEpisodesPiecesName(startIndex,eachQueryEpisodesNum) + dataFilePostFix);

    if (fs.exists(fileFullName)) {
        fs.copy(fileFullName, backupsFileFullName);
    }

    var contents = JSON.stringify(videoSrcObjTmpArr);

    fs.write(fileFullName, contents, 'w');
};
/**
 * 保存all
 *
 * @param allAnimationObjArr
 */
var saveAllJson = function(allAnimationObjArr){

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

        var err = null;

        if(!fs.exists(allEpisodesJson)){
            err = {
                msg:'allEpisodesJson not exist'
            }
        }
        if(err){
            cb(err);
        }else{

            queryAllVideoSrc(allEpisodesJson,function(allAnimationObjArr,videoSrcObjTmpArr){
                console.log(JSON.stringify(videoSrcObjTmpArr,undefined,2));

                saveAllVideoSrcJson(videoSrcObjTmpArr);

                combineAllVideoSrc(allAnimationObjArr,videoSrcObjTmpArr);

                saveAllJson(allAnimationObjArr);

                cb();
            });
        }
    }
};