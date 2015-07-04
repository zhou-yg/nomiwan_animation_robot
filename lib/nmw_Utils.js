module.exports = {
    //简单的复制对象，function会丢失
    clone:function(obj){
        return JSON.parse(JSON.stringify(obj));
    },
    getNow: function () {
        var date = new Date();
        var now = [
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate(),
            date.getHours(),
            date.getMinutes()
        ];

        return now.join('_');
    },
    log: function (arg) {
        if (typeof arg === 'object') {
            arg = JSON.stringify(arg, undefined, 2);
        }
        console.log.apply(console, arguments);
    },
    jsonBackupRegExp:/\.[\w]+/g,

    getEpisodesPiecesName:function(start,num){
        if(typeof start === 'number' && typeof start === 'number'){
            var start = 's'+start,
                end = 'e'+num;
            return start+'_'+end;
        }else{
            this.log('null start or num');
            return '';
        }
    },
    getMatchEpisodesPiecesRegExp:/s[\d]+_e[\d]+/g
};