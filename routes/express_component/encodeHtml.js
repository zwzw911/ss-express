/**
 * Created by ada on 2015/7/5.
 */

/*var list={
    ' ':{entityName:,entityCode:},
    '<':{entityName:,entityCode:},
    ">":{entityName:,entityCode:},
    "&":{entityName:,entityCode:},
    '"':{entityName:,entityCode:},
    "©":{entityName:,entityCode:},
    '®':{entityName:,entityCode:},
    "™":{entityName:,entityCode:},
    '×':{entityName:,entityCode:},
    "&":{entityName:,entityCode:},
    ' ':{entityName:,entityCode:},
    "&":{entityName:,entityCode:},

}*/

var pattern= /\s|"|&|'|<|>|[\x00-\x20]|[\x7F-\xFF]|[\u0100-\u2700]/g;

var encodeHtml = function(s){
    if(undefined===s){return "";}
    if('string'!=typeof(s)){s= s.toString();};
    if(0=== s.length){return "";};
    var returnHtml='';

    return s.replace(pattern,function(char){
        var c=char.charCodeAt(0),r='&#';
        c=(32===c) ? 160 : c;
        return r+c+';';
    })
/*    s = (s != undefined) ? s : s.toString();
    return (typeof(s) != "string") ? s :
        s.replace(this.REGX_HTML_ENCODE,
            function($0){
                var c = $0.charCodeAt(0), r = ["&#"];
                c = (c == 0x20) ? 0xA0 : c;
                r.push(c); r.push(";");
                return r.join("");
            });*/
};

exports.encodeHtml=encodeHtml;