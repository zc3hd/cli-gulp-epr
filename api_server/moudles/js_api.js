function JS_demo(app) {
  var me = this;

  // 
  me.app = app;
  // 路由
  me.router = require('express').Router();

  // 数据库模型
  me.js_demo_model = require('../collection/js_model.js');

}
JS_demo.prototype = {
  init: function() {
    var me = this;

    // add
    me.router.post('/font.do', function(req, res) {

      // 请求字体大小的方法
      me._api_font(req, res);
    });

    me.app.use('/api/js_demo', me.router);
  },
  // 请求字体大小的方法
  _api_font: function(req, res) {
    var me = this;

    // 大小
    var size = Math.floor(Math.random() * 200);
    size = size < 60 ? 60 : size;
    // 颜色
    var color = Math.floor(Math.random() * 1000000);


    // 创建数据
    me.js_demo_model
      // 创建
      .create({
        size: size,
        color: color,
        time: Date.now()
      })
      // 返回
      .then(function(data) {
        res.send(data);
      });


    // 删除数据
    me.js_demo_model
      .find()
      .then(function(arr) {
        // console.log(arr.length);
        if (arr.length > 10) {
          me.js_demo_model
            .deleteOne({ _id: arr[0]._id })
            .then(function(data) {
              console.log(data);
            });

          del();
        }
      });



  },

};



module.exports = JS_demo;