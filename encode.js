var alphabet = '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
var base = alphabet.length // base is the length of the alphabet (58 in this case)

module.exports = function encode (num, callback) {
  var encoded = ''
  while (num) {
    const remainder = num % base
    num = Math.floor(num / base)
    encoded = alphabet[remainder].toString() + encoded
  }
  callback(encoded)
}
