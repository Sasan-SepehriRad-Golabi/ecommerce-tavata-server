const crypto = require("crypto");
let secret = crypto.randomBytes(128).toString("base64")
console.log(secret)
