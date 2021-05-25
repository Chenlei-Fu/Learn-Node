var eventproxy = require('eventproxy');
var superagent = require('superagent');
var cheerio = require('cheerio');

var cnodeUrl = 'https://cnodejs.org/';

superagent.get(cnodeUrl)
.end(function(err, res) {
    if(err) {
        return console.log(err);
    }
    var topicUrls = [];
    var $ = cheerio.load(res.text);

    // get all urls
    $('#topic_list .topic_title').each(function(idx, element) {
        var $element = $(element);
        // $element.attr('href') 本来的样子是 /topic/542acd7d5d28233425538b04
        // 我们用 url.resolve 来自动推断出完整 url，变成
        // https://cnodejs.org/topic/542acd7d5d28233425538b04 的形式
        // 具体请看 http://nodejs.org/api/url.html#url_url_resolve_from_to 的示例
        var href = new URL($element.attr('href'), cnodeUrl);
        topicUrls.push(href.href);
    });
    console.log(topicUrls);

    var ep = new eventproxy();
    var author1 = '';
    var score1 = '';
    // 命令 ep 重复监听 topicUrls.length 次（在这里也就是 40 次） `topic_html` 事件再行动
    ep.after('topic_html', topicUrls.length, function (topics) {
        // topics 是个数组，包含了 40 次 ep.emit('topic_html', pair) 中的那 40 个 pair
        topics = topics.map(function(topicPair) {
            var topicUrl = topicPair[0];
            var topicHtml = topicPair[1];
            var $ = cheerio.load(topicHtml);
            var commentInfo = topicPair[2];
            if(commentInfo.length > 0) {
                author1 = commentInfo[0];
                score1 = commentInfo[1];
            }
            return ({
                title: $('.topic_full_title').text().trim(),
                href: topicUrl,
                comment1: $('.reply_content').eq(0).text().trim(),
                author1: author1,
                score1: score1
            });
        });
        console.log('final:');
        console.log(topics);
    });

    topicUrls.forEach(function (topicUrl) {
        superagent.get(topicUrl).end(function(err,res){
            var topicInfo = res.text;
            var $ = cheerio.load(topicInfo);
            var	commentInfo = [];
            var url_added = $('.user_avatar').attr('href');
            if(url_added){
                var userUrl = new URL(url_added, cnodeUrl);
                superagent.get(userUrl).end(function(err,res){
                    var $ = cheerio.load(res.text);
                    author1 = $('#content .panel .userinfo .user_big_avatar .user_avatar').attr('title');
                    score1 = $('#content .panel .userinfo .user_profile .unstyled > span').text();
                    commentInfo = [author1,score1];
                    ep.emit('topic_html',[topicUrl,topicInfo,commentInfo]);
                });
            }else{
                ep.emit('topic_html',[topicUrl,topicInfo,commentInfo]);
            }
        });
    });
});


/**
 * 在写challenge的问题是
 * ep是异步进行的，重新使用superagent获取link的时间过长，导致score1无法被同步赋值
 * 解决办法是在emit前就处理好score1和author1
 */

