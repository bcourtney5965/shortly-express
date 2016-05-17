var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var session = require('express-session');
var Promise = require('bluebird');



var User = db.Model.extend({
  tableName: 'users',
  hasTimeStamps: true
});

module.exports = User;