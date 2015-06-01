var mongoose = require('mongoose');


var db = mongoose.createConnection('localhost','nomiwan_animation');

db.on('error',console.error.bind(console,'连接错误:'));

db.once('open',function(callback){
    console.log('open:------------------->');
});


module.exports = {
    saveAnimation:function(animationArr){

    }
};