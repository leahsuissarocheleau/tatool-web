var mongoose  = require('mongoose');
var bcrypt    = require('bcrypt-nodejs');
var Schema    = mongoose.Schema;
var jwt = require('jsonwebtoken');
 
var User = new Schema({
    email: {
      type: String,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    updated_at: {
      type: Date,
      required: true
    }
});

// Execute before each user.save() call
User.pre('save', function(callback) {
  var user = this;

  // Break out if the password hasn't changed
  if (!user.isModified('password')) return callback();

  // Password changed so we need to hash it
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return callback(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return callback(err);

      user.password = hash;
      callback();
    });
  });
});

// compare password
User.methods.verifyPassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return callback(err);

    callback(null, isMatch);
  });
};

// create jwt token
User.methods.createToken = function(secret) {
  var token = jwt.sign({
    _id: this._id,
    email: this.email
  }, secret, { 
    expiresInMinutes: 60*5 
  });
  return token;
};
 
module.exports = mongoose.model( 'User', User );