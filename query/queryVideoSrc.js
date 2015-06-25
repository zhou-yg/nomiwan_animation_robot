/**
 * Created by zyg on 15/6/24.
 */
var Q = require('Q');
var pageCreator = require('webpage')

var allVideoSrcQueries = {
    iqiyi:{
        query:function(){

            return function(){
                var sharedVideoButtonSelector = 'div.act_shares a';
                var sharedVideoSrcInputSelector = 'input.code-input';

                var sharedVideoButton = document.querySelector(sharedVideoButtonSelector);
                sharedVideoButton.click();

                //只有这个点击后才能获取到下面的input们 2015.6.25
                var videoSrcInputs = document.querySelectorAll(sharedVideoSrcInputSelector);

                var srcArr = [];

                //0.网址 1.swf 2.embed 从本身的网址不需要，从1开始
                for(var i= 1,len=videoSrcInputs.length;i<len;i++){
                    srcArr.push(videoSrcInputs[i].value)
                }

                return srcArr;
            }
        }
    },
    tudou:{
        query:function(){
            return function(){
                var sharedVideoButtonSelector = 'a.btn_desc';
                var sharedVideoSrcInputSelector = 'input.txt';

                var sharedVideoButton = document.querySelector(sharedVideoButtonSelector);
                sharedVideoButton.click();

                //只有这个点击后才能获取到下面的input们 2015.6.25
                var videoSrcInputs = document.querySelectorAll(sharedVideoSrcInputSelector);

                var srcArr = [];

                //0.iframe 1.swf 2.embed
                for(var i= 0,len=videoSrcInputs.length;i<len;i++){
                    srcArr.push(videoSrcInputs[i].value)
                }

                return srcArr;

            }
        }
    },
    youku:{
        query:function(){
            return function(){
                var sharedVideoSrcInputSelector = 'input.form_input';

                //只有这个点击后才能获取到下面的input们 2015.6.25
                var videoSrcInputs = document.querySelectorAll(sharedVideoSrcInputSelector);

                var srcArr = [];

                //0.网址 1.swf 2.embed 3.iframe ,从本身的网址不需要，从1开始
                for(var i= 1,len=videoSrcInputs.length;i<len;i++){
                    srcArr.push(videoSrcInputs[i].value)
                }

                return srcArr;
            }
        }
    }
};

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
    console.log(sourceName,':',videoSiteHref);
    page.open(videoSiteHref,function(status){
        console.log(status);

        var sourceObj = allVideoSrcQueries[sourceName];

        if(status === 'success' && sourceObj){
            var query = sourceObj.query();

            console.log(1);

            var videoSrcArr = page.evaluate(query);

            console.log('----------  query : '+sourceName+' episodes done ------------------');
            //console.log(JSON.stringify(animationEpisodesArr,undefined,2));

            deferred.resolve({
                sourceName:sourceName,
                videoSrcArr:videoSrcArr
            });
        }else{
            console.log(2);

            var err = 'there is no source of "'+sourceName+'"';
            console.log('err:',err);
            deferred.reject(err);
        }
    });

    return deferred.promise
};