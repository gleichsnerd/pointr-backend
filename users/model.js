/*
*  User Model
*/

var http = require('http');
var mongoose = require('mongoose');

var uristring = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/pointr';

var theport = process.env.PORT || 5000;

mongoose.connect(uristring, function (err, res)
{
    if (err)
    {
        console.log ('ERROR connecting to: ' + uristring + '. ' + err);
    }
    else
    {
        console.log ('Succeeded connected to: ' + uristring);
    }
});

var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    longitude: Number,
    latitude: Number,
    device: String,
    tokens: [String],
    friends: [String]
});

module.exports = mongoose.model('User', userSchema);