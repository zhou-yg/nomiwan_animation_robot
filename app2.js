/**
 * Created by zyg on 15/7/5.
 */
/**
 * Created by zyg on 15/6/21.
 */
var sys = require('system');
var utils = require('./lib/nmw_Utils.js');
var allEpisodes = require('./lib/allEpisodes.js');
//var allVideoSrc = require('./lib/allVideoSrc_episodes.js');

var t1 = +new Date();


exports.query = function(cb){

    allEpisodes.getEpisodeUrls({
        srcAllJson:'all.json',
        //allEpisodesJson:'data/allEpisodes.json',
        destEpisodesJson:'allEpisodes.json',
        destAllAnimationJson:'allAnimationEpisodes.json'
    },function(err,data){

        if(err){
            utils.log('cb err:',err);
        }

        var t2 = +new Date();
        var cost = (t2 - t1) / 1000;
        console.log('===== 爬'+data+'个剧集 总共耗时：', cost, ' 秒 ======');

        if(err){
            cb(false);
        }else{
            cb(true);
        }
    });
};