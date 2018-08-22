/*
 * Helpers for various tasks
 *
 */

// Dependencies
var config = require("./config")
var crypto = require("crypto")

// Container for all the helpers
var helpers = {}

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function(str) {
  try {
    var obj = JSON.parse(str)
    return obj
  } catch (e) {
    return {}
  }
}

// Create a SHA256 hash
helpers.hash = function(str) {
  if (typeof str == "string" && str.length > 0) {
    var hash = crypto
      .createHmac("sha256", config.hashingSecret)
      .update(str)
      .digest("hex")
    return hash
  } else {
    return false
  }
}

helpers.createRandomString = function(strLength) {
  // Validate the argument
  strLength = typeof strLength == "number" && strLength > 0 ? strLength : false

  if (strLength) {
    // Define all possible characters
    var possibleCharacters = "abcdefghijklmnopqrtuvwxz0123456789"

    var str = ""

    for (i = 1; i <= strLength; i++) {
      var randomCharacter = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      )
      str += randomCharacter
    }
    return str
  } else {
    return false
  }
}
// Export the module
module.exports = helpers
