/**
 * Created by zyg on 15/6/27.
 */
var fs = require('fs');
var child = require('child_process');

var dataDirPath = './data/';
    allEpisodesJsonFile = dataDirPath+'allEpisodes.json';

var allEpisodesObjArr = JSON.parse(fs.readFileSync(allEpisodesJsonFile).toString());
/**
* 搜索视频源的动漫开始处,
* 每次爬取的数量，暂定20个
* 所有动漫源的量
*/
var queryEpisodesIndex = 0,
    eachQueryEpisodesNum = 5,
    allEpisodesNum = allEpisodesObjArr.length;

var isLast = false;

var runPhantomjs = function(){
    var runCommand = 'phantomjs app2.js '+queryEpisodesIndex+' '+eachQueryEpisodesNum
    console.log(runCommand);
    child.exec(runCommand,function(error, stdout, stderr){
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);

        if (error !== null) {
            console.log('exec error: ' + error);
        }

        if(!isLast){
            queryEpisodesIndex = queryEpisodesIndex+eachQueryEpisodesNum;

            if(queryEpisodesIndex >= allEpisodesNum){
                queryEpisodesIndex = allEpisodesNum-1;
                isLast = true;
            }

            runPhantomjs();
        }
    });
};

runPhantomjs();
