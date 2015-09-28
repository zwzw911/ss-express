/**
 * Created by wzhan039 on 2015-09-24.
 */
    var dbs=['ss']
var colls= {
    'ss': ['articlefolders', 'articles', 'attachments', 'comments', 'errors', 'folders', 'keys', 'users']
}
var conn=new Mongo();
var curDbName=dbs[0]
var db=conn.getDB(curDbName)

//var reCreateIndex=function(coll){
//    db[coll].dropIndexex()
//}

var createSingleIndex=function(coll){
    switch (coll){
        case 'articles':
            var opt={
                parse:true,
                background:true,
                //unique:true,
                weights:{
                    keys:10,
                    title:5,
                    pureContent:1
                },
                name:'searchIndex'
            }
            db[coll].createIndex({
                    keys:'text',
                    title:'text',
                    pureContent:'text'},
                opt
            )
            break
    }
}


var dropSingleIndex=function(coll){
    db[coll].dropIndexes()
}


var reCreateAllIndex=function(){
    var collLen=colls[curDbName].length
    var collName
    //var dbName=dbs[0]
    for(var i=0;i<collLen;i++){

        collName=colls[curDbName][i]
        //collName='articles'
        //console.log(collName)
        dropSingleIndex(collName)
        createSingleIndex(collName)
    }
}

reCreateAllIndex()
//createSingleIndex('articles')









