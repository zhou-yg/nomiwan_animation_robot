/**
 * Created by zyg on 15/6/21.
 */

var getAllEpisodes = require('./lib/getAllEpisodes');

getAllEpisodes.getEpisodeUrls({
    srcAllJson:'data/all.json',
    destEpisodesJson:'data/allEpisodes.json'
},function(err,data){
    console.log(err,data);

    phantom.exit();
});