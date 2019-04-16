var express = require('express');
var path = require('path');
var router = require('./router');
var bodyParser = require('body-parser');


var app = express();
//静态托管
app.use('/views/',express.static(path.join(__dirname,'views')));//use后面可以不用写views,默认访问views文件夹，__dirname变量值代表程序运行的根目录
app.use('/node_modules/',express.static(path.join(__dirname,'node_modules')));
app.use('/assets/',express.static(path.join(__dirname,'assets')));
app.engine('html', require('express-art-template'));//对后缀名为html的文件执行对应的模板引擎
app.set('view engine', 'html');//设置view engine（视图引擎）作用到什么类型的文件上
app.use(bodyParser.urlencoded({extended: false}));

app.use(router);
app.listen('3000',function(){
	console.log('server starts in port 3000....')
})
