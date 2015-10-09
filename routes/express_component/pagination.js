/**
 * Created by zw on 2015/8/18.
 */
    /*
    * total:记录总数
    * curPage: 当前页码(数字)或者first/last（字符）
    * pageSize：每页显示记录数
    * pageLength：显示页的数量
    *
    * 结果：返回分页html的起始页码和结束页码
    * */
var pagination=function(total,curPage,pageSize,pageLength){

    //如果输入参数不正确，设定默认值
    if(pageSize<0 || undefined===pageSize){pageSize=10}
    if(pageLength<0 || undefined===pageLength){pageLength=10}

    var totalPage=Math.ceil(total/pageSize)//用来定位page范围
    var showPrevious=false
    var showNext=false;
    var maxLoop=Math.ceil(totalPage/pageLength)//每次显示pageLength个页，总共可以显示多少次
    //显示的起始，结束页码
    var start,end;
    //var showPageNum=2*halfShowNum+1

    if(0===total || 1===totalPage){
        start=end=1;//不需要分页组件
        showPrevious=showNext=false;
    }
    if('last'===curPage || curPage>totalPage){
        curPage=totalPage
    }
    if('first'===curPage ||curPage<1){
        curPage=1;
    }
    if(curPage>0 && curPage<=totalPage){
        //确定范围
        for(var i=0;i<maxLoop;i++){
            start=i*pageLength+1
            end=(i+1)*pageLength
            if(end>totalPage){
                end=totalPage
            }
            if(end>start && curPage>=start && curPage<=end){
                if(curPage==start){
                    //当前页位于第一个loop的第一页
                    if(start==1){
                        showPrevious=false;
                    }else{
                        showPrevious=true
                    }
                    //当前页位于非第一个loop的第一个

                    if(end>start){
                        showNext=true
                    }else{
                        showNext=false
                    }
                }
                if(curPage==end){
                    if(curPage<totalPage){
                        showNext=true
                    }else{
                        showNext=false
                    }

                    if(curPage>start){
                        showPrevious=true;
                    }else{
                        showPrevious=false;
                    }

                }
                if(curPage<end && curPage>start){
                    showNext=true;
                    showPrevious=true;
                }
                break
            }
            //当前页码范围只有一个页码，说明此页码是最后一个页码
            if(end===start && curPage===start ){
                if(1===curPage){
                    showNext=false
                    showPrevious=false;
                }
             if(curPage>1 && curPage<totalPage){
                 showNext=true
                 showPrevious=true;
             }
            if(curPage>1 && curPage===totalPage){
                showNext=false
                showPrevious=true;
            }
            }
        }
    }
    return {start:start,end:end,curPage:curPage,showPrevious:showPrevious,showNext:showNext}
}

exports.pagination=pagination