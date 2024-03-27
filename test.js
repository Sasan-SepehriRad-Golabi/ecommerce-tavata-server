const moment = require("moment-jalaali")
moment().format("jYYYY/jM/jD");
m = moment('1402/12/22', 'jYYYY/jM/jD');
console.log(m.format('jYYYY/jM/jD--YYYY/M/D'))
let c = moment('1402/12/22 14:23', 'jYYYY/jM/jD HH:mm').format('YYYY-M-D HH:mm:ss');
console.log(c)
console.log(moment('1402/12/22 14:23', 'jYYYY/jM/jD HH:mm').format('YYYY-M-D HH:mm:ss'))
console.log(new Date(c).getTime())

