/*
This file contains the APIs for the web application, including
testing APIs and functional APIs.
*/

var express = require('express');
var router = express.Router();

var MongoClient = require("mongodb").MongoClient;
const url = 'mongodb+srv://jiazhengyu:Yjz1008936@cluster0.amvan.mongodb.net/test?authSource=admin&replicaSet=atlas-y5wq66-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true';

// API for testing the connection between frontend and backend server
// If the API been called successfully, a string message will be returned to
// the frontend.
const testAPIConnection = (req, res, next) => {
  res.status(200).json('API is working properly!!');
};

// API for testing the connection of the database
// If the API been called successfully, a line of data will be insert
// into the collection 'testCase' in the database
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

// API for insert data into the database
// This API will be called when user import CSV file in the frontend
const insertData = async (req, res, next) => {
  const currencyType = req.body.data.currencyType
  const dataSets = req.body.data.dataSets

  var processedDataSets = []

  // Pre-process the data
  for (var i=0; i < currencyType.length; i++) {
    var pDataSet = []
    const oDataSet = dataSets[i]

    // Calculate the 24 hours, weekly and monthly difference
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

  // Insert into the collection 'currencies' in the database
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

// API for read data from the database by filters
const getDataByFilter = async (req, res, next) => {
  const filter = parseInt(req.query.filter)
  const currentDate = new Date('Dec 04, 2019')

  // Filtering data by 24 hours, 7 days and 30 days
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

  // Access the database
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
