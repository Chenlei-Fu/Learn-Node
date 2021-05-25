// ---------------------
// 《使用 async 控制并发》
// https://github.com/alsotang/node-lessons/tree/master/lesson5

var async = require('async')

// 并发连接数的计数器
var concurrencyCount = 0;
var fetchUrl = function (url, callback) {
    // delay 的值在 2000 以内，是个随机的整数
    var delay = parseInt((Math.random() * 10000000) % 2000, 10);
    concurrencyCount++;
    console.log('现在的并发数是', concurrencyCount, '，正在抓取的是', url, '，耗时' + delay + '毫秒');
    setTimeout(function () {
        concurrencyCount--;
        callback(null, url + ' html content');
    }, delay);
};

var urls = [];
for(var i = 0; i < 30; i++) {
    urls.push('http://datasource_' + i);
}

// 并发抓取
async.mapLimit(urls, 5, function (url, callback) {
    fetchUrl(url, callback);
}, function (err, result) {
    console.log('finals:');
    console.log(result);
});

/**
 * Notes
 * 当你需要去多个源(一般是小于 10 个)汇总数据的时候，用 eventproxy 方便；
 * 当你需要用到队列，需要控制并发数，或者你喜欢函数式编程思维时，使用 async。
 * 大部分场景是前者，所以我个人大部分时间是用 eventproxy 的。
 */

