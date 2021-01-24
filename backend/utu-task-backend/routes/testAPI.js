var express = require('express');
var router = express.Router();

var MongoClient = require("mongodb").MongoClient;
const url = 'mongodb+srv://jiazhengyu:Yjz1008936@cluster0.amvan.mongodb.net/test?authSource=admin&replicaSet=atlas-y5wq66-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true';

const testAPIConnection = (req, res, next) => {
  res.status(200).json('API is working properly!!');
};

const testMongoDBConnection = async (req, res, next) => {
  await MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("UTU-task");
      dbo
        .collection("testCase")
        .insertOne({ testAtt: "TestData" }, function (err, result) {
          if (err) throw err;
          res.status(200).json(result);
          db.close();
        });
  });
};

module.exports = {
  testAPIConnection,
  testMongoDBConnection,
};
