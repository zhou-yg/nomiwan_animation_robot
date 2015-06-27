/**
 * Created by zyg on 15/6/27.
 */
var child = require('child_process');


var commandSet = [];

child.exec('phantomjs app2.js',function(error, stdout, stderr){
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
        console.log('exec error: ' + error);
    }
});