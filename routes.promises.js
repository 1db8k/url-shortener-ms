const url = require('url')
const encode = require('./encode')
const herokuDomain = 'https://url-tin.herokuapp.com/'
const apiPath = '/new/'
const port = process.env.PORT || 5000

module.exports = function (app, db) {
  let urlsCol = db.collection('urls')
  let countersCol = db.collection('counters')

  function findFromUrlsCol (query, cb) {
    return urlsCol.findOne(query, { fields: { original_url: 1, short_url: 1, _id: 0 } })
  }

  function incrementCounter (cb) {
    return countersCol.findOneAndUpdate({ _id: 'url_count' }, { $inc: { seq: 1 } }, { returnOriginal: false })
  }

  app.get(apiPath + '*', (req, res, next) => {
    let originalUrl = req.originalUrl.replace(apiPath, '')
    if (originalUrl.endsWith('/')) originalUrl = originalUrl.substr(0, originalUrl.length - 1)
    let urlObj = url.parse(originalUrl)

    if (urlObj.protocol && urlObj.host) {
      findFromUrlsCol({ 'original_url': urlObj.href })
        .then((doc) => {
          if (doc) {
            res.json(doc)
          } else {
            incrementCounter()
              .then((counter) => encode(counter.value.seq))
              .then((encodedSeq) => {
                const short_url = herokuDomain + encodedSeq
                res.json({ original_url: urlObj.href, short_url: short_url })
                urlsCol.insertOne({ _id: encodedSeq, original_url: urlObj.href, short_path: encodedSeq, short_url: short_url }, (err, res) => {
                  if (err) return next(err)
                })
              })
              .catch((err) => next(err))
          }
        })
    } else {
      res.status(500).json({'error': 'Wrong url format, make sure you have a valid protocol and real site such as \'http://google.com\' or \'http://www.google.com\' as opposed to \'www.google.com\''})
    }
  })

  app.get('/:encodedPath', (req, res, next) => {
    findFromUrlsCol({ 'short_path': req.params.encodedPath })
      .then((doc) => {
        if (doc) {
          res.json(doc)
        } else {
          res.status(500).json({ error: 'This url is not in the database.' })
        }
      })
  })

  app.use(function (req, res, next) {
    res.status(404).send('Sorry cant find that!')
  })

  app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
  })

  app.listen(port, () => {
    console.log('Listening on port ' + port)
  })
}
