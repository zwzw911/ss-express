/**
 * Created by wzhan039 on 2015-08-19.
 */
var testModule=require('../../../routes/express_component/pagination');



exports.testPagination=function(test){
    test.expect(4);

    var total=187
    var pageSize=5;
    //总共38页
    var pageLength=10;

    //检测页码超出范围，是否自动设成第一、最后也
    var curPage=-1
    var result=testModule.pagination(total,curPage,pageSize,pageLength);
    test.equal(result.toString(),{start:1,end:10,curPage:1,showPrevious:false,showNext:true}.toString(),'cant set to first page');

    var curPage=39
    var result=testModule.pagination(total,curPage,pageSize,pageLength);
    test.equal(result.toString(),{start:31,end:38,curPage:38,showPrevious:true,showNext:false}.toString(),'cant set to last page');

    var curPage=20
    var result=testModule.pagination(total,curPage,pageSize,pageLength);
    test.equal(result.toString(),{start:21,end:30,curPage:20, showPrevious:true,showNext:true}.toString(),'page 20 failed');


    var total=3;
    var curPage=1
    var result=testModule.pagination(total,curPage,pageSize,pageLength);
    test.equal(result.toString(),{start:1,end:1,curPage:1, showPrevious:false,showNext:false}.toString(),'page 20 failed');
    test.done();
}