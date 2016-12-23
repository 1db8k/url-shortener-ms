const express = require('express')
const app = express()
// const url = require('url')
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const MONGOLAB_URI = process.env.MONGOLAB_URI
// const encode = require('./encode')
const routes = require('./routes')
// const util = require('util')
// const herokuDomain = 'https://url-tin.herokuapp.com/'
// const apiPath = '/new/'

app.use('/', express.static(__dirname + '/public'))

//  connect to db
MongoClient.connect(MONGOLAB_URI)
//  then listen to connections
.then((db) => routes(app, db))
//  then
//  catch
.catch((err) => console.error(err))

// MongoClient.connect(MONGOLAB_URI, function (err, db) {
//     // db.close()
//   }
// })
