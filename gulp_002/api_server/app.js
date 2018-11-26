var express = require('express');
var path = require('path');

var app = express();
app.use(express.static(path.join(__dirname, '../webapp/')));


app.post('/api.do', function(req,res) {
  
  res.send({info:1});
});

app.listen(3000);
