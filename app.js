/**
 * Created by zyg on 15/6/27.
 */
var webServer = require('webserver');
var fs = require('fs');
var utils = require('./lib/nmw_Utils');
var jsonDataHandler = require('./lib/jsonDataHandler');

var app1 = require('./app1');
var app2 = require('./app2');
var app3 = require('./app3');

var port = 8081;

var onQuerying = false;

//获取视频资源
var getAllVideoSrc = function(){
    return jsonDataHandler.read('allVideoSrc.json');
};
//爬取视频资源
var setAllVideoSrc = function(){
    if(onQuerying){
        return 'on querying';
    }
    onQuerying = true;
    app1.query(function(isSuccess){
        if(isSuccess){
            utils.log('==== 爬取动漫，第1阶段：成功 =====');
            app2.query(function(isSuccess2){
                if(isSuccess2){
                    utils.log('==== 爬取剧集，第2阶段：成功 =====');
                    app3.query(function(isSuccess3){
                        if(isSuccess3){
                            utils.log('==== 爬取视频源，第3阶段：成功 =====');
                            onQuerying = false;
                        }else{
                            utils.log('==== 爬取视频源，第3阶段：失败 =====');
                        }
                    });
                }else{
                    utils.log('==== 爬取剧集，第2阶段：失败 =====');
                }
            });
        }else{
            utils.log('==== 爬取动漫，第1阶段：失败 =====');
        }
    });

    return 'start querying'
};
setAllVideoSrc();
var server = webServer.create();
var service = server.listen(port,function(req,res){
    var result;
    var requestType = req.headers('requestType');

    if(requestType === 'set'){
        result = {
            result:!onQuerying,
            data:setAllVideoSrc()
        };
    }else if(requestType === 'get'){
        if(onQuerying){
            result = JSON.stringify({
                result:false,
                data:'onQuerying'
            });
        }else{
            result = {
                result:true,
                data:getAllVideoSrc()
            };
        }
    }

    res.setHeader('accept','application/json');
    res.write(result);
    res.close();
});
utils.log('server is running on port:',port);