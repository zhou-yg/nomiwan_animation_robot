/**
 * Created by zyg on 15/6/24.
 */
var Q = require('Q');
var pageCreator = require('webpage');
var utils = require('../lib/nmw_Utils');

var allVideoSrcQueries = {
    iqiyi:{
        query:function(){

            return function(){
                var sharedVideoButtonSelector = 'div.act_shares a';
                var sharedVideoSrcInputSelector = 'input.code-input';

                var srcArr = [];

                try{
                    var sharedVideoButton = document.querySelector(sharedVideoButtonSelector);
                    if(sharedVideoButton){
                        sharedVideoButton.click();

                        //只有这个点击后才能获取到下面的input们 2015.6.25
                        var videoSrcInputs = document.querySelectorAll(sharedVideoSrcInputSelector);

                        //0.网址 1.swf 2.embed 从本身的网址不需要，从1开始
                        /*
                         for(var i= 1,len=videoSrcInputs.length;i<len;i++){
                         srcArr.push(videoSrcInputs[i].value)
                         }
                         */
                        if(videoSrcInputs.length>0){

                            srcArr.push(videoSrcInputs[1].value);
                            srcArr.push(videoSrcInputs[2].value);
                        }
                    }
                }catch (e){


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

                var srcArr = [];

                var sharedVideoButton = document.querySelector(sharedVideoButtonSelector);
                if(sharedVideoButton){

                    sharedVideoButton.click();

                    //只有这个点击后才能获取到下面的input们 2015.6.25
                    var videoSrcInputs = document.querySelectorAll(sharedVideoSrcInputSelector);


                    //0.iframe 1.swf 2.embed
                    /*
                    for(var i= 0,len=videoSrcInputs.length;i<len;i++){
                        srcArr.push(videoSrcInputs[i].value)
                    }
                    */
                    if(videoSrcInputs.length>0){

                        srcArr.push(videoSrcInputs[0].value);
                        srcArr.push(videoSrcInputs[1].value);
                        srcArr.push(videoSrcInputs[2].value);
                    }
                }
                return srcArr;
            }
        }
    },
    youku:{
        query:function(){
            return function(){
                var sharedVideoSrcInputSelector = 'input.form_input';

                var srcArr = [];

                //只有这个点击后才能获取到下面的input们 2015.6.25
                var videoSrcInputs = document.querySelectorAll(sharedVideoSrcInputSelector);

                //0.网址 1.swf 2.embed 3.iframe ,从本身的网址不需要，从1开始
                /*
                for(var i= 1,len=videoSrcInputs.length;i<len;i++){
                    srcArr.push(videoSrcInputs[i].value)
                }
                */
                if(videoSrcInputs.length > 0){

                    srcArr.push(videoSrcInputs[1].value);
                    srcArr.push(videoSrcInputs[2].value);
                    srcArr.push(videoSrcInputs[3].value);
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
        //utils.log(JSON.stringify(req,undefined,2));
        //utils.log('===============================');
    };
    page.onConsoleMessage = function(msg, lineNum, sourceId) {
        //utils.log('CONSOLE: ' + msg);
    };
    //utils.log(sourceName,':',videoSiteHref);
    page.open(videoSiteHref,function(status){
        utils.log(status);

        var sourceObj = allVideoSrcQueries[sourceName];

        var videoSrcObj = {
            sourceName:sourceName,
            videoSrcArr:[]
        };

        if(status === 'success' && sourceObj){

            var query = sourceObj.query();

            try{
                var videoSrcArr = page.evaluate(query);

                videoSrcObj.videoSrcArr = videoSrcArr;

                utils.log('----------  query : '+sourceName+' episodes done ------------------');
                //utils.log(JSON.stringify(animationEpisodesArr,undefined,2));
                deferred.resolve(videoSrcObj);
            }catch (e){
                deferred.resolve(videoSrcObj);
            }


        }else{

            var err = 'there is no source of "'+sourceName+'"';
            deferred.reject(err);
        }
    });

    return deferred.promise
};