module.exports = {
  getNow:function(){
      var date = new Date();
      var now = [
          date.getFullYear(),
          date.getMonth()+1,
          date.getDate(),
          date.getHours(),
          date.getMinutes()
      ];

      return now.join('_');
  }
};