var webSites = require('./config/animationWebsites.js');

var queryDir = './query/';
var querySuffix = 'Query';

for(var webSiteObjKey in webSites){
    (function(webSiteObjKey){
        var webSiteObj = webSites[webSiteObjKey];
        var address = webSiteObj.address;

        if(address){

            var queryPreName = webSiteObj.query || webSiteObjKey;
            var queryName = queryPreName+querySuffix;
            var query  = require(queryDir+queryName);

            if(query.openCb){

                query.openCb(address)

            }else{
                console.log(queryName,' hasnt init')
            }
        }

    })(webSiteObjKey);
}