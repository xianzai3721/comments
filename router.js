
var express = require('express');
var session = require('express-session');
// var tmp = require('art-template');
var db = require('./SqlServer');
var md5 = require('md5-node');
var multiparty = require('multiparty');
var fs = require('fs');
db.connect();

var router = express.Router();
//密码加密
router.use(session({secret: 'kasjd$la', resave: false, saveUninitialized: true, cookie: {maxAge: 1000*60*30}}));
router.use(function (req,res,next) {
    if(req.url=='/login' || req.url=='/dologin'||req.url=='/editRegister'||req.url=='/register'){
        next();
    }else {
        if (req.session.sessionUserName&&req.session.sessionUserPass) {
            next();
        } else {
            res.redirect('/login');
        }
    }
})

router.get('/tables',function(req,res){

        db.query('select * from [comments].[dbo].[pubComment] order by comId desc',function(err,data){
            if(err){
                return res.status(500).send('服务器出错了');
            }
            for(let i in data){
                data[i].comPubDateTime = new Date(data[i].comPubDateTime).Format("yyyy-MM-dd hh:mm:ss");
            }
            res.render('tables.html', {
                comments: data,
                userInfo:{
                    userName:req.session.sessionUserName
                },
                errorTips:''
            })
        })

})
router.get('/',function (req,res) {

        res.render('index.html', {
            userInfo: {
                userName: req.session.sessionUserName
            },
            errorTips: ''
        })
})
router.get('/forms',function (req,res) {

        res.render('forms.html', {
            userInfo: {
                userName: req.session.sessionUserName
            },
            errorTips: ''
        })
})

router.get('/components',function (req,res) {

        res.render('components.html', {
            userInfo: {
                userName: req.session.sessionUserName
            },
            errorTips: ''
        })

})

router.get('/icons',function (req,res) {

        res.render('icons.html', {
            userInfo: {
                userName: req.session.sessionUserName
            },
            errorTips: ''
        })
})

router.get('/notifications',function (req,res) {

        res.render('notifications.html', {
            userInfo: {
                userName: req.session.sessionUserName
            },
            errorTips: ''
        })
})

router.get('/typography',function (req,res) {

        res.render('typography.html',{
            userInfo:{
                userName:req.session.sessionUserName
            },
            errorTips:''
        })

})
//编辑评论
router.get('/edit',function (req,res) {

        db.query('select * from [comments].[dbo].[pubComment] where comId ='+req.query.id,function (err,data) {
            if(err){
                return res.status(500).send('服务器出错了');
            }
            res.render('editComment.html', {
                comments: data,
                userInfo:{
                    userName:req.session.sessionUserName
                },
                errorTips:''
            })
        })

})

//提交评论
router.post('/edit',function (req,res) {

        let dateTime = new Date().Format("yyyy-MM-dd hh:mm:ss.S");
        if(req.body.comId){
            db.query("update [comments].[dbo].[pubComment] set comContent = '"+req.body.comContent+"',comPubDateTime = '"+dateTime+"' where comId ="+req.body.comId,function (err,data) {
                if(err){
                    return res.status(500).send('服务器出错了');
                }
                res.redirect('/tables');
            })
        }else{
            db.query("INSERT INTO [comments].[dbo].[pubComment] VALUES (1,'"+req.body.comContent+"','"+dateTime+"')",function (err,data) {
                if(err){
                    return res.status(500).send('服务器出错了');
                }
                res.redirect('/tables');
            })
        }
})

//刪除评论
router.get('/delete',function (req,res) {

        db.query("delete from [comments].[dbo].[pubComment] where comId ="+req.query.id,function (err,data) {
            if(err){
                return res.status(500).send('服务器出错了');
            }
            res.redirect('/tables');
        })

})

//添加评论
router.get('/add',function (req,res) {

        res.render('editComment.html', {
            comments: [],
            userInfo:{
                userName:req.session.sessionUserName
            },
            errorTips:''
        })

})
//渲染个人简历
router.get('/profile',function (req,res) {
    db.query("select * from [comments].[dbo].[user] where userName ='"+req.session.sessionUserName+"' and userPass = '"+req.session.sessionUserPass+"'",function (err,data) {
        if(err){
            return res.status(500).send('服务器出错了');
        }
        if(data.length>0){
            res.render('profile.html',{
                userInfo:{
                    userName:req.session.sessionUserName
                },
                profileData:data[0]
            })
        }
    })

})

