var express = require('express');
var superagent = require('superagent');
var cheerio = require('cheerio');

var app = express();

app.get('/', function(req, res, next) {
    // 用 superagent 去抓取 https://cnodejs.org/ 的内容
    superagent.get('https://cnodejs.org/')
    .end(function(err, sres) {
        // hanle errors
        if(err) {
            return next(err);
        }

        // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
        // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
        // 剩下就都是 jquery 的内容了
        // $ is just a shortcut of jquery
        var $ = cheerio.load(sres.text);
        var items = [];

        // 方法1：
        // $('#topic_list .topic_title').each(function (idx, element) {
        //     var $element = $(element); /* $() is a jQuery selector,
        //     this selector $(element) will collect all elements in a document with
        //     the given tag name i.e. table, ul, li, a etc. */

        //     // challenge
        //     var $element_author = $(($('#topic_list .user_avatar.pull-left img'))[idx]);

        //     items.push({
        //         title: $element.attr('title'),
        //         href: $element.attr('href'),
        //         author: $element_author.attr('title')
        //     });
        // });

        // 方法2
        var name;
        $('#topic_list .topic_title,#topic_list .user_avatar.pull-left img').each(function(idx, element) {
            var $element = $(element);
            if(idx % 2 == 0) {
                name = $element.attr('title');
            }
            else {
                items.push({
                    title: $element.attr('title'),
                    href: $element.attr('href'),
                    name: name,
                    idx:(idx + 1)/2
                })
            }
        })
        res.send(items);
    });
});

app.listen(3000, function (req, res) {
    console.log('app is running at port 3000');
});
