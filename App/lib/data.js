//  Library to storing and editing data
var fs = require("fs")
var path = require("path")
var helpers = require("./helpers")

// Container for the module
var lib = {}

// Base directory of the data folder
lib.baseDir = path.join(__dirname, "/../.data/")

// write data to a file
lib.create = function(dir, file, data, callback) {
  // Open the file for writing
  fs.open(lib.baseDir + dir + "/" + file + ".json", "wx", function(
    err,
    fileDescriptor
  ) {
    if (!err && fileDescriptor) {
      // Convert data to string
      var stringData = JSON.stringify(data)

      // Write to file and close it
      fs.writeFile(fileDescriptor, stringData, function(err) {
        if (!err) {
          fs.close(fileDescriptor, function(err) {
            if (!err) {
              callback(false)
            } else {
              callback("Error closing new file")
            }
          })
        } else {
          callback("Error writing new file")
        }
      })
    } else {
      callback("Could not create new file, it may already exist")
    }
  })
}

// Read data from a file
lib.read = function(dir, file, callback) {
  fs.readFile(lib.baseDir + dir + "/" + file + ".json", "utf-8", function(
    err,
    data
  ) {
    if (!err && data) {
      var parsedData = helpers.parseJsonToObject(data)
      callback(false, parsedData)
    } else {
      callback(err, data)
    }
  })
}

// Update data inside a file

lib.update = function(dir, filename, data, callback) {
  // Open the file for writing
  fs.open(lib.baseDir + dir + "/" + filename + ".json", "r+", function(
    err,
    fileDescriptor
  ) {
    if (!err && fileDescriptor) {
      var stringData = JSON.stringify(data)
      // Truncate file
      fs.truncate(fileDescriptor, function(err) {
        if (!err) {
          // Write file and close
          fs.writeFile(fileDescriptor, stringData, function(err) {
            if (!err) {
              fs.close(fileDescriptor, function(err) {
                if (!err) {
                  callback(false)
                } else {
                  callback("Error closing the file ")
                }
              })
            } else {
              callback("Error writing to existing file ")
            }
          })
        } else {
          callback("Error truncating file ")
        }
      })
    } else {
      callback("Couldn't open the file for updating, it may not existy ")
    }
  })
}

// Delete a file
lib.delete = function(dir, file, callback) {
  // Unlink
  fs.unlink(lib.baseDir + dir + "/" + file + ".json", function(err) {
    if (!err) {
      callback(false)
    } else {
      callback("Error deleting file")
    }
  })
}
// Export the module
module.exports = lib
