/**
 * Created by zyg on 15/6/21.
 */

var allEpisodes = require('./lib/allEpisodes.js');

var t1 = +new Date();

allEpisodes.getEpisodeUrls({
    srcAllJson:'data/all.json',
    destEpisodesJson:'data/allEpisodes.json'

},function(err,data){

    var t2 = +new Date();
    var cost = (t2 - t1) / 1000;
    console.log('===== 爬剧集 耗时：', cost, ' 秒 ======');

    phantom.exit();
});