var express = require('express');
var router = express.Router();

var MongoClient = require("mongodb").MongoClient;
const url = 'mongodb+srv://jiazhengyu:Yjz1008936@cluster0.amvan.mongodb.net/test?authSource=admin&replicaSet=atlas-y5wq66-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true';

const dbCollections = ['bitcoin', 'bitcoin-cash', 'bnb', 'cardano', 'eos', 'ehereum', 'litecoin', 'stellar', 'tether', 'tezos', 'xrp'];

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

const insertData = async (req, res, next) => {
  const currencyType = req.body.data.currencyType
  const dataSets = req.body.data.dataSets

  var processedDataSets = []

  for (var i=0; i < currencyType.length; i++) {
    var pDataSet = []
    const oDataSet = dataSets[i]

    oDataSet.forEach((item, index) => {
      var dayDif = ((item[5] - item[2])/item[2]) * 100
      var weekDif = '-'
      var monthDif = '-'

      for (var a=0; a<oDataSet.length; a++) {
        var da = new Date(item[1])
        var db = new Date(oDataSet[a][1])
        if ((da.getTime() - db.getTime())/(24 * 60 * 60 * 1000) == 7) {
          weekDif = ((item[5] - oDataSet[a][5])/oDataSet[a][5]) * 100
          break
        }
      }

      for (var b=0; b<oDataSet.length; b++) {
        var da = new Date(item[1])
        var db = new Date(oDataSet[b][1])
        if ((da.getTime() - db.getTime())/(24 * 60 * 60 * 1000) == 30) {
          monthDif = ((item[5] - oDataSet[b][5])/oDataSet[b][5]) * 100
          break
        }
      }
      pDataSet.push({
        currencyType: currencyType[i],
        date: item[1],
        price: item[5],
        dayDif: dayDif,
        weekDif: weekDif,
        monthDif: monthDif,
        volume: parseInt(item[6]),
        mktCap: parseInt(item[7])
      })

    });

    processedDataSets.push(pDataSet)
  }

  var allProcessedData = [].concat.apply([], processedDataSets)

  await MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("UTU-task");
      dbo
        .collection('currencies')
        .insertMany(allProcessedData, function (err, result) {
          if (err) throw err;
          res.status(200).json(result)
          db.close();
        });
  });
};

const getDataByFilter = async (req, res, next) => {
  const filter = parseInt(req.query.filter)
  const currentDate = new Date('Dec 04, 2019')

  var period = 0
  switch (filter) {
    case 1:
      period = 7;
      break;
    case 2:
      period = 30;
      break;
    default:
      break
  }

  var filteredSet = [];

  //(currentDate.getTime() - tempDate.getTime())/(24 * 60 * 60 * 1000) <= period
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("UTU-task");
      dbo
        .collection('currencies')
        .find({}).toArray(function(error, result) {
          if (error) throw error;
          db.close();

          var filteredData = []
          for (var i=0; i<result.length; i++) {
            var tempDate = new Date(result[i].date)
            if ((currentDate.getTime() - tempDate.getTime())/(24 * 60 * 60 * 1000) <= period) {
              filteredData.push(result[i])
            }
          }
          res.status(200).json(filteredData);
        });
  });
}

module.exports = {
  testAPIConnection,
  testMongoDBConnection,
  insertData,
  getDataByFilter,
};
