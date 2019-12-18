# cli-gulp-epr

## 前言

* 构建：
  * `gulp3.9.1`
  * `express@4.16.4`  `mongoose@5.3.13`

* **场景：**
  * 前端：
    * 纯JS项目（例如：`JQ、vue`非脚手架项目）`MPA`多页面应用；
    * 联调公司后台；
  * 后台为：
    *  `express`全栈开发；
* 特点：
  * 前端：
    * 无需指定测试目录地址；
    * 前端页面修改后，自动刷新；
    * 前端新增文件后，需要手动重启；
    * 支持与公司后台联调；
  * 后端：支持全栈开发时，后台服务修改后，自动重启；



## cli

```json
  "scripts": {
     // 前端与后台联调代码
    "web_proxy": "set NODE_ENV=web_proxy&& gulp",
      
     // 前端开发 热启动
    "web_only": "set NODE_ENV=web_only&& gulp",
      
     // 与前端形成简单联调测试，真实联调不开启
    "api_proxy": "set NODE_ENV=api_easy&& node ./api_server/app_auto.js",
    
     // 后台开发 热启动
    "api_only": "node ./api_server/app.js",
     
     // 前后端全部完成
     "all": "node ./api_server/app.js"
  },
```



## 前端：目录结构

- `webapp`  【打包编译后的目录，该目录结构必须与src_webapp保持一致，否则会有文件引用路径错误】
  - `moudles` 【所有的业务模块放入这个文件夹下面】
    - `page/` 【一个文件夹作为一个业务功能模块】
      - `imgs `【该模块的图片】
      - `index.html`
      - `index.less`
      - `index.js` 【把本功能模块需要的AP 配置 到 JS内部】
      - `test_data.js` 【模拟测试数据，用于和后台格式约定】
  - `scripts` 【项目中所有业务需要的公共的JS文件】
    - `common` 【公司自己维护的公共文件】
    - `libs` 【业务需要的其他JS文件，例如JQ，VUE等】
  - `index.html` 【项目的入口HTML文件】





## 前端：gulpfile.js 配置

```js
// 配置
var conf = {
  // 前端测试模式下的端口
  dev_port: 1010,

  // 后台 打包后/测试时 被代理的端口
  api_port: 1011,
};

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
```



## 前端：npm run web_only

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
        console.log("前端开发 热开启");
        break;
}
// 启动代理服务器。
browserSync.init(server_opts);
```





## 前端：npm run web_proxy

* 内部执行核心：
  * 前端开启编译模式，需要涉及后台API的请求；
  * **此时后台的API端口被代理，任何后台都可以；**
* 适用场景：
  * **页面功能完成，和公司后台进行调试**
  * gulp web_proxy模式的小问题：本地代理：`http://localhost:1010/demo_004/index.html` 也会找被代理服务上是否有这个文件，如果有就返回，只是返回，本地的服务器IP还是dev_port；如果没有开启被代理的服务器，页面加载不出来；

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
        console.log("与后台联调模式 开启");
        break;
        
        
    case "web_only":
		// ...
        break;
}
// 启动代理服务器。
browserSync.init(server_opts);
```



## 后台：目录结构

- `api_server`  【后台的根目录】
  - `collection` 【前端的业务模块对应后台的数据库模型】
    - `xx_model.js` 【具体的数据库模型】
  - `moudles` 【前端的业务模块对应后台的设计的API文件】
    - `xx_api.js` 【每个模块对应设计的api文件】
  - `app_auto.js` 【测试模式入口文件，根据模式进入测试不同的文件】
  - `app_simple.js` 【前端联调时，简单地充当后台的服务】
  - `app.js`【后台开发时或者完成后，入口文件】
  - `conf.js`【后台的配置文件】



## 后台：`app_auto.js`

```js
var nodemon = require('gulp-nodemon');
var path = require('path');

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
    path.join(__dirname, '../src_webapp/'),
    path.join(__dirname, '../webapp/'),
    path.join(__dirname, '../gulpfile.js'),
    path.join(__dirname, '../cmd.js'),
  ],
  env: { 'NODE_ENV': 'development' }
});
```



## 后台：npm run api_proxy

* 前端开发完成后，需要与后台进行简单的联调；
* 若后台此时不能配合，该功能可简单的进行联调；



## 后台：npm run api_only

* 执行核心：后台开发热启动，完全是后台开发；



## 后台：npm run all

* 执行核心：前端开发完成，后台开发完成，在服务器上部署启动服务时；



## upd

### 2019-12-07 

* 以前：
  * 需要在`gulpfile.js`开始指定一个要测试文件目录；
  * 开启服务，以整个`dist`根目录为服务器；
  * 问题：
    * 每次测试新的功能目录都必须在`gulpfile.js`中重新指定目录；
    * 然后再次启动；

```js
// 需要指定一个开发路径
var one = './src_webapp/modules/js_demo/';

// 生成文件的配置
var opts = {
  // 真是的工作目录，
  dist: 'webapp',
  // 要src的文件夹名字
  src: 'src_webapp',
  // 编译一个功能模块路径
  one: one,
};

// 开发环境key
var env = process.env.NODE_ENV;

