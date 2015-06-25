/**
 * Created by zyg on 15/6/21.
 */
var fs = require('fs');
var Q = require('Q');
var utils = require('../lib/nmw_Utils');

var dir = 'data/';
var srcAllJson = dir + 'all.json';
var destEpisodesJson = dir + 'allEpisodes.json';
var destAllAnimationJson = dir + 'allAnimationEpisodes.json';

var dataFilePostFix = '.json';

//剧集页
var queryDir = '../query/';
var queryEpisodesModule = queryDir + 'queryEpisodes';

var queryEpisodes = require(queryEpisodesModule);

//获取所有漫的剧集链接
var queryAllEpisodeUrls = function (srcAllJson, cb) {
    //动漫对象集合数组
    var allAnimationObjArr = JSON.parse(fs.read(srcAllJson));

    //存放剧集的临时数组
    var episodeObjTmpArr = [];

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
    function eachAnimationObj() {
        if (animationIndex < animationLen) {
            var currentAllPromises = [];

            var animationObj = allAnimationObjArr[animationIndex];

            var animationName = animationObj.name;
            var sources = animationObj.sources;

            var promise = open(sources, animationName);
            promise.done(function (episodeObjArrLite) {

                episodeObjTmpArr = episodeObjTmpArr.concat(episodeObjArrLite);

                animationIndex++;
                eachAnimationObj();
            });

        } else {

            cb(allAnimationObjArr, episodeObjTmpArr);
        }
    };

    eachAnimationObj();
};
/**
 * 排序，归并所有的剧集
 *
 * @param allAnimationObjArr
 * @param episodeObjTmpArr
 */
var combineAllEpisodeObj = function (allAnimationObjArr, episodeObjTmpArr) {
    var allAniLen = allAnimationObjArr.length;

    function insertEpisodesInto(aniName, sName, aniEpiArr) {

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
                sourceFind.episodes = aniEpiArr;
            }
        }
    }

    for (var i = 0, len = episodeObjTmpArr.length; i < len; i++) {
        var episodesSet = episodeObjTmpArr[i];

        var animationName = episodesSet.animationName,
            sourceName = episodesSet.sourceName,
            animationEpisodesArr = episodesSet.animationEpisodesArr;

        insertEpisodesInto(animationName, sourceName, animationEpisodesArr);
    }
};
/**
 * 保存爬到的所有动漫的剧集
 * @param episodeObjTmpArr
 */
var saveEpiJson = function (episodeObjTmpArr) {

    var fileFullName = destEpisodesJson;
    var backupsFileFullName = fileFullName.replace(/\.[\w]*/g, utils.getNow() + dataFilePostFix);

    if (fs.exists(fileFullName)) {
        fs.copy(fileFullName, backupsFileFullName);
    }

    var contents = JSON.stringify(episodeObjTmpArr);

    fs.write(fileFullName, contents, 'w');
};
/**
 * 保存排序歸併后的动漫剧集
 * @param animationArr
 */
var saveAllJson = function (animationArr) {

    var fileFullName = destAllAnimationJson;
    var backupsFileFullName = fileFullName.replace(/\.[\w]*/g, utils.getNow() + dataFilePostFix);

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
        srcAllJson = option.srcAllJson || srcAllJson;
        destEpisodesJson = option.destEpisodesJson || destEpisodesJson;
        destAllAnimationJson = option.destAllAnimationJson || destAllAnimationJson;

        var err = null;

        if (!fs.exists(srcAllJson)) {
            err = {
                msg: 'srcAllJson not exist'
            };
        }
        if (err) {
            cb(err)
        } else {

            queryAllEpisodeUrls(srcAllJson, function (allAnimationObjArr, episodeObjTmpArr) {

                combineAllEpisodeObj(allAnimationObjArr, episodeObjTmpArr);
                saveEpiJson(episodeObjTmpArr);
                saveAllJson(allAnimationObjArr);

                cb()
            });
        }
    }
};
