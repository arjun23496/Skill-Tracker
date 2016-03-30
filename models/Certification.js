var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var certificationSchema = new Schema({

	data: [String]

});

var Certification = mongoose.model( 'Certification' , certificationSchema );

module.exports = Certification;

