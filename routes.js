// const express = require('express')
// const app = express()
const url = require('url')
// const mongodb = require('mongodb')
// const MongoClient = mongodb.MongoClient
// const MONGOLAB_URI = process.env.MONGOLAB_URI
const encode = require('./encode')
// const routes = require('./routes')
// const util = require('util')
const herokuDomain = 'https://url-tin.herokuapp.com/'
const apiPath = '/new/'

module.exports = function (app, db) {
  let usersCol = db.collection('urls')
  let countersCol = db.collection('counters')
  // if (err) {
  //   console.log('Unable to connect to the mongoDB server. Error:', err)
  // } else {
  console.log('Connection established to database')

  app.get(apiPath + '*', (req, res) => {
      // console.log(`url param: ${req.params[0]}`)
    let originalUrl = req.originalUrl.replace(apiPath, '')
    if (originalUrl.endsWith('/')) {
      originalUrl = originalUrl.substr(0, originalUrl.length - 1)
    }
    let urlObj = url.parse(originalUrl)
      //  ensure valid url format
    if (urlObj.protocol && urlObj.host) {
      console.log('url is valid')
        //  true ? check if already exists in database
      usersCol.findOne({ 'original_url': urlObj.href }, { fields: { original_url: 1, short_url: 1, _id: 0 } }, function (err, doc) {
        if (err) throw err
        if (doc) {
              // true ? return the found object
          console.log('found the requested url in the database')
          res.json(doc)
        } else {
            // false ?
          console.log('the requested url was NOT found in the database')
              //  increment counter and pass the current sequence number to the encoder
          countersCol.findOneAndUpdate({ _id: 'url_count' }, { $inc: { seq: 1 } }, { returnOriginal: false }, function (error, counter) {
            if (error) {
              console.log('there was an error finding the url_count document and increased sequence')
              throw err
            }
            console.log(`found the url_count document and increased sequence to ${counter.value.seq}`)
              //  encode the url,
            encode(counter.value.seq, function (encodedSeq) {
              const short_url = herokuDomain + encodedSeq
                //  show the object to user and
              res.json({ original_url: urlObj.href, short_url: short_url })
                //  save to db
              usersCol.insertOne({ _id: encodedSeq, original_url: urlObj.href, short_path: encodedSeq, short_url: short_url }, (err, res) => {
                if (err) throw err
                console.log(`${urlObj.href} written to collection ${usersCol.collectionName} with encoded sequence '${encodedSeq}' and result ${res}`)
              })
            })
          })
        }
      })
    } else {
        // false ? return {"error":"Wrong url format, make sure you have a valid protocol and real site."}
      res.json({'error': 'Wrong url format, make sure you have a valid protocol and real site such as \'http://google.com\' or \'http://www.google.com\' as opposed to \'www.google.com\''})
    }
  })

  app.get('/:encodedPath', (req, res) => {
      // let encodedUrlObj = url.parse(req.params.encodedPath)
    usersCol.findOne(
        { 'short_path': req.params.encodedPath },
        { fields: { original_url: 1, short_url: 1, _id: 0 } },
        function (err, doc) {
          if (err) throw err
          if (doc) {
              // true ? return the found object
            console.log('found the requested ENCODED url in the database')
            res.json(doc)
          } else {
            res.json({ error: 'This url is not on the database.' })
          }
        }
      )
  })

  app.use(function (req, res, next) {
    res.status(404).send('Sorry cant find that!')
  })

  app.listen(process.env.PORT || 5000, () => {
    console.log('Example app listening on port 5000!')
  })
}
