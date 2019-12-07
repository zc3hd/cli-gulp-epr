# gulp-01

## 前言

* **场景：**
  * 该工程化工具使用都是我工作时根据需求搭建的架子，主要是帮助自己能更好的开发；
  * 主要是针对公司没有采用vue脚手架的项目，例如：JQ、vue非脚手架等；**【注意：vue不用脚手架也是可以开发的，不要离开脚手架就活不了！！】**
  * 组内每个前端的同学，大家各自写各自的功能模块，目录结构也是由各自业务形成单独的文件夹，
    * 针对单独的业务模块进行初始化页面搭建（HTML+CSS+JS）的工程化工具：**用法1**
    * 页面初始化搭建完成后，与公司后台调试过程的工程化工具：**用法2**
* 基于以下的工作目录结构：
  * 项目：
    * api_server【用于自己写nodejs后台，若没有可不新建该文件夹】
    * src_webapp  【针对我们gulp架子，前端的源码】
    * webapp  【打包编译后的目录，该目录结构必须与src_webapp保持一致，否则会有文件引用路径错误】
      * moudles 【所有的业务模块放入这个文件夹下面】
        * page/ 【一个文件夹作为一个业务功能模块】
          - imgs 【该模块的图片】
          - index.html
          - index.less
          - index.js 【把本功能模块需要的AP 配置 到 JS内部】
          - test_data.js 【模拟测试数据，用于和后台格式约定】
      * scripts 【项目中所有业务需要的公共的JS文件】
        * common 【公司自己维护的公共文件】
        * libs 【业务需要的其他JS文件，例如JQ，VUE等】
      * index.html 【项目的入口HTML文件】
    * conf.js 【工程化工具的配置文件】
    * gulpfile.js 【工程化工具的入口文件】
    * package.json 【命令设置及包的依赖】
* 注意：
  * webapp打包编译后的目录，该目录结构必须与 src_webapp目录结构保持一致，否则会有文件引用路径错误，所以需要把src_webapp内的文件及结构复制一份到webapp目录下；【 upd：2019-12-08】
  * 然后删除 webapp/modules/ 目录下的所有文件；【upd ：2019-12-08 】

## package.json

```json
  "scripts": {
    "web_proxy": "set NODE_ENV=web_proxy&&gulp",
    "web_only": "set NODE_ENV=web_only&& gulp",
    "api_proxy": "node ./api_server/app_auto.js",
    "api_only": "node ./api_server/app.js"
  },
```

## 用法1

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

## 用法2

* 命令：`npm run web_proxy`
* 内部执行核心：
  * 前端开启编译模式，需要涉及后台API的请求；
  * **此时后台的API端口被代理，任何后台都可以；**
* 适用场景：
  * **页面功能完成，和公司后台进行调试！！！**
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
        break;
        
        
    case "web_only":
		// ...
        break;
}
// 启动代理服务器。
browserSync.init(server_opts);
```

## upd

### 2019-12-08 

* 以前：保留为`gulpfile_old.js`
  * 需要在`gulpfile.js`开始指定一个要测试文件目录；
  * 开启服务，以整个`dist`根目录为服务器；
  * 问题：每次新的目录都必须重新指定一次新的目录；
* 现在：
  * 开启服务，以整个`dist`根目录为服务器；
  * `gulp.watch(src) `监听`src`目录下哪个文件路径变化，就获取到相应的文件路径，然后做对应的编译；
  * 把所有的编译功能集中在面向对象上；
  * 项目用到的公共文件，开启服务后自动复制一份；

