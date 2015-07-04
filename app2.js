/**
 * Created by zyg on 15/6/21.
 */
var sys = require('system');
var utils = require('./lib/nmw_Utils.js');
var allVideoSrc = require('./lib/allVideoSrc.js');
//var allVideoSrc = require('./lib/allVideoSrc_episodes.js');

var t1 = +new Date();

var startIndex = parseInt(sys.args[1]),
    eachQueryEpisodesNum = parseInt(sys.args[2]);

startIndex = isNaN(startIndex) ? 0:startIndex;
eachQueryEpisodesNum = isNaN(eachQueryEpisodesNum) ? 5 :eachQueryEpisodesNum;

allVideoSrc.getVideoSrc({
    startIndex:startIndex,
    eachQueryEpisodesNum:eachQueryEpisodesNum,
    //allEpisodesJson:'data/allEpisodes.json',
    allEpisodesJson:'allAnimationEpisodes_copy.json',
    destAllVideoSrcJson:'allVideoSrc.json'
},function(err,data){

    utils.log(err);

    var t2 = +new Date();
    var cost = (t2 - t1) / 1000;
    console.log('===== 爬'+data+'个剧集 总共耗时：', cost, ' 秒 ======');

    phantom.exit();
});