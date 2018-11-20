
### gulp+node 前后实时编译

* 这个版本适合前端使用gulp进行监听文件变化，后台用node提供API。都是由一个人做。
* 涉及到监听node服务的包：nodemon
* 启动后台服务后，可以用browserSync代理监听node启动的服务，参与gulp编码后的浏览器的reload

### gulp第1个任务

* nodemon可以执行我写的express服务。里面写提供静态服务的api服务
* nodemon能监视目录下的所有文件，看下面的配置项，去除静态文件的两个，其他都会监听，有变化就会重新启动我的express的app.js
* 需要好好看看var nodemon = require('gulp-nodemon');

```
nodemon({
    script: './api_server/app.js',
    ignore : [
      "./src_webapp/",
      "./webapp/",
    ],
    env: { 'NODE_ENV': 'development'}  
  });
```

### gulp第2个任务

* 启动本地的代理服务器，啥是代理服务器，就是在3000的启动的服务，在4000完全可以访问

```
  browserSync.init({
    proxy: 'http://localhost:3000',
    browser: 'chrome',
    notify: false,
    //这个是browserSync对http://localhost:3000实现的代理端口
    port: 4001
  });
```

* 这个代理服务器，可以根据gulp压缩的流进行自动重启界面。
* 所以就是实现了：

```
1.真实服务器提供API，和静态资源
2.nodemon 监听真实服务器，以进行重启

3.代理服务器==真实服务器
4.gulp针对功能模块的监听，静态页面进行重载，代理服务器进行reload
```

* 需要学习browserSync

### browserSync

* 其实browserSync就是可以监听后台的起服务的端口，那么这个工具也可以用于后台JAVA启动的服务后，前端进行端口代理，然后进行前端代码的编译，相当于在JAVA起服务后的端口上进行请求。不用后台JAVA写专门的代码。
