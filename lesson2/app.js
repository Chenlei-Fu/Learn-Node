// ------------------------------------
// 《学习使用外部模块》
// https://github.com/alsotang/node-lessons/tree/master/lesson2
var express = require('express');
var utility = require('utility');

var app = express();

app.get('/', function(req, res) {
  // 从req.query中取出我们的q参数
  // req.query contains the URL query parameters
  var name = req.query.name;

  // 调用utility 获取md5 value
  var md5Value = utility.md5(name);
  console.log(req.query);

  res.send(md5Value);
});

app.listen(3000, function (req, res) {
  console.log('app is running at port 3000');
});


/**
 * 如果直接访问 http://localhost:3000/ 会抛错
 * 可以看到，这个错误是从 crypto.js 中抛出的。

这是因为，当我们不传入 q 参数时，req.query.q 取到的值是 undefined，utility.md5 直接使用了这个空值，导致下层的 crypto 抛错。
 */
