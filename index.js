var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var mongoDB = 'mongodb://127.0.0.1/test';
mongoose.connect(mongoDB);
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var Schema = mongoose.Schema;

var userDataSchema = new Schema({
  country: {type: String,required: true},
  precipitation: String,
  temperature: String
});

var UserData = mongoose.model('UserData', userDataSchema);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/get-data', function(req, res, next) {
    UserData.find()
      .then(function(doc) {
        res.render('index', {items: doc});
      });
});

router.post('/insert', function(req, res, next) {
  var item = {
    country: req.body.title,
    precipitation: req.body.content,
    temperature: req.body.author
  };

  var data = new UserData(item);
  data.save();

  res.redirect('/');
});

module.exports = router;

