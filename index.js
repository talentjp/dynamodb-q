var attr = require('dynamodb-data-types').AttributeValue;
var AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'}); //Defaults to us-west-2
var dynamodb = new AWS.DynamoDB();
var fs = require('fs');
var Q = require('q');

function _Table(table_name){
    this._tableName = table_name;
    this.Key = function(key_name, key_value){
        this._key_name = key_name;
        this._key_value = key_value;
        return this;
    }
    this.Attribs = function(attribs){
        this._attribs = attribs;
        return this;
    }
    this.AttribUpdates = function(attrib_map){
        this._attrib_map = attrib_map;
        return this;
    }
    this.Item = function(item_params){
        this._item_params = item_params;
        return this;
    }
    this.toGetItemParams = function(){
        var params = new Object();
        params.TableName = this._tableName;
        var keyParam = new Object();
        keyParam[this._key_name] = this._key_value;
        params.Key = attr.wrap(keyParam);
        params.AttributesToGet = this._attribs;
        return params;
    }
    this.toDeleteItemParams = function(){
        var params = new Object();
        params.TableName = this._tableName;
        var keyParam = new Object();
        keyParam[this._key_name] = this._key_value;
        params.Key = attr.wrap(keyParam);
        return params;
    }
    this.toPutItemParams = function(){
        var params = new Object();
        params.TableName = this._tableName;
        params.Item = attr.wrap(this._item_params);
        return params;
    }
    this.toUpdateItemParams = function(){
        var params = new Object();
        params.TableName = this._tableName;
        var keyParam = new Object();
        keyParam[this._key_name] = this._key_value;
        params.Key = attr.wrap(keyParam);
        var attributeParam = new Object();
        for(var key in this._attrib_map)
        {
            attributeParam[key] = {Value : attr.wrap(this._attrib_map)[key], Action:"PUT"};
        }
        params["AttributeUpdates"] = attributeParam;
        return params;
    }
}

module.exports = {
    SetRegion : function(region_name){
        AWS.config.update({region: region_name});
        dynamodb = new AWS.DynamoDB();
    },
    GetItem : function(builderObj){
        var deferred = Q.defer();
        dynamodb.getItem(builderObj.toGetItemParams(), function(err, data){
            if(err){
                deferred.reject(new Error(err));
            }
            else{
                if(!module.exports.isEmptyObj(data))
                {
                    deferred.resolve(attr.unwrap(data.Item));
                }
                else
                {
                    deferred.reject(new Error("Empty data"));
                }
            }
        });
        return deferred.promise;
    },
    DeleteItem : function(builderObj){
        return Q.ninvoke(dynamodb, "deleteItem", builderObj.toDeleteItemParams());
    },
    UpdateItem : function(builderObj) {
        return Q.ninvoke(dynamodb, "updateItem", builderObj.toUpdateItemParams());
    },
    PutItem : function(builderObj) {
        return Q.ninvoke(dynamodb, "putItem", builderObj.toPutItemParams());
    },
    Table : function(table_name){
        return new _Table(table_name);
    },
    isEmptyObj : function(obj){
        // null and undefined are "empty"
        if (obj == null) return true;
        // Assume if it has a length property with a non-zero value
        // that that property is correct.
        if (obj.length > 0)    return false;
        if (obj.length === 0)  return true;
        return !Object.keys(obj).length;
    }
};