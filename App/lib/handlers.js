/**
 * Request handlers
 */

//  Dependencies
var _data = require("./data")
var helpers = require("./helpers")
// Define handlers
var handlers = {}

// Users
handlers.users = function(data, callback) {
  var acceptableMethods = ["post", "get", "put", "delete"]
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback)
  } else {
    callback(405)
  }
}

// Container for the user submethods
https: handlers._users = {}

// Users = post
// Required data : firstName, lastName, phone, password, tosAgreement
handlers._users.post = function(data, callback) {
  // Check that all required fields are filled out

  var firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false

  var lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false

  var phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone.trim()
      : false
  var password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false
  var tosAgreement =
    typeof data.payload.tosAgreement == "boolean" &&
    data.payload.tosAgreement == true
      ? true
      : false

  console.log(data.payload)

  if (firstName && lastName && phone && password && tosAgreement) {
    // Make sure the user doesnt already exist
    _data.read("users", phone, function(err, data) {
      if (err) {
        // Hash the password
        var hashedPassword = helpers.hash(password)

        // Create the user object
        if (hashedPassword) {
          var userObject = {
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            hashedPassword: hashedPassword,
            tosAgreement: true
          }

          // Store the user
          _data.create("users", phone, userObject, function(err) {
            if (!err) {
              callback(200, { Success: "User created !" })
            } else {
              console.log(err)
              callback(500, { Error: "Could not create the new user" })
            }
          })
        } else {
          callback(500, { Error: "Could not hash the user's password." })
        }
      } else {
        // User alread exists
        callback(400, { Error: "A user with that phone number already exists" })
      }
    })
  } else {
    callback(400, {
      Error: "Missing required fields",
      firstName,
      lastName,
      phone,
      password,
      tosAgreement
    })
  }
}

// Users = get
// Required data : phone
// Optional data : none
// TODO Only let am authenticated user to access their object
handlers._users.get = function(data, callback) {
  // Check that phone number is valid
  var phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length == 10
      ? data.queryStringObject.phone.trim()
      : false
  if (phone) {
    // Lookup user
    _data.read("users", phone, function(err, data) {
      if (!err && data) {
        // Remove the hashed password form user obj before returning
        delete data.hashedPassword
        callback(200, data)
      } else {
        callback(400)
      }
    })
  } else {
    callback(400, { Error: "Missing phone number" })
  }
}

// Users = put
// Required data : phone
// Optional data : firstName, lastName, password ( at least one must be specified)
// !TODO Only let authenticated user to update their own object
handlers._users.put = function(data, callback) {
  // Check that all required fields are filled out
  var firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false

  var lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false

  var phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone.trim()
      : false
  var password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false
  var tosAgreement =
    typeof data.payload.tosAgreement == "boolean" &&
    data.payload.tosAgreement == true
      ? true
      : false

  //   Error if the phone is invalid in all cases
  if (phone) {
    if (firstName || lastName || password) {
      // Lookup user
      _data.read("users", phone, function(err, userData) {
        if (!err && userData) {
          // Update the fields necessary
          if (firstName) {
            userData.firstName = firstName
          }
          if (lastName) {
            userData.lastName = lastName
          }
          if (password) {
            userData.hashedPassword = helpers.hash(password)
          }
          //   Store the new updates
          _data.update("users", phone, userData)
          if (!err) {
            callback(200)
          } else {
            console.log(err)
            callback(500, { Error: "Could not update the user" })
          }
        } else {
          callback(400, { Error: "The specified user does not exist" })
        }
      })
    } else {
      callback(400, { Error: "Missing fields to update" })
    }
  } else {
    callback(400, { Error: "Missing a required field" })
  }
}

// Users = delete
// Required field : phone
// TODO Only let authenticate user to delete their object. Don't let them delete anyone

handlers._users.delete = function(data, callback) {
  // Check if the phone is valid
  var phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length == 10
      ? data.queryStringObject.phone.trim()
      : false
  if (phone) {
    // Lookup user
    _data.read("users", phone, function(err, data) {
      if (!err && data) {
        _data.delete("users", phone, function(err) {
          if (!err) {
            callback(200)
          } else {
            callback(500, { Error: "Could not delete the specified user" })
          }
        })
      } else {
        callback(400, { Error: "Could not find specified user" })
      }
    })
  } else {
    callback(400, { Error: "Missing required phone number" })
  }
}

// Tokens
handlers.tokens = function(data, callback) {
  var acceptableMethods = ["post", "get", "put", "delete"]
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback)
  } else {
    callback(405)
  }
}

handlers._tokens = {}

// Tokens - post
// Required data: phone, password
// Optional data: node

handlers._tokens.post = function(data, callback) {
  var phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone.trim()
      : false
  var password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false

  if (phone & password) {
    // Lookup the user who matches that phone number
    _data.read("users", phone, function(err, userData) {
      if (!err && userData) {
        // Hash the sent password, and compater it to the password stored in the user object

        var hashedPassword = helpers.hash(password)
        if (hashedPassword == userData.hashedPassword) {
          // Create a new token with a random name and set to expire in 1 hour of the future

          var tokenId = helpers.createRandomString(20)
          var expires = Date.now() + 1000 * 60 * 60
          var tokenObject = { phone, tokenId, expires }

          _data.create("tokens", tokenId, tokenObject, function(err) {
            if (!err) {
              callback(200, tokenObject)
            } else {
              callback(500, { Error: "Could not create a new token" })
            }
          })
        } else {
          callback(400, {
            Error: "Password did not match the specified user's stored password"
          })
        }
      } else {
        callback(400, { Error: "Could not find the specified user." })
      }
    })
  } else {
    callback(400, { Error: "Missing required field(s)." })
  }
}

// Tokens - get
// Required data - id
// Optional data - none
handlers._tokens.get = function(data, callback) {
  // Check if the id still valid
  var id =
    typeof data.queryStringObject.id == "string" &&
    data.queryStringObject.id.trim().length == 20
      ? data.queryStringObject.id.trim()
      : false

  if (id) {
    // Lookup user
    _data.read("tokens", id, function(err, tokenData) {
      if (!err && tokenData) {
        callback(200, tokenData)
      } else {
        callback(400)
      }
    })
  } else {
    callback(400, { Error: "Missing correct Id " })
  }
}

// Tokens - put
// Required data - id, extend
// Optional data: none
handlers._tokens.put = function(data, callback) {
  var id =
    typeof data.payload.id == "string" && data.payload.id.trim().length == 20
      ? data.payload.id.trim()
      : false
  var extend =
    typeof data.payload.extend == "boolean" && data.payload.extend == true
      ? true
      : false

  if (id && extend) {
    // Lookup the token
    _data.read("tokens", id, function(err, tokenData) {
      if (!err && tokenData) {
        // Check to make sure the token isn't already exipred
        if (tokenData.expires > Date.now()) {
          // Set the expiration 1 hour
          tokenData.expires = Date.now() + 1000 * 60 * 60
          _data.update("tokens", id, tokenData, function(err) {
            if (!err) {
              callback(200, { Success: "token extended" })
            } else {
              callback(500, { Error: "Could not update the token expiration" })
            }
          })
        } else {
          callback(400, { Error: "The token was expired" })
        }
      } else {
        callback(400, { Error: "Token doesn't exists" })
      }
    })
  } else {
    callback(400, { Error: "Missing Required fields, or fields are invalid" })
  }
}

// Ping route
handlers.ping = function(data, callback) {
  callback(200)
}

// Not found handler
handlers.notFound = function(data, callback) {
  callback(404)
}

module.exports = handlers
