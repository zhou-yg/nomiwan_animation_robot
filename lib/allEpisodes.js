/**
 * Created by zyg on 15/6/21.
 */
var fs = require('fs');
var Q = require('Q');
var U = require('../lib/nmw_Utils');

var dir = 'data/';
var srcAllJson = dir + 'all.json';
var destEpisodesJson = dir + 'allEpisodes.json';
var destAllAnimationJson = dir + 'allAnimationEpisodes.json';

var dataFilePostFix = '.json';

//剧集页
var queryDir = '../query/';
var queryEpisodesModule = queryDir + 'queryEpisodes';


var log = function (arg) {
    if (typeof arg === 'object') {
        arg = JSON.stringify(arg, undefined, 2);
    }
    console.log.apply(console, arguments);
};

//获取所有漫的剧集链接
var queryAllEpisodeUrls = function (srcAllJson, cb) {
    var allAnimationObjArr = JSON.parse(fs.read(srcAllJson));

    var episodeObjArr = [];

    var animationIndex = 0,
        animationLen = allAnimationObjArr.length;

    /**
     * 开始爬取该动漫对应的每个源的剧集
     * @param sources
     * @param animationName
     * @returns {|promise|Q.promise}
     */
    function open(sources, animationName) {

        var d = Q.defer();

        var currentSourceIndex = 0;
        var sourceLen = sources.length;

        var episodesObjArr = [];

        var queryEverySource = function () {

            if (currentSourceIndex < sourceLen) {

                var sourceObj = sources[currentSourceIndex];
                var sourceName = sourceObj.sourceName;
                var href = sourceObj.href;

                var queryEpisodes = require(queryEpisodesModule);

                var queryPromise = queryEpisodes.open({
                    animationName: animationName,
                    sourceName: sourceName,
                    href: href
                });
                queryPromise.done(function (episodesObj) {
                    episodesObjArr.push(episodesObj);
                    currentSourceIndex++;

                    queryEverySource();
                });
            } else {

                d.resolve(episodesObjArr);
            }
        };
        queryEverySource();

        return d.promise;
    }

    /**
     * 遍历每个动漫对象，获取其资源列
     */
    function getAnimationObj() {
        if (animationIndex < animationLen) {
            var currentAllPromises = [];

            var animationObj = allAnimationObjArr[animationIndex];

            var animationName = animationObj.name;
            var sources = animationObj.sources;

            var promise = open(sources, animationName);
            promise.done(function (episodeObjArrLite) {

                episodeObjArr = episodeObjArr.concat(episodeObjArrLite);

                animationIndex++;
                getAnimationObj();
            });

        } else {

            cb(allAnimationObjArr, episodeObjArr);
        }
        /*
         if (animationIndex < animationLen) {
         var currentAllPromises = [];

         var animationObj = allAnimationObjArr[animationIndex];

         var animationName = animationObj.name;
         var sources = animationObj.sources;

         currentSourceIndex = 0;
         sourceLen = sources.length;

         for (; currentSourceIndex < sourceLen; currentSourceIndex++) {
         currentAllPromises.push(open(sources[currentSourceIndex], animationName));
         }
         Q.all(currentAllPromises).done(function (episodeObjArrLite) {

         episodeObjArr = episodeObjArr.concat(episodeObjArrLite);

         animationIndex++;
         getAnimationObj();
         });

         } else {

         cb(allAnimationObjArr, episodeObjArr);
         }
         */
    };

    getAnimationObj();
};
/**
 * 排序，归并所有的剧集
 *
 * @param allAnimationObjArr
 * @param episodeObjArr
 */
var combineAllEpisodeObj = function (allAnimationObjArr, episodeObjArr) {
    var allAniLen = allAnimationObjArr.length;

    function insertInto(aniName, sName, aniEpiArr) {

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
            log(aniFind);
            var sources = aniFind.sources;
            for (var j = 0, len = sources.length; j < len; j++) {
                var sourceObj = sources[j];
                if (sourceObj.sourceName === sName) {
                    sourceFind = sourceObj;
                    break;
                }
            }
            if (sourceFind) {
                sourceFind.episodes = aniEpiArr;
            }
        }
    }

    for (var i = 0, len = episodeObjArr.length; i < len; i++) {
        var episodesSet = episodeObjArr[i];

        var animationName = episodesSet.animationName,
            sourceName = episodesSet.sourceName,
            animationEpisodesArr = episodesSet.animationEpisodesArr;

        insertInto(animationName, sourceName, animationEpisodesArr);
    }
};
/**
 * 保存爬到的所有动漫的剧集
 * @param episodeObjArr
 */
var saveEpiJson = function (episodeObjArr) {

    var fileFullName = destEpisodesJson;
    var backupsFileFullName = fileFullName.replace(/\.[\w]*/g, U.getNow() + dataFilePostFix);

    if (fs.exists(fileFullName)) {
        fs.copy(fileFullName, backupsFileFullName);
    }

    var contents = JSON.stringify(episodeObjArr);

    fs.write(fileFullName, contents, 'w');
};
/**
 * 保存排序歸併后的动漫剧集
 * @param animationArr
 */
var saveAllJson = function (animationArr) {

    var fileFullName = destAllAnimationJson;
    var backupsFileFullName = fileFullName.replace(/\.[\w]*/g, U.getNow() + dataFilePostFix);

    if (fs.exists(fileFullName)) {
        fs.copy(fileFullName, backupsFileFullName);
    }

    var contents = JSON.stringify(animationArr);

    fs.write(fileFullName, contents, 'w');
};

module.exports = {
    /*
     *
     * option =
     *  srcAllJson:读取所有animation的源 json文件
     *  destEpisodesJson:存剧集链接的 json文件
     * */
    getEpisodeUrls: function (option, cb) {
        var srcAllJson = option.srcAllJson || srcAllJson;
        destEpisodesJson = option.destEpisodesJson || destEpisodesJson;
        destAllAnimationJson = option.destAllAnimationJson || destAllAnimationJson;

        var isExists = fs.exists(srcAllJson);
        var err = null;

        if (!isExists) {
            err = {
                msg: 'not exist'
            };
        }
        if (err) {
            cb(err)
        } else {

            queryAllEpisodeUrls(srcAllJson, function (allAnimationObjArr, episodeObjArr) {

                combineAllEpisodeObj(allAnimationObjArr, episodeObjArr);
                saveEpiJson(episodeObjArr);
                saveAllJson(allAnimationObjArr);

                cb()
            });
        }
    }
};
