'use strict';
// 需求：
// 1.形成配置项; 
//    src ：监听哪个目录下的文件；
//    dist: 打包的目录名称
//    libs：依赖文件的目录名称，需要复制
var opts = {
  // 监听哪个目录下的文件；
  src: 'src_webapp',
  // 依赖文件的目录名称，需要复制
  copy: "scripts",
  // 打包的目录名称
  dist: 'webapp',
};



// 2.选择开发模式，不一样的模式，采用不同的服务器；


// 开发环境key
var env = process.env.NODE_ENV;
var path = require('path');
var gulp = require('gulp');
// fs-extra
var fs = require('fs-extra');

// 全局配置
var conf = require('./conf.js');

// ------------------------------------------------服务器及文件编译
// 服务器
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

// ------------------------------------html
var htmlmin = require('gulp-htmlmin');
// ------------------------------------JS
const uglify = require('gulp-uglifyes');
var babel = require('gulp-babel');
// 取消严格模式
var removeUseStrict = require("gulp-remove-use-strict");
// ------------------------------------css
var cssnano = require('gulp-cssnano');
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
// ------------------------------------img
// 图片压缩
var imagemin = require('gulp-imagemin');
// 深度压缩 
var pngquant = require('imagemin-pngquant');

// -----------------------------------其他插件
// 错误阻止
var plumber = require('gulp-plumber');
// 重命名插件
var rename = require('gulp-rename');
// 错误调试地图
var sourcemaps = require('gulp-sourcemaps');
// 只更新修改过的文件
var changed = require('gulp-changed');


var server_opts;
gulp.task('server', function() {

  switch (env) {
    case "web_proxy":
      // 后台代理模式
      server_opts = {
        // 被代理的后台API端口
        proxy: 'http://localhost:' + conf.api_port,
        browser: 'chrome',
        notify: false,
        // gulp 前端服务的的端口
        port: conf.dev_port
      };
      break;
    case "web_only":
      // 前端开发模式
      server_opts = {
        notify: false,
        server: path.resolve(__dirname, opts.dist),
        index: './index.html',
        port: conf.dev_port,
        logConnections: true
      };
      break;
  }
  // 启动服务器
  browserSync.init(server_opts);

  // 实例化工具包
  var tool = new Tool();

  // 复制
  tool._copy(
    path.resolve(__dirname, opts.src, opts.copy),
    path.resolve(__dirname, opts.dist, opts.copy),
    function() {
      console.log(`${opts.src}/${opts.copy}所有文件复制成功`);
    });

  // 删除和修改
  gulp
    .watch(
      path.resolve(__dirname, opts.src, '**/*.*'),
      function(info) {
        switch (info.type) {
          case "deleted":
            // tool._del(info.path);
            break;
          case "changed":
            tool._compile(info.path);
            break;
        }
      });


});


function Tool() {}
Tool.prototype = {
  // 
  _compile: function(info) {
    // 保存了libs的文件
    if (info.indexOf(opts.copy) != -1) {
      return;
    }
    // 
    // 后缀
    switch (path.extname(info)) {
      case ".html":
        this._html(info);
        break;
      case ".less":
        this._less(info);
        break;
      case ".js":
        this._js(info);
        break;
    }
    this._pic(info);
  },
  _html: function(info) {
    gulp.src(info)
      .pipe(plumber())
      .pipe(htmlmin({
        //清除HTML注释
        removeComments: true,
        //清除空行 压缩
        collapseWhitespace: true,
        // 忽略Boolean的值属性
        collapseBooleanAttributes: false,
        // 去除属性引用
        removeAttributeQuotes: false,
        // 删除空属性
        removeEmptyAttributes: false,
        // 删除 type="text/javascript"
        removeScriptTypeAttributes: true,
        // 删除 type="text/css"
        removeStyleLinkTypeAttributes: true,
        //压缩页面JS
        minifyJS: true,
        //压缩页面CSS
        minifyCSS: true
      }))
      .pipe(gulp.dest(this._dist(info)))
      .pipe(reload({
        stream: true
      }));
  },
  _less: function(info) {
    gulp.src(info)
      .pipe(plumber())
      .pipe(less())
      .pipe(cssnano())
      .pipe(autoprefixer({
        browsers: ['last 2 versions', '>5%', 'Firefox >= 20', 'Chrome >=40'],
        cascade: false
      }))
      .pipe(gulp.dest(this._dist(info)))
      .pipe(reload({
        stream: true
      }));
  },
  _js: function(info) {
    gulp.src(info)
      .pipe(plumber())
      // 重命名
      // .pipe(rename({
      //   suffix: '.min'
      // }))

    // 转语法
    // .pipe(babel({
    //   presets: [
    //     'es2015',
    //   ]
    // }))
    // 去除严格，这个不管用
    // .pipe(removeUseStrict())
    // 压缩
    .pipe(uglify())
      // 输出路径
      .pipe(gulp.dest(this._dist(info)))
      .pipe(reload({
        stream: true
      }));

  },
  _pic: function(info) {
    var dist = this._dist(info);
    var src = dist.replace(opts.dist, opts.src);

    gulp.src(path.join(src, '*/*.{png,jpg,gif,svg}'))
      .pipe(plumber())
      // 对比文件是否有过改动（此处填写的路径和输出路径保持一致）
      .pipe(changed(dist))
      .pipe(imagemin({
        // 无损压缩JPG图片
        progressive: true,
        // 不移除svg的viewbox属性
        svgoPlugins: [{
          removeViewBox: false
        }],
        // 使用pngquant插件进行深度压缩
        use: [pngquant()]
      }))
      // 输出路径
      .pipe(gulp.dest(dist))
      .pipe(reload({
        stream: true
      }));
  },

  // 复制
  _copy: function(oldPath, newPath, cb) {
    fs.copy(oldPath, newPath)
      .then(function() {
        cb && cb();
      })
      .catch(function() {
        console.log(1);

      });
  },
  // _dist文件目录获取
  _dist: function(info) {

    // dist
    // 数组
    info = info
      .replace(opts.src, opts.dist)
      .split(path.sep);

    // 删除最后
    info.pop();

    // 合并
    info = info.join(path.sep);

    // 返回
    return info;
  },
};















gulp.task('default', ['server'], function() {
  // gulp.start(['html', 'less', 'js', 'images']);
});