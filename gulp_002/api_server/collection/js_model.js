var mongoose = require('mongoose');
// 集合标示
var model_key = 'js_demo';

// 文档模型
var doc_model = new mongoose.Schema({
  // 字体大小
  size: Number,

  // 字体颜色
  color: Number,

  // 时间
  time: String,
});

// 模型
module.exports = mongoose.model(model_key, doc_model, model_key);