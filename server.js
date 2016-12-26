const express = require('express')
const app = express()
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const MONGOLAB_URI = process.env.MONGOLAB_URI
const routes = require('./routes.promises')

app.use('/', express.static(__dirname + '/public'))

MongoClient.connect(MONGOLAB_URI)
  .then((db) => routes(app, db))
  .catch((err) => console.error(err))
