/**
 * Created by zyg on 15/6/21.
 */
var Q = require('Q');
var pageCreator = require('webpage');

var allEpisodeQueries = {
    iqiyi:{
        query:function(){
            return function(){
                var selector = '.site-piclist-11665 > li > div > a';
                var imgSelector = 'img';

                var allA = document.querySelectorAll(selector);

                var tmp = [];

                for(var i= 0,len=allA.length;i<len;i++){
                    tmp.push(allA[i].href);
                }

                return  tmp;
            }
        }
    },
    pptv:{
        query:function(){
            return function(){
                var selector = '#dataList_juji ul.items > li > p > a';

                var allA = document.querySelectorAll(selector);

                var tmp = [];

                for(var i= 0,len=allA.length;i<len;i++){
                    tmp.push(allA[i].href);
                }

                return  tmp;
            }
        }
    },
    tudou:{
        query:function(){
            return function(){
                var selector = 'div.series_panel > a';

                var allA = document.querySelectorAll(selector);

                var tmp = [];

                for(var i= 0,len=allA.length;i<len;i++){
                    tmp.push(allA[i].href);
                }

                return  tmp;
            }
        }
    },
    youku:{
        query:function(){
            return function(){
                var selector = '#vpofficiallistv5 > div > div > ul > li > a';

                var allA = document.querySelectorAll(selector);

                var tmp = [];

                for(var i= 0,len=allA.length;i<len;i++){
                    tmp.push(allA[i].href);
                }

                return  tmp;
            }
        }
    }
};
/**
 *
 * @param option
 *   sourceName,视频源，即网站名
 *   href,该动漫对应的剧集列表页面
 */
exports.open = function(option){

    var deferred = Q.defer();

    var animationName = option.animationName,
        sourceName = option.sourceName,
        href = option.href;

    if(!(sourceName && href && animationName)){
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
    console.log('before <<<<<< ',animationName+' : '+sourceName);
    page.open(href,function(status){
        console.log('after >>>>>>>>> ',animationName, '   :  ',sourceName);
        var sourceObj = allEpisodeQueries[sourceName];

        if(sourceObj){
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