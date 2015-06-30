/**
 * Created by zyg on 15/6/21.
 */
var sys = require('system');
var utils = require('./lib/nmw_Utils.js');
var allVideoSrc = require('./lib/allVideoSrc_episodes.js');

var t1 = +new Date();

var startIndex = parseInt(sys.args[1]),
    eachQueryEpisodesNum = parseInt(sys.args[2]);

allVideoSrc.getVideoSrc({
    startIndex:startIndex,
    eachQueryEpisodesNum:eachQueryEpisodesNum,
    allEpisodesJson:'data/allEpisodes.json',
    destAllVideoSrcJson:'data/allVideoSrc.json'
},function(err,data){

    var t2 = +new Date();
    var cost = (t2 - t1) / 1000;
    console.log('===== 爬'+eachQueryEpisodesNum+'个剧集 总共耗时：', cost, ' 秒 ======');

    phantom.exit();
});