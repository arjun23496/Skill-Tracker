var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var clientSchema = new Schema({

	data: [String]

});

var Client = mongoose.model( 'Client' , clientSchema );

module.exports = Client;

