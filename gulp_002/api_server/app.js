var express = require('express');
var path = require('path');
var conf = require('../conf.js');

// 开启app
var app = express();


// 测试API
// app.post('/api/js_demo/font.do', function(req, res) {
//   var size = Math.floor(Math.random() * 200);
//   if (size < 60) {
//     size = 60;
//   }
//   var color = Math.floor(Math.random() * 1000000);

//   res.send({
//     size: size,
//     color: color,
//   });
// });


// -------------------------------------------------连接服务器
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/' + conf.db);
// 链接数据库
mongoose.connection.once('open', function() {
  console.log('数据库已连接');
});

// -------------------------------------------------处理post中间件
var bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// ------------------------------------------------API模块
var JS_demo = require('./moudles/js_demo/index.js');
new JS_demo(app).init();



// -----------------------------------------------静态资源服务器
app.use(express.static(path.join(__dirname, '../webapp/')));



app.listen(conf.api_port);
console.log("API服务 启动在 端口:" + conf.api_port);