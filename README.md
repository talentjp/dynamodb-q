# dynamodb-q
A lightweight Q/Promise-based adapter of the cumbersome node.js dynamodb API

## Installation
    npm install dynamodb-q --save

## Basic Usage
    var dq = require('dynamodb-q')
    dq.GetItem(dq.Table('employees').Key('name', 'JohnDoe').Attribs(['department', 'title','salary']))
    .then(function(data){
        console.log(data);
    }, function(reason){
        console.log(reason);
    }
    );
    //If any data is retrieved:
    //{ department: 'IT', title: 'Engineer', salary: 120000 }
    //Otherwise it will look like this:
    //[Error: Empty data]
## Table Builder
This constructs a table object to be converted into dynamodb params. <br>
From above example:

    dq.Table('employees').Key('name', 'JohnDoe').Attribs(['department', 'title','salary']
In plain English:

1. For Table named 'employees'
2. Where the key called 'name' is equal to 'JohnDoe'
3. Get only these attributes : 'department', 'title','salary'

##GetItem
    dq.GetItem(dq.Table('employees').Key('name', 'JohnDoe').Attribs(['department', 'title','salary'])).then(...);

##UpdateItem
    dq.UpdateItem(dq.Table('employees').Key('name', 'JohnDoe').AttribUpdates({salary:140000, title:'Senior Engineer'})).then(...);

##PutItem
    dq.PutItem(dq.Table('employees').Item({name:'JaneRoe', department:'HR', title:'Recruiter', salary:70000})).then(...);

##DeleteItem
    dq.DeleteItem(dq.Table('employees').Key('name', 'JohnDoe')).then(...);

##Promise Chaining
Since all operations are promises, you can chain them together (callback flattening) like so:

    dq.GetItem(dq.Table('Purchases').Key('ID', 1).Attribs(['ProductName', 'Amount']))
    .then(function(data){
        return [data, dq.GetItem(dq.Table('Stock').Key('ProductName', data.ProductName).Attribs(['Remaining']))];
    })
    .spread(function(purchaseData, stockData){
        return dq.UpdateItem(dq.Table('Stock').Key('ProductName', purchaseData.ProductName).AttribUpdates({Remaining: stockData.Remaining - purchaseData.Amount}));
    });
    .then(null, function(reason){
        console.log('Failed to update stock because ' + reason);
    });

For learning how promises can be used you can refer to the [Q Library](https://www.npmjs.com/package/q)