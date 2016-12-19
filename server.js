const express = require('express')
const app = express()
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const MONGOLAB_URI = process.env.MONGOLAB_URI

app.use('/', express.static(__dirname + '/public'))

MongoClient.connect(MONGOLAB_URI, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err)
  } else {
    console.log('Connection established to database')

    db.close()
  }
})

app.get('/new/:url', (req, res) => {

})

app.use(function (req, res, next) {
  res.status(404).send('Sorry cant find that!')
})

app.listen(process.env.PORT || 5000, () => {
  console.log('Example app listening on port 5000!')
})
