const horoscope = require('horoscope')

let sign = horoscope.getSign({month: 5, day: 2})
console.log(sign)