var path = require('path');
var gulp = require('gulp');
var fs = require('fs-extra');

// 全局配置
var conf = require('./conf.js');

// ------------------------------------------------服务器及文件编译
// 服务器
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

// html
var htmlmin = require('gulp-htmlmin');

// JS
const uglify = require('gulp-uglifyes');
var babel = require('gulp-babel');
// 取消严格模式
var removeUseStrict = require("gulp-remove-use-strict");

// css
var cssnano = require('gulp-cssnano');
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');

// img
var imagemin = require('gulp-imagemin'); // 图片压缩
var pngquant = require('imagemin-pngquant'); // 深度压缩 



// -----------------------------------------------------错误插件
// 错误阻止
var plumber = require('gulp-plumber');
// 重命名插件
var rename = require('gulp-rename');
// 错误调试地图
var sourcemaps = require('gulp-sourcemaps');
// 只更新修改过的文件
var changed = require('gulp-changed');


// -----------------------------------------------------路径解析
var arr = opts.one.split('/');
arr.forEach(function(ele, index) {
  if (ele == opts.src) {
    arr[index] = opts.dist;
  }
});
// 生成目标文件路径
opts.one_dist = arr.join('/');



var server_opts = null
  // 静态服务器 + 监听 html,css 文件
gulp.task('server', function() {

  switch (env) {
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
  // 启动代理服务器。
  browserSync.init(server_opts);


  // 监听 html
  gulp.watch(path.join(opts.one, '*.html'), ['html']);
  // 监听 less
  gulp.watch(path.join(opts.one, '*.less'), ['less']);
  // 监听 images
  gulp.watch(path.join(opts.one, '*/*.{png,jpg,gif,svg}'), ['images']);
  // 监听 js
  gulp.watch(path.join(opts.one, '*.js'), ['js']);


  gulp.watch(path.resolve(__dirname, opts.src, '**/*.*'), function(e) {
    console.log(e);
    gulp.start(['js']);
  });
});




// html
gulp.task('html', function() {
  return gulp.src(path.join(opts.one, '*.html'))
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
    .pipe(gulp.dest(opts.one_dist))
    .pipe(reload({
      stream: true
    }));
});

// less编译后的css将注入到浏览器里实现更新
gulp.task('less', function() {
  return gulp.src(path.join(opts.one, '*.less'))
    .pipe(plumber())
    .pipe(less())
    .pipe(cssnano())
    .pipe(autoprefixer({
      browsers: ['last 2 versions', '>5%', 'Firefox >= 20', 'Chrome >=40'],
      cascade: false
    }))
    .pipe(gulp.dest(opts.one_dist))
    .pipe(reload({
      stream: true
    }));

});

// 图片压缩
gulp.task('images', function() {
  //文件格式匹配,目前是png,jpg,gif,svg
  return gulp.src(path.join(opts.one, '*/*.{png,jpg,gif,svg}'))
    .pipe(plumber())
    // 对比文件是否有过改动（此处填写的路径和输出路径保持一致）
    .pipe(changed(opts.one_dist))
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
    .pipe(gulp.dest(opts.one_dist)) // 输出路径
    .pipe(reload({
      stream: true
    }));
});

// JS文件的压缩
gulp.task('js', function() {
  return gulp.src(path.join(opts.one, '*.js'))
    .pipe(plumber())
    // 压缩
    .pipe(uglify())
    // 输出路径
    .pipe(gulp.dest(opts.one_dist))
    .pipe(reload({stream: true}));
});


gulp.task('default', ['server'], function() {
  gulp.start(['html', 'less', 'js', 'images']);
});
```

* 现在：
  * 开启服务，以整个`dist`根目录为服务器；
  * `gulp.watch(src) `监听`src`目录下哪个文件路径变化，就获取到相应的文件路径，然后做对应的编译；
  * 把所有的编译功能集中在面向对象上；
  * 项目用到的公共文件，开启服务后自动复制一份；



### 2019-12-08

* 新增 `JS：sourcemaps`：

```js
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
```

* 图片压缩配置：

```js
// ------------------------------------img
// 图片压缩
var imagemin = require('gulp-imagemin');

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
```

* `gulp.watch()`只能监听 修改和删除，不能监听新增；优化删除功能；

```js
// 删除和修改 modules
  gulp
    .watch(path.resolve(__dirname, opts.src, '**/*.*'),
      function(info) {

        // 操作了 libs内 文件；
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
```

* 优化：
  * 前端开发单独配置在`gulpfile.js`;
  * 后台开发单独配置在`api_server/conf.js`
  
* 给`gulpfile.js`配置为重新启动?
  * 目前对于现在这个架子`gulpfile.js`部分，没有必要；因为我们已经在监听每个路径变化，不需要重新修改`gulpfile.js`文件
  * 有个文章做了热启动，可参考：https://blog.csdn.net/weixin_34399060/article/details/86085353



### 2019-12-09

* 更名：`cli-gulp-epr`



### 2019-12-18

* .gitignore：新增` src_webapp`；因为保证以后所有用到 `cli-gulp-epr`的项目都是从github上直接更新，而不是本地拖拽，容易出错；

