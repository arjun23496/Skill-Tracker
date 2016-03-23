var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var logSchema = new Schema({

	/* This stores the text of the log */
	record: String ,
	
	/* This to store the time when the event happened */
	createdDate: Date

});

var AdminLogs = mongoose.model( 'AdminLogs' , logSchema );

module.exports = AdminLogs;
