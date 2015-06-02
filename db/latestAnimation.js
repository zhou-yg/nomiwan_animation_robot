var mongoose = require('mongoose');
var db = mongoose.createConnection('localhost','nomiwan_animation');

var isConnection = false;
var AnimationSchema,AnimationModel;

var animationCache = [];

db.on('error',console.error.bind(console,'连接错误:'));
db.once('open',function(callback){
    console.log('open:------------------->');
    isConnection = true;
    AnimationSchema = new mongoose.Schema({
        source:String,
        animationArr:Array
    });

    AnimationModel = db.model('animation',AnimationSchema);
});

exports = {
    saveAnimation:function(source,animationArr){
        animationCache.push({
            source:source,
            animationArr:animationArr
        });

        if(isConnection){
            for(var i= 0,len=animationCache.length;i<len;i++){
                var ani = new AnimationModel(animationCache[i]);
                ani.save();
            }
        }
    }
};