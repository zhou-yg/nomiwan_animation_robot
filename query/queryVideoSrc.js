/**
 * Created by zyg on 15/6/24.
 */
var Q = require('Q');
var pageCreator = require('webpage')

var allVideoSrcQueries = {
    iqiyi:{
    },
    tudou:{
    },
    youku:{
    }
}

/**
 *
 * @param option
 *   sourceName,视频源，即网站名
 *   siteHref,该动漫对应的剧集的视频播放页面
 */
exports.open = function(option){

    var deferred = Q.defer();

    var sourceName = option.sourceName,
        videoSiteHref = option.videoSiteHref;

    if(!(sourceName && videoSiteHref)){
        return;
    }

    var page = pageCreator.create();

    page.settings.resourceTimeout = 2000;

    page.onResourceTimeout = function(req){
        //console.log(JSON.stringify(req,undefined,2));
        //console.log('===============================');
    };
    page.onConsoleMessage = function(msg, lineNum, sourceId) {
        //console.log('CONSOLE: ' + msg);
    };
    page.open(href,function(status){
        var sourceObj = allVideoSrcQueries[sourceName];

        if(sourceObj && sourceObj.query){
            var query = sourceObj.query();

            var animationEpisodesArr = page.evaluate(query);

            console.log('----------  query '+animationName+' : '+sourceName+' episodes done ------------------');
            //console.log(JSON.stringify(animationEpisodesArr,undefined,2));

            deferred.resolve({
                href:href,
                animationName:animationName,
                sourceName:sourceName,
                animationEpisodesArr:animationEpisodesArr
            });
        }else{
            var err = 'there is no source of "'+sourceName+'"';
            console.log(err);
            deferred.reject(err);
        }
    });

    return deferred.promise
};