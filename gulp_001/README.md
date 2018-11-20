# step 1

### 1.运行

```
* $ git clone 地址

* nvm use 6.11.1

* npm install 
* gulp 

```

### 2.功能说明

* 该版本的主要功能：就是在gulpfile中配置这次编辑的功能模块，实时编译到目标文件。只是自己负责的模块是这样的，和别人协同开发时不影响的。
* 这就需要注意一个问题，同目录下的src_webapp的功能模块和dist_webapp的目录下功能模块的路径是一样。其他公共依赖的包和样式文件都放在dist_webapp的目录下，所以修改一些配置文件都在dist_webapp里面进行修改，src_webapp目录只是放我们的功能模块。因为编译时的服务器是在dist_webapp目录的。

### 3.使用建议

* 建议把工具和src_webapp文件目录放在和真实的dist_webapp同目录下，方便以后查找和维护
* 以后不用时，把工具删除即可。

