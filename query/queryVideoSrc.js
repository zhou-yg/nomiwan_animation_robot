/**
 * Created by zyg on 15/6/24.
 */
var Q = require('Q');
var pageCreator = require('webpage');
var utils = require('../lib/nmw_Utils');
var monitorXhr = require('../config/monitorXhr');

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
                    }else{

                    }
                }
                return srcArr;
            }
        },
        queryScript:function(page,scriptUrl,videoSrcObj,callback){

            function query(){
                var embedTemplate = '<embed src="http://www.tudou.com/a/aCode/&bid=05&iid=iidCode&resourceId=0_05_05_99/v.swf" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" wmode="opaque" width="480" height="400"></embed>',
                    embedTmpArr = [];

                var selector = 'pre';
                var jsonpText = document.querySelector(selector).innerText;

                var len = jsonpText.length,
                    startIndex = 0,
                    endIndex = len - 1;

                for(;startIndex<len;startIndex++){
                    if(jsonpText[startIndex] === '('){
                        break;
                    }
                }
                for(;endIndex>0;endIndex--){
                    if(jsonpText[endIndex] === ')'){
                        break;
                    }
                }
                jsonpText = jsonpText.substring(startIndex+1,endIndex);
                jsonpTextObj = JSON.parse(jsonpText);
                var items = jsonpTextObj.items;
                for(var i= 0,itemsLen=items.length;i<itemsLen;i++){
                    var itemObj = items[i];
                    var acode = itemObj.acode,
                        iid = itemObj.iid;

                    var tmp = embedTemplate.replace(/aCode/,acode)
                        .replace(/iidCode/,iid);

                    embedTmpArr.push(tmp);
                }
                return embedTmpArr;
            };

            page.open(scriptUrl,function(status){
                utils.log('script open :',status);
                var allVideoSrcObj = {
                    all:[]
                };
                if(status === 'success'){

                    var embedArr = page.evaluate(query);

                    embedArr.forEach(function(ele){
                        var tmp = utils.clone(videoSrcObj);
                        tmp.videoSrcArr.push(ele);

                        allVideoSrcObj.all.push(tmp);
                    });
                }

                callback(allVideoSrcObj);
            });


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
    },
    bilibili:{
        queryScript:function(){

        }
    }
};


function openUrl(option){

    var deferred = Q.defer();

    var sourceName = option.sourceName,
        videoSiteHref = option.videoSiteHref;

    if(!(sourceName && videoSiteHref)){
        return;
    }
    var scriptUrl;

    var page = pageCreator.create();

    page.settings.resourceTimeout = 5000;
    var monitorObj = monitorXhr[sourceName];
    if(monitorObj){
        page.settings.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53';
    }

    page.onResourceTimeout = function(req){
        //console.log(JSON.stringify(req,undefined,2));
        //console.log('===============================');
    };
    page.onResourceRequested = function(req){
        if(monitorObj){
            var url = req.url;
            if(monitorObj.validate(url)){
                scriptUrl = url;
            }
        }
    };
    page.onResourceReceived = function(res){

    };
    page.onInitialized = function(){
    };

    page.onConsoleMessage = function(msg, lineNum, sourceId) {
        //console.log('--------  CONSOLE: ---------- \n' + msg);
    };
    try{
        //console.log(sourceName,':',videoSiteHref);
        page.open(videoSiteHref,function(status){
            console.log(status);

            var sourceObj = allVideoSrcQueries[sourceName];

            var videoSrcObj = {
                videoSiteHref:videoSiteHref,
                sourceName:sourceName,
                videoSrcArr:[]
            };

            //不能直接通过分享得到，而是需要通过拼接参数得到链接
            if(monitorObj){
                utils.log('script open :',scriptUrl);

                var allVideoSrcObj = sourceObj.queryScript(page,scriptUrl,videoSrcObj,function(allVideoSrcObj){

                    page.close();
                    deferred.resolve(allVideoSrcObj);
                });
            }else{
                if(status === 'success' && sourceObj){

                    var query = sourceObj.query();

                    var videoSrcArr = page.evaluate(query);

                    videoSrcObj.videoSrcArr = videoSrcArr;

                    page.close();
                    deferred.resolve(videoSrcObj);
                }else{
                    var err = 'there is no source of "'+sourceName+'"';
                    page.close();
                    deferred.reject(err);
                }
            }
        });
    }catch (e){
        console.log('open e:',e);
    }
    return deferred.promise
};
/**
 * 开始爬取每个动漫的每个源的每个剧集的每个视频链接
 *
 * @param animationName
 * @param sourceName
 * @param episodes
 * @returns {promise|*|Q.promise}
 */
exports.open = function(animationName,sourceName,episodes,t1,animationIndex) {
    var d = Q.defer();

    var currentEpisodesIndex = 0,
        episodesLen = episodes.length;

    var oneSourceVideoSrcObj = {
        animationName: animationName,
        sourceName: sourceName,
        videoSrcObjArr: []
    };


    var queryEachEpisodes = function () {

        if (currentEpisodesIndex < episodesLen) {

            try {

                var videoSiteHref = episodes[currentEpisodesIndex];

                var queryVideoSrcPromise = openUrl({
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
                    var t2 = +new Date();
                    var cost = (t2 - t1) / 1000;
                    try{
                        if(videoSrcObj.all){
                            utils.log(videoSrcObj.all);
                        }
                    }catch (e){
                        console.log(e);
                    }
                    if(videoSrcObj.all){
                        utils.log(animationName + ' 第' + animationIndex + '个剧集，' + sourceName + '全部源 耗时：', cost, ' 秒 ===============');
                        oneSourceVideoSrcObj.videoSrcObjArr = videoSrcObj.all;

                        d.resolve(oneSourceVideoSrcObj);
                    }else{
                        utils.log(animationName + ' 第' + animationIndex + '个剧集，' + sourceName + '第' + currentEpisodesIndex + '个源 耗时：', cost, ' 秒 ===============');
                        oneSourceVideoSrcObj.videoSrcObjArr.push(videoSrcObj);

                        currentEpisodesIndex++;
                        queryEachEpisodes();
                    }
                });
                queryVideoSrcPromise.fail(function (errObj) {
                    utils.log(errObj);

                    currentEpisodesIndex++;
                    queryEachEpisodes();
                })

            } catch (e) {
                console.log(e);

                currentEpisodesIndex++;
                queryEachEpisodes();
            }
        } else {
            d.resolve(oneSourceVideoSrcObj);
        }
    };
    queryEachEpisodes();

    return d.promise;
};