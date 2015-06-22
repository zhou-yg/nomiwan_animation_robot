/**
 * Created by zyg on 15/6/21.
 */
var fs = require('fs');
var Q = require('q');
var U = require('nmw_Utils');

var pageCreator = require('webpage');

var saveJsonDirPath = './db/';
var saveJsonPostFix = '.json';

var allQueries = {
    iqiyi: {
        query: function () {

            return function () {
                var selector = 'div.wrapper-week div.weekline_list > div ul.site-piclist-11665 > li > div > a';
                var imgSelector = 'div img';
                var nameSelector = 'div h4';

                var allA = document.querySelectorAll(selector);

                var tmp = [];
                var i = 0, len = allA.length,
                    aLink = imgDom = h4Dom = null,
                    otherRegExp = /[:|：][\W\w]*/;

                for (; i < len; i++) {
                    aLink = allA[i];
                    imgDom = aLink.querySelector(imgSelector);
                    h4Dom = aLink.querySelector(nameSelector);

                    var tmpName = h4Dom.title || h4Dom.alt;
                    tmpName = tmpName.replace(otherRegExp, '');

                    tmp.push({
                        name: tmpName,
                        href: aLink.href,
                        img: imgDom.src
                    });
                }

                return tmp;
            };
        }
    },
    pptv: {
        query: function () {
            return function () {
                var selector = 'div.r_w265 > div dl > dt > a';
                var imgSelector = 'img';

                var allA = document.querySelectorAll(selector);

                var tmp = [];
                var i = 0, len = allA.length,
                    aLink = imgDom = h4Dom = null,
                    otherRegExp = /[:|：][\W\w]*/;

                for (; i < len; i++) {
                    aLink = allA[i];
                    imgDom = aLink.querySelector(imgSelector);

                    tmp.push({
                        name: aLink.title,
                        href: aLink.href,
                        img: imgDom.src
                    });
                }

                return tmp;
            };
        }
    },
    tudou: {
        query: function () {

            return function () {
                var selector = 'div.box .ani_part02 .part02_list > ul > li';
                var getNewAnimationHooks = function (liArr) {
                    var i,
                        len = liArr.length,
                        liOne = null,
                        children = null,
                        p = null;

                    // p
                    for (i = 0; i < len; i++) {
                        liOne = liArr[i];
                        children = liOne.children;
                        if (children.length == 1) {

                        } else if (children.length == 2) {
                            p = children[1];
                            children[0].appendChild(p);
                        }
                    }
                    // p.a
                    for (i = 0; i < len; i++) {
                        liOne = liArr[i];
                        children = liOne.children[0].children;
                        if (children[1].children.length > 0) {
                            children[1].innerText = children[1].children[0].innerText;
                        }
                    }
                    return liArr;
                };

                var ul = document.querySelectorAll(selector);
                ul = getNewAnimationHooks(ul);

                var tmp = [];
                var i = 0, len = ul.length;

                for (; i < len; i++) {
                    var liOne = ul[i];

                    var a = liOne.children[0];

                    tmp.push({
                        name: a.innerText.replace(/\n/g, ''),
                        img: a.children[0].src,
                        href: a.href
                    })
                }

                return tmp;
            };
        }
    },
    youku: {
        query: function () {

            return function () {
                //获取‘重磅推荐’
                var getRecommend = function () {
                    var selector = 'table.tt tbody tr td > a';
                    var recommendArr = document.querySelectorAll(selector);

                    var tmp = [];
                    var i = 0, len = recommendArr.length;
                    for (; i < len; i++) {
                        var aDomObj = recommendArr[i];
                        var imgDomObj = aDomObj.querySelector('img');
                        if (imgDomObj) {
                            tmp.push({
                                name: imgDomObj.alt,
                                img: imgDomObj.src,
                                href: aDomObj.href
                            })
                        }
                    }
                    return tmp;
                };

                //获取’本季必看，漫改动画，续作系列，其它改编‘
                var getOtherList = function () {
                    var selector = 'div.yk-body > .yk-row';
                    var selectorImg = selector + ' .v img';
                    var selectorA = selector + ' .v .v-link a';

                    var imgDomArr = document.querySelectorAll(selectorImg);
                    var aDomArr = document.querySelectorAll(selectorA);

                    var tmp = [];
                    if (imgDomArr.length == aDomArr.length) {
                        var i = 0, len = imgDomArr.length;
                        for (; i < len; i++) {
                            tmp.push({
                                name: imgDomArr[i].alt,
                                img: imgDomArr[i].src,
                                href: aDomArr[i].href
                            })
                        }
                    }
                    return tmp;
                };

                var tmp1 = getRecommend(),
                    tmp2 = getOtherList();

                return tmp1.concat(tmp2);
            }
        }
    }
};
/**
 * 保存爬到的所有动漫
 * @param animationArr
 * @param sourceName
 */
var saveJson = function (sourceName, animationArr) {
    var fileFullName = saveJsonDirPath + sourceName + saveJsonPostFix;
    var backupsFileFullName = fileFullName.replace(/\.[*]/g, U.getNow()+saveJsonPostFix);

    if(fs.exists(fileFullName)){
        fs.copy(fileFullName,backupsFileFullName);
    }

    var contents = JSON.stringify({
        source: sourceName,
        animationArr: animationArr
    });

    fs.write(fileFullName, contents, 'w');
};
/**
 * @param option
 *          sourceName:视频源，即网站名
 *          href:要爬的链接
 *          saveJson:存储爬的结果
 * @returns {promise|*|Q.promise}
 */
exports.open = function (option) {


    var deferred = Q.defer();

    if (!(option.sourceName && option.address && option.saveJsonDirPath)) {
        return;
    }

    var sourceName = option.sourceName,
        address = option.address;

    saveJsonDirPath = option.saveJsonDirPath || saveJsonDirPath;

    var page = pageCreator.create();

    page.settings.resourceTimeout = 2000;

    page.onResourceTimeout = function (req) {
        //console.log(JSON.stringify(req,undefined,2));
        //console.log('===============================');
    };
    page.onConsoleMessage = function (msg, lineNum, sourceId) {
        console.log('CONSOLE: ' + msg);
    };
    page.open(address, function (status) {

        var sourceObj = allQueries[sourceName];

        if (sourceObj) {
            var query = sourceObj.query();

            var newAnimationArr = page.evaluate(query);
            //console.log(JSON.stringify(tudouNewAnimationArr,undefined,4));
            console.log('--------------' + sourceName + ' query done ------------------');
            saveJson(sourceName, newAnimationArr);

            deferred.resolve(sourceName);
        } else {
            var err = 'there is no source of "' + sourceName + '"';
            console.log(err);
            deferred.reject(err);
        }
    });

    return deferred.promise
};