// 配置
var conf = {
  // 前端测试模式下的端口
  dev_port: 1010,

  // 本地后台1011 打包后/测试时 被代理的端口
  api_port: 1011,
};


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
var path = require('path');
var gulp = require('gulp');
var fs = require('fs-extra');



// ------------------------------------------------服务器及文件编译
// 服务器
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

// ------------------------------------html
var htmlmin = require('gulp-htmlmin');
// ------------------------------------JS
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');

// ------------------------------------css
// less 
var less = require('gulp-less');
var cssnano = require('gulp-cssnano');
var autoprefixer = require('gulp-autoprefixer');

// ------------------------------------img
// 图片压缩
var imagemin = require('gulp-imagemin');

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
// 开发环境key
var env = process.env.NODE_ENV;
gulp.task('server', function() {

  switch (env) {
    case "web_proxy":
      // 后台代理模式
      server_opts = {
        // 被代理的后台API端口
        proxy: 'http://localhost:' + conf.api_port,
        browser: 'chrome',
        index: './index.html',
        notify: false,
        // gulp 前端服务的的端口
        port: conf.dev_port
      };
      console.log(`与后台port${conf.api_port}联调模式 开启`);
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
      console.log("前端开发 热开启");
      break;
  }
  // 启动服务器
  browserSync.init(server_opts);

  // 实例化工具包
  var tool = new Tool();

  // 复制 libs
  tool._copy(
    path.resolve(__dirname, opts.src, opts.copy),
    path.resolve(__dirname, opts.dist, opts.copy),
    function() {
      console.log(`${opts.src}/${opts.copy}所有文件复制成功`);
    });

  // 能监听到文件的删除和修改 
  gulp
    .watch(path.resolve(__dirname, opts.src, '**/*.*'),
      function(info) {

        // 若操作：libs内文件；直接返回；
        if (info.path.indexOf(opts.copy) != -1) {
          return;
        }

        // 文件操作 类型
        switch (info.type) {
          case "deleted":
            tool._del(info.path);
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
      // 转化
      .pipe(less())
      // 压缩
      .pipe(cssnano())
      // 加前缀
      .pipe(autoprefixer({
        browsers: [
          'last 2 versions',
          '>1%',
          'Firefox >= 20',
          'Chrome >=40'
        ],
        cascade: false
      }))
      // 
      .pipe(gulp.dest(this._dist(info)))
      .pipe(reload({ stream: true }));
  },
  _js: function(info) {
    gulp
      .src(info)
      .pipe(plumber())
      // 初始 调试map
      .pipe(sourcemaps.init())
      // 转 es2015 语法
      .pipe(babel({ presets: ['@babel/env'] }))
      // 不认识es6，压缩会报错；
      .pipe(uglify())
      // 写入 调试map
      .pipe(sourcemaps.write())
      // .pipe(rename({ suffix: '.min' })) //  重命名suffix：后缀
      // 生成目录
      .pipe(gulp.dest(this._dist(info)))
      .pipe(reload({ stream: true }));

  },
  _pic: function(info) {
    var dist = this._dist(info);
    var src = dist.replace(opts.dist, opts.src);

    gulp.src(path.join(src, '*/*.{png,jpg,gif,svg}'))
      .pipe(plumber())
      // 对比文件是否有过改动（此处填写的路径和输出路径保持一致）
      .pipe(changed(dist))
      .pipe(imagemin([
        // 图片的渐进式加载
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            { removeViewBox: true },
            { cleanupIDs: false }
          ]
        })
      ]))
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
  // 
  _del: function(info) {
    var dist = info.replace(opts.src, opts.dist);
    fs
      .remove(dist)
      .then(function() {
        console.log(dist + " 删除成功");
      });
  },

  // _dist文件目录获取
  _dist: function(info) {

    // dist
    // 数组
    info = info
      .replace(opts.src, opts.dist)
      .split(path.sep);

    // 删除最后成员
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