var alphabet = '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
var base = alphabet.length // base is the length of the alphabet (58 in this case)

const encode = function (num, callback) {
  var encoded = ''
  while (num) {
    const remainder = num % base
    num = Math.floor(num / base)
    encoded = alphabet[remainder].toString() + encoded
  }
  return callback(encoded)
}

module.exports = function (num, callback) {
  if (typeof callback === 'function') return encode(num, callback)
  return encode(num, (encoded) => new Promise((resolve, reject) => resolve(encoded)))
}
