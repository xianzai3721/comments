var sqlServer = require('mssql');
var db={};
// db.sqlQuest = new sqlServer.Request()
db.connect = function (){
	sqlServer.connect("mssql://sa:123456@127.0.0.1:1433/comments");
}
db.query = function(sqlStr,callback){
    new sqlServer.Request().query(sqlStr).then(function (records) {
        callback(null,records.recordset)
    }).catch(function (err) {
        console.log(err)
        callback(err,null)
    })
}
module.exports = db;
/**
 *sqlserver Model
 **/

