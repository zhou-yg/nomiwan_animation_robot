var Q = require('Q');

var d1 = Q.defer();
var d2 = Q.defer();

Q.all([d1.promise,d2.promise]).then(function(a,b,c){
   console.log(a,b,c);
});

d2.resolve('d2');
d1.resolve('d1');