//编辑个人简历
router.post('/editProfile',function (req,res) {

        let dateTime = new Date().Format("yyyy-MM-dd hh:mm:ss.S");
        var form  = new multiparty.Form();
        form.uploadDir = 'upload';
        form.parse(req,function (err,fields,files) {
            if(fields.isAgree){
                if(req.session.sessionUserPass){
                    let foods = '';
                    let foodsArr = [];
                    if(fields.foods){
                        foodsArr = fields.foods;
                        for (let i = 0; i < foodsArr.length; i++) {
                            foods += foodsArr[i] + ',';
                        }
                        foods = foods.substr(0,foods.length-1);
                    }
                    db.query("select [userId] from [comments].[dbo].[user] where userName ='"+req.session.sessionUserName+"' and userPass = '"+req.session.sessionUserPass+"'",function (err,data) {

                        if(err){
                            console.log(err)
                        }else{
                            if(data.length>0){
                                var originalFilename=files.photo[0].originalFilename;//判断是否上传了图片
                                if(originalFilename){
                                    db.query("update [comments].[dbo].[user] set favSport = '"+fields.sport+"',gender = '"+fields.gender
                                        +"',personalSign = '"+fields.personalSign+"',updateDateTime = '"+dateTime
                                        +"',favFoods = '"+foods+"',email = '"+fields.email+"',userPhoto = '"+files.photo[0].path
                                        +"' where userId ="+data[0].userId,function (err,data) {
                                        if (err) {
                                            return res.status(500).send('服务器出错了');
                                        }
                                        res.redirect('/');
                                    })
                                }else{
                                    db.query("update [comments].[dbo].[user] set favSport = '"+fields.sport+"',gender = '"+fields.gender
                                        +"',personalSign = '"+fields.personalSign+"',updateDateTime = '"+dateTime
                                        +"',favFoods = '"+foods+"',email = '"+fields.email
                                        +"' where userId ="+data[0].userId,function (err,data) {
                                        if (err) {
                                            return res.status(500).send('服务器出错了');
                                        }
                                        res.redirect('/');
                                    })
                                    fs.unlink(files.photo[0].path);
                                }

                            }
                        }

                    })
                }
            }else{
                res.render('profile.html',{
                    userInfo:{
                        userName:req.session.sessionUserName
                    },
                    errorTips:'您还没有同意条款，请先同意所有条款！'
                })
            }
        })


    // res.end()
})

//退出登录，清除session
router.get('/loginout',function (req,res) {
    req.session.destroy(function (err) {
        if(err){
            console.log(err)
        }else{
            res.redirect('/login')
        }
    })

})
//渲染登录页面
router.get('/login',function (req,res) {
    res.render('login.html',{
        errorTips:''

    })

})

//账户登录操作
router.post('/dologin',function (req,res) {

    db.query("select [userId] from [comments].[dbo].[user] where userName ='"+req.body.username+"' and userPass = '"+md5(req.body.password)+"'",function (err,data) {
        if(err){
            return res.status(500).send('服务器出错了');
        }
        if(data.length>0){
            req.session.sessionUserName = req.body.username;
            req.session.sessionUserPass = md5(req.body.password);
            res.redirect('/');
        }else{
            res.render('login.html',{
                errorTips:'账户不存在或密码错误',
                userInfo:{
                    userName:req.body.username
                }
            })
        }

    })
})

//渲染注册页面
router.get('/register',function (req,res) {
    res.render('register.html',{
        errorTips:''

    })

})
//提交注册
router.post('/editRegister',function (req,res) {
    db.query("select * from [comments].[dbo].[user] where userName ='"+req.body.username+"'",function (err,data) {
        if(err){
            console.log(err)
        }else{
            if(data.length>0){
                res.render('register.html',{
                    errorTips:'用户已存在'
                })
            }else{
                db.query("insert into [comments].[dbo].[user] ([userName],[userPass]) values ('"+req.body.username+"','"+md5(req.body.password)+"')",function (err,data) {
                    if(err){
                        console.log(err)
                    }else{
                        req.session.sessionUserName = req.body.username;
                        req.session.sessionUserPass = md5(req.body.password);
                        res.redirect('/')
                    }
                })
            }
        }

    })
})
// 对Date的扩展，将 Date 转化为指定格式的String
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours()-8, //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

//获取当前登录用户信息
function getUserInfo(req){
    if(req.session.sessionUserName&&req.session.sessionUserPass){
        return {
            userName:req.session.sessionUserName,
            userPass:req.session.sessionUserPass
        };
    }else{
        return null
    }
}

//如果页面一进入，进行判断是否有账号登录
function isExistUser(userInfo){
    if(!userInfo){
        return false;
    }else{
        return true;
    }
}
module.exports = router;


