# gulp-02

## 数据库操作

* 涉及到后台数据库开发：
  * 开发一：
    * 后台测试阶段 api_ proxy
    * 中间没有开发完成，下载 **本地数据库** 到 **文件目录数据库**
    * 上传 github；
  * 开发二：
    * 下载github代码
    * 上传 **文件目录数据库** 到 **本地数据库**
    * 后台测试阶段 api_ proxy
  * 全部开发完成：
    * github：上传
    * 线上服务器：
      * 上传 **本地数据库** 到 **线上**
      * 上传 前后端代码 到 线上；
* 突然发现，一切对数据库本地与线上的操作并无卵用；线上大部分情况也不需要测试数据；

```json
  "scripts": {
    "web_proxy": "set NODE_ENV=web_proxy&&gulp",
    "web_only": "set NODE_ENV=web_only&& gulp",
    "api_proxy": "node ./api_server/app_auto.js",
    "api_only": "node ./api_server/app.js",
      
    // 上传 本地数据库 到 线上
    //"esc_db": "set NODE_ENV=esc_db&&node ./cmd.js",
      
    // 下载 本地数据库 到 文件夹
    //"db_dn": "set NODE_ENV=db_dn&&node ./cmd.js",
     
    // 上传 文件夹 到 本地数据库
    //"db_up": "set NODE_ENV=db_up&&node ./cmd.js",
      
    "git": "set NODE_ENV=git&&node ./cmd.js"
  },
```

## cli 用法3

- 命令：
  - `npm run web_proxy`
  - `npm run api_proxy`
- 执行核心：
  - 前端开启编译模式，需要涉及后台API的请求；
  - 后台的API服务：是由我们前端工程师写的node服务；后台也处于dev阶段；
- 适用场景：**后台node服务，我们自己同时开发**；

```js
var nodemon = require('gulp-nodemon');
var path = require('path');
nodemon({
    // 服务入口
    script: path.join(__dirname, './app.js'),
    // 忽略哪些文件
    ignore: [
        path.join(__dirname, '../src_webapp/'),
        path.join(__dirname, '../webapp/'),
        path.join(__dirname, '../gulpfile.js'),
        path.join(__dirname, '../conf.js'),
    ],
    env: { 'NODE_ENV': 'development' }
});
```

## cli 用法4

- 命令：`npm run api_only`
- 执行核心：
  - 前后端全部完成，看最终服务开启后效果；
- 适用场景：**前后端独立完成，最终开启服务**；

```js
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
```



