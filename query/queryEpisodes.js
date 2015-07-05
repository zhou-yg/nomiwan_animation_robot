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
                function selector1(){
                    var selector = '#dataList_juji ul.items > li > p > a';

                    var allA = document.querySelectorAll(selector);

                    var tmp = [];

                    for(var i= 0,len=allA.length;i<len;i++){
                        tmp.push(allA[i].href);
                    }

                    return  tmp;
                }
                function selector2(){
                    var selector = '#div_source_data .sets_long > a';

                    var allA = document.querySelectorAll(selector);

                    var tmp = [];

                    for(var i= 0,len=allA.length;i<len;i++){
                        tmp.push(allA[i].href);
                    }

                    return  tmp;
                }
                var arr = selector1();
                if(arr.length === 0){
                    arr = selector2();
                }
                return arr;
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
                var tmp = [];
                function selector1(){
                    var selector = '#vpofficiallistv5 > div > div > ul > li > a';
                    var allA = document.querySelectorAll(selector);

                    var tmp1 = [];

                    for(var i= 0,len=allA.length;i<len;i++){
                        tmp1.push(allA[i].href);
                    }

                    return tmp1;
                }
                function selector2(){
                    var selector = '.coll_2 > ul > li > a';
                    var allA = document.querySelectorAll(selector);

                    var tmp2 = [];

                    for(var i= 0,len=allA.length;i<len;i++){
                        tmp2.push(allA[i].href);
                    }
                    return tmp2;
                }
                tmp = selector1();
                if(tmp.length === 0){
                    tmp = selector2();
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
    page.open(href,function(status){
        var sourceObj = allEpisodeQueries[sourceName];

        if(status === 'success' ){
            var query = sourceObj.query();

            var animationEpisodesArr = page.evaluate(query);

            page.close();
            deferred.resolve({
                href: href,
                animationName: animationName,
                sourceName: sourceName,
                animationEpisodesArr: animationEpisodesArr
            });
        }else{
            var err = 'open page failed "'+sourceName+'" '+href;
            deferred.reject(err);
        }
    });

    return deferred.promise
};