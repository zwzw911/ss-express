/**
 * Created by wzhan039 on 2016-03-10.
 */
//input value的数据类型
var inputDataType={
    int:'int',
    string:'string',
    date:'date',
    array:'array',
    object:'object',
    file:'file',
    folder:'folder',
    number:'number',
    password:'string',

}

//input对应的rule(server)
var inputCheckRule={
    require:'require',
    maxLength:'maxLength',
    minLength:'minLength',
    exactLength:'exactLength',
    min:'min',
    max:'max',
    format:'format',
    equalTo:'equalTo',
}

//input对应的rule(client)，根据server获得，排除（exactLength/Format/eauqlTo)
var clientInputCheckRule={
    require:'require',
    maxLength:'maxLength',
    minLength:'minLength',
    //exactLength:'exactLength',
    min:'min',
    max:'max',
/*    format:'format',
    equalTo:'equalTo',*/
}
exports.enum={
    inputDataType:inputDataType,
    inputCheckRule:inputCheckRule,
    clientInputCheckRule:clientInputCheckRule,
}
