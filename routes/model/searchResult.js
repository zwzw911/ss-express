/**
 * Created by zw on 2015/9/20.
 */
/*                              db                                */
var dbStructure=require('./db_structure');
var userModel=dbStructure.userModel;

/*                         validate and error                           */
//var validateDb=require('../assist/3rd_party_error_define').validateDb;
var input_validate=require('../error_define/input_validate').input_validate;
var errorRecorder=require('../express_component/recorderError').recorderError;
var runtimeDbError=require('../error_define/runtime_db_error').runtime_db_error;
var runtimeNodeError=require('../error_define/runtime_node_error').runtime_node_error;

/*                          MISC                                    */
//var hashCrypt=require('../express_component/hashCrypt');
//var async=require('async')
var general=require('../assist/general').general
//var pemFilePath='./other/key/key.pem'; //相对于网站根目录（此处是h:/ss_express/ss_express/)


exports.searchResultDbOperation={
    test:'test'
}