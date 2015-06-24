/**
 * Created by zyg on 15/6/22.
 */
var fs = require('fs');
var Q = require('Q');
var utils = require('../lib/nmw_Utils');

var dir = 'data/';
var allEpisodesJson = dir + 'allEpisodes.json';
var destAllVideoSrcJson = dir + 'allEpisodesVideoSrc.json';

var dataFilePostFix = '.json';

//爬取分享的flash query器
var queryDir = '../query/';
var queryVideoSrcModule = queryDir + 'queryVideoSrc';

var queryVideoSrc = require(queryVideoSrcModule);

var queryAllVideoSrc = function(allEpisodesJson){
    //动漫对象集合数组
    var allAnimationObjArr = JSON.parse(fs.read(allEpisodesJson));

    //动漫视频源的链接集合的临时数组
    var videoSrcObjTmpArr = [];

    var animationIndex = 0,
        animationLen = allAnimationObjArr.length;

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

                var videoSiteHref = episodes[currentEpisodesIndex];

                var queryVideoSrcPromise = queryVideoSrc.open({
                    sourceName:sourceName,
                    videoSiteHref:videoSiteHref
                });
                queryVideoSrc.done(function (videoSrcObj) {
                    oneSourceVideoSrcObj.videoSrcObjArr.push(videoSrcObj);
                    currentEpisodesIndex++;

                    queryEachEpisodes();
                });
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

                var sourceObj = sources[currentSourceIndex];
                var sourceName = sourceObj.sourceName;
                var episodes = sourceObj.episodes;

                /**
                 * pptv目前不支持分享视频
                 */
                if(sourceName === 'pptv'){
                    currentSourceIndex++;
                    eachSources();

                }else{
                    var queryPromise = open(animationName,sourceName,episodes);
                    queryPromise.done(function (oneSourceVideoSrcObj) {
                        videoSrcObjArr.push(oneSourceVideoSrcObj);

                        currentSourceIndex++;
                        eachSources();
                    });
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
            var currentAllPromises = [];

            var animationObj = allAnimationObjArr[animationIndex];

            var animationName = animationObj.name;
            var sources = animationObj.sources;

            var promise = openSources(sources, animationName);
            promise.done(function (episodeObjArrLite) {

                videoSrcObjTmpArr = videoSrcObjTmpArr.concat(episodeObjArrLite);

                animationIndex++;
                eachAnimationObj();
            });

        } else {

            cb(allAnimationObjArr, videoSrcObjTmpArr);
        }
    };

    eachAnimationObj();
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

            queryAllVideoSrc(allEpisodesJson,function(){

                cb();
            });
        }
    }
};