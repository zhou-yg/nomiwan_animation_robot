/**
 * Created by zyg on 15/6/21.
 */

var allVideoSrc = require('./lib/allVideoSrc_episodes.js');

var t1 = +new Date();

allVideoSrc.getVideoSrc({
    allEpisodesJson:'data/allEpisodes.json',
    destAllVideoSrcJson:'data/allVideoSrc.json'

},function(err,data){

    var t2 = +new Date();
    var cost = (t2 - t1) / 1000;
    console.log('===== 爬剧集 耗时：', cost, ' 秒 ======');

    phantom.exit();
});