# gulp-01

## 1.package.json

```json
  "scripts": {
    "web_proxy": "set NODE_ENV=web_proxy&&gulp",
    "web_only": "set NODE_ENV=web_only&& gulp",
    "api_proxy": "node ./api_server/app_auto.js",
    "api_only": "node ./api_server/app.js"
  },
```

## 2.用法1

* 命令：`npm run web_only`

* 内部执行核心：只是前端开启编译模式，不涉及后台API的请求；
* 适用场景：**页面功能HTML+CSS+JS 页面功能演示**

```js
switch (env) {
    case "web_proxy":
		// ...
        break;
    
    // 前端初始dev模式
    case "web_only":
        server_opts = {
            notify: false,
            // 服务器根目录
            server: path.resolve(__dirname, opts.dist),
            // 入口文件
            index: './index.html',
            // 服务端口
            port: conf.dev_port,
            // 打印连接日志
            logConnections: true
        };
        break;
}
// 启动代理服务器。
browserSync.init(server_opts);
```

## 3.用法2

* 命令：`npm run web_proxy`

* 内部执行核心：
  * 前端开启编译模式，需要涉及后台API的请求；
  * **此时后台的API端口被代理，任何后台都可以；**
* 适用场景：**页面功能完成，和公司后台进行调试！！！**

```js
switch (env) {
    // 代理后台
    case "web_proxy":
        // 前后端开发模式
        server_opts = {
            // 被代理的后台API端口
            proxy: 'http://localhost:' + conf.api_port,
            
            browser: 'chrome',
            notify: false,
            
            // gulp 前端的端口
            port: conf.dev_port
        };
        break;
        
        
    case "web_only":
		// ...
        break;
}
// 启动代理服务器。
browserSync.init(server_opts);
```

## 4.用法3

* 命令：
  * `npm run web_proxy`
  * `npm run api_proxy`
* 执行核心：
  * 前端开启编译模式，需要涉及后台API的请求；
  * 后台的API服务：是由我们前端工程师写的node服务；后台也处于dev阶段；
* 适用场景：**后台node服务，我们自己同时开发**；

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

## 5.用法4

* 命令：`npm run api_only`
* 执行核心：
  * 前后端全部完成，看最终服务开启后效果；
* 适用场景：**前后端独立完成，最终开启服务**；

```js
var express = require('express');
var path = require('path');
var conf = require('../conf.js');

var app = express();

// 静态资源服务器
app.use(express.static(path.join(__dirname, '../webapp/')));


// 测试API
app.post('/api/js_demo/font.do', function(req, res) {
  var size = Math.floor(Math.random() * 200);
  if (size < 60) {
    size = 60;
  }
  var color = Math.floor(Math.random() * 1000000);
  res.send({
    size: size,
    color: color,
  });
});

// 端口
app.listen(conf.api_port);
console.log("server running at " + conf.api_port);
```

