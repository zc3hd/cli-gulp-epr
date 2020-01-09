var nodemon = require('gulp-nodemon');
var path = require('path');
var conf = require('./conf.js');

var src;
var env = process.env.NODE_ENV;
switch (env) {
  // 简单的与前端联调
  case "api_simple":
    console.log("与前端简单联调测试 热开启");
    src = path.join(__dirname, './app_simple.js');
    break;

    // 后台开发模式
  case "api_only":
    console.log("后台开发 热启动");
    src = path.join(__dirname, './app.js');
    break;
};

nodemon({
  script: src,
  ignore: [
    path.join(__dirname, `../${conf.web_src}/`),
    path.join(__dirname, `../${conf.web_dist}/`),
    path.join(__dirname, '../gulpfile.js'),
  ],
  env: { 'NODE_ENV': 'development' }
});