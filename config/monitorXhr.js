/**
 * Created by zyg on 15/7/4.
 */
module.exports = {
    tudou:{
        validate:function(url){
            //样本2
            //var u1 = 'http://www.tudou.com/crp/alist.action?jsoncallback=page_play_model_aListModelList__findAll&a=115971&app=4'
            //样板1
            //var u2 ='http://www.tudou.com/tvp/olist.action?jsoncallback=page_play_model_oListModelList__findAll&areaCode=330100&a=248256&app=6&nopb=1'
            var urlRegExp = /(a|o)list\.action/g;

            return urlRegExp.test(url);
        }
    }
};