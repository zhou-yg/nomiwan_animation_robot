module.exports = {
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
    }
};